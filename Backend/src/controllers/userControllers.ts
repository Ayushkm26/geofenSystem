import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createClient } from "redis";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, persistToken, revokeToken } from "../auth/token";
import { checkIfInsideAnyFence } from "../utils/geoFenceArea";
import { sendGeofenceEventEmail } from "../utils/mail";
import { Socket } from "socket.io";

// Single Prisma instance with query counting
const prisma = new PrismaClient().$extends(withAccelerate());
(prisma as any)._queryCount = 0;

// Redis client setup
const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', (err) => console.error('Redis Client Error', err));
(async () => {
  await redis.connect();
})();

// Helper function to get cached geofence
const getCachedGeofence = async (geofenceId: string) => {
  const cached = await redis.get(`geofence:${geofenceId}`);
  return cached ? JSON.parse(cached) : null;
};

// Helper function to cache geofence data
const cacheGeofence = async (geofence: any) => {
  await redis.setEx(
    `geofence:${geofence.id}`,
    3600, // 1 hour TTL
    JSON.stringify(geofence)
  );
};

export const processLocation = async (
  userId: string | undefined,
  email: string | undefined,
  latitude: number,
  longitude: number
) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!latitude || !longitude) throw new Error("Latitude and longitude are required");

    // Check current geofence status with Redis caching
    let currentFence = null;
    const insideFences = await checkIfInsideAnyFence(latitude, longitude);
    if (insideFences.length > 0) {
      currentFence = insideFences[0];
      // Cache geofence details
      const cached = await getCachedGeofence(currentFence.id);
      if (!cached) {
        const details = await prisma.geoFenceArea.findUnique({
          where: { id: currentFence.id },
          include: { admin: true }
        });
        if (details) await cacheGeofence(details);
      }
    }

    const lastRecord = await prisma.location.findFirst({
      where: { userId },
      orderBy: { inTime: "desc" }
    });
    (prisma as any)._queryCount++;

    const wasPreviouslyInside = lastRecord && !lastRecord.isDisconnected;
    let eventType: "ENTER" | "EXIT" | "SWITCH" | null = null;
    let payload: any = {};

    if (currentFence && !wasPreviouslyInside) {
      eventType = "ENTER";
      const [newRecord, newUserInFence] = await prisma.$transaction([
        prisma.location.create({
          data: {
            userId,
            areaId: currentFence.id,
            areaName: currentFence.name,
            inLatitude: latitude,
            inLongitude: longitude,
            inTime: new Date(),
            isDisconnected: false
          }
        }),
        prisma.userGeofence.create({
          data: { userId, geofenceId: currentFence.id }
        })
      ]);
      (prisma as any)._queryCount += 2;
      
      payload = { 
        ...newRecord, 
        userInFence: newUserInFence,
        areaDetails: await getCachedGeofence(currentFence.id) 
      };
    } 
    else if (!currentFence && wasPreviouslyInside) {
      eventType = "EXIT";
      const exitedGeofence = await getCachedGeofence(lastRecord!.areaId!);
      
      const [updatedRecord] = await prisma.$transaction([
        prisma.location.update({
          where: { id: lastRecord!.id },
          data: {
            outLatitude: latitude,
            outLongitude: longitude,
            outTime: new Date(),
            isDisconnected: true
          }
        }),
        prisma.userGeofence.deleteMany({ 
          where: { userId, geofenceId: lastRecord!.areaId! }
        })
      ]);
      (prisma as any)._queryCount += 2;

      payload = { ...updatedRecord, exitedGeofence };
    }
    else if (currentFence && wasPreviouslyInside && lastRecord!.areaId !== currentFence.id) {
      eventType = "SWITCH";
      const exitedGeofence = await getCachedGeofence(lastRecord!.areaId!);
      const newGeofenceDetails = await getCachedGeofence(currentFence.id);

      const [_, newRecord, newUserInFence] = await prisma.$transaction([
        prisma.location.update({
          where: { id: lastRecord!.id },
          data: {
            outLatitude: latitude,
            outLongitude: longitude,
            outTime: new Date(),
            isDisconnected: true,
            isSwitched: true
          }
        }),
        prisma.location.create({
          data: {
            userId,
            areaId: currentFence.id,
            areaName: currentFence.name,
            inLatitude: latitude,
            inLongitude: longitude,
            inTime: new Date(),
            isDisconnected: false
          }
        }),
        prisma.userGeofence.create({
          data: { userId, geofenceId: currentFence.id }
        }),
        prisma.userGeofence.deleteMany({ 
          where: { userId, geofenceId: lastRecord!.areaId! }
        })
      ]);
      (prisma as any)._queryCount += 4;

      payload = { 
        ...newRecord, 
        userInFence: newUserInFence,
        areaDetails: newGeofenceDetails,
        exitedGeofence 
      };
    }

    if (!eventType) {
      return { message: "No status change" };
    }

    // Redis event queue
    await redis.lPush("geofence-events", JSON.stringify({ 
      type: eventType, 
      data: payload,
      queryCount: (prisma as any)._queryCount
    }));

    // Email notifications (using cached data where possible)
    if (email && (eventType === "ENTER" || eventType === "SWITCH")) {
      let geofence = payload.areaDetails;
      if (!geofence && currentFence) {
        geofence = await getCachedGeofence(currentFence.id);
      }
      if (geofence?.admin?.email) {
        await sendGeofenceEventEmail(eventType, payload, email, geofence.admin.email);
      }
    }
    else if (email && eventType === "EXIT" && payload.exitedGeofence?.admin?.email) {
      await sendGeofenceEventEmail(eventType, payload, email, payload.exitedGeofence.admin.email);
    }

    return { 
      eventType, 
      message: `Processed ${eventType} event`, 
      payload,
      queryCount: (prisma as any)._queryCount
    };
  } finally {
    (prisma as any)._queryCount = 0;
  }
};

export const handleSocketLocationUpdate = async (
  socket: Socket,
  data: { latitude: number; longitude: number }
) => {
  try {
    if (!socket.data?.user?.id) throw new Error("User authentication missing");

    const result = await processLocation(
      socket.data.user.id,
      socket.data.user.email,
      data.latitude,
      data.longitude
    );

    socket.emit("location-response", result);

    if (result.eventType === "ENTER" || result.eventType === "SWITCH") {
      socket.data.currentGeofence = result.payload.areaDetails;
      socket.emit("geofence-details", result.payload.areaDetails);
    } 
    else if (result.eventType === "EXIT") {
      socket.emit("outside-geofence", {
        message: "You are outside all geofence areas",
        timestamp: new Date(),
        exitedGeofence: result.payload.exitedGeofence
      });
      delete socket.data.currentGeofence;
    }

  } catch (error) {
    console.error("Location processing error:", error);
    socket.emit("location-error", {
      error: error instanceof Error ? error.message : String(error),
      queryCount: (prisma as any)._queryCount
    });
  } finally {
    (prisma as any)._queryCount = 0;
  }
};

export const handleCurrentGeofenceRequest = async (socket: Socket) => {
  try {
    if (!socket.data?.user?.id) throw new Error("User authentication missing");

    if (socket.data.currentGeofence) {
      socket.emit("geofence-details", socket.data.currentGeofence);
      return;
    }

    const lastLocation = await prisma.location.findFirst({
      where: { 
        userId: socket.data.user.id,
        isDisconnected: false 
      },
      orderBy: { inTime: "desc" },
      select: { areaId: true }
    });
    (prisma as any)._queryCount++;

    if (!lastLocation?.areaId) {
      socket.emit("outside-geofence", {
        message: "You are not currently in any geofence area",
        timestamp: new Date(),
      });
      return;
    }

    const geofenceDetails = await getCachedGeofence(lastLocation.areaId) || 
      await prisma.geoFenceArea.findUnique({
        where: { id: lastLocation.areaId },
        select: {
          id: true,
          name: true,
          description: true,
          latitude: true,
          longitude: true,
          radius: true,
          createdAt: true,
          updatedAt: true,
          admin: { select: { id: true, name: true, email: true } }
        }
      });
    (prisma as any)._queryCount++;

    if (geofenceDetails) {
      await cacheGeofence(geofenceDetails);
      socket.data.currentGeofence = geofenceDetails;
      socket.emit("geofence-details", geofenceDetails);
    } else {
      socket.emit("outside-geofence", {
        message: "Geofence data not available",
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error("Current geofence error:", error);
    socket.emit("geofence-error", {
      error: error instanceof Error ? error.message : String(error),
      queryCount: (prisma as any)._queryCount
    });
  } finally {
    (prisma as any)._queryCount = 0;
  }
};

// ... (keep all other existing functions unchanged)
 


export const createUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

    try {
        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User with this email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });

        const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
        const refresh = signRefreshToken({ sub: user.id, role: user.role, email: user.email });

        const accessExp = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day
        const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await persistToken(access, user.id, "ACCESS", accessExp);
        await persistToken(refresh, user.id, "REFRESH", refreshExp);

        res.status(200).json({ user: { ...user, password: undefined }, access, refresh });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ error: 'Invalid email or password' });

        const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
        const refresh = signRefreshToken({ sub: user.id, role: user.role, email: user.email });

        const accessExp = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day
        const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await persistToken(access, user.id, "ACCESS", accessExp);
        await persistToken(refresh, user.id, "REFRESH", refreshExp);

        res.status(200).json({ user: { ...user, password: undefined }, access, refresh });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login user' });
    }
};
export const logoutUser = async (req: Request, res: Response) => {
    try {
        let token: string | undefined = req.headers.authorization?.split(" ")[1] || req.headers["x-refresh-token"] as string;
        if (!token) return res.status(400).json({ error: "No token provided" });

        await revokeToken(token, "LOGOUT");
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to log out user" });
    }
};
export const getLocationHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        const history = await prisma.location.findMany({
            where: { userId },
            orderBy: { inTime: "desc" }
        });
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve location history" });
    }
};
export const verifyToken = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const userDetails = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!userDetails) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ userDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to verify token" });
    }
};

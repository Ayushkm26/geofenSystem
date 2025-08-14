import { createClient } from "redis";
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { signAccessToken,signRefreshToken,persistToken ,revokeToken} from "../auth/token";
import { checkIfInsideAnyFence } from '../utils/geoFenceArea';
import { sendGeofenceEventEmail } from "../utils/mail";
const createUser = async (req: Request, res: Response) => {

    console.log("Creating user...");
    const prisma = new PrismaClient();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, email,password } = req.body;
         console.log(name);
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingUser = (await prisma.user.findMany({
        where: { email },
        take: 1
        }))[0] || null;

  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
          console.log("User created:", user);
        const access = signAccessToken({ sub: user.id , role: user.role, email: user.email });
        const refresh = signRefreshToken({ sub: user.id , role: user.role, email: user.email });

        const accessExp = new Date(Date.now() + 1*24*60*60*1000); // 15m
        const refreshExp = new Date(Date.now() + 7*24*60*60*1000); // 7d
        await persistToken(access, user.id, "ACCESS", accessExp);
        await persistToken(refresh, user.id, "REFRESH", refreshExp);
        res.status(200).json({ user: { ...user, password: undefined }, access, refresh });
    } catch (error) {
        const errorDetails = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : String(error);
        res.status(500).json({ error: 'Failed to create user', errorDetails });
    }
}
export default createUser;
 export const loginUser = async (req: Request, res: Response) => { 
   const prisma = new PrismaClient().$extends(withAccelerate());
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma.user.findUnique({ where: { email} });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
    
        const access = signAccessToken({ sub: user.id , role: user.role , email: user.email });
        const refresh = signRefreshToken({ sub: user.id , role: user.role,email:user.email });

        const accessExp = new Date(Date.now() + 1*24*60*60*1000); // 1d
        const refreshExp = new Date(Date.now() + 7*24*60*60*1000); // 7d
        await persistToken(access, user.id, "ACCESS", accessExp);
        await persistToken(refresh, user.id, "REFRESH", refreshExp);
        res.status(200).json({ user: { ...user, password: undefined }, access, refresh });
    }catch (error) {
        res.status(500).json({ error: 'Failed to login user' });
    }
    

}
export const logoutUser = async (req: Request, res: Response) => {
    let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.headers["x-refresh-token"]) {
    token = req.headers["x-refresh-token"] as string;
  }

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    await revokeToken(token, "LOGOUT");
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Failed to log out user" });
  }
}
export const logLocation = async (req: Request, res: Response) => {
     const prisma = new PrismaClient().$extends(withAccelerate());
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();

  try {
    const id = req.user?.id; // Middleware sets req.user
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Current fences
    const insideFences = await checkIfInsideAnyFence(latitude, longitude);
    const isCurrentlyInside = insideFences.length > 0;
    const currentFence = isCurrentlyInside ? insideFences[0] : null;

    // Last open location session
    const lastRecord = await prisma.location.findFirst({
      where: { userId: id },
      orderBy: { inTime: "desc" }
    });
    const wasPreviouslyInside = lastRecord && !lastRecord.isDisconnected;


    let eventType: "ENTER" | "EXIT" | "SWITCH" | null = null;
    let payload: Record<string, any> = {};

    if (isCurrentlyInside && !wasPreviouslyInside) {
      eventType = "ENTER";
      const newRecord = await prisma.location.create({
        data: {
          userId: id,
          areaId: currentFence!.id,
          areaName: currentFence!.name,
          inLatitude: latitude,
          inLongitude: longitude,
          inTime: new Date(),
          isDisconnected: false
        }
      });
      const newuserInfence = await prisma.userGeofence.create({
        data: {
          userId: id,
          geofenceId: currentFence!.id,
        }
      });
      payload = { ...newRecord , userInfence: newuserInfence };
    }

    // EXIT — previously inside, now outside
    if (!isCurrentlyInside && wasPreviouslyInside) {
      eventType = "EXIT";
      const updatedRecord = await prisma.location.update({
        where: { id: lastRecord!.id },
        data: {
          outLatitude: latitude,
          outLongitude: longitude,
          outTime: new Date(),
          isDisconnected: true
        }
      });
      if (lastRecord!.areaId !== null) {
        await prisma.userGeofence.deleteMany({
          where: {
            userId: id,
            geofenceId: lastRecord!.areaId
          }
        });
      }
      payload = { ...updatedRecord,};
    }

    // SWITCH — previously inside fence A, now inside fence B
    if (
      isCurrentlyInside &&
      wasPreviouslyInside &&
      lastRecord!.areaId !== currentFence!.id
    ) {
      eventType = "SWITCH";

      // 1️⃣ Close old record
      await prisma.location.update({
        where: { id: lastRecord!.id },
        data: {
          outLatitude: latitude,
          outLongitude: longitude,
          outTime: new Date(),
          isDisconnected: true,
          isSwitched: true // Mark as switched
        }
      });
      if (lastRecord!.areaId !== null) {
        await prisma.userGeofence.deleteMany({
          where: {
            userId: id,
            geofenceId: lastRecord!.areaId
          }
        });
      }
      
      // 2️⃣ Create new record for the new fence
      const newRecord = await prisma.location.create({
        data: {
          userId: id,
          areaId: currentFence!.id,
          areaName: currentFence!.name,
          inLatitude: latitude,
          inLongitude: longitude,
          inTime: new Date(),
          isDisconnected: false
        }
      });
      const newuserInfence = await prisma.userGeofence.create({
        data: {
          userId: id,
          geofenceId: currentFence!.id,
        }
      });
      payload = { ...newRecord , userInfence: newuserInfence };
    }

    // No change → skip
    if (!eventType) {
      return res.status(200).json({ message: "No status change" });
    }

    // Push event to Redis
    // Find admin email for the geofence the user entered
    let adminEmail: string | undefined = undefined;
    if (eventType === "ENTER" || eventType === "SWITCH" ) {
      // Get geofence details including admin info
      const geofence = await prisma.geoFenceArea.findUnique({
      where: { id: currentFence!.id },
      include: { admin: true }
      });
      adminEmail = geofence?.admin?.email;
    } else if (eventType === "EXIT" && lastRecord?.areaId) {
      // Get admin email for the previous fence
      const geofence = await prisma.geoFenceArea.findUnique({
      where: { id: lastRecord.areaId },
      include: { admin: true }
      });
      adminEmail = geofence?.admin?.email;
    }

    await redis.lPush(
      "geofence-events",
      JSON.stringify({ type: eventType, data: payload })
    );


    if (!req.user || !req.user.email || !adminEmail) {
      return res.status(400).json({ error: "User email is required to send geofence event email" });
    }
    await sendGeofenceEventEmail(eventType, payload, req.user.email, adminEmail);

    res.status(200).json({ message: `Queued ${eventType} event`, payload });

  } catch (error) {
    console.error("Error processing location:", error);
    res.status(500).json({ error: "Failed to process location" });
  } finally {
    await redis.disconnect();
    await prisma.$disconnect();
  }
};

export const GeofenceDetails = async (req: Request, res: Response) => {
    const prisma = new PrismaClient().$extends(withAccelerate());
     try {
    const userId = req.user?.id; // from auth middleware

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Get the latest areaId from location table
    const lastLocation = await prisma.location.findFirst({
      where: { userId },
      orderBy: { inTime: "desc" },
      select: { areaId: true } // only get areaId
    });

    if (!lastLocation || !lastLocation.areaId) {
      return res.status(404).json({ error: "No active geofence found" });
    }

    // Get geofence details using areaId
    const geofenceDetails = await prisma.geoFenceArea.findUnique({
      where: { id: lastLocation.areaId }
    });

    if (!geofenceDetails) {
      return res.status(404).json({ error: "Geofence not found" });
    }

    return res.status(200).json(geofenceDetails);

  } catch (error) {
    console.error("Error fetching geofence details:", error);
    return res.status(500).json({ error: "Failed to fetch geofence details" });
  }
}
export const getLocationHistory = async (req: Request, res: Response) => {
     const prisma = new PrismaClient().$extends(withAccelerate());
    const userId = req.user?.id; // Assuming user ID is set in req.user
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        // Example history
        const history = await prisma.location.findMany({
            where: { userId },
            orderBy: { inTime: 'desc' },
        });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve location history' });
    }
}



import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, persistToken, revokeToken } from "../auth/token";
import { sendGeofenceEventEmail } from "../utils/mail";
import { Socket } from "socket.io";
import { prisma, io } from "../server";
import { checkIfInsideAnyFence } from "../utils/geoFenceArea";
import generateOTP from "../utils/generateOtp"
import {transporter} from "../utils/mail";
import {generateOtpEmailHtml} from "../utils/mail"
import { processLocation } from "./location.service";

// ─── Redis Client Setup ─────────────────────────────────────────────────────
const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("Redis Client Error", err));
(async () => await redis.connect())();

// ─── Redis Helpers ─────────────────────────────────────────────────────────
const getCachedGeofence = async (geofenceId: string) => {
  const cached = await redis.get(`geofence:${geofenceId}`);
  return cached ? JSON.parse(cached) : null;
};

const cacheGeofence = async (geofence: any) => {
  await redis.setEx(`geofence:${geofence.id}`, 3600, JSON.stringify(geofence));
};

// ─── Preload All Geofences ──────────────────────────────────────────────────
let allFences: any[] = [];
const loadAllFences = async () => allFences = await prisma.geoFenceArea.findMany();
const getAllFences = async () => allFences.length ? allFences : await loadAllFences();

// ─── Ensure Geofence Cached ─────────────────────────────────────────────────
const cacheAndGet = async (id: string) => {
  let gf = await getCachedGeofence(id);
  if (!gf) {
    gf = await prisma.geoFenceArea.findUnique({ where: { id }, include: { admin: true } });
    if (gf) await cacheGeofence(gf);
  }
  return gf;
};



// ─── Handle Socket Updates (EXIT fixed) ─────────────────────────────────────
export const handleSocketLocationUpdate = async (
  socket: Socket,
  data: { latitude: number; longitude: number }
) => {
  try {
    const userId = socket.data?.user?.id;
    if (!userId) throw new Error("User authentication missing");

    const result = await processLocation(
      userId,
      socket.data.user.email,
      data.latitude,
      data.longitude
    );
    socket.emit("location-response", result);

    // Notify admin if ENTER/SWITCH
    if (result.eventType === "ENTER" || result.eventType === "SWITCH") {
      socket.data.currentGeofence = result.payload.areaDetails;
      socket.emit("geofence-details", result.payload.areaDetails);

      if (result.payload.areaDetails?.id) {
        const geofence = await prisma.geoFenceArea.findUnique({
          where: { id: result.payload.areaDetails.id },
          select: { id: true, name: true, createdBy: true },
        });
        if (geofence)
          io.of("/admin")
            .to(`admin:${geofence.createdBy}`)
            .emit("user-geofence-event", {
              userId,
              userEmail: socket.data.user.email,
              geofenceId: geofence.id,
              geofenceName: geofence.name,
              event: result.eventType,
              timestamp: new Date(),
            });
      }
    }

    // Notify admin on EXIT (fixed)
if (result.eventType === "EXIT") {
  // Clear the current geofence
  socket.data.currentGeofence = null;

  // Notify user dashboard
  socket.emit("outside-geofence", {
  latitude: null,
  longitude: null,
  message: "You are outside all geofence areas", 
  timestamp: new Date(),
  exitedGeofence: result.payload.exitedFence,
});

  // Notify admins
  if (result.payload.exitedFence?.id) {
    const geofence = await prisma.geoFenceArea.findUnique({
      where: { id: result.payload.exitedFence.id },
      select: { id: true, name: true, createdBy: true },
    });

    const finalGeofence = geofence ?? result.payload.exitedFence;
    io.of("/admin")
      .to(`admin:${finalGeofence.createdBy}`)
      .emit("user-geofence-event", {
        userId,
        userEmail: socket.data.user.email,
        geofenceId: finalGeofence.id,
        geofenceName: finalGeofence.name ?? "Unknown Geofence",
        event: "EXIT",
        timestamp: new Date(),
      });
  }
}


  } catch (error) {
    console.error("Location processing error:", error);
    socket.emit("location-error", {
      error: error instanceof Error ? error.message : String(error),
      queryCount: (prisma as any)._queryCount,
    });
  } finally {
    (prisma as any)._queryCount = 0;
  }
};


// ─── Handle Current Geofence Request ────────────────────────────────────────
export const handleCurrentGeofenceRequest = async (socket: Socket) => {
  try {
    const userId = socket.data?.user?.id;
    if (!userId) throw new Error("User authentication missing");

    if (socket.data.currentGeofence) return socket.emit("geofence-details", socket.data.currentGeofence);

    const lastLocation = await prisma.location.findFirst({ where: { userId, isDisconnected: false }, orderBy: { inTime: "desc" }, select: { areaId: true } });
    (prisma as any)._queryCount++;

if (!lastLocation?.areaId) {
  return socket.emit("outside-geofence", {
    latitude: null,
    longitude: null,
    message: "You are not currently in any geofence area",
    timestamp: new Date(),
  });
}
    const geofenceDetails = await cacheAndGet(lastLocation.areaId);
    if (geofenceDetails) {
      socket.data.currentGeofence = geofenceDetails;
      socket.emit("geofence-details", geofenceDetails);
    } else {
      socket.emit("outside-geofence", { message: "Geofence data not available", timestamp: new Date() });
    }

  } catch (error) {
    console.error("Current geofence error:", error);
    socket.emit("geofence-error", { error: error instanceof Error ? error.message : String(error), queryCount: (prisma as any)._queryCount });
  } finally { (prisma as any)._queryCount = 0; }
};

// ─── User Routes ───────────────────────────────────────────────────────────
export const createUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User with this email already exists' });
     const otp=generateOTP();

    const hashedPassword = await bcrypt.hash(password, 10);
    await redis.set(`signup:${email}`, JSON.stringify({ name, email, hashedPassword }), { EX: 300 })
     await redis.set(`otp:${email}`, otp, { EX: 300 });
    await transporter.sendMail({
    from: `"GeoFence System" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: generateOtpEmailHtml({
    appName: "GeoFence System",
    otp,
    expiryMinutes: 5,
    supportEmail: "support@geofencesystem.com"
  })
  });
    res.status(201).json({ message: "OTP sent to email. Please verify to complete signup." }); 
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
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid email or password' });

    const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const refresh = signRefreshToken({ sub: user.id, role: user.role, email: user.email });
    await persistToken(access, user.id, "ACCESS", new Date(Date.now() + 24*60*60*1000));
    await persistToken(refresh, user.id, "REFRESH", new Date(Date.now() + 7*24*60*60*1000));

    res.status(200).json({ user: { ...user, password: undefined }, access, refresh });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers["x-refresh-token"] as string;
    if (!token) return res.status(400).json({ error: "No token provided" });
    console.log("Logging out user:", req.user?.id);
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

    const history = await prisma.location.findMany({ where: { userId }, orderBy: { inTime: "desc" } });
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

    const userDetails = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
    if (!userDetails) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify token" });
  }
};
export const verifyUserCreate= async(req: Request, res: Response)=>{
   const { email, otp } = req.body;

  const storedOtp = await redis.get(`otp:${email}`);
  const pendingUser = await redis.get(`signup:${email}`);
 
  if (!storedOtp || !pendingUser) {
    return res.status(400).json({ message: "OTP expired or no signup request found" });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  const {name,hashedPassword} =JSON.parse(pendingUser);
  const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });

    const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const refresh = signRefreshToken({ sub: user.id, role: user.role, email: user.email });
    await persistToken(access, user.id, "ACCESS", new Date(Date.now() + 24*60*60*1000));
    await persistToken(refresh, user.id, "REFRESH", new Date(Date.now() + 7*24*60*60*1000));
     // Clean Redis
    await redis.del(`otp:${email}`);
    await redis.del(`signup:${email}`);
    res.status(200).json({ user: { ...user, password: undefined }, access, refresh });
  
}

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check Redis for existing OTP
    let otp = await redis.get(`otp:${email}`);

    if (!otp) {
      // If expired, generate new one
      otp = generateOTP();
      await redis.set(`otp:${email}`, otp, { EX: 300 });
    }

    // Send OTP email
     await transporter.sendMail({
    from: `"GeoFence System" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your new OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: generateOtpEmailHtml({
    appName: "GeoFence System",
    otp,
    expiryMinutes: 5,
    supportEmail: "support@geofencesystem.com"
  })
  });

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ error: "Failed to resend OTP" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    await redis.set(`forgot-password:${email}`, otp, { EX: 300 });

    await transporter.sendMail({
      from: `"GeoFence System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. It expires in 5 minutes.`,
      html: generateOtpEmailHtml({
        appName: "GeoFence System",
        otp,
        expiryMinutes: 5,
        supportEmail: "support@geofencesystem.com"
      })
    });

    return res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Failed to send password reset OTP" });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const storedOtp = await redis.get(`forgot-password:${email}`);
    if (!storedOtp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    await redis.del(`forgot-password:${email}`);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
};

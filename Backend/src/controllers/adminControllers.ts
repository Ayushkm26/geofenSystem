import express from "express";
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { persistToken, revokeToken, signAccessToken, signRefreshToken } from "../auth/token";
import { createGeofenceArea } from "../utils/geoFenceArea";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verifyToken } from "./userControllers";
import { prisma } from "../server";
import { Socket } from "socket.io";
import generateOTP  from "../utils/generateOtp";
import {transporter} from "../utils/mail";
import {generateOtpEmailHtml} from "../utils/mail"
import { createClient } from "redis";
const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("Redis Client Error", err));
(async () => await redis.connect())();

export const createAdmin = async (req: Request, res: Response) => {
    const prisma = new PrismaClient().$extends(withAccelerate());
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });    
    }
    const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
 try {
     const existingAdmin = await prisma.admin.findUnique({ where: { email } });
     if (existingAdmin) return res.status(400).json({ error: 'Admin with this email already exists' });
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
     res.status(500).json({ error: 'Failed to create Admin' });
   }
}
export const loginAdmin = async (req: Request, res: Response) => {
  const prisma = new PrismaClient().$extends(withAccelerate());
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        subscriptionStart: true,
        subscriptionEnd: true, // 👈 make sure we pull these
      },
    });

    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 👇 Include subscription dates in JWT payload
    const payload = {
      sub: admin.id,
      role: admin.role,
      email: admin.email,
      isActive: admin.isActive,
      subscriptionStart: admin.subscriptionStart,
      subscriptionEnd: admin.subscriptionEnd,
    };

    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);

    const accessExp = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 day
    const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await persistToken(access, admin.id, "ACCESS", accessExp);
    await persistToken(refresh, admin.id, "REFRESH", refreshExp);

    res.status(201).json({
      admin: { ...admin, password: undefined },
      access,
      refresh,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in admin" });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
     let token: string | undefined;
  console.log("Logging out admin");
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
    return res.status(500).json({ error: "Failed to log out admin" });
  }
}
// Send all geofences for this admin
export const sendGeofences = async (socket: Socket) => {
  if (!socket.data.admin?.id) return;
  const geofences = await prisma.geoFenceArea.findMany({
    where: { createdBy: socket.data.admin.id },
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      radius: true,
      type: true,
      createdAt: true,
      UserGeofence: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  socket.emit("geofences-list", geofences);
};

// Add Geofence
export const addGeofence = async (socket: Socket, data: any) => {
  try {
    
    const { name, latitude, longitude, radius } = data;
    console.log(radius)
    const coordinates = createGeofenceArea(longitude, latitude, radius);

    const geofenceData: any = {
      name,
      type: coordinates.type,
      latitude,
      longitude,
      radius,
      coordinates: JSON.stringify(coordinates), 
      createdBy: socket.data.admin.id,
    };

    const geofence = await prisma.geoFenceArea.create({ data: geofenceData });
    socket.emit("geofence-added", geofence);
  } catch (err) {
    socket.emit("geofence-error", { error: "Failed to add geofence" });
  }
};
export const addGeofenceHttp = async (req: Request, res: Response) => {
    try {
        const { name, latitude, longitude, radius } = req.body;
        if (!name || latitude === undefined || longitude === undefined || radius === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const coordinates = createGeofenceArea(longitude, latitude, radius);
        const geofenceData: any = {
            name,
            type: coordinates.type,
            latitude,
            longitude,
            radius,
            coordinates: JSON.stringify(coordinates),
            createdBy: req.admin?.id,
        };

        const geofence = await prisma.geoFenceArea.create({ data: geofenceData });
        res.status(201).json({ geofence });
    } catch (err) {
        res.status(500).json({ error: "Failed to add geofence" });
    }
};


// Update Geofence
export const updateGeofence = async (socket: Socket, data: any) => {
  try {
    const { id, name, latitude, longitude, radius } = data;
    if (!id) {
      return socket.emit("geofence-error", { error: "Geofence ID is required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    console.log("Updating geofence:", { id, name, lat, lng, rad });

    const coordinates = createGeofenceArea(lat, lng, rad);

    const updated = await prisma.geoFenceArea.update({
      where: { id },
      data: {
        name,
        latitude: lat,
        longitude: lng,
        radius: rad,
        type: coordinates.type,
        coordinates: JSON.stringify(coordinates),
        createdBy: socket.data.admin.id,
      },
    });

    socket.emit("geofence-updated", updated);
  } catch (err) {
    console.error("Update error:", err);
    socket.emit("geofence-error", { error: "Failed to update geofence" });
  }
};


// Delete Geofence
export const deleteGeofence = async (socket: Socket, id: string) => {
  try {
    await prisma.geoFenceArea.delete({ where: { id } });
    socket.nsp.emit("geofence-deleted", id);
  } catch (err) {
    socket.emit("geofence-error", { error: "Failed to delete geofence" });
  }
};

// Get single geofence details
export const getGeofenceDetails = async (socket: Socket, id: string) => {
  try {
    const geofence = await prisma.geoFenceArea.findUnique({
      where: { id },
    });
    socket.emit("geofence-details", geofence);
  } catch (err) {
    socket.emit("geofence-error", { error: "Failed to get geofence details" });
  }
};
export const verifyTokenforAdmin = async (req: Request, res: Response) => {
     try {
        const adminId = req.admin?.id;
        if (!adminId) return res.status(401).json({ error: "Unauthorized" });

        const adminDetails = await prisma.admin.findUnique({
            where: { id: adminId },
            select: { id: true, name: true, email: true, role: true ,isActive:true,subscriptionEnd:true}
        });

        if (!adminDetails) return res.status(404).json({ error: "Admin not found" });

        res.status(200).json({ adminDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to verify token" });
    }
}

export const  verifyAdminAfterCreate=async(req:Request,res:Response)=>{
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
       const admin = await prisma.admin.create({ data: { name, email, password: hashedPassword } });

            const access = signAccessToken({
      sub: admin.id,
      role: admin.role,
      email: admin.email,
      isActive: admin.isActive,
      subscriptionEnd: admin.subscriptionEnd,
      subscriptionStart: admin.subscriptionStart,
    });
    const refresh = signRefreshToken({
      sub: admin.id,
      role: admin.role,
      email: admin.email,
      isActive: admin.isActive,
      subscriptionEnd: admin.subscriptionEnd,
      subscriptionStart: admin.subscriptionStart,
    });
    await persistToken(access, admin.id, "ACCESS", new Date(Date.now() + 24*60*60*1000),);
    await persistToken(refresh, admin.id, "REFRESH", new Date(Date.now() + 7*24*60*60*1000));
    // Clean Redis
    await redis.del(`otp:${email}`);
    await redis.del(`signup:${email}`);
         res.status(200).json({ admin: { ...admin, password: undefined }, access, refresh });
}
export const resendAdminOtp=async(req:Request,res:Response)=>{
   try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
  
      // Check Redis for existing OTP
      let otp = await redis.get(`otp:${email}`);
  
      if (!otp) {
        otp = generateOTP();
        await redis.set(`otp:${email}`, otp, { EX: 300 });
      }
  
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
}
export const forgotAdminPassword=async(req:Request,res:Response)=>{
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) return res.status(404).json({ error: "Admin not found" });

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
}
export const resetAdminPassword=async(req:Request,res:Response)=>{
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP, and new password are required" });
      }
  
      const storedOtp = await redis.get(`forgot-password:${email}`);
      if (!storedOtp) {
        return res.status(400).json({ error: "OTP expired or no reset request found" });
      }
  
      if (storedOtp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({
        where: { email },
        data: { password: hashedPassword }
      });
  
      await redis.del(`forgot-password:${email}`);
  
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ error: "Failed to reset password" });
    }
}
export const getAllPlans=async(req:Request,res:Response)=>{
   try {
        const plans = await prisma.subscriptionPlan.findMany({
            select: { id: true, name: true, price: true, currency: true, durationDays: true }
        });
        res.status(200).json({ plans });
    } catch (error) {
        console.error("Get all plans error:", error);
        res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
}
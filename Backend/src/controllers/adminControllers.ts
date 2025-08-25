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


export const createAdmin = async (req: Request, res: Response) => {
    const prisma = new PrismaClient().$extends(withAccelerate());
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });    
    }
    try {
        const { name, email ,password} = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        if (await prisma.admin.findFirst({ where: { email } })) {
            return res.status(400).json({ error: 'Admin with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,       
            },
        });
         const access = signAccessToken({ sub: admin.id , role: admin.role });
         const refresh = signRefreshToken({ sub: admin.id , role: admin.role });

                const accessExp = new Date(Date.now() + 1*24*60*60*1000); // 1d
                const refreshExp = new Date(Date.now() + 7*24*60*60*1000); // 7d
                await persistToken(access, admin.id, "ACCESS", accessExp);
                await persistToken(refresh, admin.id, "REFRESH", refreshExp);
        res.status(201).json({ admin: { ...admin, password: undefined }, access,refresh });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create admin' });
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
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const admin = await prisma.admin.findFirst({ where: { email } });
        if (!admin) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
         const access = signAccessToken({ sub: admin.id , role: admin.role });
         const refresh = signRefreshToken({ sub: admin.id , role: admin.role });

                const accessExp = new Date(Date.now() + 1*24*60*60*1000); // 1d
                const refreshExp = new Date(Date.now() + 7*24*60*60*1000); // 7d
                await persistToken(access, admin.id, "ACCESS", accessExp);
                await persistToken(refresh, admin.id, "REFRESH", refreshExp);
        res.status(201).json({ admin: { ...admin, password: undefined }, access,refresh });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log in admin' });
    }
}
export const logoutAdmin = async (req: Request, res: Response) => {
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
    socket.nsp.emit("geofence-added", geofence);
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

    const updated = await prisma.geoFenceArea.update({
      where: { id },
      data: geofenceData,
    });

    socket.nsp.emit("geofence-updated", updated);
  } catch (err) {
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
            select: { id: true, name: true, email: true, role: true }
        });

        if (!adminDetails) return res.status(404).json({ error: "Admin not found" });

        res.status(200).json({ adminDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to verify token" });
    }
}
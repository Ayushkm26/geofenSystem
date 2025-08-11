import express from "express";
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { persistToken, revokeToken, signAccessToken, signRefreshToken } from "../auth/token";
import { createGeofenceArea } from "../utils/geoFenceArea";

export const createAdmin = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
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
    const prisma = new PrismaClient();
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
export const addGeofence = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
       
       const { name, longitude, latitude, radius } = req.body;

if (!name || longitude == null || latitude == null || radius == null) {
    return res.status(400).json({ error: 'Name, longitude, latitude, and radius are required' });
}

const coordinates = createGeofenceArea(longitude, latitude, radius);

const geofenceData: any = {
    name,
    type: coordinates.type,
    longitude: coordinates.coordinates[0], // longitude
    latitude: coordinates.coordinates[1], // latitude
    radius: coordinates.radius,
    coordinates: JSON.stringify(coordinates)
};
if (req.admin?.id) {
    geofenceData.createdBy = req.admin.id;
}

const geofence = await prisma.geoFenceArea.create({
    data: geofenceData,
});

res.status(201).json({ message: 'Geofence added successfully', geofence });

    } catch (error) {
        res.status(500).json({ error: 'Failed to add geofence' });
    }
}
export const deleteGeofence = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Geofence ID is required' });
        }

        await prisma.geoFenceArea.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Geofence deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete geofence' });
    }
}
export const getGeofences = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    try {
        const geofences = await prisma.geoFenceArea.findMany({
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                radius: true,
                createdBy: true
            }
        });
        res.status(200).json({ geofences });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve geofences' });
    }
}
export const getGeofenceDetails = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Geofence ID is required' });
        }
        const geofence = await prisma.geoFenceArea.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                radius: true,
                createdBy: true,
                coordinates: true
            }
        });
        if (!geofence) {
            return res.status(404).json({ error: 'Geofence not found' });
        }
        // Parse coordinates if stored as JSON string
        if (typeof geofence.coordinates === 'string') {
            geofence.coordinates = JSON.parse(geofence.coordinates);
        }
        res.status(200).json(geofence);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve geofence details' });
    }
}
export const updateGeofence = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    try {
        const { id } = req.params;
        const { name, longitude, latitude, radius } = req.body;
        if (!id || !name || !longitude || !latitude || !radius) {
            return res.status(400).json({ error: 'Geofence ID, name, coordinates, and radius are required' });
        }

        const coordinates = createGeofenceArea(longitude, latitude, radius);

        const geofenceData: any = {
            name,
            type: coordinates.type,
            longitude: coordinates.coordinates[0], // longitude
            latitude: coordinates.coordinates[1], // latitude
            radius: coordinates.radius,
            coordinates: JSON.stringify(coordinates)
        };
        if (req.admin?.id) {
            geofenceData.createdBy = req.admin.id;
        }

        await prisma.geoFenceArea.update({
            where: { id },
            data: geofenceData
        });

        res.status(200).json({ message: 'Geofence updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update geofence' });
    }
}
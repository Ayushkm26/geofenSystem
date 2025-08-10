const express = require('express');
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import bcrypt from 'bcryptjs';
import { signAccessToken,signRefreshToken,persistToken ,revokeToken} from "../auth/token";

const router = express.Router();
const createUser = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, email,password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        if(await prisma.user.findFirst({ where: { email } })) {
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

        const access = signAccessToken({ sub: user.id , role: user.role });
        const refresh = signRefreshToken({ sub: user.id , role: user.role });

        const accessExp = new Date(Date.now() + 1*24*60*60*1000); // 15m
        const refreshExp = new Date(Date.now() + 7*24*60*60*1000); // 7d
        await persistToken(access, user.id, "ACCESS", accessExp);
        await persistToken(refresh, user.id, "REFRESH", refreshExp);
        res.status(200).json({ user: { ...user, password: undefined }, access, refresh });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
}
export default createUser;
 export const loginUser = async (req: Request, res: Response) => { 
   const prisma = new PrismaClient();
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
    
        const access = signAccessToken({ sub: user.id , role: user.role });
        const refresh = signRefreshToken({ sub: user.id , role: user.role });

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
    try {
      
      const id = req.user?.id;
        const { latitude, longitude, areaId, areaName } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        if (!id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const prisma = new PrismaClient();
       const location = await prisma.location.create({
            data: {
                userId: id,
                inLatitude: latitude,
                inLongitude: longitude,
                areaId: areaId || null,
                areaName: areaName || null,
                locationSharingTime: new Date(), // Removed because not in Prisma schema
                isDisconnected: false
            },
        });
        // Logic to handle geofencing can be added here
        res.status(200).json({ message: 'Location logged successfully', location });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log location' });
    }
}
export const getLocation = async (req: Request, res: Response) => { 
    try {
        // Logic to retrieve the location
        const location = { latitude: 0, longitude: 0 }; // Example location
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve location' });
    }
}
export const GeofenceDetails = async (req: Request, res: Response) => {
    try {
        // Logic to retrieve geofence details
        const geofence = { id: 1, name: 'Example Geofence' }; // Example geofence
        res.status(200).json(geofence);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve geofence details' });
    }
}
export const getLocationHistory = async (req: Request, res: Response) => {
    try {
        // Logic to retrieve location history
        const history = [
            { timestamp: '2023-10-01T00:00:00Z', latitude: 0, longitude: 0 },
            { timestamp: '2023-10-02T00:00:00Z', latitude: 1, longitude: 1 }
        ]; // Example history
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve location history' });
    }
}
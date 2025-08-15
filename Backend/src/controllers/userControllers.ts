import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createClient } from "redis";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, persistToken, revokeToken } from "../auth/token";
import { checkIfInsideAnyFence } from "../utils/geoFenceArea";
import { sendGeofenceEventEmail } from "../utils/mail";

// Single Prisma instance
const prisma = new PrismaClient().$extends(withAccelerate());

/**
 * Create a new user
 */
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

/**
 * User login
 */
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

/**
 * User logout
 */
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

/**
 * Log user location and detect geofence events
 */
export const logLocation = async (req: Request, res: Response) => {
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        const id = req.user?.id;
        const { latitude, longitude } = req.body;

        if (!id) return res.status(400).json({ error: "User ID is required" });
        if (!latitude || !longitude) return res.status(400).json({ error: "Latitude and longitude are required" });

        const insideFences = await checkIfInsideAnyFence(latitude, longitude);
        const isCurrentlyInside = insideFences.length > 0;
        const currentFence = isCurrentlyInside ? insideFences[0] : null;

        const lastRecord = await prisma.location.findFirst({
            where: { userId: id },
            orderBy: { inTime: "desc" }
        });
        const wasPreviouslyInside = lastRecord && !lastRecord.isDisconnected;

        let eventType: "ENTER" | "EXIT" | "SWITCH" | null = null;
        let payload: any = {};

        // ENTER event
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
            const newUserInFence = await prisma.userGeofence.create({
                data: { userId: id, geofenceId: currentFence!.id }
            });
            payload = { ...newRecord, userInFence: newUserInFence };
        }

        // EXIT event
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
            if (lastRecord!.areaId) {
                await prisma.userGeofence.deleteMany({ where: { userId: id, geofenceId: lastRecord!.areaId } });
            }
            payload = { ...updatedRecord };
        }

        // SWITCH event
        if (isCurrentlyInside && wasPreviouslyInside && lastRecord!.areaId !== currentFence!.id) {
            eventType = "SWITCH";
            await prisma.location.update({
                where: { id: lastRecord!.id },
                data: {
                    outLatitude: latitude,
                    outLongitude: longitude,
                    outTime: new Date(),
                    isDisconnected: true,
                    isSwitched: true
                }
            });
            if (lastRecord!.areaId) {
                await prisma.userGeofence.deleteMany({ where: { userId: id, geofenceId: lastRecord!.areaId } });
            }

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
            const newUserInFence = await prisma.userGeofence.create({
                data: { userId: id, geofenceId: currentFence!.id }
            });
            payload = { ...newRecord, userInFence: newUserInFence };
        }

        if (!eventType) return res.status(200).json({ message: "No status change" });

        // Push event to Redis
        await redis.lPush("geofence-events", JSON.stringify({ type: eventType, data: payload }));

        // Send notification email
        let adminEmail: string | undefined;
        if (eventType === "ENTER" || eventType === "SWITCH") {
            const geofence = await prisma.geoFenceArea.findUnique({ where: { id: currentFence!.id }, include: { admin: true } });
            adminEmail = geofence?.admin?.email;
        } else if (eventType === "EXIT" && lastRecord?.areaId) {
            const geofence = await prisma.geoFenceArea.findUnique({ where: { id: lastRecord.areaId }, include: { admin: true } });
            adminEmail = geofence?.admin?.email;
        }

        if (req.user?.email && adminEmail) {
            await sendGeofenceEventEmail(eventType, payload, req.user.email, adminEmail);
        }

        res.status(200).json({ message: `Queued ${eventType} event`, payload });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process location" });
    } finally {
        await redis.disconnect();
    }
};

/**
 * Get current geofence details
 */
export const GeofenceDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        const lastLocation = await prisma.location.findFirst({
            where: { userId },
            orderBy: { inTime: "desc" },
            select: { areaId: true }
        });

        if (!lastLocation || !lastLocation.areaId) return res.status(404).json({ error: "No active geofence found" });

        const geofenceDetails = await prisma.geoFenceArea.findUnique({ where: { id: lastLocation.areaId } });
        if (!geofenceDetails) return res.status(404).json({ error: "Geofence not found" });

        return res.status(200).json(geofenceDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch geofence details" });
    }
};

/**
 * Get user location history
 */
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

/**
 * Verify user token
 */
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

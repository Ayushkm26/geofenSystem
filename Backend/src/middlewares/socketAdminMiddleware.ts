import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";

const prisma = new PrismaClient();

interface AdminJwtPayload {
  sub: any;
  id: string;
  role: string;
  email?: string;
}

export const socketAdminMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
 try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("❌ No token provided");
      return next(new Error("Admin auth token missing"));
    }

    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      console.log("❌ JWT secret missing");
      return next(new Error("JWT secret not configured"));
    }

    let decoded: AdminJwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as AdminJwtPayload;
    } catch (err) {
      console.log("❌ JWT verification failed:", err);
      return next(new Error("Authentication failed"));
    }

    if (!decoded || decoded.role !== "ADMIN") {
      console.log("❌ Invalid admin role:", decoded);
      return next(new Error("Unauthorized admin"));
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.sub } });
    if (!admin) {
      console.log("❌ Admin not found in DB for ID:", decoded.sub);
      return next(new Error("Admin not found"));
    }

    socket.data.admin = admin;
    console.log("✅ Admin socket authenticated:", admin.id);
    next();
  } catch (err) {
    console.error("❌ Admin socket auth error:", err);
    next(new Error("Authentication failed"));
  }
};

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
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("❌ Admin auth token missing"));
    }
    console.log("Admin auth token found:", token);

    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      return next(new Error("❌ JWT secret not configured"));
    }

    const decoded = jwt.verify(token, jwtSecret) as AdminJwtPayload;
  

    if (!decoded || decoded.role !== "ADMIN") {
      return next(new Error("❌ Unauthorized admin"));
    }
     console.log(decoded);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.sub }
    });

    if (!admin) {
      return next(new Error("❌ Admin not found"));
    }

    // Attach admin info to socket for later use
    socket.data.admin = admin;
    
    
    next();
  } catch (err) {
    console.error("❌ Admin socket auth error:", err);
    next(new Error("Authentication failed"));
  }
};

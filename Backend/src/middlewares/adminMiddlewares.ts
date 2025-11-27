import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenValid } from "../auth/token";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string };
    }
  }
}

export const authAdmin = (requireActive: boolean) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;

    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }

    const token = auth.split(" ")[1];

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as { sub: string; role?: string };

      if (payload.role !== "ADMIN") {
        return res.status(403).json({ error: "Not authorized as admin" });
      }

      // Validate if token still exists (not revoked)
      const ok = await isTokenValid(token, "ACCESS");
      if (!ok) {
        return res.status(401).json({ error: "Token revoked or expired" });
      }

      // 🔍 Fetch admin from DB
      const admin = await prisma.admin.findUnique({
        where: { id: payload.sub }
      });

      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      // Check real subscription status
      const now = new Date();
      const subscriptionExpired =
        !admin.subscriptionEnd || new Date(admin.subscriptionEnd) < now;

      // 🔒 REQUIRE ACTIVE
      if (requireActive) {
        if (!admin.isActive || subscriptionExpired) {
          return res
            .status(403)
            .json({ 
              error: "Subscription inactive or expired. Please renew." 
            });
        }
      }

      // 🔓 REQUIRE INACTIVE (payment page)
      else {
        if (admin.isActive && !subscriptionExpired) {
          return res.status(409).json({
            error: "You already have an active plan."
          });
        }
      }

      req.admin = { id: admin.id };
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};

export const PaymentauthAdminMiddleware = authAdmin(false);
export const authAdminMiddleware = authAdmin(true);

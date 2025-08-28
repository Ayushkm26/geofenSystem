import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenValid } from "../auth/token";

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string };
    }
  }
}

/**
 * Middleware for Admin authentication & subscription validation
 * @param requireActive - If true → requires active plan, if false → requires inactive plan
 */
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
      ) as { sub: string; role?: string; isActive?: boolean };

      if (payload.role !== "ADMIN") {
        return res.status(403).json({ error: "Not authorized as admin" });
      }

      // 🔒 Subscription checks
      if (requireActive && payload.isActive === false) {
        return res
          .status(403)
          .json({ error: "Subscription inactive. Please buy a plan." });
      }
      if (!requireActive && payload.isActive === true) {
        return res
          .status(409)
          .json({ error: "Already have an active plan." });
      }

      // 🔑 Check DB if token is still valid (not revoked)
      const ok = await isTokenValid(token, "ACCESS");
      if (!ok) {
        return res.status(401).json({ error: "Token revoked or expired" });
      }

      req.admin = { id: payload.sub };
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};
export const PaymentauthAdminMiddleware = authAdmin(false);
export const authAdminMiddleware = authAdmin(true);
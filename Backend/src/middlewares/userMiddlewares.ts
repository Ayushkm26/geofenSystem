import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenValid } from "../auth/token";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role?: string; email?: string };
    }
  }
}

export async function authUserMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({error:"No token"});
  const token = auth.split(" ")[1];

  try {
    // Verify access token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string; role?: string; email?: string };
      console.log(payload.role);
      if (payload.role !== "USER") {
        return res.status(403).json({ error: "Not authorized to log out user" });
      }
    } catch (error) {
      // If access token expired, try to refresh
      if ((error as any).name === "TokenExpiredError") {
        const refreshToken = req.headers["x-refresh-token"] as string | undefined;
        if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

        try {
          const refreshPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string; role?: string; email?: string };
          if (refreshPayload.role !== "USER") {
            return res.status(403).json({ error: "Not authorized as a user" });
          }
          const ok = await isTokenValid(refreshToken, "REFRESH");
          if (!ok) return res.status(401).json({ error: "Refresh token revoked or expired" });

          const newAccessToken = jwt.sign(
            { sub: refreshPayload.sub },
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: "1d" }
          );
          res.setHeader("x-access-token", newAccessToken);

          payload = refreshPayload;
        } catch (refreshErr) {
          return res.status(401).json({ error: "Invalid refresh token" });
        }
      } else {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    const ok = await isTokenValid(token, "ACCESS");
    if (!ok) return res.status(401).json({ error: "Token revoked or expired" });

    req.user = { id: payload.sub , role: payload.role ,email: payload.email };
    console.log(payload.email);
    next();
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
}

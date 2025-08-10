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

export async function authAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({error:"No token"});
  const token = auth.split(" ")[1];

  try {
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string; role?: string };
    if (payload.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to log out admin" });
    }
    } catch (error) {
      if ((error as any).name === "TokenExpiredError") {
        const refreshToken = req.headers["x-refresh-token"] as string | undefined;
        if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

        try {
          const refreshPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string; role?: string };
            if (refreshPayload.role !== "ADMIN") {
                return res.status(403).json({ error: "Not authorized as a admin" });
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

    // check DB if token is valid (not revoked, not expired according to DB row)
    const ok = await isTokenValid(token, "ACCESS");
    if (!ok) return res.status(401).json({ error: "Token revoked or expired" });

    // attach admin info
    req.admin = { id: payload.sub };
    console.log(payload.sub);
    next();
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
}

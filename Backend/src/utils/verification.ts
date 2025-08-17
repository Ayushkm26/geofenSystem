// src/auth/utils.ts
import jwt from "jsonwebtoken";
import { isTokenValid } from "./../auth/token";

interface TokenPayload {
  sub: string;
  role?: string;
  email?: string;
}

export async function verifyAuthentication(
  token: string,
  refreshToken?: string
): Promise<{ user: { id: string; role?: string; email?: string }, newAccessToken?: string }> {
  try {
    // Verify access token
    let payload: TokenPayload;
    let newAccessToken: string | undefined;
    
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
      
      // Check if token is valid in database
      const isValid = await isTokenValid(token, "ACCESS");
      if (!isValid) throw new Error("Token revoked or expired");
      
      if (payload.role !== "USER") {
        throw new Error("Not authorized as a user");
      }
    } catch (error) {
      // If access token expired, try to refresh
      if ((error as any).name === "TokenExpiredError") {
        if (!refreshToken) throw new Error("Refresh token required");
        
        const refreshPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
        if (refreshPayload.role !== "USER") {
          throw new Error("Not authorized as a user");
        }
        
        const isValid = await isTokenValid(refreshToken, "REFRESH");
        if (!isValid) throw new Error("Refresh token revoked or expired");
        
        newAccessToken = jwt.sign(
          { sub: refreshPayload.sub, role: refreshPayload.role, email: refreshPayload.email },
          process.env.JWT_ACCESS_SECRET!,
          { expiresIn: "1d" }
        );
        
        payload = refreshPayload;
      } else {
        throw error;
      }
    }
    
    return {
      user: { id: payload.sub, role: payload.role, email: payload.email },
      newAccessToken
    };
  } catch (error) {
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: string }).message
      : String(error);
    throw new Error("Authentication failed: " + errorMessage);
  }
}
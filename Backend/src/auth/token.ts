import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(payload: object) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "1d" });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export async function persistToken(token: string, userId: string, type: "ACCESS"|"REFRESH", expiresAt: Date) {
  const hashed = hashToken(token);
  return prisma.jwtToken.create({
    data: {
      userId,
      token: hashed,
      type,
      expiresAt,
    }
  });
}

/** Mark given token as revoked (logout) */
export async function revokeToken(token: string, reason?: string) {
  const hashed = hashToken(token);
  return prisma.jwtToken.updateMany({
    where: { token: hashed, revoked: false },
    data: { revoked: true, revokedAt: new Date(), reason }
  });
}

/** Check whether token is revoked/expired */
export async function isTokenValid(token: string, type: "ACCESS"|"REFRESH") {
  const hashed = hashToken(token);
  const row = await prisma.jwtToken.findFirst({
    where: { token: hashed, type },
  });
  if (!row) return false; // unknown token
  if (row.revoked) return false;
  if (row.expiresAt.getTime() < Date.now()) return false;
  return true;
}

/** Revoke all tokens for a user (logout-all) */
export async function revokeAllTokensForUser(userId: string, reason?: string) {
  return prisma.jwtToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true, revokedAt: new Date(), reason }
  });
}

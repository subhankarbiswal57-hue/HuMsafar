import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { prisma } from "../config/prisma";

export interface AccessTokenPayload {
  sub: string;
  role: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const token = jwt.sign({ sub: userId, jti: uuidv4() }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_EXPIRES_IN_DAYS}d`,
  });
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function rotateRefreshToken(oldToken: string): Promise<{ userId: string; token: string } | null> {
  let decoded: { sub: string };
  try {
    decoded = jwt.verify(oldToken, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    return null;
  }
  const stored = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) return null;

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const newToken = await issueRefreshToken(decoded.sub);
  return { userId: decoded.sub, token: newToken };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
}

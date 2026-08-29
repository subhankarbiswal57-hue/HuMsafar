import { Request, Response } from "express";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { prisma } from "../config/prisma";
import { signAccessToken, issueRefreshToken } from "../utils/jwt";
import { sanitizeUser } from "../services/auth.service";
import { env } from "../config/env";

// Verifies a Google ID token via Google's tokeninfo endpoint (no extra SDK dependency).
async function verifyGoogleIdToken(idToken: string) {
  const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!resp.ok) throw new ApiError(401, "Invalid Google token");
  const data: any = await resp.json();
  if (!data.email || data.email_verified !== "true") throw new ApiError(401, "Google email not verified");
  return data as { sub: string; email: string; given_name?: string; family_name?: string };
}

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken: string };
  if (!idToken) throw new ApiError(400, "idToken is required");
  const payload = await verifyGoogleIdToken(idToken);

  let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub } });
    } else {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          passwordHash: "",
          firstName: payload.given_name ?? "Google",
          lastName: payload.family_name ?? "User",
          role: "CITIZEN",
          isEmailVerified: true,
          googleId: payload.sub,
        },
      });
    }
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = await issueRefreshToken(user.id);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    maxAge: env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
  res.json({ accessToken, user: sanitizeUser(user) });
});

import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as authService from "../services/auth.service";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";

const REFRESH_COOKIE = "refreshToken";

export function setRefreshCookie(res: Response, token: string) {
  // Support cross-domain cookies when COOKIE_SECURE is true (Render + Vercel deployment)
  const isSecure = env.COOKIE_SECURE || env.NODE_ENV === "production";
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ message: "Registration successful. Please verify your email.", user });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token);
  res.json({ message: "Email verified successfully" });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body.email, req.body.password);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ error: "Missing refresh token" });
  const { accessToken, refreshToken, user } = await authService.refreshTokens(token);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await authService.logoutUser(token);
  const isSecure = env.COOKIE_SECURE || env.NODE_ENV === "production";
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth", secure: isSecure, sameSite: isSecure ? "none" : "lax" });
  res.json({ message: "Logged out" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.requestPasswordReset(req.body.email);
  res.json({ message: "If that email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ message: "Password reset successfully" });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: authService.sanitizeUser(user) });
});

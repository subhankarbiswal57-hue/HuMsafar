import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken } from "../utils/jwt";
import { sendMail, verificationEmailHtml, resetPasswordEmailHtml } from "../utils/mailer";
import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";
import { Role } from "@prisma/client";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await hashPassword(input.password);
  const emailVerifyToken = uuidv4();

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role ?? "CITIZEN",
      emailVerifyToken,
    },
  });

  await sendMail(
    user.email,
    "Verify your email",
    verificationEmailHtml(`${env.APP_URL}/verify-email?token=${emailVerifyToken}`)
  );

  return sanitizeUser(user);
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) throw new ApiError(400, "Invalid verification token");
  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid credentials");
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = await issueRefreshToken(user.id);
  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

export async function refreshTokens(oldToken: string) {
  const rotated = await rotateRefreshToken(oldToken);
  if (!rotated) throw new ApiError(401, "Invalid refresh token");
  const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
  if (!user) throw new ApiError(401, "User not found");
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  return { accessToken, refreshToken: rotated.token, user: sanitizeUser(user) };
}

export async function logoutUser(refreshToken: string) {
  await revokeRefreshToken(refreshToken);
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // do not leak existence
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
  await sendMail(
    user.email,
    "Reset your password",
    resetPasswordEmailHtml(`${env.APP_URL}/reset-password?token=${resetToken}`)
  );
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw new ApiError(400, "Invalid or expired reset token");
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });
}

export function sanitizeUser(user: any) {
  const { passwordHash, emailVerifyToken, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
}

import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    logger.info(`[mailer:dev-mode] to=${to} subject=${subject}`);
    return;
  }
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
}

export function verificationEmailHtml(link: string): string {
  return `<p>Welcome to the Infrastructure Resilience Platform.</p><p>Verify your email: <a href="${link}">${link}</a></p>`;
}

export function resetPasswordEmailHtml(link: string): string {
  return `<p>Reset your password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`;
}

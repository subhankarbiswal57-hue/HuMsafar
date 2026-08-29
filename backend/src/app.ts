import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { UPLOAD_DIR } from "./utils/upload";

import authRoutes from "./routes/auth.routes";
import roadRoutes from "./routes/road.routes";
import bridgeRoutes from "./routes/bridge.routes";
import transitRoutes from "./routes/transit.routes";
import assetRoutes from "./routes/asset.routes";
import gisRoutes from "./routes/gis.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import complaintRoutes from "./routes/complaint.routes";
import inspectionRoutes from "./routes/inspection.routes";
import maintenanceRoutes from "./routes/maintenance.routes";
import analyticsRoutes from "./routes/analytics.routes";
import aiRoutes from "./routes/ai.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(","),
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
  app.use("/api", globalLimiter);

  app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

  // Serve uploaded complaint/inspection photos. In production, swap this for Cloudinary
  // (upload.ts already isolates the storage logic behind fileToPublicUrl).
  app.use("/uploads", express.static(UPLOAD_DIR));

  app.use("/api/auth", authRoutes);
  app.use("/api/roads", roadRoutes);
  app.use("/api/bridges", bridgeRoutes);
  app.use("/api/transit", transitRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/gis", gisRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/inspections", inspectionRoutes);
  app.use("/api/maintenance", maintenanceRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/ai", aiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

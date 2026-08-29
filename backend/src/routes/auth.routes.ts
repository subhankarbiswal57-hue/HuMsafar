import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { googleLogin } from "../controllers/oauth.controller";
import { validateBody } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validators";
import { requireAuth } from "../middleware/auth";

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.post("/verify-email", validateBody(verifyEmailSchema), authController.verifyEmail);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), authController.resetPassword);
router.get("/me", requireAuth, authController.me);
router.post("/google", authLimiter, googleLogin);

export default router;

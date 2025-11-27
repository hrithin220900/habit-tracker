import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../core/middlewares/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validators.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import { authLimiter } from "../../core/middlewares/rateLimit.middleware.js";

/**
 * Auth routes
 */
const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  validate(registerSchema, "body"),
  authController.register.bind(authController)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  validate(loginSchema, "body"),
  authController.login.bind(authController)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  "/refresh",
  validate(refreshTokenSchema, "body"),
  authController.refreshToken.bind(authController)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear refresh token)
 * @access  Private
 */
router.post(
  "/logout",
  authenticate,
  authController.logout.bind(authController)
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify access token
 * @access  Private
 */
router.get("/verify", authenticate, authController.verify.bind(authController));

export default router;

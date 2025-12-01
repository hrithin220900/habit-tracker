import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";

const isDevelopment = config.server.env === "development";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Much higher limit in development
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === "::1" || req.ip === "127.0.0.1" || req.ip?.startsWith("::ffff:127.0.0.1"));
  },
  handler(req: Request, res: Response) {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        method: req.method,
      },
      "Rate limit exceeded"
    );
    res.status(429).json({
      success: false,
      error: {
        message: "Too many requests, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: isDevelopment ? 60 * 1000 : 60 * 60 * 1000, // 1 minute in dev, 1 hour in production
  max: isDevelopment ? 100 : 10, // Much higher limit in development
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === "::1" || req.ip === "127.0.0.1" || req.ip?.startsWith("::ffff:127.0.0.1"));
  },
  handler: (req: Request, res: Response) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
      },
      "Auth rate limit exceeded"
    );
    res.status(429).json({
      success: false,
      error: {
        message: "Too many authentication attempts, please try again later.",
        code: "AUTH_RATE_LIMIT_EXCEEDED",
      },
    });
  },
});

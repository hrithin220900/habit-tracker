import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
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
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
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

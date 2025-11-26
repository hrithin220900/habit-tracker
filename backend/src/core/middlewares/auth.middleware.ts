import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { AuthenticationError, AuthorizationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AuthenticationError("Token is required");
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError("Token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError("Invalid token");
      }
      throw error;
    }
  } catch (error) {
    logger.warn({ error }, "Authentication failed");
    next(error);
  }
};

export const authorize =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthorizationError("You are not authenticated");
      }

      if (!allowedRoles.length) {
        return next();
      }

      const userRole = req.user.role || "user";

      if (!allowedRoles.includes(userRole)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

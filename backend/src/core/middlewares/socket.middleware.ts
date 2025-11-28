import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import type { JWTPayload } from "../utils/jwt.js";
import type { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
  role?: string;
}

export const socketAuth = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      logger.warn(
        { socketId: socket.id },
        "Socket connection rejected: No token provided"
      );
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      socket.userId = decoded.userId;
      socket.email = decoded.email;
      socket.role = decoded.role || "user";

      logger.debug(
        { socketId: socket.id, userId: decoded.userId },
        "Socket authenticated successfully"
      );

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn(
          { socketId: socket.id },
          "Socket connection rejected: Token expired"
        );
        return next(new Error("Authentication error: Token expired"));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn(
          { socketId: socket.id },
          "Socket connection rejected: Invalid token"
        );
        return next(new Error("Authentication error: Invalid token"));
      }
      throw error;
    }
  } catch (error) {
    logger.error({ error, socketId: socket.id }, "Socket authentication error");
    next(new Error("Authentication error"));
  }
};

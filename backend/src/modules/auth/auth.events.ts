import type { Server as SocketIOServer } from "socket.io";
import { logger } from "../../core/utils/logger.js";

export class AuthEvents {
  private io: SocketIOServer | null = null;

  initialize(io: SocketIOServer): void {
    this.io = io;
    logger.info("Auth events initialized");
  }

  emitUserAuthenticated(userId: string, email: string): void {
    if (!this.io) {
      logger.warn("Socket.io server not initialized, skipping event");
      return;
    }

    this.io.to(`user:${userId}`).emit("user:authenticated", {
      userId,
      email,
      timestamp: new Date().toISOString(),
    });
  }

  emitUserLoggedOut(userId: string): void {
    if (!this.io) {
      logger.warn("Socket.io server not initialized, skipping event");
      return;
    }

    this.io.to(`user:${userId}`).emit("user:logged_out", {
      userId,
      timestamp: new Date().toISOString(),
    });

    logger.debug({ userId }, "Emitted user:logged_out event");
  }
}

export const authEvents = new AuthEvents();

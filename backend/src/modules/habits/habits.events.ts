import type { Server as SocketIOServer } from "socket.io";
import { logger } from "../../core/utils/logger.js";

export class HabitsEvents {
  private io: SocketIOServer | null = null;

  initialize(io: SocketIOServer): void {
    this.io = io;
    logger.info("Habits events initialized");
  }

  emitHabitCreated(userId: string, habit: any): void {
    if (!this.io) {
      logger.warn("Socket.io server not initialized, skipping event");
      return;
    }
    this.io.to(`user:${userId}`).emit("habit:created", {
      habit,
      timestamp: new Date().toISOString(),
    });

    logger.debug({ userId, habitId: habit.id }, "Emitted habit:created event");
  }

  emitHabitUpdated(userId: string, habit: any): void {
    if (!this.io) {
      logger.warn("Socket.io server not initialized, skipping event");
      return;
    }

    this.io.to(`user:${userId}`).emit("habit:updated", {
      habit,
      timestamp: new Date().toISOString(),
    });

    logger.debug({ userId, habitId: habit.id }, "Emitted habit:updated event");
  }

  emitHabitDeleted(userId: string, habitId: string): void {
    if (!this.io) {
      logger.warn("Socket.io server not initialized, skipping event");
      return;
    }

    this.io.to(`user:${userId}`).emit("habit:deleted", {
      habitId,
      timestamp: new Date().toISOString(),
    });

    logger.debug({ userId, habitId }, "Emitted habit:deleted event");
  }

  emitHabitCompleted(
    userId: string,
    habitId: string,
    date: string,
    streak: number
  ): void {
    if (!this.io) {
      logger.warn("Socket.io server not initialized, skipping event");
      return;
    }

    this.io.to(`user:${userId}`).emit("habit:completed", {
      habitId,
      date,
      streak,
      timestamp: new Date().toISOString(),
    });

    logger.debug(
      { userId, habitId, date, streak },
      "Emitted habit:completed event"
    );
  }
}

export const habitsEvents = new HabitsEvents();

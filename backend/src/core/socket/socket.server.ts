import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import { authEvents } from "../../modules/auth/auth.events.js";
import { habitsEvents } from "../../modules/habits/habits.events.js";
import {
  socketAuth,
  type AuthenticatedSocket,
} from "../middlewares/socket.middleware.js";
import { habitsService } from "../../modules/habits/habits.service.js";

let io: SocketIOServer | null = null;

export function initializeSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.socket.corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(socketAuth);

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;

    if (!userId) {
      logger.warn({ socketId: socket.id }, "Socket connected without userId");
      socket.disconnect();
      return;
    }

    logger.info(
      { socketId: socket.id, userId },
      "Socket connected successfully"
    );

    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    logger.debug(
      { socketId: socket.id, userId, room: userRoom },
      "Socket joined user room"
    );

    socket.on("join:user-room", (data: { userId?: string }) => {
      const targetUserId = data.userId || userId;
      if (targetUserId === userId) {
        socket.join(`user:${targetUserId}`);
        logger.debug(
          { socketId: socket.id, userId: targetUserId },
          "Explicitly joined user room"
        );
        socket.emit("joined:user-room", { userId: targetUserId });
      } else {
        socket.emit("error", {
          message: "Cannot join another user's room",
          code: "AUTHORIZATION_ERROR",
        });
      }
    });

    socket.on(
      "habit:complete",
      async (data: { habitId: string; date?: string }) => {
        try {
          if (!userId) {
            socket.emit("error", {
              message: "User not authenticated",
              code: "AUTHENTICATION_ERROR",
            });
            return;
          }

          if (!data?.habitId) {
            socket.emit("error", {
              message: "Habit ID is required",
              code: "VALIDATION_ERROR",
            });
            return;
          }

          const completion = await habitsService.markComplete(
            data.habitId,
            userId,
            data.date
          );

          socket.emit("habit:completed", {
            habitId: data.habitId,
            date: completion.date,
            streak: completion.streak,
            timestamp: new Date().toISOString(),
          });

          io?.to(`user:${userId}`).emit("habit:completed", {
            habitId: data.habitId,
            date: completion.date,
            streak: completion.streak,
            timestamp: new Date().toISOString(),
          });
          logger.debug(
            { socketId: socket.id, userId, habitId: data.habitId },
            "Habit completed via socket"
          );
        } catch (error) {
          logger.error(
            { error, socketId: socket.id, userId, data },
            "Error handling habit:complete event"
          );
          socket.emit("error", {
            message:
              error instanceof Error
                ? error.message
                : "Failed to complete habit",
            code: "COMPLETION_ERROR",
          });
        }
      }
    );

    socket.on(
      "habit:uncomplete",
      async (data: { habitId: string; date: string }) => {
        try {
          if (!userId) {
            socket.emit("error", {
              message: "User not authenticated",
              code: "AUTHENTICATION_ERROR",
            });
            return;
          }

          if (!data?.habitId || !data?.date) {
            socket.emit("error", {
              message: "Habit ID and date are required",
              code: "VALIDATION_ERROR",
            });
            return;
          }

          await habitsService.unmarkComplete(data.habitId, userId, data.date);

          socket.emit("habit:uncompleted", {
            habitId: data.habitId,
            date: data.date,
            timestamp: new Date().toISOString(),
          });

          io?.to(`user:${userId}`).emit("habit:uncompleted", {
            habitId: data.habitId,
            date: data.date,
            timestamp: new Date().toISOString(),
          });

          logger.debug(
            {
              socketId: socket.id,
              userId,
              habitId: data.habitId,
              date: data.date,
            },
            "Habit uncompleted via socket"
          );
        } catch (error) {
          logger.error(
            { error, socketId: socket.id, userId, data },
            "Error handling habit:uncomplete event"
          );
          socket.emit("error", {
            message:
              error instanceof Error
                ? error.message
                : "Failed to uncomplete habit",
            code: "UNCOMPLETION_ERROR",
          });
        }
      }
    );

    socket.on("disconnect", (reason: string) => {
      logger.info(
        { socketId: socket.id, userId, reason },
        "Socket disconnected"
      );
    });

    socket.on("error", (error: Error) => {
      logger.error({ error, socketId: socket.id, userId }, "Socket error");
    });
  });

  authEvents.initialize(io);
  habitsEvents.initialize(io);

  logger.info("Socket.io server initialized");

  return io;
}

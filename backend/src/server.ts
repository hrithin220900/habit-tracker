import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./core/config/index.js";
import { logger } from "./core/utils/logger.js";
import { database } from "./core/database/connection.js";
import {
  errorHandler,
  notFoundHandler,
} from "./core/middlewares/error.middleware.js";
import { apiLimiter } from "./core/middlewares/rateLimit.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import habitsRoutes from "./modules/habits/habits.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import {
  createApolloServer,
  startApolloServer,
} from "./core/graphql/server.js";
import { initializeSocket } from "./core/socket/socket.server.js";
import { createServer } from "http";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

app.use(config.server.apiPrefix, apiLimiter);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(config.server.apiPrefix, (req, res, next) => {
  if (
    req.path.startsWith("/auth") ||
    req.path.startsWith("/habits") ||
    req.path.startsWith("/analytics")
  ) {
    return next();
  }
  res.json({ message: "API is running" });
});

// Auth routes
app.use(`${config.server.apiPrefix}/auth`, authRoutes);

// Habits routes
app.use(`${config.server.apiPrefix}/habits`, habitsRoutes);

// Analytics routes
app.use(`${config.server.apiPrefix}/analytics`, analyticsRoutes);

// Admin routes
app.use(`${config.server.apiPrefix}/admin`, adminRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await database.connect();

    const httpServer = createServer(app);

    initializeSocket(httpServer);

    const apolloServer = createApolloServer();
    await startApolloServer(apolloServer, app);

    const server = httpServer.listen(config.server.port, () => {
      logger.info(
        {
          port: config.server.port,
          env: config.server.env,
          apiPrefix: config.server.apiPrefix,
        },
        "Server started successfully"
      );
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      server.close(async () => {
        logger.info("HTTP server closed");
        await apolloServer.stop();
        await database.disconnect();
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Graceful shutdown timed out, forcefully exiting...");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error(error, "Failed to start server");
    process.exit(1);
  }
};

startServer();

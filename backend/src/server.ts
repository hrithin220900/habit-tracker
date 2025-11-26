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

app.use(config.server.apiPrefix, (req, res) => {
  res.json({ message: "API is running" });
});

app.use(notFoundHandler);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await database.connect();

    const server = app.listen(config.server.port, () => {
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

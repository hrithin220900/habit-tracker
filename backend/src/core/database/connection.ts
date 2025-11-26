import mongoose from "mongoose";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

class DatabaseConnection {
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("Database already connected");
      return;
    }

    try {
      await mongoose.connect(config.database.uri);
      this.isConnected = true;
      logger.info("MongoDB connected successfully");

      mongoose.connection.on("error", (error) => {
        logger.error("MongoDB connection error:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        logger.info("MongoDB reconnected");
        this.isConnected = true;
      });

      process.on("SIGINT", this.disconnect.bind(this));
      process.on("SIGTERM", this.disconnect.bind(this));
    } catch (error) {
      logger.error({ error }, "Failed to connect to database");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info("Database not connected");
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("Disconnected from MongoDB");
    } catch (error) {
      logger.error({ error }, "Failed to disconnect from database");
      throw error;
    }
  }

  get connected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const database = new DatabaseConnection();

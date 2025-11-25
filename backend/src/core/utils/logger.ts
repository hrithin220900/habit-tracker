import pino from "pino";
import { config } from "../config/index.js";

const loggerOptions: pino.LoggerOptions = {
  level: config.logging.level,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

if (config.server.env === "development") {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  };
}

export const logger = pino(loggerOptions);

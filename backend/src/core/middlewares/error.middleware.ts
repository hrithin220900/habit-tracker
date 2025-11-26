import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof AppError && error.isOperational) {
    logger.warn(
      {
        statusCode: error.statusCode,
        message: error.message,
        code: error.code,
        path: req.path,
        method: req.method,
      },
      "Operational error"
    );
  } else {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
      },
      "Unexpected error"
    );
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.fields
          ? { fields: error.fields }
          : {}),
        ...(config.server.env === "development" ? { stack: error.stack } : {}),
      },
    });
  } else {
    res.status(500).json({
      success: false,
      error: {
        message:
          config.server.env === "development"
            ? error.message
            : "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
        ...(config.server.env === "development" ? { stack: error.stack } : {}),
      },
    });
  }
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "NOT_FOUND",
    },
  });
};

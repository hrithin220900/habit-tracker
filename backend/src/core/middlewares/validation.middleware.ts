import type { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export const validate = (
  schema: ZodType,
  source: "body" | "query" | "params" = "body"
) => {
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);

      req[source] = validated as (typeof req)[typeof source];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          fields[path] = issue.message;
        });

        logger.warn({ fields, source }, "Validation failed");
        throw new ValidationError("Validation failed", fields);
      }
      next(error);
    }
  };
};

import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import type { JWTPayload } from "../utils/jwt.js";

export interface AuthContext {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
  req: Request;
  res: Response;
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<AuthContext> {
  const context: AuthContext = { req, res };
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1] || "";

      try {
        const decoded = jwt.verify(
          token,
          config.jwt.secret
        ) as unknown as JWTPayload;
        context.user = {
          userId: decoded.userId,
          email: decoded.email,
          ...(decoded.role !== undefined ? { role: decoded.role } : {}),
        };
      } catch (error) {}
    }
  } catch (error) {}
  return context;
}

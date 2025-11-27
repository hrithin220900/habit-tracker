import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { config } from "../config/index.js";

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = config.jwt.secret as Secret;

  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiry as NonNullable<SignOptions["expiresIn"]>,
  };
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = config.jwt.secret as Secret;

  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiry as NonNullable<SignOptions["expiresIn"]>,
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};

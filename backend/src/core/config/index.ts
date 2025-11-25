import { env } from "./env.js";

/**
 * Centralized configuration export
 */
export { env } from "./env.js";

export const config = {
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
    apiPrefix: env.API_PREFIX,
  },
  database: {
    uri: env.MONGODB_URI,
  },
  jwt: {
    secret: env.JWT_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },
  cors: {
    origin: env.FRONTEND_URL,
  },
  socket: {
    corsOrigin: env.SOCKET_CORS_ORIGIN,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

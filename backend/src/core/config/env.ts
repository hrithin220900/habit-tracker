import "dotenv/config";
import { envsafe, str, port, url, makeValidator } from "envsafe";

const jwtParser = makeValidator<string>((input) => {
  if (input.length < 32) {
    throw new Error("JWT secret must be at least 32 characters long");
  }
  return input;
});

export const env = envsafe({
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: port({
    default: 5000,
  }),
  API_PREFIX: str({
    default: "/api",
  }),

  // Database
  MONGODB_URI: url({
    desc: "MongoDB connection string",
  }),

  // JWT
  JWT_SECRET: jwtParser(),
  JWT_ACCESS_EXPIRY: str({
    default: "15m",
    desc: "Access token expiry time",
  }),
  JWT_REFRESH_EXPIRY: str({
    default: "7d",
    desc: "Refresh token expiry time",
  }),

  FRONTEND_URL: url({
    default: "http://localhost:3000",
    desc: "Frontend URL for CORS",
  }),

  SOCKET_CORS_ORIGIN: str({
    default: "http://localhost:3000",
    desc: "Socket.io CORS origin",
  }),

  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace"],
    default: "info",
  }),
});

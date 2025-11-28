import { authRepository } from "./auth.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  type JWTPayload,
} from "../../core/utils/jwt.js";
import { AuthenticationError, ConflictError } from "../../core/utils/errors.js";
import { logger } from "../../core/utils/logger.js";
import type { RegisterInput, LoginInput } from "./auth.validators.js";
import { authEvents } from "./auth.events.js";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export class AuthService {
  async register(data: RegisterInput): Promise<TokenResponse> {
    try {
      const user = await authRepository.create({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      const tokenPayload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      await authRepository.updateRefreshToken(
        user._id.toString(),
        refreshToken,
        refreshTokenExpiry
      );

      logger.info(
        { userId: user._id, email: user.email },
        "User registered successfully"
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error({ error, email: data.email }, "Error during registration");
      throw new Error("Registration failed");
    }
  }

  async login(data: LoginInput): Promise<TokenResponse> {
    try {
      const user = await authRepository.findByEmail(data.email, true);
      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }
      const isPasswordValid = await user.comparePassword(data.password);
      if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
      }
      const tokenPayload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

      // Save refresh token to database
      await authRepository.updateRefreshToken(
        user._id.toString(),
        refreshToken,
        refreshTokenExpiry
      );

      logger.info(
        { userId: user._id, email: user.email },
        "User logged in successfully"
      );

      authEvents.emitUserAuthenticated(user._id.toString(), user.email);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error({ error, email: data.email }, "Error during login");
      throw new AuthenticationError("Login failed");
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyToken(refreshToken);

      const user = await authRepository.findById(decoded.userId, true);
      if (!user) {
        throw new AuthenticationError("Invalid refresh token");
      }
      if (user.refreshToken !== refreshToken) {
        throw new AuthenticationError("Invalid refresh token");
      }
      if (user.refreshTokenExpiry && user.refreshTokenExpiry < new Date()) {
        throw new AuthenticationError("Refresh token expired");
      }

      const tokenPayload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);

      logger.info({ userId: user._id }, "Access token refreshed successfully");

      return { accessToken };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error({ error }, "Error refreshing token");
      throw new AuthenticationError("Token refresh failed");
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await authRepository.clearRefreshToken(userId);
      authEvents.emitUserLoggedOut(userId);
      logger.info({ userId }, "User logged out successfully");
    } catch (error) {
      logger.error({ error, userId }, "Error during logout");
      throw new Error("Logout failed");
    }
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      return verifyToken(token);
    } catch (error) {
      throw new AuthenticationError("Invalid or expired token");
    }
  }
}

export const authService = new AuthService();

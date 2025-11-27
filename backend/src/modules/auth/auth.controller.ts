import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from "./auth.validators.js";
import type { AuthRequest } from "../../core/middlewares/auth.middleware.js";

/**
 * Auth controller - handles HTTP requests and responses
 */
export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body as RegisterInput;
      const result = await authService.register(data);

      res.status(201).json({
        success: true,
        data: result,
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as LoginInput;
      const result = await authService.login(data);

      res.status(200).json({
        success: true,
        data: result,
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: "User not authenticated",
            code: "AUTHENTICATION_ERROR",
          },
        });
        return;
      }

      await authService.logout(req.user.userId);

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify token (health check for auth)
   * GET /api/auth/verify
   */
  async verify(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: "User not authenticated",
            code: "AUTHENTICATION_ERROR",
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
        message: "Token is valid",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

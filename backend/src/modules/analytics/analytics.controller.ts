import type { Response, NextFunction } from "express";
import { analyticsService } from "./analytics.service.js";
import type { AuthRequest } from "../../core/middlewares/auth.middleware.js";

/**
 * Analytics controller - handles HTTP requests and responses
 */
export class AnalyticsController {
  /**
   * Get dashboard statistics
   * GET /api/analytics/dashboard
   */
  async getDashboard(
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

      const stats = await analyticsService.getDashboardStats(req.user.userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get habit analytics
   * GET /api/analytics/habits/:habitId
   */
  async getHabitAnalytics(
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

      const { habitId } = req.params as { habitId: string };
      const analytics = await analyticsService.getHabitAnalytics(
        habitId,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();

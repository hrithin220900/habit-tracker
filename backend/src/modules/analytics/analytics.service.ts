import { analyticsRepository } from "./analytics.repository.js";
import { NotFoundError } from "../../core/utils/errors.js";
import { logger } from "../../core/utils/logger.js";

/**
 * Analytics service - handles analytics business logic
 */
export class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string) {
    try {
      return await analyticsRepository.getDashboardStats(userId);
    } catch (error) {
      logger.error({ error, userId }, "Error in getDashboardStats service");
      throw error;
    }
  }

  /**
   * Get habit analytics
   */
  async getHabitAnalytics(habitId: string, userId: string) {
    try {
      return await analyticsRepository.getHabitAnalytics(habitId, userId);
    } catch (error) {
      if (error instanceof Error && error.message === "Habit not found") {
        throw new NotFoundError("Habit");
      }
      logger.error(
        { error, habitId, userId },
        "Error in getHabitAnalytics service"
      );
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();

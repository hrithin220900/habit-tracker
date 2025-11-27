import { analyticsService } from "../../../modules/analytics/analytics.service.js";
import { AuthenticationError } from "../../../core/utils/errors.js";
import type { AuthContext } from "../context.js";

export const analyticsResolvers = {
  Query: {
    dashboard: async (_: any, __: any, context: AuthContext) => {
      if (!context.user) {
        throw new AuthenticationError("Authentication required");
      }

      return await analyticsService.getDashboardStats(context.user.userId);
    },
    habitAnalytics: async (
      _: any,
      { habitId }: { habitId: string },
      context: AuthContext
    ) => {
      if (!context.user) {
        throw new AuthenticationError("Authentication required");
      }

      return await analyticsService.getHabitAnalytics(
        habitId,
        context.user.userId
      );
    },
  },
};

import { Router } from "express";
import { analyticsController } from "./analytics.controller.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";

/**
 * Analytics routes
 */
const router = Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get(
  "/dashboard",
  authenticate,
  analyticsController.getDashboard.bind(analyticsController)
);

/**
 * @route   GET /api/analytics/habits/:habitId
 * @desc    Get analytics for a specific habit
 * @access  Private
 */
router.get(
  "/habits/:habitId",
  authenticate,
  analyticsController.getHabitAnalytics.bind(analyticsController)
);

export default router;

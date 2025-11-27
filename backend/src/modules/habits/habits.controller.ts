import type { Request, Response, NextFunction } from "express";
import { habitsService } from "./habits.service.js";
import type {
  CreateHabitInput,
  UpdateHabitInput,
  CompleteHabitInput,
} from "./habits.validators.js";
import type { AuthRequest } from "../../core/middlewares/auth.middleware.js";

/**
 * Habits controller - handles HTTP requests and responses
 */
export class HabitsController {
  /**
   * Create a new habit
   * POST /api/habits
   */
  async create(
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

      const data = req.body as CreateHabitInput;
      const result = await habitsService.createHabit(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: result,
        message: "Habit created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all habits for authenticated user
   * GET /api/habits
   */
  async getAll(
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

      const habits = await habitsService.getUserHabits(req.user.userId);

      res.status(200).json({
        success: true,
        data: habits,
        count: habits.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get habit by ID
   * GET /api/habits/:id
   */
  async getById(
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

      const { id } = req.params;
      const habit = await habitsService.getHabitById(id!, req.user.userId);

      res.status(200).json({
        success: true,
        data: habit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update habit
   * PUT /api/habits/:id
   */
  async update(
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

      const { id } = req.params;
      const data = req.body as UpdateHabitInput;
      const habit = await habitsService.updateHabit(id!, req.user.userId, data);

      res.status(200).json({
        success: true,
        data: habit,
        message: "Habit updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete habit
   * DELETE /api/habits/:id
   */
  async delete(
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

      const { id } = req.params;
      await habitsService.deleteHabit(id!, req.user.userId);

      res.status(200).json({
        success: true,
        message: "Habit deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark habit as complete
   * POST /api/habits/:id/complete
   */
  async markComplete(
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

      const { id } = req.params;
      const { date } = req.body as CompleteHabitInput;
      const completion = await habitsService.markComplete(
        id!,
        req.user.userId,
        date
      );

      res.status(200).json({
        success: true,
        data: completion,
        message: "Habit marked as complete",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public habit
   * GET /api/habits/public/:publicId
   */
  async getPublic(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { publicId } = req.params;
      const habit = await habitsService.getPublicHabit(publicId!);

      res.status(200).json({
        success: true,
        data: habit,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const habitsController = new HabitsController();

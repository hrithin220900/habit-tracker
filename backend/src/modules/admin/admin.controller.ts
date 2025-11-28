import type { Response, NextFunction } from "express";
import { adminService } from "./admin.service.js";
import type {
  GetUsersQuery,
  GetHabitsQuery,
  UpdateUserRoleInput,
} from "./admin.validators.js";
import type { AuthRequest } from "../../core/middlewares/auth.middleware.js";

/**
 * Admin controller - handles HTTP requests and responses
 */
export class AdminController {
  /**
   * Get all users
   * GET /api/admin/users
   */
  async getUsers(
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

      const query = (req.query || {}) as GetUsersQuery;
      const page = query.page || 1;
      const limit = query.limit || 10;
      const search = query.search;

      const result = await adminService.getUsers(page, limit, search);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID with statistics
   * GET /api/admin/users/:userId
   */
  async getUserById(
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

      const { userId } = req.params;
      const user = await adminService.getUserById(userId!);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all habits
   * GET /api/admin/habits
   */
  async getHabits(
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

      const query = (req.query || {}) as GetHabitsQuery;
      const page = query.page || 1;
      const limit = query.limit || 10;
      const search = query.search;

      const result = await adminService.getHabits(page, limit, search);

      res.status(200).json({
        success: true,
        data: result.habits,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system metrics
   * GET /api/admin/metrics
   */
  async getMetrics(
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

      const metrics = await adminService.getSystemMetrics();

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   * PUT /api/admin/users/:userId/role
   */
  async updateUserRole(
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

      const { userId } = req.params;
      const { role } = req.body as UpdateUserRoleInput;

      const user = await adminService.updateUserRole(userId!, role);

      res.status(200).json({
        success: true,
        data: user,
        message: "User role updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:userId
   */
  async deleteUser(
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

      const { userId } = req.params;
      await adminService.deleteUser(userId!);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

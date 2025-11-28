import { adminRepository } from "./admin.repository.js";
import { NotFoundError } from "../../core/utils/errors.js";
import { logger } from "../../core/utils/logger.js";

/**
 * Admin service - handles admin business logic
 */
export class AdminService {
  /**
   * Get all users with pagination
   */
  async getUsers(page = 1, limit = 10, search?: string) {
    try {
      return await adminRepository.getAllUsers(page, limit, search);
    } catch (error) {
      logger.error({ error }, "Error in getUsers service");
      throw error;
    }
  }

  /**
   * Get user by ID with statistics
   */
  async getUserById(userId: string) {
    try {
      const user = await adminRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }

      const stats = await adminRepository.getUserStats(userId);

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, userId }, "Error in getUserById service");
      throw error;
    }
  }

  /**
   * Get all habits with pagination
   */
  async getHabits(page = 1, limit = 10, search?: string) {
    try {
      return await adminRepository.getAllHabits(page, limit, search);
    } catch (error) {
      logger.error({ error }, "Error in getHabits service");
      throw error;
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    try {
      return await adminRepository.getSystemMetrics();
    } catch (error) {
      logger.error({ error }, "Error in getSystemMetrics service");
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const user = await adminRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }

      await adminRepository.deleteUser(userId);
      logger.info({ userId }, "User deleted by admin");
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, userId }, "Error in deleteUser service");
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: "user" | "admin") {
    try {
      const user = await adminRepository.updateUserRole(userId, role);
      logger.info({ userId, role }, "User role updated by admin");

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error({ error, userId, role }, "Error in updateUserRole service");
      throw error;
    }
  }
}

export const adminService = new AdminService();

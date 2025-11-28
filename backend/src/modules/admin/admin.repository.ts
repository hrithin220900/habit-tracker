import { User, type IUserDocument } from "../users/users.model.js";
import { Habit } from "../habits/habits.model.js";
import { HabitCompletion } from "../habits/habit-completion.model.js";
import { logger } from "../../core/utils/logger.js";
import mongoose from "mongoose";

export class AdminRepository {
  async getAllUsers(page = 1, limit = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (search) {
        query.$or = [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password -refreshToken -refreshTokenExpiry")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        User.countDocuments(query).exec(),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error({ error }, "Error getting all users");
      throw error;
    }
  }

  async getUserById(userId: string): Promise<IUserDocument | null> {
    try {
      return await User.findById(userId)
        .select("-password -refreshToken -refreshTokenExpiry")
        .exec();
    } catch (error) {
      logger.error({ error, userId }, "Error getting user by ID");
      throw error;
    }
  }

  async getUserStats(userId: string) {
    try {
      const userIdObj = new mongoose.Types.ObjectId(userId);

      const [habitsCount, completionsCount, publicHabitsCount] =
        await Promise.all([
          Habit.countDocuments({ userId: userIdObj }).exec(),
          HabitCompletion.countDocuments({ userId: userIdObj }).exec(),
          Habit.countDocuments({
            userId: userIdObj,
            isPublic: true,
          }).exec(),
        ]);

      const longestStreak = await HabitCompletion.aggregate([
        { $match: { userId: userIdObj } },
        { $group: { _id: null, longestStreak: { $max: "$streak" } } },
      ]);

      const user = await User.findById(userId).exec();
      const daysSinceRegistration = user
        ? Math.ceil(
            (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      return {
        habitsCount,
        completionsCount,
        publicHabitsCount,
        longestStreak: longestStreak[0]?.maxStreak || 0,
        daysSinceRegistration,
        createdAt: user?.createdAt,
      };
    } catch (error) {
      logger.error({ error, userId }, "Error getting user stats");
      throw error;
    }
  }

  async getAllHabits(page = 1, limit = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const [habits, total] = await Promise.all([
        Habit.find(query)
          .populate("userId", "email name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Habit.countDocuments(query).exec(),
      ]);

      return {
        habits,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error({ error }, "Error getting all habits");
      throw error;
    }
  }

  async getSystemMetrics() {
    try {
      const [
        totalUsers,
        totalHabits,
        totalCompletions,
        totalPublicHabits,
        activeUsers,
        adminUsers,
      ] = await Promise.all([
        User.countDocuments().exec(),
        Habit.countDocuments().exec(),
        HabitCompletion.countDocuments().exec(),
        Habit.countDocuments({ isPublic: true }).exec(),
        // Active users (users with at least one completion in last 30 days)
        HabitCompletion.distinct("userId", {
          completedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        }).exec(),
        User.countDocuments({ role: "admin" }).exec(),
      ]);

      // Get average habits per user
      const avgHabitsPerUser =
        totalUsers > 0 ? (totalHabits / totalUsers).toFixed(2) : "0.00";

      // Get average completions per habit
      const avgCompletionsPerHabit =
        totalHabits > 0 ? (totalCompletions / totalHabits).toFixed(2) : "0.00";

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentCompletions = await HabitCompletion.countDocuments({
        completedAt: { $gte: sevenDaysAgo },
      }).exec();

      // Get longest streak across all users
      const longestStreak = await HabitCompletion.aggregate([
        { $group: { _id: null, maxStreak: { $max: "$streak" } } },
      ]);

      // Get users registered in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsersLast30Days = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      }).exec();

      // Get habits created in last 30 days
      const newHabitsLast30Days = await Habit.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      }).exec();

      return {
        users: {
          total: totalUsers,
          active: activeUsers.length,
          admins: adminUsers,
          newLast30Days: newUsersLast30Days,
        },
        habits: {
          total: totalHabits,
          public: totalPublicHabits,
          newLast30Days: newHabitsLast30Days,
          avgPerUser: parseFloat(avgHabitsPerUser),
        },
        completions: {
          total: totalCompletions,
          recent7Days: recentCompletions,
          avgPerHabit: parseFloat(avgCompletionsPerHabit),
        },
        streaks: {
          longest: longestStreak[0]?.maxStreak || 0,
        },
      };
    } catch (error) {
      logger.error({ error }, "Error getting system metrics");
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user's habits and completions first
      const habits = await Habit.find({ userId }).exec();
      const habitIds = habits.map((h) => h._id);

      await Promise.all([
        HabitCompletion.deleteMany({ habitId: { $in: habitIds } }).exec(),
        Habit.deleteMany({ userId }).exec(),
        User.findByIdAndDelete(userId).exec(),
      ]);
    } catch (error) {
      logger.error({ error, userId }, "Error deleting user");
      throw error;
    }
  }

  async updateUserRole(
    userId: string,
    role: "user" | "admin"
  ): Promise<IUserDocument> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      )
        .select("-password -refreshToken -refreshTokenExpiry")
        .exec();

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      logger.error({ error, userId, role }, "Error updating user role");
      throw error;
    }
  }
}

export const adminRepository = new AdminRepository();

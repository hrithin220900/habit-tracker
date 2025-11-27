import { Habit, type IHabitDocument } from "./habits.model.js";
import {
  HabitCompletion,
  type IHabitCompletionDocument,
} from "./habit-completion.model.js";
import { NotFoundError, ConflictError } from "../../core/utils/errors.js";
import { logger } from "../../core/utils/logger.js";

export class HabitsRepository {
  async create(habitData: {
    userId: string;
    name: string;
    description?: string;
    frequency: string;
    color: string;
    icon: string;
    reminderTime?: Date;
    isPublic?: boolean;
  }): Promise<IHabitDocument> {
    try {
      const habit = new Habit({
        userId: habitData.userId,
        name: habitData.name.trim(),
        description: habitData.description?.trim(),
        frequency: habitData.frequency,
        color: habitData.color,
        icon: habitData.icon,
        reminderTime: habitData.reminderTime,
        isPublic: habitData.isPublic || false,
      });

      return await habit.save();
    } catch (error) {
      logger.error({ error, userId: habitData.userId }, "Error creating habit");
      throw error;
    }
  }

  async findByIdAndUserId(
    habitId: string,
    userId: string
  ): Promise<IHabitDocument | null> {
    try {
      return await Habit.findOne({
        _id: habitId,
        userId: userId,
      }).exec();
    } catch (error) {
      logger.error({ error, habitId, userId }, "Error finding habit");
      throw error;
    }
  }

  async findByPublicId(publicId: string): Promise<IHabitDocument | null> {
    try {
      return await Habit.findOne({ publicId, isPublic: true }).exec();
    } catch (error) {
      logger.error({ error, publicId }, "Error finding public habit");
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<IHabitDocument[]> {
    try {
      return await Habit.find({ userId }).sort({ createdAt: -1 }).exec();
    } catch (error) {
      logger.error({ error, userId }, "Error finding user habits");
      throw error;
    }
  }

  async update(
    habitId: string,
    userId: string,
    updateData: Partial<{
      name: string;
      description?: string;
      frequency: string;
      color: string;
      icon: string;
      reminderTime?: Date | null;
      isPublic?: boolean;
    }>
  ): Promise<IHabitDocument> {
    try {
      const habit = await Habit.findOneAndUpdate(
        { _id: habitId, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).exec();

      if (!habit) {
        throw new NotFoundError("Habit");
      }

      return habit;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, habitId, userId }, "Error updating habit");
      throw error;
    }
  }

  async delete(habitId: string, userId: string): Promise<void> {
    try {
      const result = await Habit.deleteOne({
        _id: habitId,
        userId,
      }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundError("Habit");
      }

      // Also delete all completions for this habit
      await HabitCompletion.deleteMany({ habitId }).exec();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, habitId, userId }, "Error deleting habit");
      throw error;
    }
  }

  async findCompletion(
    habitId: string,
    userId: string,
    date: string
  ): Promise<IHabitCompletionDocument | null> {
    try {
      return await HabitCompletion.findOne({
        habitId,
        userId,
        date,
      }).exec();
    } catch (error) {
      logger.error(
        { error, habitId, userId, date },
        "Error finding completion"
      );
      throw error;
    }
  }

  async createCompletion(data: {
    habitId: string;
    userId: string;
    date: string;
    streak: number;
  }): Promise<IHabitCompletionDocument> {
    try {
      const existing = await this.findCompletion(
        data.habitId,
        data.userId,
        data.date
      );

      if (existing) {
        throw new ConflictError("Habit already completed for this date");
      }

      const completion = new HabitCompletion({
        habitId: data.habitId,
        userId: data.userId,
        date: data.date,
        completedAt: new Date(),
        streak: data.streak,
      });

      return await completion.save();
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error({ error, ...data }, "Error creating completion");
      throw error;
    }
  }

  async deleteCompletion(
    habitId: string,
    userId: string,
    date: string
  ): Promise<void> {
    try {
      const result = await HabitCompletion.deleteOne({
        habitId,
        userId,
        date,
      }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundError("Completion");
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(
        { error, habitId, userId, date },
        "Error deleting completion"
      );
      throw error;
    }
  }

  async getCompletionsByHabit(
    habitId: string,
    userId: string
  ): Promise<IHabitCompletionDocument[]> {
    try {
      return await HabitCompletion.find({ habitId, userId })
        .sort({ date: -1 })
        .exec();
    } catch (error) {
      logger.error(
        { error, habitId, userId },
        "Error getting completion by habit"
      );
      throw error;
    }
  }

  async getCompletionCount(habitId: string, userId: string): Promise<number> {
    try {
      return await HabitCompletion.countDocuments({
        habitId,
        userId,
      }).exec();
    } catch (error) {
      logger.error(
        { error, habitId, userId },
        "Error getting completion count"
      );
      throw error;
    }
  }

  async getLastCompletionDate(
    habitId: string,
    userId: string
  ): Promise<string | null> {
    try {
      const lastCompletion = await HabitCompletion.findOne({
        habitId,
        userId,
      })
        .sort({ date: -1 })
        .exec();

      return lastCompletion?.date || null;
    } catch (error) {
      logger.error({ error, habitId, userId }, "Error getting last completion");
      throw error;
    }
  }
}

export const habitsRepository = new HabitsRepository();

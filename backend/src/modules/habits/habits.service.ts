import { habitsRepository } from "./habits.repository.js";
import { NotFoundError, ConflictError } from "../../core/utils/errors.js";
import { logger } from "../../core/utils/logger.js";
import type {
  CreateHabitInput,
  UpdateHabitInput,
} from "./habits.validators.js";
import { habitsEvents } from "./habits.events.js";

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// function getYesterdayDateString(): string {
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
//   const year = yesterday.getFullYear();
//   const month = String(yesterday.getMonth() + 1).padStart(2, "0");
//   const day = String(yesterday.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

async function calculateStreak(
  habitId: string,
  userId: string,
  currentDate: string
): Promise<number> {
  try {
    const completions = await habitsRepository.getCompletionsByHabit(
      habitId,
      userId
    );

    if (completions.length === 0) {
      return 1; // First completion
    }

    const sortedCompletions = completions
      .map((c) => c.date)
      .sort()
      .reverse();

    let streak = 1;
    const currentDateObj = new Date(currentDate);
    currentDateObj.setDate(currentDateObj.getDate() - 1);

    for (let i = 0; i < sortedCompletions.length; i++) {
      const expectedDate = new Date(currentDateObj);
      const year = expectedDate.getFullYear();
      const month = String(expectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(expectedDate.getDate()).padStart(2, "0");
      const expectedDateString = `${year}-${month}-${day}`;

      if (sortedCompletions[i] === expectedDateString) {
        streak++;
        currentDateObj.setDate(currentDateObj.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  } catch (error) {
    logger.error({ error, habitId, userId }, "Error calculating streak");
    return 1;
  }
}

export class HabitsService {
  async createHabit(userId: string, data: CreateHabitInput) {
    try {
      const habit = await habitsRepository.create({
        userId,
        name: data.name,
        ...(data.description !== undefined && {
          description: data.description,
        }),
        frequency: data.frequency,
        color: data.color,
        icon: data.icon,
        ...(data.reminderTime !== undefined && {
          reminderTime: data.reminderTime,
        }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      });

      logger.info({ habitId: habit._id, userId }, "Habit created successfully");

      const habitData = {
        id: habit._id.toString(),
        userId: habit.userId.toString(),
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        color: habit.color,
        icon: habit.icon,
        reminderTime: habit.reminderTime,
        isPublic: habit.isPublic,
        publicId: habit.publicId,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
      };

      habitsEvents.emitHabitCreated(userId, habitData);

      return habitData;
    } catch (error) {
      logger.error({ error, userId }, "Error creating habit");
      throw error;
    }
  }

  async getUserHabits(userId: string) {
    try {
      const habits = await habitsRepository.findByUserId(userId);
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      const habitsWithCompletion = await Promise.all(
        habits.map(async (habit) => {
          const isCompletedToday = await habitsRepository.findCompletion(
            habit._id.toString(),
            userId,
            today
          );

          return {
            id: habit._id.toString(),
            userId: habit.userId.toString(),
            name: habit.name,
            description: habit.description,
            frequency: habit.frequency,
            color: habit.color,
            icon: habit.icon,
            reminderTime: habit.reminderTime,
            isPublic: habit.isPublic,
            publicId: habit.publicId,
            createdAt: habit.createdAt,
            updatedAt: habit.updatedAt,
            isCompletedToday: !!isCompletedToday,
          };
        })
      );

      return habitsWithCompletion;
    } catch (error) {
      logger.error({ error, userId }, "Error getting user habits");
      throw error;
    }
  }

  async getHabitById(habitId: string, userId: string) {
    try {
      const habit = await habitsRepository.findByIdAndUserId(habitId, userId);
      if (!habit) {
        throw new NotFoundError("Habit");
      }

      const completionCount = await habitsRepository.getCompletionCount(
        habitId,
        userId
      );
      const lastCompletionDate = await habitsRepository.getLastCompletionDate(
        habitId,
        userId
      );

      let currentStreak = 0;

      if (lastCompletionDate) {
        const completions = await habitsRepository.getCompletionsByHabit(
          habitId,
          userId
        );
        if (completions.length > 0) {
          const lastCompletion = completions.sort((a, b) =>
            b.date.localeCompare(a.date)
          )[0];
          currentStreak = lastCompletion?.streak || 0;
        }
      }

      return {
        id: habit._id.toString(),
        userId: habit.userId.toString(),
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        color: habit.color,
        icon: habit.icon,
        reminderTime: habit.reminderTime,
        isPublic: habit.isPublic,
        publicId: habit.publicId,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
        stats: {
          completionCount,
          currentStreak,
          lastCompletionDate,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, habitId, userId }, "Error getting habit");
      throw error;
    }
  }

  async updateHabit(habitId: string, userId: string, data: UpdateHabitInput) {
    try {
      const updateData: Partial<{
        name: string;
        description?: string;
        frequency: string;
        color: string;
        icon: string;
        reminderTime?: Date | null;
        isPublic?: boolean;
      }> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.frequency !== undefined) updateData.frequency = data.frequency;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.reminderTime !== undefined)
        updateData.reminderTime = data.reminderTime;
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

      const habit = await habitsRepository.update(habitId, userId, updateData);

      logger.info({ habitId, userId }, "Habit updated successfully");

      const habitData = {
        id: habit._id.toString(),
        userId: habit.userId.toString(),
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        color: habit.color,
        icon: habit.icon,
        reminderTime: habit.reminderTime,
        isPublic: habit.isPublic,
        publicId: habit.publicId,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
      };

      habitsEvents.emitHabitUpdated(userId, habitData);

      return habitData;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, habitId, userId }, "Error updating habit");
      throw error;
    }
  }

  async deleteHabit(habitId: string, userId: string): Promise<void> {
    try {
      await habitsRepository.delete(habitId, userId);
      habitsEvents.emitHabitDeleted(userId, habitId);
      logger.info({ habitId, userId }, "Habit deleted successfully");
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, habitId, userId }, "Error deleting habit");
      throw error;
    }
  }

  async markComplete(habitId: string, userId: string, date?: string) {
    try {
      const habit = await habitsRepository.findByIdAndUserId(habitId, userId);

      if (!habit) {
        throw new NotFoundError("Habit");
      }

      const completionDate = date || getTodayDateString();

      const existing = await habitsRepository.findCompletion(
        habitId,
        userId,
        completionDate
      );

      if (existing) {
        throw new ConflictError("Habit already completed for this date");
      }

      const streak = await calculateStreak(habitId, userId, completionDate);

      const completion = await habitsRepository.createCompletion({
        habitId,
        userId,
        date: completionDate,
        streak,
      });

      logger.info(
        { habitId, userId, date: completionDate, streak },
        "Habit marked as complete"
      );

      const completionData = {
        id: completion._id.toString(),
        habitId: completion.habitId.toString(),
        userId: completion.userId.toString(),
        date: completion.date,
        completedAt: completion.completedAt,
        streak: completion.streak,
      };

      habitsEvents.emitHabitCompleted(userId, habitId, completionDate, streak);

      return completionData;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      logger.error({ error, habitId, userId }, "Error marking habit complete");
      throw error;
    }
  }

  async unmarkComplete(habitId: string, userId: string, date: string) {
    try {
      await habitsRepository.deleteCompletion(habitId, userId, date);
      logger.info({ habitId, userId, date }, "Habit completion removed");
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, habitId, userId, date }, "Error unmarking habit");
      throw error;
    }
  }

  async getPublicHabit(publicId: string) {
    try {
      const habit = await habitsRepository.findByPublicId(publicId);

      if (!habit) {
        throw new NotFoundError("Public habit");
      }

      const completionCount = await habitsRepository.getCompletionCount(
        habit._id.toString(),
        habit.userId.toString()
      );

      return {
        id: habit._id.toString(),
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        color: habit.color,
        icon: habit.icon,
        createdAt: habit.createdAt,
        stats: {
          completionCount,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error({ error, publicId }, "Error getting public habit");
      throw error;
    }
  }
}

export const habitsService = new HabitsService();

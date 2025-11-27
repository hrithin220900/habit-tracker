import { Habit } from "../habits/habits.model.js";
import { HabitCompletion } from "../habits/habit-completion.model.js";
import { logger } from "../../core/utils/logger.js";
import mongoose from "mongoose";

export class AnalyticsRepository {
  async getDashboardStats(userId: string) {
    try {
      const userIdObj = new mongoose.Types.ObjectId(userId);
      const totalHabits = await Habit.countDocuments({ userId: userIdObj });
      const completionsWithStreak = await HabitCompletion.aggregate([
        { $match: { userId: userIdObj } },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: "$habitId",
            maxStreak: { $max: "$streak" },
            lastDate: { $max: "$date" },
          },
        },
        { $match: { maxStreak: { $gt: 0 } } },
      ]);

      const activeStreaks = completionsWithStreak.length;

      const totalCompletions = await HabitCompletion.countDocuments({
        userId: userIdObj,
      });

      let completionRate = 0;

      if (totalHabits > 0) {
        const firstHabit = await Habit.findOne({ userId: userIdObj })
          .sort({ createdAt: 1 })
          .exec();

        if (firstHabit) {
          const daysSinceFirstHabit = Math.ceil(
            (Date.now() - firstHabit.createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const expectedCompletions =
            totalHabits * Math.max(daysSinceFirstHabit, 1);
          completionRate =
            expectedCompletions > 0
              ? (totalCompletions / expectedCompletions) * 100
              : 0;
          completionRate = Math.min(completionRate, 100);
        }
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoString = sevenDaysAgo.toISOString().split("T")[0];

      const weeklyCompletions = await Habit.aggregate([
        { $match: { userId: userIdObj, date: { $gte: sevenDaysAgoString } } },
        {
          $group: {
            _id: "$date",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const weeklyCompletionsFormatted = weeklyCompletions.map((item) => ({
        date: item._id,
        count: item.count,
      }));

      const habitStats = await HabitCompletion.aggregate([
        { $match: { userId: userIdObj } },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: "$habitId",
            currentStreak: { $max: "$streak" },
            longestStreak: { $max: "$streak" },
            totalCompletions: { $sum: 1 },
            lastCompletionDate: { $max: "$date" },
          },
        },
        {
          $lookup: {
            from: "habits",
            localField: "_id",
            foreignField: "_id",
            as: "habit",
          },
        },
        { $unwind: "$habit" },
        {
          $project: {
            habitId: { $toString: "$_id" },
            habitName: "$habit.name",
            currentStreak: 1,
            longestStreak: 1,
            totalCompletions: 1,
            lastCompletionDate: 1,
          },
        },
      ]);

      const habitStatsWithRates = habitStats.map((stat) => {
        const habit = habitStats.find((s) => s.habitId === stat.habitId);
        const daysSinceCreation = habit
          ? Math.ceil(
              (Date.now() - new Date(habit.lastCompletionDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;
        const completionRate =
          daysSinceCreation > 0
            ? (stat.totalCompletions / Math.max(daysSinceCreation, 1)) * 100
            : 0;

        return {
          ...stat,
          completionRate: Math.min(completionRate, 100),
        };
      });

      return {
        totalHabits,
        activeStreaks,
        completionRate: Math.round(completionRate * 100) / 100,
        weeklyCompletions: weeklyCompletionsFormatted,
        habitStats: habitStatsWithRates,
      };
    } catch (error) {
      logger.error({ error, userId }, "Error getting dashboard stats");
      throw error;
    }
  }

  async getHabitAnalytics(habitId: string, userId: string) {
    try {
      const habitIdObj = new mongoose.Types.ObjectId(habitId);
      const userIdObj = new mongoose.Types.ObjectId(userId);

      // Verify habit belongs to user
      const habit = await Habit.findOne({
        _id: habitIdObj,
        userId: userIdObj,
      }).exec();

      if (!habit) {
        throw new Error("Habit not found");
      }

      const completions = await HabitCompletion.find({
        habitId: habitIdObj,
        userId: userIdObj,
      })
        .sort({ date: 1 })
        .exec();

      const completionsByDate = completions.map((completion) => ({
        date: completion.date,
        completed: true,
      }));

      const streakHistory: Array<{
        startDate: string;
        endDate: string;
        length: number;
      }> = [];
      let currentStreakStart: string | null = null;
      let currentStreakLength = 0;

      for (let i = 0; i < completions.length; i++) {
        const completion = completions[i];
        const prevCompletion = i > 0 ? completions[i - 1] : null;

        if (completion && prevCompletion) {
          const dateDiff =
            (new Date(completion.date).getTime() -
              new Date(prevCompletion.date).getTime()) /
            (1000 * 60 * 60 * 24);

          if (dateDiff === 1) {
            if (!currentStreakStart) {
              currentStreakStart = prevCompletion.date;
            }
            currentStreakLength++;
          } else {
            if (currentStreakStart) {
              streakHistory.push({
                startDate: currentStreakStart,
                endDate: prevCompletion.date,
                length: currentStreakLength + 1,
              });
            }
            currentStreakStart = completion.date;
            currentStreakLength = 1;
          }
        } else {
          currentStreakStart = completion?.date || null;
          currentStreakLength = 1;
        }
      }

      if (currentStreakStart && completions.length > 0) {
        streakHistory.push({
          startDate: currentStreakStart,
          endDate: completions[completions.length - 1]?.date || "",
          length: currentStreakLength,
        });
      }

      const monthlyStats = await HabitCompletion.aggregate([
        {
          $match: {
            habitId: habitIdObj,
            userId: userIdObj,
          },
        },
        {
          $group: {
            _id: {
              year: { $year: { $dateFromString: { dateString: "$date" } } },
              month: { $month: { $dateFromString: { dateString: "$date" } } },
            },
            completions: { $sum: 1 },
            days: { $addToSet: "$date" },
          },
        },
        {
          $project: {
            month: {
              $concat: [
                { $toString: "$_id.year" },
                "-",
                {
                  $toString: {
                    $cond: [{ $lt: ["$_id.month", 10] }, "0", ""],
                  },
                },
                { $toString: "$_id.month" },
              ],
            },
            completions: 1,
            days: { $size: "$days" },
          },
        },
        { $sort: { month: 1 } },
      ]);

      return {
        habitId,
        completionsByDate,
        streakHistory,
        monthlyStats: monthlyStats.map((stat) => ({
          month: stat.month,
          completions: stat.completions,
          days: stat.days,
        })),
      };
    } catch (error) {
      logger.error({ error, habitId, userId }, "Error getting habit analytics");
      throw error;
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();

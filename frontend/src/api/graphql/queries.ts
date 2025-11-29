import { gql } from "@apollo/client";

export const GET_DASHBOARD = gql`
  query GetDashboard {
    dashboard {
      totalHabits
      activeStreaks
      completionRate
      weeklyCompletions {
        date
        count
      }
      habitStats {
        habitId
        habitName
        currentStreak
        longestStreak
        completionRate
        totalCompletions
      }
    }
  }
`;

export const GET_HABIT_ANALYTICS = gql`
  query GetHabitAnalytics($habitId: ID!) {
    habitAnalytics(habitId: $habitId) {
      habitId
      completionsByDate {
        date
        completed
      }
      streakHistory {
        startDate
        endDate
        length
      }
      monthlyStats {
        month
        completions
        days
      }
    }
  }
`;

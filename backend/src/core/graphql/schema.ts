import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    dashboard: Dashboard
    habitAnalytics(habitId: ID!): HabitAnalytics
  }

  type Dashboard {
    totalHabits: Int!
    activeStreaks: Int!
    completionRate: Float!
    weeklyCompletions: [CompletionDay!]!
    habitStats: [HabitStat!]!
  }

  type CompletionDay {
    date: String!
    count: Int!
  }

  type HabitStat {
    habitId: ID!
    habitName: String!
    currentStreak: Int!
    longestStreak: Int!
    completionRate: Float!
    totalCompletions: Int!
  }

  type HabitAnalytics {
    habitId: ID!
    completionsByDate: [CompletionPoint!]!
    streakHistory: [StreakPeriod!]!
    monthlyStats: [MonthlyStat!]!
  }

  type CompletionPoint {
    date: String!
    completed: Boolean!
  }

  type StreakPeriod {
    startDate: String!
    endDate: String!
    length: Int!
  }

  type MonthlyStat {
    month: String!
    completions: Int!
    days: Int!
  }
`;

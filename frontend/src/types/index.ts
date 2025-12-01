export type UserRole = "user" | "admin";

export type HabitFrequency = "daily" | "weekly" | "custom";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  color: string;
  icon: string;
  reminderTime?: string;
  isPublic: boolean;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
  isCompletedToday?: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completedAt: string;
  streak: number;
}

export interface DashboardStats {
  totalHabits: number;
  activeStreaks: number;
  completionRate: number;
  weeklyCompletions: { date: string; count: number }[];
  habitStats: {
    habitId: string;
    habitName: string;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    totalCompletions: number;
  }[];
}

export interface HabitAnalytics {
  habitId: string;
  completionsByDate: Array<{ date: string; completed: boolean }>;
  streakHistory: Array<{ startDate: string; endDate: string; length: number }>;
  monthlyStats: Array<{ month: string; completions: number; days: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    fields?: Record<string, string>;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

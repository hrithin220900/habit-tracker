export type UserRole = "user" | "admin";

export type HabitFrequency = "daily" | "weekly" | "custom";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  color: string;
  icon: string;
  reminderTime?: Date;
  isPublic: boolean;
  publicId?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitCompletion {
  _id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  date: string; // YYYY-MM-DD format
  streak: number;
  createdAt: Date;
}

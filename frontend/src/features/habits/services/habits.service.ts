import { api } from '../../../lib/api-client.js';
import type { Habit, HabitCompletion, ApiResponse } from '../../../types/index.js';

export interface CreateHabitData {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  color: string;
  icon: string;
  reminderTime?: string;
  isPublic?: boolean;
}

export interface UpdateHabitData extends Partial<CreateHabitData> {}

/**
 * Habits service - handles habits API calls
 */
export const habitsService = {
  /**
   * Get all habits
   */
  async getHabits(): Promise<Habit[]> {
    const response = await api.get<Habit[]>('/habits');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch habits');
    }
    return response.data;
  },

  /**
   * Get habit by ID
   */
  async getHabitById(habitId: string): Promise<Habit & { stats?: any }> {
    const response = await api.get<Habit & { stats?: any }>(`/habits/${habitId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch habit');
    }
    return response.data;
  },

  /**
   * Create habit
   */
  async createHabit(data: CreateHabitData): Promise<Habit> {
    const response = await api.post<Habit>('/habits', data);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create habit');
    }
    return response.data;
  },

  /**
   * Update habit
   */
  async updateHabit(habitId: string, data: UpdateHabitData): Promise<Habit> {
    const response = await api.put<Habit>(`/habits/${habitId}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update habit');
    }
    return response.data;
  },

  /**
   * Delete habit
   */
  async deleteHabit(habitId: string): Promise<void> {
    const response = await api.delete(`/habits/${habitId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete habit');
    }
  },

  /**
   * Mark habit as complete
   */
  async markComplete(habitId: string, date?: string): Promise<HabitCompletion> {
    const response = await api.post<HabitCompletion>(
      `/habits/${habitId}/complete`,
      { date }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to mark habit complete');
    }
    return response.data;
  },
};


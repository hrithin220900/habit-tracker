import { api } from '../../../lib/api-client';
import type {
  User,
  Habit,
  ApiResponse,
  PaginatedResponse,
} from '../../../types/index';

export interface AdminUser extends User {
  stats?: {
    habitsCount: number;
    completionsCount: number;
    publicHabitsCount: number;
    longestStreak: number;
    daysSinceRegistration: number;
  };
}

export interface AdminMetrics {
  users: {
    total: number;
    active: number;
    admins: number;
    newLast30Days: number;
  };
  habits: {
    total: number;
    public: number;
    newLast30Days: number;
    avgPerUser: number;
  };
  completions: {
    total: number;
    recent7Days: number;
    avgPerHabit: number;
  };
  streaks: {
    longest: number;
  };
}

export interface AdminUsersResponse extends PaginatedResponse<AdminUser> {}
export interface AdminHabitsResponse extends PaginatedResponse<Habit> {}

/**
 * Admin service - frontend wrapper around admin REST API
 */
export const adminService = {
  async getUsers(page = 1, limit = 10, search?: string): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);

    const response = await api.get<AdminUsersResponse>(`/admin/users?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch users');
    }
    return response.data;
  },

  async getUserById(userId: string): Promise<AdminUser> {
    const response = await api.get<AdminUser>(`/admin/users/${userId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch user');
    }
    return response.data;
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<AdminUser> {
    const response = await api.put<AdminUser>(`/admin/users/${userId}/role`, { role });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update user role');
    }
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await api.delete(`/admin/users/${userId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete user');
    }
  },

  async getHabits(page = 1, limit = 10, search?: string): Promise<AdminHabitsResponse> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);

    const response = await api.get<AdminHabitsResponse>(`/admin/habits?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch habits');
    }
    return response.data;
  },

  async getMetrics(): Promise<AdminMetrics> {
    const response = await api.get<AdminMetrics>('/admin/metrics');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch metrics');
    }
    return response.data;
  },
};



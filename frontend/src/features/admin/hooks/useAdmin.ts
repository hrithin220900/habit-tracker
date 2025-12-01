import { useState, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import type {
  AdminUser,
  AdminMetrics,
  AdminUsersResponse,
  AdminHabitsResponse,
} from '../services/admin.service';

export function useAdminUsers() {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (page = 1, limit = 10, search?: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await adminService.getUsers(page, limit, search);
        setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUserRole = useCallback(async (userId: string, role: 'user' | 'admin') => {
    const updated = await adminService.updateUserRole(userId, role);
    setData((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((u) => (u.id === userId ? updated : u)),
          }
        : prev
    );
    return updated;
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    await adminService.deleteUser(userId);
    setData((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.filter((u) => u.id !== userId),
            pagination: {
              ...prev.pagination,
              total: prev.pagination.total - 1,
            },
          }
        : prev
    );
  }, []);

  return {
    users: data?.data ?? [],
    pagination: data?.pagination,
    loading,
    error,
    fetchUsers,
    updateUserRole,
    deleteUser,
  };
}

export function useAdminHabits() {
  const [data, setData] = useState<AdminHabitsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(
    async (page = 1, limit = 10, search?: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await adminService.getHabits(page, limit, search);
        setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch habits';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    habits: data?.data ?? [],
    pagination: data?.pagination,
    loading,
    error,
    fetchHabits,
  };
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getMetrics();
      setMetrics(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
  };
}



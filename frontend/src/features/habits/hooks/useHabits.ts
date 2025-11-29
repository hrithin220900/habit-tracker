import { useState, useEffect } from 'react';
import { useHabitsStore } from '../../../state/stores/habits.store.js';
import { habitsService } from '../services/habits.service.js';
import { getSocket } from '../../../lib/socket.js';
import type { Habit } from '../../../types/index.js';

export function useHabits() {
  const { habits, setHabits, addHabit, updateHabit, removeHabit } = useHabitsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits
  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await habitsService.getHabits();
      setHabits(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch habits';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Create habit
  const createHabit = async (data: Parameters<typeof habitsService.createHabit>[0]) => {
    try {
      setLoading(true);
      setError(null);
      const habit = await habitsService.createHabit(data);
      addHabit(habit);
      return habit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create habit';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update habit
  const updateHabitById = async (
    habitId: string,
    data: Parameters<typeof habitsService.updateHabit>[1]
  ) => {
    try {
      setLoading(true);
      setError(null);
      const habit = await habitsService.updateHabit(habitId, data);
      updateHabit(habitId, habit);
      return habit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update habit';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    try {
      setLoading(true);
      setError(null);
      await habitsService.deleteHabit(habitId);
      removeHabit(habitId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete habit';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark complete
  const markComplete = async (habitId: string, date?: string) => {
    try {
      await habitsService.markComplete(habitId, date);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark complete';
      setError(message);
      throw err;
    }
  };

  // Setup Socket.io listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleHabitCreated = (data: { habit: Habit }) => {
      addHabit(data.habit);
    };

    const handleHabitUpdated = (data: { habit: Habit }) => {
      updateHabit(data.habit.id, data.habit);
    };

    const handleHabitDeleted = (data: { habitId: string }) => {
      removeHabit(data.habitId);
    };

    socket.on('habit:created', handleHabitCreated);
    socket.on('habit:updated', handleHabitUpdated);
    socket.on('habit:deleted', handleHabitDeleted);

    return () => {
      socket.off('habit:created', handleHabitCreated);
      socket.off('habit:updated', handleHabitUpdated);
      socket.off('habit:deleted', handleHabitDeleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit: updateHabitById,
    deleteHabit,
    markComplete,
  };
}


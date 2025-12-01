import { useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { useHabitsStore } from '../../../state/stores/habits.store';
import { habitsService } from '../services/habits.service';
import { getSocket } from '../../../lib/socket';
import { GET_DASHBOARD } from '../../../api/graphql/queries';
import type { Habit } from '../../../types/index';

export function useHabits() {
  const { habits, setHabits, addHabit, updateHabit, removeHabit } = useHabitsStore();
  const apolloClient = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits
  const fetchHabits = useCallback(async () => {
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
  }, [setHabits]);

  // Create habit
  const createHabit = async (data: Parameters<typeof habitsService.createHabit>[0]) => {
    try {
      setLoading(true);
      setError(null);
      const habit = await habitsService.createHabit(data);
      // Add immediately for instant feedback
      // Socket.io event will also fire, but duplicate check in store will prevent double-add
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
      // Remove immediately for instant feedback
      // Socket.io event will also fire, but the duplicate check in store prevents issues
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
      // Refetch dashboard query to update completion rate
      await apolloClient.refetchQueries({
        include: [GET_DASHBOARD],
      });
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

    const handleHabitCompleted = (data: { habitId: string; date: string }) => {
      const today = new Date().toISOString().split('T')[0];
      // If the completion is for today, update the habit's isCompletedToday status
      if (data.date === today) {
        updateHabit(data.habitId, { isCompletedToday: true });
      }
    };

    socket.on('habit:created', handleHabitCreated);
    socket.on('habit:updated', handleHabitUpdated);
    socket.on('habit:deleted', handleHabitDeleted);
    socket.on('habit:completed', handleHabitCompleted);

    return () => {
      socket.off('habit:created', handleHabitCreated);
      socket.off('habit:updated', handleHabitUpdated);
      socket.off('habit:deleted', handleHabitDeleted);
      socket.off('habit:completed', handleHabitCompleted);
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


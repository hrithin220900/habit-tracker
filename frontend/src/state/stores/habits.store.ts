import { create } from "zustand";
import type { Habit } from "../../types/index.js";

interface HabitsState {
  habits: Habit[];
  selectedHabit: Habit | null;
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  removeHabit: (habitId: string) => void;
  setSelectedHabit: (habit: Habit | null) => void;
  clearHabits: () => void;
}

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  selectedHabit: null,

  setHabits: (habits) => set({ habits }),

  addHabit: (habit) =>
    set((state) => ({
      habits: [...state.habits, habit],
    })),

  updateHabit: (habitId, updates) =>
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === habitId ? { ...habit, ...updates } : habit
      ),
    })),

  removeHabit: (habitId) =>
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== habitId),
      selectedHabit:
        state.selectedHabit?.id === habitId ? null : state.selectedHabit,
    })),

  setSelectedHabit: (habit) => set({ selectedHabit: habit }),

  clearHabits: () => set({ habits: [], selectedHabit: null }),
}));

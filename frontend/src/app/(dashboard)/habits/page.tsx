'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../components/shared/ProtectedRoute.js';
import { useHabits } from '../../../features/habits/hooks/useHabits.js';
import { HabitCard } from '../../../features/habits/components/HabitCard.js';
import { HabitForm } from '../../../features/habits/components/HabitForm.js';
import { Button } from '../../../components/ui/button.js';
import { Input } from '../../../components/ui/input.js';
import { Plus, Search } from 'lucide-react';
import type { Habit } from '../../../types/index.js';
import type { CreateHabitData } from '../../../features/habits/services/habits.service.js';

function HabitsPageContent() {
  const { habits, loading, error, fetchHabits, createHabit, updateHabit, deleteHabit } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'custom'>('all');

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || habit.frequency === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCreate = async (data: CreateHabitData) => {
    await createHabit(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: CreateHabitData) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
      setEditingHabit(null);
      setShowForm(false);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDelete = async (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habitId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  My Habits
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Track and manage your daily habits
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingHabit(null);
                  setShowForm(true);
                }}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Habit
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search habits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'daily', 'weekly', 'custom'] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && habits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading habits...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredHabits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                {habits.length === 0
                  ? "You don't have any habits yet"
                  : 'No habits match your search'}
              </p>
              {habits.length === 0 && (
                <Button
                  onClick={() => setShowForm(true)}
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Habit
                </Button>
              )}
            </div>
          )}

          {/* Habits Grid */}
          {filteredHabits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Habit Form Modal */}
          {showForm && (
            <HabitForm
              habit={editingHabit || undefined}
              onSubmit={editingHabit ? handleUpdate : handleCreate}
              onCancel={handleFormClose}
              loading={loading}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default HabitsPageContent;


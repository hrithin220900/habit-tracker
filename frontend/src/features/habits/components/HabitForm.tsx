'use client';

import { useState, FormEvent } from 'react';
import { Button } from '../../../components/ui/button.js';
import { Input } from '../../../components/ui/input.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card.js';
import type { Habit, HabitFrequency } from '../../../types/index.js';
import type { CreateHabitData } from '../services/habits.service.js';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const ICONS = ['⭐', '💪', '📚', '🏃', '🧘', '🎯', '💡', '🔥', '✨', '🌟'];

interface HabitFormProps {
  habit?: Habit;
  onSubmit: (data: CreateHabitData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function HabitForm({ habit, onSubmit, onCancel, loading }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency || 'daily');
  const [color, setColor] = useState(habit?.color || COLORS[0]);
  const [icon, setIcon] = useState(habit?.icon || ICONS[0]);
  const [isPublic, setIsPublic] = useState(habit?.isPublic || false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        color,
        icon,
        isPublic,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save habit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</CardTitle>
          <CardDescription>
            {habit ? 'Update your habit details' : 'Start tracking a new habit'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Input
              label="Habit Name"
              placeholder="e.g., Morning Exercise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 min-h-[80px] resize-none"
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Frequency</label>
              <select
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                disabled={loading}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      color === c ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-full h-10 rounded-lg border-2 text-lg transition-all ${
                      icon === i
                        ? 'border-foreground bg-accent'
                        : 'border-transparent hover:bg-accent/50'
                    }`}
                    disabled={loading}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                Make this habit public
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                isLoading={loading}
                disabled={loading}
              >
                {habit ? 'Update Habit' : 'Create Habit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


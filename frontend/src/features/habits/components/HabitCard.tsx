'use client';

import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { Button } from '../../../components/ui/button';
import { getTodayDateString } from '../../../lib/utils';
import type { Habit } from '../../../types/index';
import { Flame, Share2, Trash2, Edit } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  currentStreak?: number;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export function HabitCard({ habit, currentStreak = 0, onEdit, onDelete }: HabitCardProps) {
  const { markComplete, loading } = useHabits();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      await markComplete(habit.id);
      setIsCompleted(true);
      setTimeout(() => setIsCompleted(false), 2000);
    } catch (error) {
      console.error('Failed to mark complete:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleShare = async () => {
    if (habit.publicId) {
      const shareUrl = `${window.location.origin}/habits/public/${habit.publicId}`;
      try {
        await navigator.share({
          title: habit.name,
          text: `Check out my habit: ${habit.name}`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      alert('Habit must be public to share');
    }
  };

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-semibold flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            >
              {habit.icon || '⭐'}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-card-foreground truncate">
              {habit.name}
            </h3>
          </div>
          {habit.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {habit.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground">
              {habit.frequency}
            </span>
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">{currentStreak} day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
        <Button
          onClick={handleComplete}
          disabled={isCompleting || loading || isCompleted}
          className="flex-1 sm:flex-none"
          size="sm"
          variant={isCompleted ? 'outline' : 'default'}
        >
          {isCompleted ? '✓ Completed!' : isCompleting ? 'Completing...' : 'Mark Complete'}
        </Button>

        <div className="flex gap-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(habit)}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Edit className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
          {habit.isPublic && (
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Share2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(habit.id)}
              variant="destructive"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


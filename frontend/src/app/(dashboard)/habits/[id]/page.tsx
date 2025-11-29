'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../../../components/shared/ProtectedRoute.js';
import { habitsService } from '../../../../features/habits/services/habits.service.js';
import { Button } from '../../../../components/ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card.js';
import { ArrowLeft, Edit, Share2 } from 'lucide-react';
import type { Habit } from '../../../../types/index.js';

function HabitDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;
  const [habit, setHabit] = useState<Habit & { stats?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        setLoading(true);
        const data = await habitsService.getHabitById(habitId);
        setHabit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load habit');
      } finally {
        setLoading(false);
      }
    };

    if (habitId) {
      fetchHabit();
    }
  }, [habitId]);

  const handleShare = async () => {
    if (habit?.publicId) {
      const shareUrl = `${window.location.origin}/habits/public/${habit.publicId}`;
      try {
        await navigator.share({
          title: habit.name,
          text: `Check out my habit: ${habit.name}`,
          url: shareUrl,
        });
      } catch (error) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !habit) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error || 'Habit not found'}</p>
              <Button onClick={() => router.push('/habits')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Habits
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => router.push('/habits')}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl font-semibold"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.icon || '⭐'}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {habit.name}
                  </h1>
                  {habit.description && (
                    <p className="text-muted-foreground mt-1">{habit.description}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {habit.isPublic && (
                  <Button onClick={handleShare} variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/habits?edit=${habit.id}`)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {habit.stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {habit.stats.completionRate?.toFixed(1) || 0}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {habit.stats.currentStreak || 0} days
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Completions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {habit.stats.completionCount || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Frequency</p>
                <p className="capitalize">{habit.frequency}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                <p>{new Date(habit.createdAt).toLocaleDateString()}</p>
              </div>
              {habit.isPublic && habit.publicId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Public Link</p>
                  <p className="text-sm break-all text-primary">
                    {typeof window !== 'undefined' && `${window.location.origin}/habits/public/${habit.publicId}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default HabitDetailPageContent;


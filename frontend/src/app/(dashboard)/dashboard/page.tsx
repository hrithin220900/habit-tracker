'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { ProtectedRoute } from '../../../components/shared/ProtectedRoute';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { useAuthStore } from '../../../state/stores/auth.store';
import { useHabits } from '../../../features/habits/hooks/useHabits';
import { GET_DASHBOARD } from '../../../api/graphql/queries';
import type { DashboardStats } from '../../../types/index';
import { WeeklyCompletionsChart } from '../../../components/charts/WeeklyCompletionsChart';
import { HabitCompletionBarChart } from '../../../components/charts/HabitCompletionBarChart';
import { Plus, TrendingUp, Flame } from 'lucide-react';

interface GetDashboardResponse {
  dashboard: DashboardStats;
}

function DashboardPageContent() {
  const { user } = useAuthStore();
  const { habits, fetchHabits } = useHabits();

  const { data, loading: statsLoading, error: statsError } =
    useQuery<GetDashboardResponse>(GET_DASHBOARD);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const stats = data?.dashboard;

  const totalHabits = stats?.totalHabits ?? habits.length;
  const activeStreaks = stats?.activeStreaks ?? 0;
  const completionRate = stats?.completionRate ?? 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Welcome Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Here's your habit tracking overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Habits
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHabits}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalHabits === 0 ? 'No habits yet' : 'Active habits'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Streaks
                </CardTitle>
                <Flame className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStreaks}</div>
                <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your overall habit completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Weekly Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsError && (
                  <p className="text-sm text-destructive mb-2">
                    Failed to load analytics
                  </p>
                )}
                <WeeklyCompletionsChart
                  data={stats?.weeklyCompletions ?? []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Top Habits by Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HabitCompletionBarChart
                  data={stats?.habitStats ?? []}
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/habits">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Habits
                </Button>
              </Link>
              <Link href="/habits">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View All Habits
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Habits */}
          {habits.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                Recent Habits
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.slice(0, 6).map((habit) => (
                  <Link key={habit.id} href={`/habits/${habit.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: habit.color }}
                          >
                            {habit.icon || '⭐'}
                          </div>
                          <CardTitle className="text-lg">
                            {habit.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!statsLoading && habits.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-lg text-muted-foreground mb-4">
                  You don't have any habits yet
                </p>
                <Link href="/habits">
                  <Button size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Habit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardPageContent;


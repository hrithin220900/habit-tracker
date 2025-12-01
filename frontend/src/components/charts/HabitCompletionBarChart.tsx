 'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DashboardStats } from '../../types/index.js';

interface HabitCompletionBarChartProps {
  data: DashboardStats['habitStats'];
}

/**
 * Mobile-first responsive bar chart for per-habit completion stats
 */
export function HabitCompletionBarChart({ data }: HabitCompletionBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No habit statistics yet
      </div>
    );
  }

  // Limit to top 5 habits by completions for readability
  const topHabits = [...data]
    .sort((a, b) => b.totalCompletions - a.totalCompletions)
    .slice(0, 5)
    .map((h) => ({
      name: h.habitName.length > 12 ? `${h.habitName.slice(0, 12)}…` : h.habitName,
      totalCompletions: h.totalCompletions,
      completionRate: Number(h.completionRate.toFixed(1)),
    }));

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topHabits} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            tickMargin={8}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 8,
            }}
            labelStyle={{ fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="totalCompletions"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



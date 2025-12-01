 'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DashboardStats } from '../../types/index.js';

interface WeeklyCompletionsChartProps {
  data: DashboardStats['weeklyCompletions'];
}

/**
 * Mobile-first responsive line chart for weekly completions
 */
export function WeeklyCompletionsChart({ data }: WeeklyCompletionsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No completion data yet
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="date"
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
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}



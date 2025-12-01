import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { AdminMetrics } from '../services/admin.service';

interface AdminMetricsCardsProps {
  metrics?: AdminMetrics | null;
}

/**
 * Mobile-first system metrics cards
 */
export function AdminMetricsCards({ metrics }: AdminMetricsCardsProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 w-20 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-7 w-16 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const { users, habits, completions, streaks } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {users.newLast30Days} new in last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{habits.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {habits.public} public • {habits.avgPerUser.toFixed(1)} per user
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completions.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {completions.recent7Days} in last 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Longest Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streaks.longest} days</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all users
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



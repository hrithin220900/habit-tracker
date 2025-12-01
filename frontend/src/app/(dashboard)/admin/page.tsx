"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "../../../components/shared/ProtectedRoute";
import { useAuthStore } from "../../../state/stores/auth.store";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  useAdminUsers,
  useAdminHabits,
  useAdminMetrics,
} from "../../../features/admin/hooks/useAdmin";
import { AdminUsersTable } from "../../../features/admin/components/AdminUsersTable";
import { AdminHabitsTable } from "../../../features/admin/components/AdminHabitsTable";
import { AdminMetricsCards } from "../../../features/admin/components/AdminMetricsCards";

function AdminPageContent() {
  const { user } = useAuthStore();
  const {
    users,
    pagination: usersPagination,
    loading: usersLoading,
    error: usersError,
    fetchUsers,
    updateUserRole,
    deleteUser,
  } = useAdminUsers();
  const {
    habits,
    pagination: habitsPagination,
    loading: habitsLoading,
    error: habitsError,
    fetchHabits,
  } = useAdminHabits();
  const { metrics, error: metricsError, fetchMetrics } = useAdminMetrics();

  const [userSearch, setUserSearch] = useState("");
  const [habitSearch, setHabitSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [habitsPage, setHabitsPage] = useState(1);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchUsers(usersPage, 10, userSearch || undefined);
  }, [fetchUsers, usersPage, userSearch]);

  useEffect(() => {
    fetchHabits(habitsPage, 10, habitSearch || undefined);
  }, [fetchHabits, habitsPage, habitSearch]);

  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsersPage(1);
    fetchUsers(1, 10, userSearch || undefined);
  };

  const handleHabitSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHabitsPage(1);
    fetchHabits(1, 10, habitSearch || undefined);
  };

  const isAdmin = user?.role === "admin";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Admin Panel
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage users, habits, and view system metrics
            </p>
          </div>

          {/* Access Restriction */}
          {!isAdmin && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive text-base">
                  Access denied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You do not have permission to view this page.
                </p>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <>
              {/* Metrics */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold">
                  System Metrics
                </h2>
                {metricsError && (
                  <p className="text-sm text-destructive">{metricsError}</p>
                )}
                <AdminMetricsCards metrics={metrics} />
              </section>

              {/* Users */}
              <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">Users</h2>
                  <form
                    onSubmit={handleUserSearchSubmit}
                    className="w-full sm:w-auto flex gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Button type="submit" variant="outline">
                      Search
                    </Button>
                  </form>
                </div>
                {usersError && (
                  <p className="text-sm text-destructive">{usersError}</p>
                )}
                <AdminUsersTable
                  users={users}
                  loading={usersLoading}
                  currentPage={usersPage}
                  totalPages={usersPagination?.pages}
                  onChangePage={setUsersPage}
                  onUpdateRole={updateUserRole}
                  onDeleteUser={deleteUser}
                />
              </section>

              {/* Habits */}
              <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">Habits</h2>
                  <form
                    onSubmit={handleHabitSearchSubmit}
                    className="w-full sm:w-auto flex gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="Search habits..."
                      value={habitSearch}
                      onChange={(e) => setHabitSearch(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Button type="submit" variant="outline">
                      Search
                    </Button>
                  </form>
                </div>
                {habitsError && (
                  <p className="text-sm text-destructive">{habitsError}</p>
                )}
                <AdminHabitsTable
                  habits={habits}
                  loading={habitsLoading}
                  currentPage={habitsPage}
                  totalPages={habitsPagination?.pages}
                  onChangePage={setHabitsPage}
                />
              </section>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminPageContent;

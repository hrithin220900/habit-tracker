'use client';

import { useState } from 'react';
import type { AdminUser } from '../services/admin.service.js';
import { Button } from '../../../components/ui/button.js';

interface AdminUsersTableProps {
  users: AdminUser[];
  loading: boolean;
  onChangePage: (page: number) => void;
  currentPage: number;
  totalPages?: number;
  onUpdateRole: (userId: string, role: 'user' | 'admin') => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

/**
 * Mobile-first responsive users table for admin panel
 */
export function AdminUsersTable({
  users,
  loading,
  currentPage,
  totalPages,
  onChangePage,
  onUpdateRole,
  onDeleteUser,
}: AdminUsersTableProps) {
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    try {
      setProcessingUserId(userId);
      await onUpdateRole(userId, role);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return;
    }
    try {
      setProcessingUserId(userId);
      await onDeleteUser(userId);
    } finally {
      setProcessingUserId(null);
    }
  };

  if (!loading && users.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No users found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Name
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Email
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Role
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">
                Habits
              </th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border/60">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {user.email}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-foreground">{user.email}</span>
                </td>
                <td className="px-4 py-3 capitalize">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                  {user.stats?.habitsCount ?? '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as 'user' | 'admin'
                        )
                      }
                      disabled={processingUserId === user.id || loading}
                      className="rounded-lg border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={processingUserId === user.id || loading}
                      onClick={() => handleDelete(user.id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onChangePage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onChangePage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}



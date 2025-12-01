'use client';

import type { Habit } from '../../../types/index.js';

interface AdminHabitsTableProps {
  habits: Habit[];
  loading: boolean;
  currentPage: number;
  totalPages?: number;
  onChangePage: (page: number) => void;
}

/**
 * Mobile-first responsive habits table for admin panel
 */
export function AdminHabitsTable({
  habits,
  loading,
  currentPage,
  totalPages,
  onChangePage,
}: AdminHabitsTableProps) {
  if (!loading && habits.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No habits found.
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
              <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">
                User ID
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Frequency
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">
                Public
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="border-b border-border/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: habit.color }}
                    >
                      {habit.icon || '⭐'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {habit.name}
                      </span>
                      {habit.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {habit.description}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                  {habit.userId}
                </td>
                <td className="px-4 py-3 capitalize text-sm">
                  {habit.frequency}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm">
                  {habit.isPublic ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 rounded-lg border border-input bg-background disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => onChangePage(currentPage - 1)}
            >
              Previous
            </button>
            <button
              className="px-2 py-1 rounded-lg border border-input bg-background disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => onChangePage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



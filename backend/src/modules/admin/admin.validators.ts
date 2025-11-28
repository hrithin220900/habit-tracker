import { z } from "zod";

/**
 * Get users query validation schema
 */
export const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    search: z.string().trim().optional(),
  }),
});

/**
 * Get habits query validation schema
 */
export const getHabitsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    search: z.string().trim().optional(),
  }),
});

/**
 * Update user role validation schema
 */
export const updateUserRoleSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    role: z.enum(["user", "admin"], {
      message: 'Role must be either "user" or "admin"',
    }),
  }),
});

/**
 * Delete user validation schema
 */
export const deleteUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
});

/**
 * Type exports
 */
export type GetUsersQuery = z.infer<typeof getUsersSchema>["query"];
export type GetHabitsQuery = z.infer<typeof getHabitsSchema>["query"];
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>["body"];

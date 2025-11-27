import { z } from "zod";

export const createHabitSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Habit name is required")
      .max(100, "Habit name cannot exceed 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .trim()
      .optional(),
    frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
    color: z
      .string()
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Invalid color format. Must be a valid hex color (e.g., #3B82F6)"
      )
      .default("#3B82F6"),
    icon: z
      .string()
      .min(1, "Icon is required")
      .max(50, "Icon name cannot exceed 50 characters")
      .trim()
      .default("star"),
    reminderTime: z.coerce.date().optional(),
    isPublic: z.boolean().default(false),
  }),
});

export const updateHabitSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Habit name is required")
      .max(100, "Habit name cannot exceed 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .trim()
      .optional(),
    frequency: z
      .enum(["daily", "weekly", "custom"])
      .default("daily")
      .optional(),
    color: z
      .string()
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Invalid color format. Must be a valid hex color (e.g., #3B82F6)"
      )
      .optional(),
    icon: z
      .string()
      .min(1, "Icon is required")
      .max(50, "Icon name cannot exceed 50 characters")
      .trim()
      .optional(),
    reminderTime: z.coerce.date().optional().nullable(),
    isPublic: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Habit ID is required"),
  }),
});

export const completeHabitSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Habit ID is required"),
  }),
  body: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional(),
  }),
});

export const getPublicHabitSchema = z.object({
  params: z.object({
    publicId: z.string().min(1, "Public ID is required"),
  }),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>["body"];
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>["body"];
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>["body"];

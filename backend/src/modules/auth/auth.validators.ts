import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .min(1, "Email is required")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .min(1, "Email is required")
      .toLowerCase()
      .trim(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];

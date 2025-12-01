import { api } from "../../../lib/api-client";
import type { User, ApiResponse } from "../../../types/index";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Registration failed");
    }
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Login failed");
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  async verifyToken(): Promise<User> {
    const response = await api.get<{ user: User }>("/auth/verify");
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Token verification failed");
    }
    return response.data.user;
  },
};

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../state/stores/auth.store.js";
import { authService } from "../services/auth.service.js";
import type {
  LoginCredentials,
  RegisterData,
} from "../services/auth.service.js";

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setAuth(response.user, response.accessToken, response.refreshToken);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      setAuth(response.user, response.accessToken, response.refreshToken);
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      clearAuth();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      clearAuth();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated,
    user,
  };
}

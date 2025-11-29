"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../state/stores/auth.store.js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, requireAuth, router]);

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

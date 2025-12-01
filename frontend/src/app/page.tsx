"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../state/stores/auth.store";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand persist to hydrate
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && pathname === "/") {
      router.replace("/dashboard");
    } else if (!isAuthenticated && pathname === "/") {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, pathname, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

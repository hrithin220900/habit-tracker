"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {displayError}
                </div>
              )}

              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                className="w-full"
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
                className="w-full"
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
                disabled={loading}
              >
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-1">
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

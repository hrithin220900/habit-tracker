"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "../../../features/auth/hooks/useAuth.js";
import { Button } from "../../../components/ui/button.js";
import { Input } from "../../../components/ui/input.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card.js";

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      await register({ name, email, password });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your information to get started
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
                type="text"
                label="Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                autoComplete="name"
                className="w-full"
              />

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
                className="w-full"
              />

              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
                className="w-full"
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
                disabled={loading}
              >
                Create account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-1">
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

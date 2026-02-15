"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleReset = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-olive-green/10">
            <svg className="h-8 w-8 text-olive-green" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-tuscan-brown">
            Check Your Email
          </h1>
          <p className="mt-3 text-base text-dark-text/60">
            If an account exists for <strong className="text-dark-text">{email}</strong>,
            we&apos;ve sent a password reset link. Please check your inbox.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-base font-medium text-terracotta transition-colors hover:text-terracotta/80"
          >
            Back to Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-tuscan-brown">
            Reset Password
          </h1>
          <p className="mt-2 text-base text-dark-text/60">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <Card>
          <CardBody className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-base text-red-600">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
            />

            <Button
              fullWidth
              isLoading={isLoading}
              onClick={handleReset}
            >
              Send Reset Link
            </Button>
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-base text-dark-text/60">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-terracotta transition-colors hover:text-terracotta/80"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

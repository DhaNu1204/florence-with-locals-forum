"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  // Auto-generate username preview from email
  const usernamePreview = useMemo(() => {
    if (!email.includes("@")) return "";
    let base = email.split("@")[0].toLowerCase();
    base = base.replace(/[^a-z0-9-]/g, "");
    base = base.replace(/^[^a-z]+/, "");
    return base || "user";
  }, [email]);

  // Password strength checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passwordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  const handleRegister = async () => {
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!passwordValid) {
      setError("Please meet all password requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      // Log full error for debugging (check browser console)
      console.error('Registration error:', JSON.stringify(authError, null, 2));

      const msg = authError.message;
      if (msg.includes("User already registered")) {
        setError(
          "An account with this email already exists. Try logging in instead."
        );
      } else if (msg.includes("Password should be at least")) {
        setError("Password must be at least 8 characters long.");
      } else if (msg.includes("Unable to validate email")) {
        setError("Please enter a valid email address.");
      } else if (msg.includes("rate limit") || msg.includes("too many")) {
        setError(
          "Too many signup attempts. Please wait a few minutes and try again."
        );
      } else {
        // Show the actual Supabase error for debugging
        setError(`Registration failed: ${msg}`);
      }
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-olive-green/10">
            <svg className="h-8 w-8 text-olive-green" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-tuscan-brown">
            Check Your Email
          </h1>
          <p className="mt-3 text-base text-dark-text/60">
            We&apos;ve sent a confirmation link to{" "}
            <strong className="text-dark-text">{email}</strong>.
            Click the link to activate your account and join the community.
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
            Join the Community
          </h1>
          <p className="mt-2 text-base text-dark-text/60">
            Create your Florence With Locals forum account
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
              label="Full Name"
              type="text"
              placeholder="Maria Rossi"
              value={fullName}
              onChange={(e) => setFullName((e.target as HTMLInputElement).value)}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            />

            {usernamePreview && (
              <p className="text-sm text-dark-text/50">
                Your profile:{" "}
                <span className="font-medium text-tuscan-brown">
                  forum.florencewithlocals.com/u/{usernamePreview}
                </span>
              </p>
            )}

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              />
              {password && (
                <div className="mt-2 space-y-1">
                  <PasswordCheck
                    passed={passwordChecks.length}
                    label="At least 8 characters"
                  />
                  <PasswordCheck
                    passed={passwordChecks.uppercase}
                    label="One uppercase letter"
                  />
                  <PasswordCheck
                    passed={passwordChecks.number}
                    label="One number"
                  />
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword((e.target as HTMLInputElement).value)
              }
              error={
                confirmPassword && password !== confirmPassword
                  ? "Passwords do not match"
                  : undefined
              }
            />

            <Button
              fullWidth
              isLoading={isLoading}
              onClick={handleRegister}
            >
              Create Account
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light-stone" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-dark-text/40">
                  or
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={handleGoogleSignUp}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-base text-dark-text/60">
          Already have an account?{" "}
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

function PasswordCheck({
  passed,
  label,
}: {
  passed: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <svg className="h-3.5 w-3.5 text-olive-green" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5 text-dark-text/30" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
      <span className={passed ? "text-olive-green" : "text-dark-text/40"}>
        {label}
      </span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

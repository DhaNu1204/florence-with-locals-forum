"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function SentryUserProvider() {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      Sentry.setUser({
        id: user.id,
        username: profile.username,
        email: user.email,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user, profile]);

  return null;
}

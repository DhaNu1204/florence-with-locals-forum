"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/app/actions/profile-actions";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProfile(userId: string, retries = 2) {
    console.log("AuthContext: fetchProfile called for", userId);

    for (let attempt = 0; attempt <= retries; attempt++) {
      // On retry, wait a moment for the DB trigger / cookies to settle
      if (attempt > 0) {
        console.log("AuthContext: fetchProfile retry", attempt, "of", retries, "for", userId);
        await new Promise((r) => setTimeout(r, 1500));
      }

      console.log("AuthContext: querying profiles table for id", userId, "(attempt", attempt, ")");
      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("AuthContext: query result — data:", !!data, "error:", error?.message || "none", "status:", status);

      if (data) {
        console.log("AuthContext: profile loaded:", (data as Profile).username);
        return data as Profile;
      }

      if (error) {
        console.error("AuthContext: profile query error:", error.message, "code:", error.code, "details:", error.details, "hint:", error.hint);
      }

      // No profile found — auto-create via server action (bypasses RLS)
      console.warn("AuthContext: no profile from query — calling ensureProfile server action");
      try {
        const result = await ensureProfile();
        console.log("AuthContext: ensureProfile returned — profile:", !!result.profile, "error:", result.error || "none");
        if (result.profile) {
          console.log("AuthContext: got profile from ensureProfile:", result.profile.username);
          return result.profile;
        }
      } catch (err) {
        console.error("AuthContext: ensureProfile threw:", err);
      }
    }

    console.error("AuthContext: ALL attempts failed for", userId, "— returning null");
    return null;
  }

  async function refreshProfile() {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Mark loading done as soon as session is known — profile loads in background
          setIsLoading(false);
          const p = await fetchProfile(currentSession.user.id);
          if (mounted) setProfile(p);
        }
      } catch (err) {
        console.error("AuthContext: init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("AuthContext: AUTH EVENT:", event);

      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setProfile(null);
        return;
      }

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        const p = await fetchProfile(newSession.user.id);
        if (mounted) setProfile(p);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isLoading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

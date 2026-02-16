"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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

/** Race a real Promise against a timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent duplicate concurrent fetchProfile calls
  const fetchingRef = useRef<string | null>(null);

  async function fetchProfile(userId: string) {
    // Deduplicate: if we're already fetching for this user, skip
    if (fetchingRef.current === userId) {
      console.log("AuthContext: fetchProfile already in progress for", userId, "— skipping");
      return null;
    }
    fetchingRef.current = userId;

    console.log("AuthContext: fetchProfile called for", userId);
    console.log("AuthContext: Supabase URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);

    try {
      // --- Fast path: browser-side query with timeout ---
      try {
        // Test if the browser Supabase client works at all
        console.log("AuthContext: testing Supabase connection with categories query...");
        const testResult = await withTimeout(
          Promise.resolve(supabase.from("categories").select("id").limit(1)),
          5000,
          "categories test query"
        );
        console.log(
          "AuthContext: test query result — data:", !!testResult.data,
          "error:", testResult.error?.message || "none"
        );

        if (testResult.data) {
          // Client works — try the profile query
          console.log("AuthContext: querying profiles table for id", userId);
          const profileResult = await withTimeout(
            Promise.resolve(
              supabase.from("profiles").select("*").eq("id", userId).single()
            ),
            5000,
            "profile query"
          );
          console.log(
            "AuthContext: profile query — data:", !!profileResult.data,
            "error:", profileResult.error?.message || "none",
            "status:", profileResult.status
          );

          if (profileResult.data) {
            console.log("AuthContext: profile loaded via browser client:", (profileResult.data as unknown as Profile).username);
            return profileResult.data as unknown as Profile;
          }

          if (profileResult.error) {
            console.error("AuthContext: profile query error:", profileResult.error.message, "code:", profileResult.error.code);
          }
        }
      } catch (err) {
        console.warn("AuthContext: browser query failed/timed out:", (err as Error).message);
      }

      // --- Fallback: server action (uses admin client, bypasses browser client issues) ---
      console.log("AuthContext: falling back to ensureProfile server action");
      try {
        const result = await withTimeout(
          ensureProfile(),
          10000,
          "ensureProfile server action"
        );
        console.log(
          "AuthContext: ensureProfile result — profile:", !!result.profile,
          "error:", result.error || "none"
        );
        if (result.profile) {
          console.log("AuthContext: profile loaded via server action:", result.profile.username);
          return result.profile;
        }
      } catch (err) {
        console.error("AuthContext: ensureProfile failed/timed out:", (err as Error).message);
      }

      // --- Last resort: retry server action once after a delay ---
      console.warn("AuthContext: first ensureProfile attempt failed — retrying after 2s...");
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const retryResult = await withTimeout(
          ensureProfile(),
          10000,
          "ensureProfile retry"
        );
        if (retryResult.profile) {
          console.log("AuthContext: profile loaded on retry:", retryResult.profile.username);
          return retryResult.profile;
        }
        console.error("AuthContext: retry also failed:", retryResult.error || "no profile returned");
      } catch (err) {
        console.error("AuthContext: retry ensureProfile failed/timed out:", (err as Error).message);
      }

      console.error("AuthContext: ALL attempts to load profile failed for", userId);
      return null;
    } finally {
      fetchingRef.current = null;
    }
  }

  async function refreshProfile() {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
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
        console.log("AuthContext: init — getting session...");
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        console.log("AuthContext: init — session:", !!currentSession, "user:", !!currentSession?.user);

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsLoading(false);
          const p = await fetchProfile(currentSession.user.id);
          if (mounted && p) setProfile(p);
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

        // Only fetch profile if we don't already have one for this user
        // Also deduplicated via fetchingRef inside fetchProfile
        const p = await fetchProfile(newSession.user.id);
        if (mounted && p) setProfile(p);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

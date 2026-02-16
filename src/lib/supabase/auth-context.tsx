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
    if (fetchingRef.current === userId) return null;
    fetchingRef.current = userId;

    try {
      // --- Fast path: browser-side query with timeout ---
      try {
        const testResult = await withTimeout(
          Promise.resolve(supabase.from("categories").select("id").limit(1)),
          5000,
          "categories test query"
        );

        if (testResult.data) {
          const profileResult = await withTimeout(
            Promise.resolve(
              supabase.from("profiles").select("*").eq("id", userId).single()
            ),
            5000,
            "profile query"
          );

          if (profileResult.data) {
            return profileResult.data as unknown as Profile;
          }
        }
      } catch {
        // Browser query failed or timed out — fall through to server action
      }

      // --- Fallback: server action (uses admin client, bypasses browser client issues) ---
      try {
        const result = await withTimeout(
          ensureProfile(),
          10000,
          "ensureProfile server action"
        );
        if (result.profile) return result.profile;
      } catch (err) {
        console.error("AuthContext: ensureProfile failed:", (err as Error).message);
      }

      // --- Last resort: retry server action once after a delay ---
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const retryResult = await withTimeout(
          ensureProfile(),
          10000,
          "ensureProfile retry"
        );
        if (retryResult.profile) return retryResult.profile;
      } catch (err) {
        console.error("AuthContext: ensureProfile retry failed:", (err as Error).message);
      }

      console.error("AuthContext: all attempts to load profile failed for", userId);
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
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

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

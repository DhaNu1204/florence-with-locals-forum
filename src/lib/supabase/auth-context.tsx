"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

  async function fetchProfile(userId: string) {
    console.log("AuthContext: fetching profile for", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("AuthContext: profile fetch error:", error.message);
      return null;
    }
    console.log("AuthContext: profile loaded:", data?.username);
    return data as Profile;
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

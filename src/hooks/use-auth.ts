import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const isSupabaseConfigured = true;
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "admin" | "student";

export const ADMIN_LOCAL_KEY = "skillarion_admin_session";
export const ADMIN_LOCAL_EMAIL = "skillariondevelopment9@gmail.com";

function readLocalAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ADMIN_LOCAL_KEY) === "1";
  } catch {
    return false;
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }


    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
        setRole(null);
        setTimeout(() => fetchRole(s.user.id), 0);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        setLoading(true);
        fetchRole(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? "student");
    setLoading(false);
  }

  async function signOut() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(ADMIN_LOCAL_KEY);
      } catch {
        // ignore
      }
    }
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setRole(null);
  }

  return { session, user, role, loading, signOut };
}

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AccountProfile { id: string; full_name: string; avatar_url: string | null }
export type AppRole = "admin" | "host" | "renter";

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: AccountProfile | null;
  roles: AppRole[];
  isHost: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const load = useCallback(async (s: Session | null) => {
    if (!s) { setProfile(null); setRoles([]); return; }
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url").eq("id", s.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", s.user.id),
    ]);
    setProfile(p.data ?? { id: s.user.id, full_name: "", avatar_url: null });
    setRoles((r.data ?? []).map((x) => x.role as AppRole));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        // Defer DB calls out of the auth callback.
        setTimeout(() => { load(s).finally(() => setReady(true)); }, 0);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      load(data.session).finally(() => setReady(true));
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const value: AuthState = {
    ready, session, user: session?.user ?? null, profile, roles, isHost: roles.includes("host"),
    refresh: () => load(session),
    signOut: async () => { await supabase.auth.signOut(); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

export function displayName(p: AccountProfile | null, fallback = "You") {
  return p?.full_name?.trim() || fallback;
}

// Uploads into a private bucket and returns a long-lived signed link (public buckets are blocked in this workspace).
export async function uploadImage(bucket: "avatars" | "listing-photos", userId: string, file: Blob, name: string) {
  const path = `${userId}/${Date.now().toString(36)}-${name}`;
  const up = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signed.error || !signed.data) throw signed.error ?? new Error("Could not create photo link");
  return signed.data.signedUrl;
}

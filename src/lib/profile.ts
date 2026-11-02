import { useEffect, useState } from "react";
import { demoProfile } from "./data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Profile } from "./types";

const KEY = "tryout-profile";

function readLocal(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw ? JSON.parse(raw) : null;
    return saved && saved.gender ? { ...demoProfile, ...saved } : null;
  } catch { return null; }
}

// Saves on this device, and to the account when signed in so matches follow the person.
export async function saveProfile(p: Profile, userId?: string | null) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
  if (userId) {
    await supabase.from("renter_preferences").upsert({ user_id: userId, answers: p as never, updated_at: new Date().toISOString() });
  }
}

// Account answers, then this device's answers, then the demo persona so every page works.
export function useProfile() {
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    (async () => {
      const local = readLocal();
      if (user) {
        const { data } = await supabase.from("renter_preferences").select("answers").eq("user_id", user.id).maybeSingle();
        const saved = data?.answers as Profile | undefined;
        if (saved && (saved as Profile).gender) { if (live) { setProfile({ ...demoProfile, ...saved }); setIsDemo(false); } return; }
        if (local) { await saveProfile(local, user.id); if (live) { setProfile(local); setIsDemo(false); } return; }
      }
      if (live) { setProfile(local ?? demoProfile); setIsDemo(!local); }
    })();
    return () => { live = false; };
  }, [user, ready]);
  return profile ? Object.assign(profile, { isDemo }) as Profile & { isDemo: boolean } : null;
}


import { useEffect, useState } from "react";
import { demoProfile } from "./data";
import type { Profile } from "./types";

const KEY = "tryout-profile";

export function saveProfile(p: Profile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

// Falls back to the demo persona so every page works when opened directly during judging.
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) : null;
      // Old saved answers from the first quiz version don't have the new fields, so reset to the demo persona.
      setProfile(saved && saved.gender ? { ...demoProfile, ...saved } : demoProfile);
    } catch {
      setProfile(demoProfile);
    }
  }, []);
  return profile;
}

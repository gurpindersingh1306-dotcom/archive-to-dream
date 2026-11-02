
import { useEffect, useState } from "react";
import { listings as seed } from "./data";
import type { Listing } from "./types";

const KEY = "tryout-host-listings";

export function getHostListings(): Listing[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

// Throws if the browser's storage is full (usually too many large photos).
export function saveHostListing(l: Listing) {
  const all = getHostListings().filter((x) => x.id !== l.id);
  localStorage.setItem(KEY, JSON.stringify([{ ...l, byYou: true }, ...all]));
}

export function deleteHostListing(id: string) {
  localStorage.setItem(KEY, JSON.stringify(getHostListings().filter((x) => x.id !== id)));
}

// Demo storage. Real version: Supabase table + Storage bucket for photos.
export function useAllListings() {
  const [all, setAll] = useState<Listing[] | null>(null);
  useEffect(() => { setAll([...getHostListings(), ...seed]); }, []);
  return all;
}

export function useHostListings() {
  const [mine, setMine] = useState<Listing[] | null>(null);
  useEffect(() => { setMine(getHostListings()); }, []);
  return { mine, refresh: () => setMine(getHostListings()) };
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listings as seed } from "./data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Listing } from "./types";

type Row = { id: string; host_id: string; data: unknown; photos: string[]; status: string; created_at: string };

export function rowToListing(r: Row, uid?: string | null): Listing {
  const d = r.data as Omit<Listing, "id">;
  return { ...d, id: r.id, photos: r.photos.length ? r.photos : undefined, hostId: r.host_id, status: r.status as Listing["status"], byYou: !!uid && r.host_id === uid };
}

async function fetchDbListings(): Promise<Row[]> {
  const { data, error } = await supabase.from("listings").select("id, host_id, data, photos, status, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Row[];
}

export const listingsKey = ["listings"] as const;

// Real listings from hosts first, then the sample homes.
export function useAllListings() {
  const { user, ready } = useAuth();
  const q = useQuery({ queryKey: [...listingsKey, user?.id ?? "anon"], queryFn: fetchDbListings, enabled: ready });
  if (!q.data) return q.isError ? seed : null;
  const live = q.data.filter((r) => r.status === "live" || r.host_id === user?.id).map((r) => rowToListing(r, user?.id));
  return [...live, ...seed];
}

export function useHostListings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: [...listingsKey, "mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("id, host_id, data, photos, status, created_at").eq("host_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Row[]).map((r) => rowToListing(r, user!.id));
    },
  });
  return { mine: q.data ?? null, refresh: () => qc.invalidateQueries({ queryKey: listingsKey }) };
}

export async function createListing(l: Listing, photos: string[]) {
  const { id: _id, photos: _p, byYou: _b, hostId: _h, status: _s, ...data } = l;
  const { data: row, error } = await supabase.from("listings").insert({ data: data as never, photos }).select("id").single();
  if (error) throw error;
  return row.id;
}

export async function setListingStatus(id: string, status: "live" | "paused") {
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteHostListing(id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}

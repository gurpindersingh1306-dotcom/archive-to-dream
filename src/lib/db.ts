import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Duration } from "./types";

export type BookingStatus = "requested" | "accepted" | "declined" | "cancelled" | "completed";
export interface Booking {
  id: string; listing_id: string; listing_title: string; renter_id: string; host_id: string | null;
  duration: Duration; start_date: string; total: number; message: string; status: BookingStatus; created_at: string;
}
export interface Review { id: string; listing_id: string; author_id: string; rating: number; topic: "water" | "power" | "noise" | "safety" | "commute"; tone: "good" | "mixed"; body: string; created_at: string }
export interface Message { id: string; listing_id: string; renter_id: string; host_id: string; sender_id: string; body: string; created_at: string }
export interface TxRow {
  id: string; ref: string; booking_id: string | null; payer_id: string; payee_id: string | null; property: string;
  type: "rent" | "deposit" | "refund" | "maintenance" | "utility" | "additional" | "repair";
  description: string; amount: number; status: "paid" | "pending" | "refunded"; due: string; method: string | null; paid_at: string | null; created_at: string;
}

// Names and photos for any set of user IDs.
export function useNames(ids: (string | null | undefined)[]) {
  const list = [...new Set(ids.filter(Boolean) as string[])].sort();
  const q = useQuery({
    queryKey: ["names", list],
    enabled: list.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", list);
      return Object.fromEntries((data ?? []).map((p) => [p.id, p]));
    },
  });
  return (q.data ?? {}) as Record<string, { id: string; full_name: string; avatar_url: string | null }>;
}

export function useBookings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
  });
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`bookings-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => qc.invalidateQueries({ queryKey: ["bookings"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);
  return { bookings: q.data ?? null, refresh: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); qc.invalidateQueries({ queryKey: ["transactions"] }); } };
}

export async function requestBooking(b: { listing_id: string; listing_title: string; duration: Duration; start_date: string; total: number; message: string }) {
  const { data, error } = await supabase.from("bookings").insert(b).select("*").single();
  if (error) throw error;
  return data as Booking;
}

export async function setBookingStatus(id: string, status: BookingStatus) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}

export function useTransactions() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as TxRow[];
    },
  });
  return { rows: q.data ?? null, refresh: () => qc.invalidateQueries({ queryKey: ["transactions"] }) };
}

export async function payTransaction(id: string) {
  const { error } = await supabase.rpc("pay_transaction", { _id: id });
  if (error) throw error;
}

export async function createInvoice(t: { payer_id: string; property: string; type: TxRow["type"]; description: string; amount: number; due: string; payee_id: string }) {
  const { error } = await supabase.from("transactions").insert(t);
  if (error) throw error;
}

export function useReviews(listingId: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["reviews", listingId],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").eq("listing_id", listingId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });
  return { reviews: q.data ?? [], refresh: () => qc.invalidateQueries({ queryKey: ["reviews", listingId] }) };
}

export async function addReview(r: { listing_id: string; rating: number; topic: Review["topic"]; tone: Review["tone"]; body: string }) {
  const { error } = await supabase.from("reviews").insert(r);
  if (error) throw error;
}

export function useMessages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["messages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`messages-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);
  return { messages: q.data ?? null, refresh: () => qc.invalidateQueries({ queryKey: ["messages"] }) };
}

export async function sendMessage(m: { listing_id: string; renter_id: string; host_id: string; body: string }) {
  const { error } = await supabase.from("messages").insert(m);
  if (error) throw error;
}

export const durationLabel: Record<Duration, string> = { "1w": "1 week", "1m": "1 month", "3m": "3 months", "11m": "11 months" };
export const bookingTone: Record<BookingStatus, string> = {
  requested: "bg-amber-soft text-amber", accepted: "bg-green-soft text-green", declined: "bg-stone text-ink-2", cancelled: "bg-stone text-muted", completed: "bg-ink text-on-ink",
};
export const bookingLabel: Record<BookingStatus, string> = { requested: "Waiting for host", accepted: "Confirmed", declined: "Declined", cancelled: "Cancelled", completed: "Completed" };

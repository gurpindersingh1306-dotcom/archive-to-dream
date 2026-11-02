import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MessageSquare, Star } from "lucide-react";
import Link from "@/components/AppLink";
import { useAuth } from "@/lib/auth";
import { addReview, bookingLabel, bookingTone, durationLabel, setBookingStatus, useBookings, useNames, type Booking, type BookingStatus, type Review } from "@/lib/db";
import { inr } from "@/lib/match";
import { Avatar } from "@/components/ui";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "Trial stays | Tryout" },
      { name: "description", content: "Your trial stays and the requests guests have sent to your homes." },
      { property: "og:title", content: "Trial stays | Tryout" },
      { property: "og:description", content: "Track trial stays and booking requests." },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { user } = useAuth();
  const { bookings, refresh } = useBookings();
  const [tab, setTab] = useState<"trips" | "requests">("trips");
  const names = useNames((bookings ?? []).flatMap((b) => [b.renter_id, b.host_id]));
  const trips = (bookings ?? []).filter((b) => b.renter_id === user?.id);
  const requests = (bookings ?? []).filter((b) => b.host_id === user?.id);
  const list = tab === "trips" ? trips : requests;
  const pending = requests.filter((b) => b.status === "requested").length;

  const change = async (b: Booking, s: BookingStatus, msg: string) => {
    try { await setBookingStatus(b.id, s); toast.success(msg); refresh(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't update"); }
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-5xl" data-reveal>Trial stays</h1>
      <div className="mt-8 inline-grid grid-cols-2 gap-1 rounded-full bg-stone p-1" role="tablist">
        {(["trips", "requests"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${tab === t ? "bg-ink text-on-ink" : "text-ink-2"}`}>
            {t === "trips" ? `My stays (${trips.length})` : `Requests to host${pending ? ` · ${pending} new` : ""}`}
          </button>
        ))}
      </div>

      {bookings === null ? <p className="mt-10 text-muted">Loading</p> : list.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-line p-10 text-center">
          <p className="font-display text-2xl font-bold">{tab === "trips" ? "No trial stays yet" : "No requests yet"}</p>
          <p className="mt-2 text-ink-2">{tab === "trips" ? "Find a home that fits and book a week or a month." : "When renters request a stay at one of your homes, it shows up here."}</p>
          <Link href={tab === "trips" ? "/matches" : "/host"} className="btn-primary mt-6">{tab === "trips" ? "See your matches" : "Your listings"}</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4" data-reveal-stagger>
          {list.map((b) => {
            const other = tab === "trips" ? (b.host_id ? names[b.host_id] : null) : names[b.renter_id];
            return (
              <li key={b.id} className="rounded-[1.75rem] border border-line bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/homes/${b.listing_id}`} className="font-display text-xl font-bold hover:text-coral">{b.listing_title}</Link>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{durationLabel[b.duration]} from {new Date(b.start_date + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="font-semibold tabular-nums text-ink">{inr(b.total)}</span>
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${bookingTone[b.status]}`}>{tab === "requests" && b.status === "requested" ? "Needs your answer" : bookingLabel[b.status]}</span>
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm">
                  <Avatar name={other?.full_name ?? (tab === "trips" ? "Tryout" : "Guest")} url={other?.avatar_url} />
                  <span className="text-ink-2">{tab === "trips" ? `Host: ${other?.full_name || "Tryout sample home"}` : `Guest: ${other?.full_name || "A renter"}`}</span>
                </div>
                {b.message && <p className="mt-3 rounded-2xl bg-paper p-3 text-sm text-ink-2">&ldquo;{b.message}&rdquo;</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {tab === "requests" && b.status === "requested" && (<>
                    <button onClick={() => change(b, "accepted", "Stay accepted. An invoice was sent to the guest.")} className="btn-primary !py-2">Accept</button>
                    <button onClick={() => change(b, "declined", "Request declined")} className="btn-ghost !py-2">Decline</button>
                  </>)}
                  {b.status === "accepted" && (tab === "requests" || !b.host_id) && (
                    <button onClick={() => change(b, "completed", "Marked as completed")} className="btn-ghost !py-2">Mark stay completed</button>
                  )}
                  {tab === "trips" && (b.status === "requested" || b.status === "accepted") && (
                    <button onClick={() => { if (confirm("Cancel this trial stay?")) change(b, "cancelled", "Stay cancelled"); }} className="rounded-full px-4 py-2 text-sm font-semibold text-red hover:bg-paper">Cancel</button>
                  )}
                  {b.host_id && <Link href={`/inbox?listing=${b.listing_id}&renter=${b.renter_id}`} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold hover:bg-paper"><MessageSquare className="h-4 w-4" />Message</Link>}
                  {tab === "trips" && b.status === "accepted" && <Link href="/transactions" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-paper">Pay invoice</Link>}
                </div>
                {tab === "trips" && (b.status === "accepted" || b.status === "completed") && <ReviewBox booking={b} />}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

const topics: { v: Review["topic"]; label: string }[] = [
  { v: "water", label: "Water" }, { v: "power", label: "Power" }, { v: "noise", label: "Noise" }, { v: "safety", label: "Safety" }, { v: "commute", label: "Commute" },
];

function ReviewBox({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(4);
  const [topic, setTopic] = useState<Review["topic"]>("water");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <p className="mt-4 rounded-2xl bg-green-soft p-3 text-sm text-green">Thanks! Your lived-in report now shows on the listing.</p>;
  if (!open) return <button onClick={() => setOpen(true)} className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-coral hover:underline"><Star className="h-4 w-4" />Write a lived-in report</button>;
  const submit = async () => {
    if (body.trim().length < 4) { toast.error("Write a sentence about what it's really like."); return; }
    setBusy(true);
    try { await addReview({ listing_id: booking.listing_id, rating, topic, tone: rating >= 4 ? "good" : "mixed", body: body.trim() }); setDone(true); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save"); }
    finally { setBusy(false); }
  };
  return (
    <div className="mt-4 rounded-2xl border border-line p-4">
      <p className="text-sm font-semibold">What should the next renter know?</p>
      <div className="mt-3 flex gap-1" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}><Star className={`h-6 w-6 ${n <= rating ? "fill-coral text-coral" : "text-line"}`} /></button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{topics.map((t) => <button key={t.v} onClick={() => setTopic(t.v)} className={`rounded-full border px-3 py-1 text-sm ${topic === t.v ? "border-ink bg-ink text-on-ink" : "border-line"}`}>{t.label}</button>)}</div>
      <textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} maxLength={600} className="field mt-3" placeholder="Water comes 6 to 9 am, the tank covers the rest of the day." />
      <button onClick={submit} disabled={busy} className="btn-primary mt-3 !py-2">{busy ? "Saving" : "Post report"}</button>
    </div>
  );
}

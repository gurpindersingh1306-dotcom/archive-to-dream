import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "@/components/AppLink";
import { useAllListings } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { durations } from "@/lib/quiz";
import { inr, priceFor } from "@/lib/match";
import { requestBooking, durationLabel } from "@/lib/db";
import { HomeVisual } from "@/components/visuals";
import type { Duration } from "@/lib/types";

const order: Duration[] = ["1w", "1m", "3m", "11m"];
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

export function TrialView({ id }: { id: string }) {
  const all = useAllListings();
  const profile = useProfile();
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const l = all?.find((x) => x.id === id);
  const [duration, setDuration] = useState<Duration>("1m");
  const [start, setStart] = useState(tomorrow());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (profile) setDuration(profile.duration); }, [profile]);

  if (!all || !ready) return <main className="mx-auto max-w-6xl px-5 py-16 text-muted">Loading</main>;
  if (!l) return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="text-3xl">This home isn&apos;t listed anymore</h1>
      <Link href="/matches" className="btn-primary mt-6">See your matches</Link>
    </main>
  );

  const allowed = durations.filter((d) => order.indexOf(d.value) >= order.indexOf(l.minStay));
  const price = priceFor(l, duration);
  const own = !!user && l.hostId === user.id;

  const book = async () => {
    if (!user) { nav({ to: "/auth", search: { redirect: `/homes/${l.id}/trial` } }); return; }
    if (start < tomorrow()) { toast.error("Pick a start date from tomorrow onwards."); return; }
    setBusy(true);
    try {
      const b = await requestBooking({ listing_id: l.id, listing_title: `${l.title}, ${l.area}`, duration, start_date: start, total: Math.round(price.total), message: message.trim() });
      toast.success(b.status === "accepted" ? "Trial confirmed. Your invoice is ready." : "Request sent to the host.");
      nav({ to: "/bookings" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't book this stay");
    } finally { setBusy(false); }
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Link href={`/homes/${l.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"><ArrowLeft className="h-4 w-4" />Back to the home</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <section data-reveal>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral">Book a trial stay</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{l.title}</h1>
          <p className="mt-2 text-ink-2">{l.area}, Bengaluru · hosted by {l.host}</p>

          <div className="mt-10 space-y-8">
            <div>
              <p className="text-sm font-semibold">How long?</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {allowed.map((d) => (
                  <button key={d.value} onClick={() => setDuration(d.value)} aria-pressed={duration === d.value}
                    className={`rounded-2xl border-[1.5px] p-4 text-left transition ${duration === d.value ? "border-ink bg-ink text-on-ink" : "border-line bg-card hover:border-ink"}`}>
                    <span className="block font-display text-lg font-bold">{d.label}</span>
                    <span className={`text-xs ${duration === d.value ? "text-on-ink/70" : "text-muted"}`}>{inr(priceFor(l, d.value).total)}</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="block max-w-xs text-sm font-semibold">
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Move-in date</span>
              <input type="date" min={tomorrow()} value={start} onChange={(e) => setStart(e.target.value)} className="field mt-2" />
            </label>
            <label className="block text-sm font-semibold">
              A note for the household <span className="font-normal text-muted">(optional)</span>
              <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={600} className="field mt-2"
                placeholder="Hi! I'm starting at a startup in Koramangala next month and would love to try the room for a few weeks." />
            </label>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start" data-reveal>
          <div className="overflow-hidden rounded-[2rem] border border-line bg-card shadow-lift">
            <HomeVisual listing={l} className="h-44" />
            <div className="p-6">
              <p className="text-sm text-muted">{durationLabel[duration]} from {new Date(start + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              <p className="mt-1 font-display text-4xl font-bold tabular-nums">{inr(price.total)}</p>
              <p className="text-sm text-muted">{price.unit} · {price.note}</p>
              <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-ink-2">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-green" />{l.hostId ? "The host confirms within 24 hours" : "Sample home: confirms instantly"}</li>
                <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-green" />You pay only after it's confirmed</li>
              </ul>
              {own ? (
                <p className="mt-5 rounded-2xl bg-paper p-3 text-sm text-ink-2">This is your own listing, so you can't book it.</p>
              ) : (
                <button onClick={book} disabled={busy} className="btn-primary mt-5 w-full">
                  {busy ? "Booking" : user ? (l.hostId ? "Request this stay" : "Confirm trial stay") : "Sign in to book"}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

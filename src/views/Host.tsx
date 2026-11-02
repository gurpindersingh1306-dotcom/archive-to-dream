import Link from "@/components/AppLink";
import { toast } from "sonner";
import { Eye, Plus, Trash2, ShieldCheck, ClipboardCheck, RefreshCw, Pause, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useHostListings, deleteHostListing, setListingStatus } from "@/lib/store";
import { useBookings } from "@/lib/db";
import { inr } from "@/lib/match";
import { HomeVisual } from "@/components/visuals";

const why = [
  { icon: RefreshCw, title: "Meet tenants before a year-long lease", body: "Renters stay for a week or a month first. You both decide with real experience." },
  { icon: ClipboardCheck, title: "Every room documented", body: "The move-in inspection records condition with timestamped photos both sides confirm." },
  { icon: ShieldCheck, title: "Better-matched households", body: "Renters see how they fit your current flatmates, so fewer people leave early." },
];

export default function HostDashboard() {
  const { isHost, refresh: refreshAuth, ready } = useAuth();
  const { mine, refresh } = useHostListings();
  const { bookings } = useBookings();

  const become = async () => {
    const { error } = await supabase.rpc("become_host");
    if (error) { toast.error(error.message); return; }
    await refreshAuth(); toast.success("Hosting is on");
  };
  const act = async (fn: () => Promise<void>, msg: string) => {
    try { await fn(); toast.success(msg); refresh(); } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); }
  };

  if (ready && !isHost) return (
    <main className="mx-auto max-w-3xl px-5 py-20 text-center">
      <h1 className="text-5xl" data-reveal>Host on Tryout</h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-ink-2">List a room, a flat or a PG bed. Renters try it for a week or a month before they commit.</p>
      <button onClick={become} className="btn-primary mt-8">Start hosting</button>
    </main>
  );

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
        <div>
          <h1 className="text-5xl">Your listings</h1>
          <p className="mt-2 text-ink-2">List a room, a flat or a PG bed. Renters can try it before they commit.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/bookings" className="btn-ghost">Trial requests</Link>
          <Link href="/host/new" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" />List a home</Link>
        </div>
      </div>

      {mine === null ? <p className="mt-10 text-muted">Loading</p> : mine.length === 0 ? (
        <div className="mt-10 grid gap-8 rounded-[2rem] border border-line bg-card p-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <h2 className="text-3xl">List your first home</h2>
            <p className="mt-2 leading-relaxed text-ink-2">About five minutes: the basics, pricing for trial and long stays, photos, who lives there and your house rules.</p>
            <Link href="/host/new" className="btn-primary mt-6">Start listing</Link>
          </div>
          <ul className="space-y-5" data-reveal-stagger>
            {why.map(({ icon: I, title, body }) => (
              <li key={title} className="flex gap-3">
                <I className="mt-0.5 h-5 w-5 shrink-0 text-coral" aria-hidden="true" />
                <div><p className="font-semibold">{title}</p><p className="text-sm text-ink-2">{body}</p></div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          {mine.map((l) => {
            const reqs = (bookings ?? []).filter((b) => b.listing_id === l.id);
            const open = reqs.filter((b) => b.status === "requested").length;
            const live = l.status !== "paused";
            return (
              <li key={l.id} className="overflow-hidden rounded-[1.75rem] border border-line bg-card transition hover:-translate-y-1 hover:shadow-lift">
                <HomeVisual listing={l} className="h-44" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">{l.area} · {l.kind}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${live ? "bg-green-soft text-green" : "bg-stone text-ink-2"}`}>{live ? "Live" : "Paused"}</span>
                  </div>
                  <h2 className="mt-1 text-lg">{l.title}</h2>
                  <p className="mt-1 text-sm text-ink-2">{inr(l.weekly)}/week trial · {inr(l.monthly)}/month</p>
                  <p className="mt-3 text-sm">{open ? <Link href="/bookings" className="font-semibold text-coral">{open} trial request{open > 1 ? "s" : ""} waiting</Link> : <span className="text-muted">{reqs.length ? `${reqs.length} past request${reqs.length > 1 ? "s" : ""}` : "No trial requests yet"}</span>}</p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/homes/${l.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line py-2 text-sm font-semibold hover:border-ink"><Eye className="h-4 w-4" aria-hidden="true" />View</Link>
                    <button onClick={() => act(() => setListingStatus(l.id, live ? "paused" : "live"), live ? "Listing paused" : "Listing is live")} aria-label={live ? "Pause listing" : "Publish listing"} className="rounded-full border border-line px-3 hover:border-ink">{live ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                    <button onClick={() => { if (confirm(`Remove "${l.title}"?`)) act(() => deleteHostListing(l.id), "Listing removed"); }} aria-label={`Remove ${l.title}`} className="rounded-full border border-line px-3 text-muted hover:border-red hover:text-red"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

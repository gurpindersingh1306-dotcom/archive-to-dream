
import Link from "@/components/AppLink";
import { motion } from "framer-motion";
import { Eye, Plus, Trash2, ShieldCheck, ClipboardCheck, RefreshCw } from "lucide-react";
import { useHostListings, deleteHostListing } from "@/lib/store";
import { inr } from "@/lib/match";
import { HomeVisual } from "@/components/visuals";

const why = [
  { icon: RefreshCw, title: "Meet tenants before a year-long lease", body: "Renters stay for a week or a month first. You both decide with real experience." },
  { icon: ClipboardCheck, title: "Every room documented", body: "The move-in inspection records condition with timestamped photos both sides confirm." },
  { icon: ShieldCheck, title: "Better-matched households", body: "Renters see how they fit your current flatmates, so fewer people leave early." },
];

export default function HostDashboard() {
  const { mine, refresh } = useHostListings();

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Your listings</h1>
          <p className="mt-2 text-ink-2">List a room, a flat or a PG bed. Renters can try it before they commit.</p>
        </div>
        <Link href="/host/new" className="flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-medium text-white hover:bg-ink-2"><Plus className="h-4 w-4" aria-hidden="true" />List a home</Link>
      </div>

      {mine === null ? null : mine.length === 0 ? (
        <div className="mt-10 grid gap-8 rounded-2xl border border-line bg-white p-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">List your first home</h2>
            <p className="mt-2 leading-relaxed text-ink-2">It takes about five minutes: the basics, pricing for trial and long stays, photos, who lives there and your house rules.</p>
            <Link href="/host/new" className="mt-6 inline-block rounded-xl bg-ink px-5 py-3 font-medium text-white hover:bg-ink-2">Start listing</Link>
          </div>
          <ul className="space-y-5">
            {why.map(({ icon: I, title, body }) => (
              <li key={title} className="flex gap-3">
                <I className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                <div><p className="font-medium">{title}</p><p className="text-sm text-ink-2">{body}</p></div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mine.map((l, i) => (
            <motion.li key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="overflow-hidden rounded-2xl border border-line bg-white">
              <HomeVisual listing={l} className="h-40" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">{l.area} · {l.kind}</p>
                  <span className="rounded-md bg-green-soft px-2 py-0.5 text-xs font-medium text-green">Live</span>
                </div>
                <h2 className="mt-1 text-lg font-semibold">{l.title}</h2>
                <p className="mt-1 text-sm text-ink-2">{inr(l.weekly)}/week trial · {inr(l.monthly)}/month</p>
                <p className="mt-3 text-sm text-muted">No trial requests yet</p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/homes/${l.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-sm font-medium hover:border-ink/30"><Eye className="h-4 w-4" aria-hidden="true" />View as renter</Link>
                  <button onClick={() => { if (confirm(`Remove "${l.title}"?`)) { deleteHostListing(l.id); refresh(); } }} aria-label={`Remove ${l.title}`} className="rounded-lg border border-line px-3 text-muted hover:border-red hover:text-red"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </main>
  );
}

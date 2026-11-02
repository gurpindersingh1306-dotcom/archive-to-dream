
import Link from "@/components/AppLink";
import { motion } from "framer-motion";
import { Bus, RefreshCw, Users, UserRound } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { useAllListings } from "@/lib/store";
import { durations } from "@/lib/quiz";
import { inr, priceFor, rankListings, type MatchResult } from "@/lib/match";
import { MatchPill } from "@/components/ui";
import { HomeVisual } from "@/components/visuals";
import type { Profile } from "@/lib/types";

export default function Matches() {
  const profile = useProfile();
  const all = useAllListings();
  if (!profile || !all) return <main className="mx-auto max-w-6xl px-5 py-16 text-muted">Finding your matches</main>;

  const ranked = rankListings(profile, all);
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const dur = durations.find((d) => d.value === profile.duration)?.label ?? "1 month";

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Your top 3 this week</h1>
          <p className="mt-2 text-ink-2">Picked from {all.length} homes for {dur}{profile.area !== "Anywhere" ? ` near ${profile.area}` : ""}, around {inr(profile.budget)} a month.</p>
        </div>
        <Link href="/start" className="rounded-lg border border-line bg-white px-4 py-2 text-sm hover:border-ink/30">Edit your answers</Link>
      </div>

      {top.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-white p-8">
          <p className="font-medium">No homes match these answers yet</p>
          <p className="mt-1 text-ink-2">Try a higher budget, choose &quot;Either works&quot; for how you want to live, or widen the kinds of homes you&apos;re comfortable in.</p>
          <Link href="/start" className="mt-4 inline-block rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">Edit your answers</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {top.map((m, i) => (
            <motion.div key={m.listing.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.1, duration: 0.4 }}>
              <TopCard m={m} profile={profile} first={i === 0} />
            </motion.div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold">More homes worth a look</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {rest.map((m) => (
              <li key={m.listing.id}>
                <Link href={`/homes/${m.listing.id}`} className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-3 hover:border-ink/30">
                  <HomeVisual listing={m.listing} className="h-20 w-28 shrink-0 rounded-xl" label={false} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium group-hover:text-teal">{m.listing.title}</p>
                    <p className="truncate text-sm text-muted">{m.listing.area} · {inr(m.listing.monthly)} a month</p>
                    <p className="mt-1 line-clamp-1 text-sm text-ink-2">{m.reason}</p>
                  </div>
                  <MatchPill score={m.score} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function TopCard({ m, profile, first }: { m: MatchResult; profile: Profile; first: boolean }) {
  const l = m.listing;
  const price = priceFor(l, profile.duration);
  return (
    <Link href={`/homes/${l.id}`} className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 ${first ? "border-teal" : "border-line hover:border-ink/30"}`}>
      <div className="relative overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-105">
          <HomeVisual listing={l} className="h-48" />
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          {l.trialToLease && <span className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-green"><RefreshCw className="h-3 w-3" aria-hidden="true" /> Trial to lease</span>}
          {l.byYou && <span className="rounded-md bg-ink px-2 py-1 text-xs font-medium text-white">Listed by you</span>}
        </div>
        <div className="absolute right-3 top-3"><MatchPill score={m.score} /></div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted">{l.area} · {l.kind}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:text-teal">{l.title}</h3>
        <p className="mt-3 text-sm">
          <span className="font-semibold tabular-nums">{inr(price.total)}</span> <span className="text-muted">{price.unit}</span>
          {profile.duration !== "11m" && <span className="text-muted"> · {inr(l.monthly)}/month long term</span>}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
          <span className="flex items-center gap-1.5"><Bus className="h-4 w-4 text-muted" aria-hidden="true" />{l.commuteMin} min to {l.commuteTo.split(" and ")[0]}</span>
          <span className="flex items-center gap-1.5">
            {l.flatmates.length ? <Users className="h-4 w-4 text-muted" aria-hidden="true" /> : <UserRound className="h-4 w-4 text-muted" aria-hidden="true" />}
            {l.flatmates.length ? `${l.flatmates.length} ${l.flatmates.length > 1 ? "flatmates" : "flatmate"}` : "Just you"}
          </span>
        </div>
        <p className="mt-4 rounded-lg bg-paper p-3 text-sm leading-relaxed text-ink-2">{m.reason}</p>
      </div>
    </Link>
  );
}

import { useMemo, useState } from "react";
import Link from "@/components/AppLink";
import { ArrowRight, CloudRain, Wind } from "lucide-react";
import { getLocality, type PlaceCategory } from "@/lib/locality";
import { CategoryFilter, DemoBadge, LocalityMap, PlaceRow, ScoreBar, useCategoryFilter } from "./LocalityMap";

// Compact locality block shown on each property profile.
export function LocalityPanel({ area }: { area: string }) {
  const loc = getLocality(area);
  const { active, toggle } = useCategoryFilter();
  const [selected, setSelected] = useState<string | null>(null);
  const counts = useMemo(() => loc.places.reduce<Record<string, number>>((a, p) => ({ ...a, [p.category]: (a[p.category] ?? 0) + 1 }), {}), [loc]);
  const list = loc.places.filter((p) => active.has(p.category as PlaceCategory)).slice(0, 6);

  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Around this home</h2>
          <p className="mt-0.5 text-sm text-muted">{loc.tagline}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold text-teal tabular-nums">{loc.overall}<span className="text-sm text-muted">/100</span></p>
          <p className="text-xs text-muted">Locality score</p>
        </div>
      </div>
      <div className="mt-4"><CategoryFilter active={active} onToggle={toggle} counts={counts} /></div>
      <div className="mt-4 space-y-3">
        <LocalityMap loc={loc} active={active} selected={selected} onSelect={(p) => setSelected(p?.id ?? null)} className="aspect-[16/10] w-full" />
        <div className="grid gap-1 sm:grid-cols-2">
          {list.map((p) => <PlaceRow key={p.id} p={p} active={p.id === selected} onClick={() => setSelected(p.id === selected ? null : p.id)} />)}
        </div>
      </div>
      <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {loc.infra.slice(0, 4).map((s) => (
          <div key={s.key}>
            <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{s.label}</span><span className="tabular-nums text-ink-2">{s.score}</span></div>
            <ScoreBar score={s.score} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-ink-2">
        <span className="flex items-center gap-1.5 rounded-lg bg-paper px-3 py-2"><Wind className="h-4 w-4 text-muted" aria-hidden="true" />AQI {loc.aqi}</span>
        <span className="flex items-center gap-1.5 rounded-lg bg-paper px-3 py-2"><CloudRain className="h-4 w-4 text-muted" aria-hidden="true" />{loc.monsoonNote}</span>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted"><DemoBadge />{loc.source} · {loc.updated}</p>
        <Link href={`/locality?area=${encodeURIComponent(area)}`} className="flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-deep">Full locality report <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

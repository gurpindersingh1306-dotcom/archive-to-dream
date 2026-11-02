import { useEffect, useMemo, useState } from "react";
import Link from "@/components/AppLink";
import { motion } from "framer-motion";
import { ArrowLeftRight, CloudRain, MapPin, Wind } from "lucide-react";
import aerial from "@/assets/homes/aerial-1.jpg";
import { categoryMeta, getLocality, localityAreas, nearest, type PlaceCategory } from "@/lib/locality";
import { listings } from "@/lib/data";
import { inr } from "@/lib/match";
import { CategoryFilter, DemoBadge, LocalityMap, PlaceRow, ScoreBar, categoryIcon, useCategoryFilter } from "@/components/LocalityMap";
import { HomeVisual } from "@/components/visuals";

export default function LocalityPage({ initialArea }: { initialArea?: string }) {
  const [area, setArea] = useState(initialArea && localityAreas.includes(initialArea) ? initialArea : "HSR Layout");
  const [compare, setCompare] = useState("Indiranagar");
  const [selected, setSelected] = useState<string | null>(null);
  const [sort, setSort] = useState<"distance" | "name">("distance");
  const { active, toggle } = useCategoryFilter();
  useEffect(() => { if (initialArea && localityAreas.includes(initialArea)) setArea(initialArea); }, [initialArea]);
  useEffect(() => { if (compare === area) setCompare(localityAreas.find((a) => a !== area)!); }, [area, compare]);

  const loc = getLocality(area);
  const other = getLocality(compare);
  const counts = useMemo(() => loc.places.reduce<Record<string, number>>((a, p) => ({ ...a, [p.category]: (a[p.category] ?? 0) + 1 }), {}), [loc]);
  const list = loc.places.filter((p) => active.has(p.category)).sort((a, b) => (sort === "distance" ? a.km - b.km : a.name.localeCompare(b.name)));
  const homes = listings.filter((l) => l.area === area).slice(0, 3);
  const cats = Object.keys(categoryMeta) as PlaceCategory[];

  return (
    <main>
      <section className="relative overflow-hidden">
        <img src={aerial} alt="Aerial view of a Bengaluru neighbourhood with a metro line" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/20" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-white sm:py-20">
          <p className="flex items-center gap-2 text-sm text-white/80"><MapPin className="h-4 w-4" aria-hidden="true" />Locality intelligence · Bengaluru</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold sm:text-5xl">Know the street before you sign</h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">Hospitals, police, transit, drainage, lighting and monsoon flooding, mapped around every home.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="area">Area</label>
            <select id="area" value={area} onChange={(e) => { setArea(e.target.value); setSelected(null); }}
              className="rounded-xl border border-white/30 bg-white px-4 py-3 font-medium text-ink">
              {localityAreas.map((a) => <option key={a}>{a}</option>)}
            </select>
            <span className="rounded-md bg-amber-soft px-2 py-1 text-xs font-medium text-amber">Demonstration data</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Locality score", v: `${loc.overall}/100`, s: loc.tagline },
            { k: "Nearest hospital", v: `${nearest(loc, "hospital")?.km ?? "–"} km`, s: nearest(loc, "hospital")?.name ?? "" },
            { k: "Nearest metro", v: `${nearest(loc, "metro")?.km ?? "–"} km`, s: `${nearest(loc, "metro")?.walkMin ?? "–"} min walk` },
            { k: "Air quality (AQI)", v: String(loc.aqi), s: loc.aqi <= 100 ? "Satisfactory to moderate" : "Moderate, sensitive groups take care" },
          ].map((c, i) => (
            <motion.div key={c.k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm text-muted">{c.k}</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{c.v}</p>
              <p className="mt-1 truncate text-xs text-ink-2">{c.s}</p>
            </motion.div>
          ))}
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-xl font-semibold">Map of {area}</h2><p className="text-sm text-muted">Tap a pin or a place for details. Distances are from the area centre.</p></div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sort</span>
              {(["distance", "name"] as const).map((s) => (
                <button key={s} onClick={() => setSort(s)} aria-pressed={sort === s} className={`rounded-lg px-3 py-1.5 capitalize ${sort === s ? "bg-ink text-white" : "border border-line hover:border-ink/30"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="mt-4"><CategoryFilter active={active} onToggle={toggle} counts={counts} /></div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <LocalityMap loc={loc} active={active} selected={selected} onSelect={(p) => setSelected(p?.id ?? null)} className="aspect-[4/3] lg:aspect-auto lg:min-h-[480px]" />
            <div className="max-h-[480px] space-y-1 overflow-y-auto pr-1">
              {list.map((p) => <PlaceRow key={p.id} p={p} active={p.id === selected} onClick={() => setSelected(p.id === selected ? null : p.id)} />)}
            </div>
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted"><DemoBadge />{loc.source} · {loc.updated}</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-xl font-semibold">Civic infrastructure</h2>
            <ul className="mt-5 space-y-4">
              {loc.infra.map((s) => (
                <li key={s.key}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{s.label}</span><span className="tabular-nums text-ink-2">{s.score}/100</span></div>
                  <ScoreBar score={s.score} />
                  <p className="mt-1 text-xs text-muted">{s.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted">Sources (simulated): ward road audits, storm-water drain maps, streetlight records · {loc.updated}</p>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-xl font-semibold">Environment</h2>
              <div className="mt-4 space-y-3 text-sm text-ink-2">
                <p className="flex gap-3"><Wind className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />AQI {loc.aqi} on a typical day. Worse in winter mornings and near arterial roads.</p>
                <p className="flex gap-3"><CloudRain className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />{loc.monsoonNote}</p>
              </div>
              <p className="mt-4 text-xs text-muted">Sources (simulated): pollution board monitors, monsoon flood reports · {loc.updated}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-xl font-semibold">Homes in {area}</h2>
              {homes.length ? (
                <ul className="mt-4 space-y-3">
                  {homes.map((h) => (
                    <li key={h.id}>
                      <Link href={`/homes/${h.id}`} className="flex items-center gap-3 rounded-xl border border-line p-2 hover:border-ink/30">
                        <HomeVisual listing={h} className="h-14 w-20 shrink-0 rounded-lg" label={false} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{h.title}</span><span className="text-xs text-muted">{inr(h.monthly)}/month</span></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm text-ink-2">No homes listed here yet.</p>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <ArrowLeftRight className="h-5 w-5 text-teal" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Compare {area} with</h2>
            <select value={compare} onChange={(e) => setCompare(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium">
              {localityAreas.filter((a) => a !== area).map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b border-line text-left text-muted"><th className="py-2 font-medium">Measure</th><th className="py-2 font-medium">{area}</th><th className="py-2 font-medium">{compare}</th></tr></thead>
              <tbody>
                <Row label="Locality score" a={loc.overall} b={other.overall} />
                {loc.infra.map((s, i) => <Row key={s.key} label={s.label} a={s.score} b={other.infra[i]!.score} />)}
                <Row label="AQI (lower is better)" a={loc.aqi} b={other.aqi} invert />
                {cats.map((c) => { const I = categoryIcon[c]; return (
                  <tr key={c} className="border-b border-line/60">
                    <td className="py-2.5"><span className="flex items-center gap-2"><I className="h-4 w-4 text-muted" aria-hidden="true" />Nearest {categoryMeta[c].label.toLowerCase()}</span></td>
                    <td className="py-2.5 tabular-nums">{nearest(loc, c)?.km ?? "–"} km</td>
                    <td className="py-2.5 tabular-nums">{nearest(other, c)?.km ?? "–"} km</td>
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">Demonstration data for both areas · {loc.updated}</p>
        </section>
      </div>
    </main>
  );
}

function Row({ label, a, b, invert }: { label: string; a: number; b: number; invert?: boolean }) {
  const aWins = invert ? a < b : a > b; const bWins = invert ? b < a : b > a;
  return (
    <tr className="border-b border-line/60">
      <td className="py-2.5">{label}</td>
      <td className={`py-2.5 tabular-nums ${aWins ? "font-semibold text-green" : ""}`}>{a}</td>
      <td className={`py-2.5 tabular-nums ${bWins ? "font-semibold text-green" : ""}`}>{b}</td>
    </tr>
  );
}

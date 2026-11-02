import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bus, Cross, Flame, House, Pill, ShieldCheck, ShoppingBasket, TrainFront, Minus, Plus, LocateFixed } from "lucide-react";
import { categoryMeta, type Locality, type Place, type PlaceCategory } from "@/lib/locality";

export const categoryIcon: Record<PlaceCategory, typeof Bus> = {
  hospital: Cross, police: ShieldCheck, fire: Flame, pharmacy: Pill, grocery: ShoppingBasket, metro: TrainFront, bus: Bus,
};
export const categoryTone: Record<PlaceCategory, string> = {
  hospital: "bg-red text-white", police: "bg-ink text-white", fire: "bg-amber text-white", pharmacy: "bg-green text-white",
  grocery: "bg-teal text-white", metro: "bg-ink-2 text-white", bus: "bg-teal-deep text-white",
};

export function CategoryFilter({ active, onToggle, counts }: { active: Set<PlaceCategory>; onToggle: (c: PlaceCategory | "all") => void; counts: Record<string, number> }) {
  const all = Object.keys(categoryMeta) as PlaceCategory[];
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter places">
      <button onClick={() => onToggle("all")} aria-pressed={active.size === all.length}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active.size === all.length ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink/30"}`}>All</button>
      {all.map((c) => {
        const I = categoryIcon[c]; const on = active.has(c);
        return (
          <button key={c} onClick={() => onToggle(c)} aria-pressed={on}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${on ? "border-teal bg-teal-soft text-teal-deep" : "border-line bg-white text-muted hover:border-ink/30"}`}>
            <I className="h-3.5 w-3.5" aria-hidden="true" />{categoryMeta[c].plural}<span className="tabular-nums opacity-70">{counts[c] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

export function useCategoryFilter() {
  const all = Object.keys(categoryMeta) as PlaceCategory[];
  const [active, setActive] = useState<Set<PlaceCategory>>(new Set(all));
  const toggle = (c: PlaceCategory | "all") => {
    if (c === "all") return setActive(new Set(all));
    setActive((prev) => {
      if (prev.size === all.length) return new Set([c]);
      const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c);
      return n.size ? n : new Set(all);
    });
  };
  return { active, toggle };
}

// Illustrated, interactive neighbourhood map. Positions are demo data, not survey coordinates.
export function LocalityMap({ loc, active, selected, onSelect, className = "" }: {
  loc: Locality; active: Set<PlaceCategory>; selected?: string | null; onSelect: (p: Place | null) => void; className?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const [rings, setRings] = useState(true);
  const visible = useMemo(() => loc.places.filter((p) => active.has(p.category)), [loc, active]);
  const sel = loc.places.find((p) => p.id === selected) ?? null;
  const metro = loc.places.find((p) => p.category === "metro");

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line bg-map ${className}`}>
      <motion.div className="absolute inset-0 origin-center" animate={{ scale: zoom }} transition={{ type: "spring", damping: 26, stiffness: 220 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* parks and lake */}
          <rect x="6" y="8" width="18" height="14" rx="3" fill="var(--color-park)" />
          <rect x="72" y="70" width="20" height="18" rx="4" fill="var(--color-park)" />
          <ellipse cx="80" cy="22" rx="12" ry="8" fill="var(--color-water)" />
          {/* blocks */}
          {Array.from({ length: 6 }).map((_, i) => Array.from({ length: 6 }).map((__, j) => (
            <rect key={`${i}-${j}`} x={4 + i * 16} y={4 + j * 16} width="12" height="12" rx="1.5" fill="var(--color-block)" opacity={(i * 7 + j * 3) % 5 === 0 ? 0 : 0.9} />
          )))}
          {/* roads */}
          {[18, 34, 50, 66, 82].map((v) => <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke="var(--color-road)" strokeWidth={v === 50 ? 2.6 : 1.4} />)}
          {[18, 34, 50, 66, 82].map((v) => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" stroke="var(--color-road)" strokeWidth={v === 34 ? 2.6 : 1.4} />)}
          <path d="M0 92 C 30 70, 60 96, 100 60" stroke="var(--color-arterial)" strokeWidth="3" fill="none" />
          {/* metro line */}
          {metro && <path d={`M -5 ${metro.y + 20} L ${metro.x} ${metro.y} L 105 ${metro.y - 18}`} stroke="var(--color-metro)" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="2 1.2" fill="none" />}
          {rings && [15, 30].map((r) => <ellipse key={r} cx="50" cy="50" rx={r} ry={r * 0.8} fill="none" stroke="var(--color-teal)" strokeOpacity="0.45" strokeWidth="0.35" strokeDasharray="1 1" />)}
        </svg>
        {rings && (
          <>
            <span className="absolute rounded bg-white/80 px-1 text-[10px] text-teal-deep" style={{ left: "65%", top: "49%" }}>~1 km</span>
            <span className="absolute rounded bg-white/80 px-1 text-[10px] text-teal-deep" style={{ left: "80%", top: "49%" }}>~2 km</span>
          </>
        )}
        {/* home */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: "50%" }}>
          <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-teal/30" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-teal text-white shadow-lg"><House className="h-4 w-4" aria-hidden="true" /></span>
        </div>
        <AnimatePresence>
          {visible.map((p) => {
            const I = categoryIcon[p.category]; const on = p.id === selected;
            return (
              <motion.button key={p.id} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: on ? 1.25 : 1 }} exit={{ opacity: 0, scale: 0.4 }}
                onClick={() => onSelect(on ? null : p)} aria-label={`${p.name}, ${p.km} km`}
                className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-md ${categoryTone[p.category]} ${on ? "z-10 ring-4 ring-ink/20" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <I className="h-3.5 w-3.5" aria-hidden="true" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <button onClick={() => setZoom((z) => Math.min(1.8, z + 0.2))} aria-label="Zoom in" className="p-2 hover:bg-paper"><Plus className="h-4 w-4" /></button>
        <button onClick={() => setZoom((z) => Math.max(1, z - 0.2))} aria-label="Zoom out" className="border-t border-line p-2 hover:bg-paper"><Minus className="h-4 w-4" /></button>
        <button onClick={() => { setZoom(1); onSelect(null); }} aria-label="Reset map" className="border-t border-line p-2 hover:bg-paper"><LocateFixed className="h-4 w-4" /></button>
      </div>
      <button onClick={() => setRings((v) => !v)} aria-pressed={rings} className="absolute left-3 top-3 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-2 shadow-sm hover:border-ink/30">
        {rings ? "Hide" : "Show"} distance rings
      </button>
      <span className="absolute bottom-2 left-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] text-muted">Demo map · positions approximate</span>

      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-9 right-3 w-64 rounded-xl border border-line bg-white p-3 shadow-lg">
            <PlaceRow p={sel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlaceRow({ p, onClick, active }: { p: Place; onClick?: () => void; active?: boolean }) {
  const I = categoryIcon[p.category];
  const body = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${categoryTone[p.category]}`}><I className="h-4 w-4" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
        <span className="block truncate text-xs text-muted">{p.detail} · {p.open}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-semibold tabular-nums text-ink">{p.km} km</span>
        <span className="block text-xs text-muted">{p.walkMin} min walk</span>
      </span>
    </>
  );
  if (!onClick) return <div className="flex items-center gap-3">{body}</div>;
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${active ? "border-teal bg-teal-soft/50" : "border-transparent hover:border-line hover:bg-paper"}`}>{body}</button>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const tone = score >= 70 ? "bg-green" : score >= 55 ? "bg-teal" : "bg-amber";
  return (
    <div className="h-1.5 w-full rounded-full bg-paper">
      <motion.div className={`h-1.5 rounded-full ${tone}`} initial={{ width: 0 }} whileInView={{ width: `${score}%` }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
    </div>
  );
}

export function DemoBadge({ text = "Demonstration data" }: { text?: string }) {
  return <span className="inline-flex items-center gap-1 rounded-md border border-amber/30 bg-amber-soft px-2 py-0.5 text-[11px] font-medium text-amber">{text}</span>;
}

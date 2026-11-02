
import { useState } from "react";
import { Check } from "lucide-react";
import { durations } from "@/lib/quiz";
import { demoProfile, listings } from "@/lib/data";
import { inr, priceFor, scoreListing } from "@/lib/match";
import { HomeVisual } from "./visuals";
import type { Duration } from "@/lib/types";

const l = listings[0];
const fit = scoreListing(demoProfile, l).score;

export function DurationDemo() {
  const [i, setI] = useState(1);
  const d = durations[i].value as Duration;
  const price = priceFor(l, d);
  const lease = d === "11m";
  const progress = [18, 40, 66, 100][i];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <HomeVisual listing={l} className="h-36" />
      <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{l.area}, Bengaluru</p>
          <p className="font-display text-lg font-semibold">{l.title}</p>
        </div>
        <span className="rounded-md bg-teal px-2 py-1 text-xs font-semibold text-white">{fit}% fit</span>
      </div>

      <label htmlFor="dur" className="mt-6 block text-sm font-medium text-ink-2">How long do you need it?</label>
      <input id="dur" type="range" min={0} max={3} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} className="mt-3 w-full" aria-valuetext={durations[i].label} />
      <div className="mt-1 grid grid-cols-4 text-xs text-muted">
        {durations.map((x, k) => (
          <button key={x.value} onClick={() => setI(k)} className={`text-left ${k === i ? "font-semibold text-ink" : ""} ${k === 3 ? "text-right" : k === 2 ? "text-center" : k === 1 ? "text-center" : ""}`}>{x.label}</button>
        ))}
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="font-display text-3xl font-semibold tabular-nums">{inr(price.total)}</p>
          <p className="text-sm text-muted">{price.unit} · {price.note}</p>
        </div>
      </div>

      <div className="mt-6" aria-hidden="true">
        <div className="relative h-2">
          <div className="absolute inset-y-[3px] left-0 right-0 border-t-2 border-dashed border-line" />
          <div className="absolute inset-y-[3px] left-0 border-t-2 border-teal transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>Trial stay</span><span className={lease ? "font-semibold text-teal" : ""}>Lease</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {["Move-in condition recorded room by room", "Agreement clauses explained in plain language", "Deposit ledger both sides can see"].map((t, k) => (
          <li key={t} className={`flex items-center gap-2 transition-colors ${lease || k === 0 ? "text-ink" : "text-muted/60"}`}>
            <Check className={`h-4 w-4 ${lease || k === 0 ? "text-green" : "text-line"}`} aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

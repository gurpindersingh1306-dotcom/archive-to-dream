
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Scene, type SceneKind } from "./scenes";
import type { Listing } from "@/lib/types";

function viewsFor(l: Listing): SceneKind[] {
  return l.kind === "PG room" || l.kind === "Room in a family home" ? ["bedroom", "living", "street"] : ["living", "bedroom", "street"];
}

export function photoCount(l: Listing) {
  return l.photos?.length ? l.photos.length : 3;
}

// Real photos when the host uploaded them, illustrated scenes otherwise.
export function HomeVisual({ listing, index = 0, className = "", label = true }: { listing: Listing; index?: number; className?: string; label?: boolean }) {
  const photo = listing.photos?.[index];
  return (
    <div className={`relative overflow-hidden bg-paper ${className}`}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={`${listing.title}, photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <Scene seed={`${listing.id}-${index}`} kind={viewsFor(listing)[index % 3]} className="h-full w-full" />
      )}
      {label && photo && !listing.byYou && <span className="absolute bottom-2 right-2 rounded-md bg-white/85 px-1.5 py-0.5 text-[11px] text-muted">Sample photo</span>}
      {label && !photo && <span className="absolute bottom-2 right-2 rounded-md bg-white/85 px-1.5 py-0.5 text-[11px] text-muted">Illustration</span>}
    </div>
  );
}

export function Gallery({ listing }: { listing: Listing }) {
  const [i, setI] = useState(0);
  const n = photoCount(listing);
  const go = (d: number) => setI((x) => (x + d + n) % n);
  return (
    <div>
      <div className="relative h-64 overflow-hidden rounded-2xl sm:h-96">
        <AnimatePresence initial={false}>
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <HomeVisual listing={listing} index={i} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>
        {n > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-3 flex gap-2">
          {Array.from({ length: n }).map((_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`} aria-current={k === i}
              className={`h-16 w-24 overflow-hidden rounded-lg border-2 transition ${k === i ? "border-teal" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <HomeVisual listing={listing} index={k} className="h-full w-full" label={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FitBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const color = score >= 0.65 ? "bg-green" : "bg-amber";
  return (
    <div className="h-1.5 w-full rounded-full bg-paper">
      <motion.div className={`h-1.5 rounded-full ${color}`} initial={{ width: 0 }} whileInView={{ width: `${Math.max(6, Math.round(score * 100))}%` }}
        viewport={{ once: true }} transition={{ duration: 0.7, delay, ease: "easeOut" }} />
    </div>
  );
}

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) { setV(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduce]);
  return <span className="tabular-nums">{v}{suffix}</span>;
}

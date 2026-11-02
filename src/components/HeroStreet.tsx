
import { motion, useReducedMotion } from "framer-motion";
import { hash } from "./scenes";

// One orchestrated moment: a Bengaluru street at dusk, windows lighting up one by one.
const buildings = [
  { x: 0, w: 130, h: 170, c: "#e3c3b0" },
  { x: 140, w: 150, h: 240, c: "#efdcc8" },
  { x: 300, w: 120, h: 190, c: "#d9c4cf" },
  { x: 430, w: 170, h: 270, c: "#e8cdb5" },
  { x: 610, w: 130, h: 200, c: "#cfd6d6" },
  { x: 750, w: 160, h: 250, c: "#efdcc8" },
  { x: 920, w: 120, h: 180, c: "#e3c3b0" },
  { x: 1050, w: 150, h: 230, c: "#d9c4cf" },
];
const GROUND = 330;
const fronds = [[-74, 26], [-60, -6], [-30, -30], [30, -30], [60, -6], [74, 26], [-44, 40], [44, 40]];

type Win = { x: number; y: number; lit: boolean; order: number };
const windows: Win[] = buildings.flatMap((b, bi) => {
  const cols = Math.floor((b.w - 20) / 34);
  const rows = Math.floor((b.h - 40) / 38);
  return Array.from({ length: rows * cols }, (_, k) => {
    const r = Math.floor(k / cols), c = k % cols;
    const n = hash(`${bi}-${r}-${c}`);
    return { x: b.x + 14 + c * 34, y: GROUND - b.h + 22 + r * 38, lit: n % 5 !== 0, order: n % 997 };
  });
});
const sorted = [...windows].sort((a, b) => a.order - b.order);
const delayOf = new Map(sorted.map((w, i) => [w, 0.5 + i * (2.2 / sorted.length)]));

export function HeroStreet() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" className="h-full w-full" role="img" aria-label="Illustration of a Bengaluru street at dusk with windows lighting up">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d5b9a" />
          <stop offset="0.75" stopColor="#f0a77c" />
        </linearGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#hero-sky)" />
      <motion.circle cx="690" r="48" fill="#f8b86c" initial={reduce ? { cy: 146 } : { cy: 110 }} animate={{ cy: 146 }} transition={{ duration: 3, ease: "easeOut" }} />
      {[30, 210, 380, 560, 700, 860, 1010, 1120].map((x, i) => (
        <rect key={x} x={x} y={150 - (i % 4) * 22} width="90" height="260" fill="#8a86b5" opacity="0.45" />
      ))}
      {buildings.map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} fill={b.c} />
          <rect x={b.x - 4} y={GROUND - b.h - 8} width={b.w + 8} height="9" fill="#c9b19e" />
        </g>
      ))}
      {windows.map((w, i) => (
        <g key={i}>
          <motion.rect x={w.x} y={w.y} width="20" height="22" rx="2"
            initial={{ fill: reduce && w.lit ? "#ffd38a" : "#4a4d72" }}
            animate={{ fill: w.lit ? "#ffd38a" : "#4a4d72" }}
            transition={{ delay: reduce ? 0 : delayOf.get(w), duration: 0.3 }} />
          <rect x={w.x - 3} y={w.y + 22} width="26" height="4" fill="#b8a08c" />
        </g>
      ))}
      <g fill="#2c2b4a">
        {[90, 520, 980].map((x) => (
          <g key={x}>
            <path d={`M${x} ${GROUND + 10} q8 -90 -4 -150 l7 0 q12 60 5 150z`} />
            {fronds.map(([dx, dy], i) => (
              <path key={i} d={`M${x + 2} ${GROUND - 140} q${dx * 0.5} ${dy - 34} ${dx} ${dy}`} fill="none" stroke="#2c2b4a" strokeWidth="9" strokeLinecap="round" />
            ))}
          </g>
        ))}
        {[300, 760, 1150].map((x) => (
          <g key={x}>
            <rect x={x - 5} y={GROUND - 70} width="10" height="80" />
            {[[-30, -80], [0, -100], [30, -82], [-15, -60], [18, -64]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={GROUND + dy} r="32" />)}
          </g>
        ))}
      </g>
      <rect y={GROUND} width="1200" height="14" fill="#c9b9a6" />
      <rect y={GROUND + 14} width="1200" height="60" fill="#3d4058" />
      {[60, 260, 460, 660, 860, 1060].map((x) => <rect key={x} x={x} y={GROUND + 40} width="80" height="5" fill="#d9d2c3" opacity="0.7" />)}
      {[200, 640, 1080].map((x) => (
        <g key={x}>
          <rect x={x} y={GROUND - 96} width="5" height="110" fill="#2c2b4a" />
          <rect x={x - 12} y={GROUND - 100} width="28" height="6" rx="3" fill="#2c2b4a" />
          <motion.circle cx={x + 2} cy={GROUND - 82} r="38" fill="#ffd98a" initial={{ opacity: reduce ? 0.35 : 0 }} animate={{ opacity: 0.35 }} transition={{ delay: reduce ? 0 : 1.4, duration: 1 }} />
        </g>
      ))}
    </svg>
  );
}

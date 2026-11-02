
import { useId } from "react";

// Illustrated stand-ins for photos. Each listing gets its own wall colour, furniture colour and time of day.

export type SceneKind = "living" | "bedroom" | "street";
type Time = "morning" | "day" | "dusk" | "night";

const walls = ["#efe6da", "#e3ebe5", "#e9e5ef", "#f2e2da", "#e1e8f0", "#ece6d4"];
const floors = ["#c69c74", "#b58c64", "#d3b38e", "#a6825f"];
const accents = ["#2f5d62", "#c0703f", "#5b6c8f", "#7f8f52", "#b5545c", "#3d4f7a"];
const times: Time[] = ["morning", "day", "dusk", "night"];
const sky: Record<Time, [string, string, string]> = {
  morning: ["#bcd7ea", "#f6d7b6", "#f7c873"],
  day: ["#9ccbe8", "#e3f1f8", "#fff2c2"],
  dusk: ["#6f6aa6", "#f2a679", "#f6b26b"],
  night: ["#1d2747", "#3c4a78", "#f3ecd2"],
};

export function hash(s: string) {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619);
  // Final avalanche so small palettes use well-mixed bits.
  x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return x >>> 0;
}

export function Scene({ seed, kind, className = "" }: { seed: string; kind: SceneKind; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const pick = <T,>(salt: string, arr: T[]) => arr[hash(seed + salt) % arr.length];
  const accent = pick("accent", accents);
  const p = {
    wall: pick("wall", walls),
    floor: pick("floor", floors),
    accent,
    accent2: pick("accent2", accents.filter((a) => a !== accent)),
    time: pick("time", times),
    palm: pick("palm", [true, false]),
    decor: pick("decor", ["art", "shelf", "mirror"] as const),
    seed,
    uid,
  };
  const flip = kind !== "street" && pick("flip", [true, false]);
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={`Illustration of a ${kind === "street" ? "street outside the home" : kind}`}>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[p.time][0]} />
          <stop offset="1" stopColor={sky[p.time][1]} />
        </linearGradient>
      </defs>
      <g transform={flip ? "translate(640 0) scale(-1 1)" : undefined}>
        {kind === "living" && <Living {...p} />}
        {kind === "bedroom" && <Bedroom {...p} />}
        {kind === "street" && <Street {...p} />}
      </g>
    </svg>
  );
}

type P = { wall: string; floor: string; accent: string; accent2: string; time: Time; palm: boolean; decor: "art" | "shelf" | "mirror"; seed: string; uid: string };

function WindowView({ x, y, w, h, p }: { x: number; y: number; w: number; h: number; p: P }) {
  const night = p.time === "night";
  return (
    <g>
      <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} rx="4" fill="#f8f5ef" />
      <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect width={w} height={h} fill={`url(#sky-${p.uid})`} />
        <circle cx={w * 0.72} cy={h * (p.time === "day" ? 0.25 : 0.45)} r={night ? 12 : 16} fill={sky[p.time][2]} />
        {[0.05, 0.22, 0.38, 0.55, 0.7, 0.86].map((bx, i) => (
          <rect key={i} x={w * bx} y={h * (0.62 - (i % 3) * 0.08)} width={w * 0.14} height={h} fill={night ? "#2a3459" : "#9aa7b8"} opacity={0.55 + (i % 2) * 0.2} />
        ))}
        {night && [0.1, 0.27, 0.43, 0.6, 0.76].map((wx, i) => <rect key={i} x={w * wx} y={h * 0.72} width="4" height="5" fill="#ffd38a" />)}
        {p.palm && (
          <g fill={night ? "#121a33" : "#3f6b48"}>
            <path d={`M${w * 0.18} ${h} q6 ${-h * 0.35} -2 ${-h * 0.55} l5 0 q8 ${h * 0.2} 3 ${h * 0.55}z`} />
            {[[-30, 10], [-24, -8], [-10, -18], [10, -18], [24, -8], [30, 10]].map(([dx, dy], i) => (
              <path key={i} d={`M${w * 0.18} ${h * 0.45} q${dx * 0.5} ${dy - 14} ${dx} ${dy}`} fill="none" stroke={night ? "#121a33" : "#3f6b48"} strokeWidth="5" strokeLinecap="round" />
            ))}
          </g>
        )}
      </svg>
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#f8f5ef" strokeWidth="6" />
      <line x1={x} y1={y + h * 0.42} x2={x + w} y2={y + h * 0.42} stroke="#f8f5ef" strokeWidth="6" />
      <rect x={x - 14} y={y + h + 6} width={w + 28} height="8" rx="2" fill="#e8e1d5" />
    </g>
  );
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-55, -25, 0, 25, 55, -80, 80].map((a, i) => (
        <ellipse key={a} cx="0" cy="-40" rx="11" ry="34" fill={i % 2 ? "#4d7a4a" : "#5f8f5a"} transform={`rotate(${a} 0 0)`} />
      ))}
      <path d="M-22 -4 h44 l-6 40 h-32z" fill="#c9785a" />
      <rect x="-24" y="-8" width="48" height="8" rx="2" fill="#b5664a" />
    </g>
  );
}

function Lamp({ x, p }: { x: number; p: P }) {
  const glow = p.time === "night" || p.time === "dusk";
  return (
    <g>
      <line x1={x} y1="0" x2={x} y2="110" stroke="#4a4a4a" strokeWidth="2" />
      {glow && <circle cx={x} cy="135" r="60" fill="#ffd98a" opacity="0.28" />}
      <path d={`M${x - 26} 140 Q${x} 92 ${x + 26} 140 Z`} fill="#2b2b2b" />
      <ellipse cx={x} cy="140" rx="26" ry="4" fill={glow ? "#ffe2a3" : "#3a3a3a"} />
    </g>
  );
}

function Room({ p, children }: { p: P; children: React.ReactNode }) {
  return (
    <>
      <rect width="640" height="300" fill={p.wall} />
      <rect y="300" width="640" height="100" fill={p.floor} />
      {[318, 340, 366].map((y) => <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="#000" strokeOpacity="0.07" />)}
      <rect y="294" width="640" height="7" fill="#000" opacity="0.06" />
      {children}
      {p.time === "night" && <rect width="640" height="400" fill="#1d2747" opacity="0.16" />}
    </>
  );
}

function Living(p: P) {
  return (
    <Room p={p}>
      <rect x="40" y="30" width="26" height="240" rx="4" fill={p.accent2} opacity="0.35" />
      <rect x="254" y="30" width="26" height="240" rx="4" fill={p.accent2} opacity="0.35" />
      <WindowView x={70} y={52} w={180} h={186} p={p} />
      <Plant x={300} y={300} s={0.95} />
      {p.decor === "art" && (
        <g>
          <rect x="392" y="74" width="124" height="92" rx="3" fill="#fbf8f2" stroke="#3b3b3b" strokeOpacity="0.25" />
          <circle cx="432" cy="118" r="22" fill={p.accent2} opacity="0.85" />
          <path d="M440 150 Q470 96 500 150" fill="none" stroke={p.accent} strokeWidth="6" />
        </g>
      )}
      {p.decor === "shelf" && (
        <g>
          {[110, 160].map((y) => <rect key={y} x="380" y={y} width="150" height="7" rx="2" fill="#8b6a4f" />)}
          {[388, 402, 414, 430, 444].map((x, i) => <rect key={x} x={x} y={80 + (i % 2) * 4} width="11" height={30 - (i % 2) * 4} fill={[p.accent, "#e0c9a6", p.accent2][i % 3]} />)}
          <Plant x={500} y={110} s={0.32} />
          <rect x="392" y="140" width="34" height="20" rx="3" fill="#f3e6cf" />
          {[450, 464, 478].map((x, i) => <rect key={x} x={x} y={132 + i * 2} width="11" height={28 - i * 2} fill={[p.accent2, p.accent, "#d9c3a0"][i]} />)}
        </g>
      )}
      {p.decor === "mirror" && (
        <g>
          <ellipse cx="455" cy="118" rx="44" ry="58" fill="#f6f3ee" stroke="#c9a46a" strokeWidth="5" />
          <path d="M430 95 q10 -18 26 -22" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </g>
      )}
      <Lamp x={585} p={p} />
      <ellipse cx="460" cy="350" rx="175" ry="26" fill={p.accent2} opacity="0.25" />
      <g>
        <rect x="335" y="198" width="250" height="70" rx="18" fill={p.accent} />
        <rect x="325" y="240" width="270" height="52" rx="14" fill={p.accent} />
        <rect x="350" y="232" width="110" height="30" rx="10" fill="#fff" opacity="0.18" />
        <rect x="465" y="232" width="110" height="30" rx="10" fill="#fff" opacity="0.18" />
        <rect x="372" y="208" width="48" height="34" rx="9" fill="#f3e6cf" transform="rotate(-8 396 225)" />
        <rect x="340" y="292" width="8" height="14" fill="#3a2e25" />
        <rect x="572" y="292" width="8" height="14" fill="#3a2e25" />
      </g>
      <ellipse cx="455" cy="330" rx="56" ry="10" fill="#6b4f3a" />
      <rect x="430" y="314" width="22" height="14" rx="3" fill="#f2efe8" />
    </Room>
  );
}

function Bedroom(p: P) {
  return (
    <Room p={p}>
      <WindowView x={420} y={56} w={160} h={170} p={p} />
      <rect x="400" y="34" width="22" height="236" rx="4" fill={p.accent2} opacity="0.3" />
      <rect x="578" y="34" width="22" height="236" rx="4" fill={p.accent2} opacity="0.3" />
      <rect x="60" y="80" width="150" height="10" rx="2" fill="#8b6a4f" />
      {[70, 86, 100, 118, 134, 150].map((x, i) => <rect key={x} x={x} y={46 + (i % 3) * 4} width="12" height={34 - (i % 3) * 4} fill={[p.accent, "#e0c9a6", p.accent2][i % 3]} />)}
      <Plant x={175} y={78} s={0.45} />
      <rect x="60" y="160" width="300" height="110" rx="14" fill="#8b6a4f" />
      <rect x="50" y="240" width="320" height="56" rx="10" fill="#f4efe6" />
      <path d="M50 252 h320 v34 a10 10 0 0 1 -10 10 h-300 a10 10 0 0 1 -10 -10z" fill={p.accent} />
      <rect x="80" y="214" width="110" height="36" rx="12" fill="#fbf8f2" />
      <rect x="210" y="214" width="110" height="36" rx="12" fill="#fbf8f2" />
      <rect x="380" y="240" width="56" height="56" rx="6" fill="#a37f5f" />
      <path d="M392 240 l8 -40 h16 l8 40z" fill="#efe1c3" />
      {(p.time === "night" || p.time === "dusk") && <circle cx="408" cy="215" r="44" fill="#ffd98a" opacity="0.25" />}
      <ellipse cx="210" cy="355" rx="150" ry="20" fill={p.accent2} opacity="0.2" />
      <Plant x={600} y={300} s={0.8} />
    </Room>
  );
}

function Street(p: P) {
  const night = p.time === "night" || p.time === "dusk";
  const buildings = [
    { x: 20, w: 170, h: 220, c: "#e9d8c4" },
    { x: 200, w: 210, h: 270, c: "#f1ece3" },
    { x: 420, w: 200, h: 200, c: "#d9e2dc" },
  ];
  return (
    <>
      <rect width="640" height="400" fill={`url(#sky-${p.uid})`} />
      <circle cx="520" cy={p.time === "day" ? 70 : 120} r="26" fill={sky[p.time][2]} />
      {[40, 150, 300, 470, 560].map((x, i) => <rect key={x} x={x} y={150 - (i % 3) * 30} width="70" height="200" fill={night ? "#3a4570" : "#b8c4d3"} opacity="0.5" />)}
      {buildings.map((b, bi) => (
        <g key={b.x}>
          <rect x={b.x} y={330 - b.h} width={b.w} height={b.h} fill={b.c} />
          <rect x={b.x - 6} y={330 - b.h - 10} width={b.w + 12} height="12" fill="#cbbba8" />
          {Array.from({ length: Math.floor((b.h - 40) / 46) }).map((_, r) =>
            Array.from({ length: Math.floor(b.w / 52) }).map((_, c) => {
              const lit = night && hash(`${p.seed}-${bi}-${r}-${c}`) % 3 !== 0;
              const wx = b.x + 16 + c * 52, wy = 330 - b.h + 24 + r * 46;
              return (
                <g key={`${r}-${c}`}>
                  <rect x={wx} y={wy} width="30" height="26" rx="2" fill={lit ? "#ffd38a" : night ? "#2e3a5e" : "#a9c3d6"} />
                  <rect x={wx - 4} y={wy + 26} width="38" height="5" fill="#bfae98" />
                  {(r + c + bi) % 4 === 0 && <rect x={wx + 2} y={wy + 20} width="26" height="6" fill="#5f8f5a" />}
                </g>
              );
            }),
          )}
        </g>
      ))}
      <g>
        <rect x="128" y="250" width="10" height="90" fill="#5b4334" />
        {[[110, 240], [140, 225], [165, 245], [125, 215], [150, 260]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="30" fill={p.palm ? ["#e2683c", "#d4553a", "#ec8046"][i % 3] : ["#4f7d4a", "#5f8f5a", "#3f6b48"][i % 3]} />
        ))}
      </g>
      <rect y="322" width="640" height="18" fill="#d8cdbd" />
      <rect y="340" width="640" height="60" fill="#4b4f57" />
      {[40, 160, 280, 400, 520].map((x) => <rect key={x} x={x} y="368" width="60" height="5" fill="#e9e3d6" />)}
      <rect x="626" y="236" width="5" height="104" fill="#3a3a3a" />
      <rect x="604" y="232" width="28" height="6" rx="3" fill="#3a3a3a" />
      {night && <circle cx="610" cy="250" r="34" fill="#ffd98a" opacity="0.3" />}
    </>
  );
}

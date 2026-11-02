import type { Habits, Listing, Profile } from "./types";

export type FitKey = "rhythm" | "cleanliness" | "guests" | "noise" | "kitchen" | "smoking" | "pets" | "sharing";
export interface FitPart { key: FitKey; label: string; score: number; note: string }
export interface MatchResult { listing: Listing; score: number; parts: FitPart[]; reason: string }

const order = {
  wake: ["early", "mid", "late"],
  sleep: ["before11", "11to1", "after1"],
  dishes: ["now", "beforebed", "later"],
  guests: ["rarely", "sometimes", "often"],
  noise: ["quiet", "some", "lively"],
  sharing: ["all", "basics", "separate"],
} as const;

export const fitLabels: Record<FitKey, string> = {
  rhythm: "Daily rhythm", cleanliness: "Dishes and cleaning", guests: "Guests", noise: "Noise",
  kitchen: "Kitchen", smoking: "Smoking and drinking", pets: "Pets", sharing: "Groceries and bills",
};
const weights: Record<FitKey, number> = { rhythm: 25, cleanliness: 18, guests: 12, noise: 12, kitchen: 10, smoking: 10, pets: 7, sharing: 6 };
const keys = Object.keys(weights) as FitKey[];

// 1 = same answer, falls off with distance along the scale. Unanswered counts as neutral.
function closeness<K extends keyof typeof order>(key: K, a?: string, b?: string) {
  if (!a || !b) return 0.75;
  const scale = order[key] as readonly string[];
  return Math.max(0, 1 - Math.abs(scale.indexOf(a) - scale.indexOf(b)) / (scale.length - 1));
}
const avg = (n: number[]) => (n.length ? n.reduce((s, x) => s + x, 0) / n.length : 1);

function workFit(a?: string, b?: string) {
  if (!a || !b) return 0.75;
  if (a === b) return 1;
  if (a === "night" || b === "night") return 0.2;
  return 0.8;
}

const foodTable: Record<string, Record<string, number>> = {
  veg: { veg: 1, egg: 0.55, nonveg: 0.1, any: 0.4 },
  egg: { veg: 0.5, egg: 1, nonveg: 0.4, any: 0.6 },
  nonveg: { veg: 0.1, egg: 0.3, nonveg: 1, any: 1 },
  any: { veg: 0.8, egg: 0.9, nonveg: 1, any: 1 },
};

function smokeFit(h: Habits, l: Listing) {
  const smokers = l.flatmates.some((f) => f.habits.smoke === "smokes");
  const drinkers = l.flatmates.some((f) => f.habits.smoke === "drinks");
  switch (h.smoke) {
    case "none": return smokers ? 0.3 : drinkers ? 0.8 : 1;
    case "drinks": return l.rules.drinking ? 1 : 0.3;
    case "smokes": return l.rules.smoking === "no" ? 0.15 : 1;
    default: return 0.75;
  }
}

function petsFit(h: Habits, l: Listing) {
  if (h.pets === "has") return l.rules.pets ? 1 : 0;
  if (h.pets === "none") return l.flatmates.some((f) => f.habits.pets === "has") ? 0.2 : 1;
  return 1;
}

const verdict = (s: number) => (s >= 0.85 ? "Great" : s >= 0.65 ? "Good" : s >= 0.45 ? "Some differences" : "Differs");

export function scoreListing(p: Profile, l: Listing): MatchResult {
  const h = p.habits;
  const f = l.flatmates.map((x) => x.habits);
  const solo = f.length === 0;
  const userGuestLevel = h.guests ? order.guests.indexOf(h.guests) : -1;

  const raw: Record<FitKey, number> = {
    rhythm: solo ? 1 : avg(f.map((x) => (closeness("wake", h.wake, x.wake) + closeness("sleep", h.sleep, x.sleep) + workFit(h.work, x.work)) / 3)),
    cleanliness: solo ? 1 : avg(f.map((x) => closeness("dishes", h.dishes, x.dishes))),
    guests: solo
      ? (userGuestLevel <= order.guests.indexOf(l.rules.guests) ? 1 : 0.4)
      : avg(f.map((x) => closeness("guests", h.guests, x.guests))),
    noise: solo ? 0.95 : avg(f.map((x) => closeness("noise", h.noise, x.noise))),
    kitchen: solo ? 1 : (foodTable[h.food ?? "any"]?.[l.rules.food] ?? 0.75),
    smoking: smokeFit(h, l),
    pets: petsFit(h, l),
    sharing: solo ? 1 : avg(f.map((x) => closeness("sharing", h.sharing, x.sharing))),
  };

  let total = keys.reduce((s, k) => s + raw[k] * weights[k], 0);
  if (l.monthly > p.budget) total -= Math.min(15, ((l.monthly - p.budget) / p.budget) * 60);
  if (p.area !== "Anywhere" && l.area === p.area) total += 4;

  const soloNote: Partial<Record<FitKey, string>> = { rhythm: "Your own schedule", cleanliness: "Your own space", sharing: "Your own bills", kitchen: "Your own kitchen" };
  const parts: FitPart[] = keys.map((k) => ({ key: k, label: fitLabels[k], score: raw[k], note: solo && soloNote[k] ? soloNote[k]! : verdict(raw[k]) }));

  return { listing: l, score: Math.max(0, Math.min(99, Math.round(total))), parts, reason: buildReason(p, l, raw) };
}

function buildReason(p: Profile, l: Listing, raw: Record<FitKey, number>) {
  const h = p.habits;
  if (!l.flatmates.length) {
    const bits = [raw.guests === 1 ? "the guest rules suit you" : "the guest rules are stricter than you're used to"];
    if (h.pets === "has" && l.rules.pets) bits.push("your pet is welcome");
    return `Your own space, and ${bits.join(" and ")}.`;
  }
  const one = l.flatmates.length === 1 && !l.flatmates[0].name.includes(" and ");
  const who = l.flatmates.length === 1 ? l.flatmates[0].name : l.flatmates.length === 2 ? "Both flatmates" : "Your flatmates";
  // [plural, singular]
  const phrase: Partial<Record<FitKey, [string, string]>> = {
    rhythm: h.sleep === "before11" ? ["sleep early", "sleeps early"] : h.wake === "early" ? ["are up early", "is up early"] : ["keep similar hours", "keeps similar hours"],
    cleanliness: h.dishes === "now" ? ["do dishes right away", "does dishes right away"] : h.dishes === "beforebed" ? ["clear the sink before bed", "clears the sink before bed"] : ["are relaxed about dishes", "is relaxed about dishes"],
    guests: h.guests === "often" ? ["love having friends over", "loves having friends over"] : h.guests === "rarely" ? ["rarely have people over", "rarely has people over"] : ["have guests now and then", "has guests now and then"],
    noise: h.noise === "quiet" ? ["keep the flat quiet", "keeps the flat quiet"] : h.noise === "lively" ? ["like a lively home", "likes a lively home"] : ["are fine with some noise", "is fine with some noise"],
    sharing: h.sharing === "all" ? ["split everything", "splits everything"] : h.sharing === "separate" ? ["keep groceries separate", "keeps groceries separate"] : ["split just the basics", "splits just the basics"],
  };
  const strong = keys.filter((k) => phrase[k] && raw[k] >= 0.8);
  const say = (k: FitKey) => phrase[k]![one ? 1 : 0];
  const caveats: Record<FitKey, string> = {
    rhythm: "Your daily rhythms differ", cleanliness: "You differ on dishes", guests: "You differ on guests", noise: "You differ on noise",
    kitchen: "The kitchen rules may not suit you", smoking: "Smoking or drinking may be an issue", pets: "Pets may be an issue", sharing: "You split bills differently",
  };
  const weakest = [...keys].sort((a, b) => raw[a] - raw[b])[0];
  const caveat = raw[weakest] < 0.45 ? ` ${caveats[weakest]}, so worth asking.` : "";
  if (strong.length >= 2) return `${who} ${say(strong[0])} and ${say(strong[1])}, like you.${caveat}`;
  if (strong.length === 1) return `${who} ${say(strong[0])}, like you.${caveat || " A few habits differ."}`;
  return caveat ? `Your habits differ from this household in a few ways.${caveat}` : "A decent overall fit, though no single habit lines up closely. Worth a chat before you book.";
}

function householdAllowed(p: Profile, l: Listing) {
  if (l.householdType === "mixed") return p.householdPref !== "single";
  if (p.householdPref === "mixed") return false;
  return (l.householdType === "women" && p.gender === "woman") || (l.householdType === "men" && p.gender === "man");
}

export function rankListings(p: Profile, all: Listing[]) {
  return all
    .filter((l) => (p.living === "alone" ? l.flatmates.length === 0 : p.living === "flatmates" ? l.flatmates.length > 0 : true))
    .filter((l) => householdAllowed(p, l))
    .filter((l) => !(p.habits.pets === "has" && !l.rules.pets))
    .filter((l) => l.monthly <= p.budget * 1.35)
    .map((l) => scoreListing(p, l))
    .sort((a, b) => b.score - a.score);
}

export function priceFor(l: Listing, d: Profile["duration"]) {
  switch (d) {
    case "1w": return { total: l.weekly, unit: "for 1 week", note: "Trial stay" };
    case "1m": return { total: Math.round((l.monthly * 1.1) / 100) * 100, unit: "for 1 month", note: "Trial stay, includes a 10% short-stay rate" };
    case "3m": return { total: l.monthly * 3, unit: "for 3 months", note: "Short let at the monthly rate" };
    case "11m": return { total: l.monthly, unit: "per month", note: "Long-term lease" };
  }
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

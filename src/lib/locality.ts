// Locality intelligence. ALL VALUES ARE DEMONSTRATION DATA: places, distances and
// scores are generated deterministically per area so the demo is stable. They are
// not live readings from any public source.

export type PlaceCategory = "hospital" | "police" | "fire" | "pharmacy" | "grocery" | "metro" | "bus";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  x: number; // 0-100 map coordinates, home is at 50,50
  y: number;
  km: number;
  walkMin: number;
  detail: string;
  open: string;
}

export interface InfraScore {
  key: "roads" | "drainage" | "lighting" | "waterlogging" | "air" | "green" | "noise";
  label: string;
  score: number; // 0-100, higher is better
  note: string;
}

export interface Locality {
  area: string;
  tagline: string;
  overall: number;
  places: Place[];
  infra: InfraScore[];
  aqi: number;
  monsoonNote: string;
  source: string;
  updated: string;
}

export const categoryMeta: Record<PlaceCategory, { label: string; plural: string }> = {
  hospital: { label: "Hospital", plural: "Hospitals" },
  police: { label: "Police station", plural: "Police" },
  fire: { label: "Fire station", plural: "Fire stations" },
  pharmacy: { label: "Pharmacy", plural: "Pharmacies" },
  grocery: { label: "Grocery", plural: "Groceries" },
  metro: { label: "Metro station", plural: "Metro" },
  bus: { label: "Bus stop", plural: "Bus stops" },
};

export const localityAreas = [
  "HSR Layout", "Koramangala", "Indiranagar", "BTM Layout", "Bellandur", "Whitefield", "Marathahalli", "JP Nagar",
  "Electronic City", "Jayanagar", "Malleshwaram", "Frazer Town", "Sarjapur Road", "Hebbal",
];

const taglines: Record<string, string> = {
  "HSR Layout": "Planned sectors, cafés and quick access to Outer Ring Road",
  Koramangala: "Busy, central and full of food, startups and nightlife",
  Indiranagar: "Leafy streets, metro access and a lively 12th Main",
  "BTM Layout": "Affordable, dense and well served by buses",
  Bellandur: "Close to tech parks, watch the lake-side monsoon roads",
  Whitefield: "Tech corridor with new metro, longer city commutes",
  "JP Nagar": "Residential calm with parks and metro on the Green Line",
  Jayanagar: "Old Bengaluru, tree cover and great markets",
  Malleshwaram: "Heritage homes, temples and morning flower markets",
  Hebbal: "Lake views, airport road and flyover traffic",
};

const names: Record<PlaceCategory, string[]> = {
  hospital: ["Narayana Clinic & Hospital", "Sakra Multispeciality", "Cloudnine Care", "St. Martha's Hospital", "Manipal Clinic"],
  police: ["Police Station (Law & Order)", "Traffic Police Station", "Women's Help Desk Outpost"],
  fire: ["Karnataka Fire & Emergency Station"],
  pharmacy: ["Apollo Pharmacy", "MedPlus", "Wellness Forever", "Jan Aushadhi Kendra"],
  grocery: ["Namdhari's Fresh", "More Supermarket", "Local Kirana Store", "Nilgiris", "Sunday Vegetable Market"],
  metro: ["Metro Station"],
  bus: ["BMTC Bus Stop", "BMTC Depot", "Bus Shelter (Main Road)"],
};
const counts: Record<PlaceCategory, number> = { hospital: 3, police: 2, fire: 1, pharmacy: 4, grocery: 4, metro: 1, bus: 3 };
const openHours: Record<PlaceCategory, string> = {
  hospital: "Open 24 hours · Emergency", police: "Open 24 hours", fire: "Open 24 hours · Dial 101", pharmacy: "8 am – 11 pm",
  grocery: "7 am – 10 pm", metro: "5 am – 11 pm · every 6 min", bus: "Routes 500D, 201R, 335E",
};

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, Locality>();

export function getLocality(area: string): Locality {
  const hit = cache.get(area);
  if (hit) return hit;
  const r = seeded(area);
  const places: Place[] = [];
  (Object.keys(counts) as PlaceCategory[]).forEach((cat) => {
    for (let i = 0; i < counts[cat]; i++) {
      const angle = r() * Math.PI * 2;
      const dist = cat === "metro" ? 18 + r() * 22 : 8 + r() * 36;
      const x = Math.round((50 + Math.cos(angle) * dist) * 10) / 10;
      const y = Math.round((50 + Math.sin(angle) * dist * 0.8) * 10) / 10;
      const km = Math.round(dist * 0.06 * 10) / 10 || 0.2;
      const base = names[cat][i % names[cat].length];
      const name = cat === "metro" ? `${area.split(" ")[0]} ${base}` : cat === "police" || cat === "fire" ? `${area} ${base}` : base;
      places.push({
        id: `${cat}-${i}`, name, category: cat, x, y, km, walkMin: Math.max(2, Math.round(km * 13)),
        detail: cat === "hospital" ? (i === 0 ? "Multispeciality · 120 beds · ICU" : "Clinic · OPD and diagnostics") : cat === "grocery" && i === 0 ? "Fresh produce, delivery in 20 min" : categoryMeta[cat].label,
        open: openHours[cat],
      });
    }
  });
  const sc = (lo: number, hi: number) => Math.round(lo + r() * (hi - lo));
  const infra: InfraScore[] = [
    { key: "roads", label: "Road condition", score: sc(55, 90), note: "Internal roads mostly tarred, a few potholed stretches" },
    { key: "drainage", label: "Drainage", score: sc(45, 85), note: "Covered storm drains on main roads" },
    { key: "lighting", label: "Street lighting", score: sc(60, 95), note: "LED streetlights, a couple of dark lanes" },
    { key: "waterlogging", label: "Waterlogging risk", score: sc(35, 85), note: "Low-lying junctions flood after heavy rain" },
    { key: "air", label: "Air quality", score: sc(50, 80), note: "Moderate, worse near the main road" },
    { key: "green", label: "Green cover", score: sc(40, 90), note: "Tree-lined residential lanes and a park nearby" },
    { key: "noise", label: "Quietness", score: sc(40, 85), note: "Quiet inside lanes, traffic noise at peak hours" },
  ];
  const overall = Math.round(infra.reduce((a, b) => a + b.score, 0) / infra.length);
  const loc: Locality = {
    area,
    tagline: taglines[area] ?? "Residential neighbourhood in Bengaluru",
    overall,
    places: places.sort((a, b) => a.km - b.km),
    infra,
    aqi: sc(55, 120),
    monsoonNote: infra[3]!.score < 55 ? "Expect slow traffic and puddled lanes for a few hours after heavy rain." : "Usually drains within an hour after heavy rain.",
    source: "Demo data modelled on public civic, transit and pollution datasets",
    updated: "Updated 28 Oct 2026",
  };
  cache.set(area, loc);
  return loc;
}

export function nearest(loc: Locality, cat: PlaceCategory) {
  return loc.places.find((p) => p.category === cat);
}

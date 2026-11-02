export type Duration = "1w" | "1m" | "3m" | "11m";
export type Work = "office" | "hybrid" | "wfh" | "night" | "student";
export type Wake = "early" | "mid" | "late";
export type Sleep = "before11" | "11to1" | "after1";
export type Dishes = "now" | "beforebed" | "later";
export type Guests = "rarely" | "sometimes" | "often";
export type Noise = "quiet" | "some" | "lively";
export type Food = "veg" | "egg" | "nonveg" | "any";
export type Smoke = "none" | "drinks" | "smokes";
export type Pets = "has" | "loves" | "none";
export type Sharing = "all" | "basics" | "separate";
export type Living = "alone" | "flatmates" | "either";
export type Gender = "woman" | "man" | "unspecified";
export type HouseholdPref = "single" | "mixed" | "either";
export type HouseholdType = "women" | "men" | "mixed";

export interface Habits {
  work?: Work;
  wake?: Wake;
  sleep?: Sleep;
  dishes?: Dishes;
  guests?: Guests;
  noise?: Noise;
  food?: Food;
  smoke?: Smoke;
  pets?: Pets;
  sharing?: Sharing;
}

export interface Profile {
  name: string;
  duration: Duration;
  area: string;
  budget: number;
  living: Living;
  gender: Gender;
  householdPref: HouseholdPref;
  habits: Habits;
}

export interface Flatmate {
  name: string;
  age: number;
  work: string;
  habits: Required<Habits>;
}

export interface LivedInReport {
  icon: "water" | "power" | "noise" | "safety" | "commute";
  label: string;
  tone: "good" | "mixed";
}

export interface HouseRules {
  guests: Guests;
  quietAfter: string;
  food: Food;
  smoking: "no" | "balcony";
  drinking: boolean;
  pets: boolean;
  other: string[];
}

export interface Listing {
  id: string;
  title: string;
  area: string;
  kind: "Shared flat" | "Studio" | "1BHK" | "PG room" | "Room in a family home";
  householdType: HouseholdType;
  weekly: number;
  monthly: number;
  deposit: number;
  minStay: Duration;
  commuteMin: number;
  commuteTo: string;
  trialToLease: boolean;
  host: string;
  hostSince: number;
  blurb: string;
  photos?: string[];
  flatmates: Flatmate[];
  rules: HouseRules;
  shared: string[];
  reports: LivedInReport[];
  reportCount: number;
  trust: { idVerified: boolean; ownershipDocs: "owner-submitted" | "not-provided"; inspected: boolean };
  answers: Record<string, string>;
  byYou?: boolean;
  hostId?: string;
  terms?: string;
  status?: "live" | "paused";
}

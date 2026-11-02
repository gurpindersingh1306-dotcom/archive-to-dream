import type { Habits } from "./types";

export interface QuizOption { value: string; label: string; icon: string }
export interface QuizRow { key: keyof Habits; label?: string; options: QuizOption[] }
export interface QuizQuestion { id: string; question: string; hint: string; rows: QuizRow[] }

// Grounded questions: ask about things people actually do, not how they see themselves.
export const quiz: QuizQuestion[] = [
  {
    id: "work",
    question: "What does a normal weekday look like for you?",
    hint: "Tells us who's home during the day.",
    rows: [{ key: "work", options: [
      { value: "office", label: "At the office most days", icon: "Building2" },
      { value: "hybrid", label: "Hybrid, home two or three days", icon: "Laptop" },
      { value: "wfh", label: "Working from home full time", icon: "House" },
      { value: "night", label: "Night shifts", icon: "Moon" },
      { value: "student", label: "College classes or internship", icon: "GraduationCap" },
    ] }],
  },
  {
    id: "rhythm",
    question: "On a weekday, you're usually...",
    hint: "Pick one in each row. Clocks that clash cause the most friction.",
    rows: [
      { key: "wake", label: "Up by", options: [
        { value: "early", label: "Before 7 am", icon: "Sunrise" },
        { value: "mid", label: "7 to 9 am", icon: "Sun" },
        { value: "late", label: "After 9 am", icon: "Coffee" },
      ] },
      { key: "sleep", label: "Lights out", options: [
        { value: "before11", label: "Before 11 pm", icon: "BedDouble" },
        { value: "11to1", label: "11 pm to 1 am", icon: "Clock" },
        { value: "after1", label: "After 1 am", icon: "MoonStar" },
      ] },
    ],
  },
  {
    id: "dishes",
    question: "You cooked dinner. When do the dishes get done?",
    hint: "The single best predictor of kitchen peace.",
    rows: [{ key: "dishes", options: [
      { value: "now", label: "Right after eating", icon: "Sparkles" },
      { value: "beforebed", label: "Sometime before bed", icon: "Clock" },
      { value: "later", label: "Next day, or when the sink is full", icon: "Hourglass" },
    ] }],
  },
  {
    id: "guests",
    question: "How often does someone stay over or visit?",
    hint: "Friends crashing on the couch, partners, family visits.",
    rows: [{ key: "guests", options: [
      { value: "rarely", label: "Almost never", icon: "UserRound" },
      { value: "sometimes", label: "A couple of times a month", icon: "UsersRound" },
      { value: "often", label: "Most weekends", icon: "PartyPopper" },
    ] }],
  },
  {
    id: "noise",
    question: "Calls, music and TV at home: what works for you?",
    hint: "Think about your evenings and work-from-home days.",
    rows: [{ key: "noise", options: [
      { value: "quiet", label: "I take calls or study at home, I need quiet", icon: "Headphones" },
      { value: "some", label: "Some background noise is fine", icon: "Music" },
      { value: "lively", label: "I play music out loud and like a buzzing home", icon: "Speaker" },
    ] }],
  },
  {
    id: "food",
    question: "What gets cooked in the kitchen you share?",
    hint: "We never match on religion, caste or region. Only on how you live.",
    rows: [{ key: "food", options: [
      { value: "veg", label: "Vegetarian only", icon: "Salad" },
      { value: "egg", label: "Vegetarian plus eggs", icon: "Egg" },
      { value: "nonveg", label: "Non-veg is cooked", icon: "Drumstick" },
      { value: "any", label: "No preference", icon: "UtensilsCrossed" },
    ] }],
  },
  {
    id: "smoke",
    question: "Smoking and drinking at home?",
    hint: "No judgement. It just needs to match the house.",
    rows: [{ key: "smoke", options: [
      { value: "none", label: "Neither, and I'd prefer a home without", icon: "Ban" },
      { value: "drinks", label: "An occasional drink at home", icon: "Wine" },
      { value: "smokes", label: "I smoke, on the balcony or outside", icon: "Cigarette" },
    ] }],
  },
  {
    id: "pets",
    question: "Pets?",
    hint: "Including the stray cat you'll definitely start feeding.",
    rows: [{ key: "pets", options: [
      { value: "has", label: "I have a pet coming with me", icon: "PawPrint" },
      { value: "loves", label: "No pet, but I love them", icon: "Heart" },
      { value: "none", label: "I'd rather not live with pets", icon: "Ban" },
    ] }],
  },
  {
    id: "sharing",
    question: "How do you like to handle groceries and bills?",
    hint: "Milk, oil, cleaning supplies, Wi-Fi.",
    rows: [{ key: "sharing", options: [
      { value: "all", label: "Split everything, cook together sometimes", icon: "Users" },
      { value: "basics", label: "Split the basics, the rest separately", icon: "Scale" },
      { value: "separate", label: "Keep everything separate", icon: "Wallet" },
    ] }],
  },
];

export const areas = [
  "Anywhere", "HSR Layout", "Koramangala", "Indiranagar", "BTM Layout", "Bellandur", "Whitefield",
  "Marathahalli", "Electronic City", "JP Nagar", "Jayanagar", "Malleshwaram", "Frazer Town", "Sarjapur Road", "Hebbal",
  "Domlur", "Kalyan Nagar", "Yelahanka", "Rajajinagar", "Basavanagudi", "Banashankari",
];

export const durations = [
  { value: "1w", label: "1 week", sub: "Trial stay" },
  { value: "1m", label: "1 month", sub: "Trial stay" },
  { value: "3m", label: "3 months", sub: "Short let" },
  { value: "11m", label: "11 months", sub: "Long-term lease" },
] as const;

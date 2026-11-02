import living1 from "@/assets/homes/living-1.jpg";
import living2 from "@/assets/homes/living-2.jpg";
import bedroom1 from "@/assets/homes/bedroom-1.jpg";
import kitchen1 from "@/assets/homes/kitchen-1.jpg";
import studio1 from "@/assets/homes/studio-1.jpg";
import balcony1 from "@/assets/homes/balcony-1.jpg";
import street1 from "@/assets/homes/street-1.jpg";
import type { Flatmate, Habits, HouseRules, Listing, LivedInReport, Profile } from "./types";

// Demo data only. Every listing, person and report here is invented for the hackathon demo.

type H = Required<Habits>;
const h = (work: H["work"], wake: H["wake"], sleep: H["sleep"], dishes: H["dishes"], guests: H["guests"], noise: H["noise"], food: H["food"], smoke: H["smoke"], pets: H["pets"], sharing: H["sharing"]): H =>
  ({ work, wake, sleep, dishes, guests, noise, food, smoke, pets, sharing });
const fm = (name: string, age: number, work: string, habits: H): Flatmate => ({ name, age, work, habits });
const rules = (r: Partial<HouseRules>): HouseRules => ({ guests: "sometimes", quietAfter: "10:30 pm", food: "any", smoking: "no", drinking: true, pets: false, other: [], ...r });
const rep = (icon: LivedInReport["icon"], label: string, tone: LivedInReport["tone"] = "good"): LivedInReport => ({ icon, label, tone });
const verified = { idVerified: true, ownershipDocs: "owner-submitted" as const, inspected: true };

export const sampleTerms = `1. Trial stay: The trial is charged upfront. If the guest leaves before the trial ends, no refund is given for unused days.
2. Security deposit: For a lease, the tenant pays two months' rent as a security deposit. It is refunded within 30 days of move-out after deducting unpaid dues and the cost of any damage beyond normal wear and tear.
3. Notice period: Either side must give one month's written notice to end the lease. If the tenant leaves without notice, one month's rent is deducted from the deposit.
4. Lock-in: The first 6 months of a lease are a lock-in period. Leaving during the lock-in means the tenant pays rent for the remaining lock-in months.
5. Rent: Rent is due by the 5th of every month. A late fee of Rs 200 per day applies after the 5th.
6. Maintenance: Society maintenance and electricity are paid by the tenant and split equally among flatmates. Major repairs (plumbing, wiring, appliances supplied by the owner) are the owner's responsibility.
7. Painting and cleaning: At move-out, Rs 5,000 is deducted from the deposit for painting and deep cleaning, regardless of the condition of the room.
8. Guests: Overnight guests are allowed for up to 2 nights a month with prior notice to flatmates.
9. Entry: The owner may inspect the flat with 24 hours' notice, except in emergencies.
10. Rent increase: Rent increases by 5% at each annual renewal.`;

export const listings: Listing[] = [
  {
    id: "hsr-2bhk-share", title: "Bright room in a 2BHK share", area: "HSR Layout", kind: "Shared flat", householdType: "women",
    weekly: 4200, monthly: 14500, deposit: 29000, minStay: "1w", commuteMin: 22, commuteTo: "Outer Ring Road tech parks",
    trialToLease: true, host: "Meera K.", hostSince: 2021,
    blurb: "Corner room with morning light, a balcony full of plants and two calm flatmates.",
    flatmates: [
      fm("Ananya", 24, "Product designer", h("hybrid", "mid", "before11", "beforebed", "rarely", "quiet", "any", "none", "loves", "basics")),
      fm("Kavya", 26, "Data analyst", h("office", "early", "before11", "now", "often", "quiet", "any", "drinks", "loves", "basics")),
    ],
    rules: rules({ guests: "sometimes", quietAfter: "10:30 pm", other: ["Cleaning rota on the fridge"] }),
    shared: ["Kitchen", "Living room", "Balcony", "Washing machine"],
    reports: [rep("water", "Water 6 to 9 am and 6 to 9 pm, tank backup", "mixed"), rep("power", "Short power cuts about once a week, inverter covers Wi-Fi", "mixed"), rep("noise", "Quiet lane, busy main road two minutes away"), rep("safety", "Well lit at night, guard at the gate")],
    reportCount: 4, trust: verified,
    answers: {
      guests: "Kavya's friends come over most Saturdays, usually for dinner, and leave by 10:30 pm. Ananya rarely has people over. We give each other a heads-up on the group chat.",
      cleanliness: "Weekly rota. Kavya does dishes the minute she's done eating, Ananya before bed. The sink is never full overnight.",
      default: "Happy to answer that. Want to hop on a quick video call this week to see the place?",
    },
  },
  {
    id: "koramangala-studio", title: "Compact studio near Sony Signal", area: "Koramangala", kind: "Studio", householdType: "mixed",
    weekly: 5600, monthly: 19500, deposit: 58500, minStay: "1w", commuteMin: 15, commuteTo: "Koramangala startup offices",
    trialToLease: true, host: "Rahul S.", hostSince: 2019,
    blurb: "Your own studio with a kitchenette, a rooftop terrace and cafes downstairs.",
    flatmates: [], rules: rules({ quietAfter: "11 pm", other: ["Building gate closes at midnight"] }),
    shared: ["Rooftop terrace", "Lift"],
    reports: [rep("water", "24-hour water supply"), rep("noise", "Weekend nights get loud from nearby cafes", "mixed"), rep("commute", "Walkable to most Koramangala offices")],
    reportCount: 6, trust: { ...verified, inspected: false },
    answers: { default: "Sure, ask away. The studio gets good morning light and the building has a lift." },
  },
  {
    id: "indiranagar-3bhk", title: "Room in a lively 3BHK off 12th Main", area: "Indiranagar", kind: "Shared flat", householdType: "mixed",
    weekly: 4900, monthly: 16500, deposit: 33000, minStay: "1w", commuteMin: 28, commuteTo: "Domlur and Old Airport Road",
    trialToLease: true, host: "Farhan A.", hostSince: 2022,
    blurb: "A social house with Friday dinners, a big terrace and a piano in the living room.",
    flatmates: [
      fm("Arjun", 27, "Sales lead", h("office", "late", "after1", "later", "often", "lively", "nonveg", "drinks", "loves", "all")),
      fm("Neha", 25, "Content writer", h("wfh", "late", "11to1", "beforebed", "often", "some", "nonveg", "drinks", "loves", "all")),
      fm("Sid", 28, "Musician and teacher", h("hybrid", "late", "after1", "later", "sometimes", "lively", "nonveg", "smokes", "loves", "all")),
    ],
    rules: rules({ guests: "often", quietAfter: "midnight", food: "nonveg", smoking: "balcony", other: ["Friday dinners together if you want"] }),
    shared: ["Kitchen", "Large living room", "Terrace", "Shared bathroom"],
    reports: [rep("water", "Steady water, low pressure on the top floor sometimes"), rep("noise", "Busy street with bars nearby, bring earplugs", "mixed"), rep("safety", "Lots of people around late at night")],
    reportCount: 3, trust: { idVerified: true, ownershipDocs: "not-provided", inspected: false },
    answers: { guests: "It's a social house. Friends are over most weekends and we host dinners on Fridays.", default: "Come by for a Friday dinner and see if it feels right." },
  },
  {
    id: "btm-pg-women", title: "Women's PG with home-style meals", area: "BTM Layout", kind: "PG room", householdType: "women",
    weekly: 3100, monthly: 10500, deposit: 10500, minStay: "1w", commuteMin: 25, commuteTo: "Bannerghatta Road offices",
    trialToLease: true, host: "Lakshmi PG", hostSince: 2017,
    blurb: "Twin-sharing room with breakfast and dinner, a warden on site and a quiet study room.",
    flatmates: [
      fm("Pooja", 22, "Fintech intern", h("student", "late", "after1", "beforebed", "rarely", "some", "veg", "none", "loves", "separate")),
      fm("Sneha", 23, "MBA student", h("student", "early", "before11", "now", "rarely", "quiet", "veg", "none", "none", "separate")),
    ],
    rules: rules({ guests: "rarely", quietAfter: "10 pm", food: "veg", drinking: false, other: ["Gate closes at 10:30 pm", "Visitors in the common area only"] }),
    shared: ["Dining hall", "Laundry service", "Study room"],
    reports: [rep("water", "24-hour water with RO drinking water"), rep("safety", "CCTV and a warden on site"), rep("power", "Full power backup")],
    reportCount: 9, trust: verified,
    answers: { default: "Meals are home-style vegetarian. You can try a week before deciding on a longer stay." },
  },
  {
    id: "bellandur-2bhk", title: "Calm room near Ecospace", area: "Bellandur", kind: "Shared flat", householdType: "men",
    weekly: 4400, monthly: 15000, deposit: 30000, minStay: "1w", commuteMin: 12, commuteTo: "Ecospace and RMZ Ecoworld",
    trialToLease: true, host: "Vikram P.", hostSince: 2020,
    blurb: "Gated society with a gym and pool, a five-minute walk to Ecospace.",
    flatmates: [fm("Rohan", 25, "Software engineer, games at night", h("hybrid", "late", "11to1", "beforebed", "sometimes", "some", "veg", "none", "loves", "basics"))],
    rules: rules({ food: "veg", quietAfter: "11 pm", other: ["No parties"] }),
    shared: ["Kitchen", "Living room", "Society gym and pool"],
    reports: [rep("water", "Water tankers in summer, otherwise steady", "mixed"), rep("commute", "Walk to Ecospace"), rep("safety", "Gated society with 24-hour security")],
    reportCount: 5, trust: verified,
    answers: { default: "Rohan works hybrid and games a bit at night with headphones on. Weekdays are fairly calm." },
  },
  {
    id: "whitefield-1bhk", title: "Furnished 1BHK near ITPL, pets welcome", area: "Whitefield", kind: "1BHK", householdType: "mixed",
    weekly: 5200, monthly: 18000, deposit: 54000, minStay: "1m", commuteMin: 18, commuteTo: "ITPL and Whitefield tech parks",
    trialToLease: true, host: "Sunita R.", hostSince: 2018,
    blurb: "A full 1BHK with a small garden patch, ten minutes' walk from the metro.",
    flatmates: [], rules: rules({ guests: "often", quietAfter: "11 pm", pets: true, smoking: "balcony", other: ["Covered parking"] }),
    shared: ["Society clubhouse", "Covered parking"],
    reports: [rep("water", "Borewell plus municipal, no shortages reported"), rep("commute", "Metro station 10 minutes on foot")],
    reportCount: 2, trust: { ...verified, inspected: false },
    answers: { pets: "Dogs and cats are both fine with a small pet deposit.", default: "It's fully furnished, including a fridge and washing machine." },
  },
  {
    id: "marathahalli-share", title: "Room in a quiet 3BHK, daytime calm", area: "Marathahalli", kind: "Shared flat", householdType: "men",
    weekly: 3500, monthly: 12000, deposit: 24000, minStay: "1w", commuteMin: 20, commuteTo: "Outer Ring Road tech parks",
    trialToLease: true, host: "Deepak N.", hostSince: 2021,
    blurb: "Two night-shift flatmates, so the flat is yours in the evenings.",
    flatmates: [
      fm("Aditya", 29, "QA engineer, night shift", h("night", "late", "after1", "beforebed", "rarely", "quiet", "nonveg", "drinks", "loves", "separate")),
      fm("Manish", 26, "Support lead, night shift", h("night", "late", "after1", "later", "rarely", "some", "nonveg", "smokes", "loves", "separate")),
    ],
    rules: rules({ guests: "rarely", quietAfter: "9 am to 3 pm (day sleepers)", food: "nonveg", smoking: "balcony" }),
    shared: ["Kitchen", "Living room"],
    reports: [rep("power", "Frequent short power cuts in monsoon", "mixed"), rep("water", "Water 5 to 8 am only", "mixed")],
    reportCount: 3, trust: { idVerified: false, ownershipDocs: "not-provided", inspected: false },
    answers: { default: "We both work night shifts, so daytime is quiet hours for us." },
  },
  {
    id: "jpnagar-share", title: "Room with a balcony garden near the metro", area: "JP Nagar", kind: "Shared flat", householdType: "women",
    weekly: 3800, monthly: 13000, deposit: 26000, minStay: "1w", commuteMin: 30, commuteTo: "Bannerghatta Road and Jayanagar",
    trialToLease: true, host: "Prakash M.", hostSince: 2016,
    blurb: "Plants everywhere, a cook twice a week and a six-minute walk to the metro.",
    flatmates: [
      fm("Isha", 24, "Architect", h("office", "mid", "11to1", "now", "sometimes", "some", "veg", "none", "loves", "all")),
      fm("Tara", 23, "Edtech intern", h("student", "mid", "before11", "beforebed", "sometimes", "quiet", "veg", "none", "loves", "all")),
    ],
    rules: rules({ food: "veg", drinking: false, other: ["Water the plants on your turn", "Shared cook twice a week"] }),
    shared: ["Kitchen", "Living room", "Balcony garden"],
    reports: [rep("water", "24-hour water"), rep("commute", "Metro six minutes on foot"), rep("safety", "Residential, calm and well lit")],
    reportCount: 7, trust: verified,
    answers: { default: "We have a cook twice a week and split groceries. Isha keeps the kitchen spotless." },
  },
  {
    id: "ecity-coliving", title: "Co-living room near the Phase 1 gate", area: "Electronic City", kind: "PG room", householdType: "mixed",
    weekly: 2900, monthly: 9800, deposit: 9800, minStay: "1w", commuteMin: 10, commuteTo: "Electronic City Phase 1",
    trialToLease: true, host: "Nest Co-living", hostSince: 2020,
    blurb: "Meals, daily housekeeping and a games room. Most residents are graduate trainees.",
    flatmates: [fm("Varun", 22, "Graduate trainee", h("office", "early", "11to1", "beforebed", "sometimes", "some", "any", "drinks", "loves", "separate"))],
    rules: rules({ quietAfter: "11 pm", drinking: false, other: ["Meals included", "Daily housekeeping"] }),
    shared: ["Dining area", "Games room", "Laundry"],
    reports: [rep("commute", "Walk to work for most residents")],
    reportCount: 11, trust: verified,
    answers: { default: "Housekeeping comes daily, so dishes and cleaning are handled for you." },
  },
  {
    id: "jayanagar-family", title: "Room in a family home with breakfast", area: "Jayanagar", kind: "Room in a family home", householdType: "mixed",
    weekly: 3300, monthly: 11000, deposit: 22000, minStay: "1m", commuteMin: 25, commuteTo: "Jayanagar and South End offices",
    trialToLease: true, host: "Mrs. Rao", hostSince: 2015,
    blurb: "A private room on the first floor of an old Jayanagar house. Filter coffee every morning.",
    flatmates: [fm("Mr. and Mrs. Rao", 64, "Retired teachers, live downstairs", h("wfh", "early", "before11", "now", "rarely", "quiet", "veg", "none", "loves", "separate"))],
    rules: rules({ guests: "rarely", quietAfter: "10 pm", food: "veg", drinking: false, other: ["Breakfast included", "Separate entrance"] }),
    shared: ["Garden", "Dining room for breakfast"],
    reports: [rep("water", "24-hour water"), rep("noise", "Very quiet street, temple bells in the morning"), rep("safety", "Established neighbourhood, lots of families")],
    reportCount: 8, trust: verified,
    answers: { default: "We keep a quiet, early house. Breakfast is idli or upma with coffee at 7:30." },
  },
  {
    id: "malleshwaram-heritage", title: "Room in a heritage house near 8th Cross", area: "Malleshwaram", kind: "Shared flat", householdType: "women",
    weekly: 3700, monthly: 12500, deposit: 25000, minStay: "1w", commuteMin: 20, commuteTo: "Malleshwaram and Rajajinagar",
    trialToLease: true, host: "Shobha V.", hostSince: 2019,
    blurb: "High ceilings, a red oxide floor and a courtyard. Morning people live here.",
    flatmates: [
      fm("Meghana", 27, "Veena teacher", h("wfh", "early", "before11", "now", "sometimes", "some", "egg", "none", "loves", "all")),
      fm("Divya", 25, "Bank analyst", h("office", "early", "before11", "now", "rarely", "quiet", "egg", "none", "none", "all")),
    ],
    rules: rules({ food: "egg", quietAfter: "10 pm", drinking: false, other: ["Veena practice 6 to 7 am on weekdays"] }),
    shared: ["Courtyard", "Kitchen", "Terrace"],
    reports: [rep("water", "Steady water, sump backup"), rep("commute", "Metro and markets within ten minutes"), rep("safety", "Busy, family neighbourhood")],
    reportCount: 5, trust: verified,
    answers: { noise: "Meghana practises veena from 6 to 7 am. It's beautiful, but you'll hear it.", default: "We're early birds and keep a clean kitchen. Come for chai and see the courtyard." },
  },
  {
    id: "frazer-artists", title: "Room in an artists' flat with a cat", area: "Frazer Town", kind: "Shared flat", householdType: "mixed",
    weekly: 4000, monthly: 13500, deposit: 27000, minStay: "1w", commuteMin: 30, commuteTo: "MG Road and Cunningham Road",
    trialToLease: true, host: "Imran Q.", hostSince: 2020,
    blurb: "A studio-flat hybrid full of canvases, a resident cat called Biryani and the best kebabs in town nearby.",
    flatmates: [
      fm("Zoya", 28, "Illustrator", h("wfh", "late", "after1", "later", "sometimes", "some", "nonveg", "smokes", "has", "separate")),
      fm("Kiran", 30, "Photographer", h("hybrid", "mid", "11to1", "beforebed", "often", "lively", "nonveg", "drinks", "loves", "separate")),
    ],
    rules: rules({ guests: "often", quietAfter: "midnight", food: "nonveg", smoking: "balcony", pets: true, other: ["Cat lives here, keep doors closed"] }),
    shared: ["Kitchen", "Studio corner", "Balcony"],
    reports: [rep("noise", "Busy street during Ramzan nights, festive and loud", "mixed"), rep("water", "Water every morning, tank for evenings", "mixed")],
    reportCount: 2, trust: { idVerified: true, ownershipDocs: "owner-submitted", inspected: false },
    answers: { pets: "Biryani is a very friendly orange cat. She sleeps on whoever's laptop is warmest.", default: "We're creative and a bit chaotic but respectful. Come see the flat." },
  },
  {
    id: "sarjapur-gated", title: "Room in a 3BHK in a gated society", area: "Sarjapur Road", kind: "Shared flat", householdType: "men",
    weekly: 4600, monthly: 15500, deposit: 31000, minStay: "1m", commuteMin: 25, commuteTo: "Wipro Sarjapur and RGA Tech Park",
    trialToLease: true, host: "Nikhil J.", hostSince: 2022,
    blurb: "Early-rising fitness crowd, shared meal prep on Sundays, pool and badminton court.",
    flatmates: [
      fm("Abhay", 27, "Product manager", h("office", "early", "before11", "now", "sometimes", "some", "nonveg", "none", "loves", "all")),
      fm("Sameer", 26, "Developer", h("hybrid", "early", "before11", "now", "rarely", "quiet", "nonveg", "none", "loves", "all")),
    ],
    rules: rules({ food: "nonveg", quietAfter: "10:30 pm", other: ["Sunday meal prep together"] }),
    shared: ["Kitchen", "Living room", "Society gym, pool and badminton court"],
    reports: [rep("commute", "Traffic on Sarjapur Road is heavy at peak hours", "mixed"), rep("safety", "Gated, 24-hour security"), rep("power", "Full power backup")],
    reportCount: 4, trust: verified,
    answers: { default: "We're up at 6 for the gym and in bed by 11. Sunday meal prep is optional but fun." },
  },
  {
    id: "hebbal-wfh", title: "Quiet room with a dog, lake view", area: "Hebbal", kind: "Shared flat", householdType: "mixed",
    weekly: 4300, monthly: 14800, deposit: 29600, minStay: "1w", commuteMin: 20, commuteTo: "Manyata Tech Park",
    trialToLease: true, host: "Aarav M.", hostSince: 2021,
    blurb: "Fast fibre, a dedicated desk in your room and a golden retriever who loves everyone.",
    flatmates: [fm("Aarav", 29, "Remote backend engineer, codes late", h("wfh", "late", "after1", "beforebed", "rarely", "quiet", "egg", "drinks", "has", "basics"))],
    rules: rules({ guests: "sometimes", quietAfter: "10:30 pm", food: "egg", pets: true, other: ["Meeting-friendly quiet hours 10 am to 6 pm"] }),
    shared: ["Kitchen", "Living room", "Balcony with lake view"],
    reports: [rep("commute", "Manyata is 20 minutes, airport road nearby"), rep("water", "24-hour water"), rep("noise", "Flyover traffic hum, double glazed windows")],
    reportCount: 3, trust: verified,
    answers: { pets: "Bruno is a four-year-old golden retriever, house-trained and very gentle.", default: "I work from home, so the flat is quiet in the day. Fibre is 300 Mbps." },
  },
  {
    id: "koramangala-founders", title: "Room in a startup founders' flat", area: "Koramangala", kind: "Shared flat", householdType: "mixed",
    weekly: 5000, monthly: 17000, deposit: 34000, minStay: "1w", commuteMin: 8, commuteTo: "Koramangala 5th Block",
    trialToLease: true, host: "Tanya B.", hostSince: 2023,
    blurb: "Whiteboards on every wall, late nights, and a living room that doubles as a pitch rehearsal space.",
    flatmates: [
      fm("Tanya", 29, "Founder, fintech", h("hybrid", "late", "after1", "later", "often", "lively", "any", "drinks", "loves", "all")),
      fm("Dev", 27, "Founder, D2C brand", h("hybrid", "mid", "after1", "beforebed", "often", "some", "any", "drinks", "loves", "all")),
    ],
    rules: rules({ guests: "often", quietAfter: "midnight", other: ["Cleaner comes three times a week"] }),
    shared: ["Kitchen", "Living room", "Rooftop"],
    reports: [rep("commute", "Walk to most 5th Block offices"), rep("noise", "Lively building, lots of young professionals", "mixed")],
    reportCount: 2, trust: { idVerified: true, ownershipDocs: "not-provided", inspected: false },
    answers: { guests: "People drop by a lot, often for work. We try to wrap up by midnight.", default: "It's busy and fun. Great if you're building something too." },
  },
  {
    id: "hsr-bakery-1bhk", title: "Quiet 1BHK above a bakery", area: "HSR Layout", kind: "1BHK", householdType: "mixed",
    weekly: 5000, monthly: 17500, deposit: 52500, minStay: "1m", commuteMin: 18, commuteTo: "HSR and Outer Ring Road",
    trialToLease: true, host: "Joseph D.", hostSince: 2014,
    blurb: "Your own 1BHK on a tree-lined road. The whole street smells of fresh bread at 6 am.",
    flatmates: [], rules: rules({ guests: "sometimes", quietAfter: "11 pm", smoking: "no", other: ["Bike parking only"] }),
    shared: ["Terrace"],
    reports: [rep("water", "24-hour water"), rep("noise", "Very quiet after 9 pm"), rep("safety", "Tree-lined residential road")],
    reportCount: 6, trust: verified,
    answers: { default: "It's a calm building with three other tenants. Bakery opens at 6 am." },
  },
  {
    id: "whitefield-pg-men", title: "Men's PG with gaming lounge", area: "Whitefield", kind: "PG room", householdType: "men",
    weekly: 2800, monthly: 9500, deposit: 9500, minStay: "1w", commuteMin: 15, commuteTo: "ITPL and Brookefield",
    trialToLease: true, host: "Urban Nest PG", hostSince: 2019,
    blurb: "Single rooms, meals, a gaming lounge and a lot of late-night cricket debates.",
    flatmates: [
      fm("Karthik", 24, "Support engineer, US shift", h("night", "late", "after1", "later", "sometimes", "lively", "nonveg", "drinks", "loves", "separate")),
      fm("Rahul", 23, "Graduate trainee", h("office", "mid", "after1", "beforebed", "sometimes", "some", "nonveg", "none", "loves", "separate")),
    ],
    rules: rules({ guests: "rarely", quietAfter: "11 pm", food: "nonveg", drinking: false, other: ["Meals included", "Housekeeping daily"] }),
    shared: ["Gaming lounge", "Dining hall", "Laundry"],
    reports: [rep("power", "Power backup for rooms, not the lounge", "mixed"), rep("commute", "Shuttle to ITPL")],
    reportCount: 10, trust: verified,
    answers: { default: "It's a young, social PG. The gaming lounge stays open till 1 am." },
  },
  {
    id: "indiranagar-wfh-women", title: "Calm room for remote workers", area: "Indiranagar", kind: "Shared flat", householdType: "women",
    weekly: 4700, monthly: 16000, deposit: 32000, minStay: "1w", commuteMin: 15, commuteTo: "Indiranagar and Domlur",
    trialToLease: true, host: "Ritika S.", hostSince: 2020,
    blurb: "Two remote workers, a library-quiet flat on weekdays and long brunches on Sundays.",
    flatmates: [
      fm("Ritika", 28, "UX researcher, remote", h("wfh", "mid", "before11", "now", "rarely", "quiet", "egg", "drinks", "loves", "basics")),
      fm("Fatima", 26, "Translator, remote", h("wfh", "mid", "11to1", "beforebed", "sometimes", "quiet", "any", "none", "loves", "basics")),
    ],
    rules: rules({ guests: "sometimes", quietAfter: "10 pm", food: "egg", other: ["Quiet working hours 10 am to 6 pm"] }),
    shared: ["Kitchen", "Living room", "Work nook"],
    reports: [rep("noise", "Back of the building, very quiet in the day"), rep("water", "24-hour water"), rep("safety", "Well lit, near the metro")],
    reportCount: 5, trust: verified,
    answers: { noise: "We're both on calls most of the day, so we keep it library-quiet until 6.", default: "Sunday brunches are a tradition here. You're welcome to join." },
  },
];

// Demo photography (AI-generated, representative, not the actual homes).
const photoSets = [
  [living1, bedroom1, kitchen1, street1],
  [studio1, kitchen1, balcony1, street1],
  [living2, bedroom1, balcony1, street1],
  [bedroom1, living1, kitchen1, street1],
  [balcony1, living2, bedroom1, street1],
];
listings.forEach((l, i) => { if (!l.photos?.length) l.photos = photoSets[i % photoSets.length]; });

// Every sample home ships the same sample agreement.
listings.forEach((l) => { l.terms ??= sampleTerms; });

export const demoProfile: Profile = {
  name: "Riya", duration: "1m", area: "HSR Layout", budget: 16000, living: "flatmates", gender: "woman", householdPref: "either",
  habits: { work: "hybrid", wake: "mid", sleep: "before11", dishes: "beforebed", guests: "rarely", noise: "quiet", food: "any", smoke: "none", pets: "loves", sharing: "basics" },
};

export function getListing(id: string) {
  return listings.find((l) => l.id === id);
}

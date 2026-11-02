import Link from "@/components/AppLink";
import { ArrowRight, ArrowUpRight, Droplets, Zap, ShieldCheck, Volume2, KeyRound, Scale, Camera, Search, CalendarCheck, FileSignature } from "lucide-react";
import { DurationDemo } from "@/components/DurationDemo";
import { HeroStreet } from "@/components/HeroStreet";
import { TrialThread } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import living1 from "@/assets/homes/living-1.jpg";
import bedroom1 from "@/assets/homes/bedroom-1.jpg";
import balcony1 from "@/assets/homes/balcony-1.jpg";
import kitchen1 from "@/assets/homes/kitchen-1.jpg";

const areas = ["HSR Layout", "Koramangala", "Indiranagar", "Whitefield", "BTM Layout", "Electronic City", "Jayanagar", "Bellandur", "Marathahalli", "JP Nagar"];

const steps = [
  { icon: Search, title: "Find your fit", body: "Answer six quick questions about how you live. We rank homes and households that suit you, and say why." },
  { icon: CalendarCheck, title: "Try it for a week or a month", body: "Book a trial stay. The host confirms, you pay, and on day one you record every room's condition together." },
  { icon: FileSignature, title: "Make it your home", body: "If it feels right, turn the stay into a lease. Your evidence, agreement and deposit record come with you." },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <main className="overflow-x-clip">
      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-24 h-[28rem] w-[28rem] rounded-full bg-coral/15 blur-3xl" data-parallax="0.3" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-medium" data-reveal>
            <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />Now open in Bengaluru
          </p>
          <h1 className="mt-6 text-[clamp(2.8rem,5.6vw,4.7rem)] leading-[0.95]" data-split>Try the home. Try the flatmates. Then sign.</h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2" data-reveal>
            Moving cities shouldn&apos;t mean an 11-month lease on a flat you&apos;ve seen once. Stay a week or a month first. If the home and the people fit, make it permanent.
          </p>
          <div className="mt-9 flex flex-wrap gap-3" data-reveal>
            <Link href="/start" className="btn-primary">Find your fit <ArrowRight className="h-4 w-4" /></Link>
            <Link href={user ? "/host" : "/auth?mode=signup"} className="btn-ghost">List your home</Link>
          </div>
        </div>
        <div className="relative" data-reveal><DurationDemo /></div>
      </section>

      {/* Marquee */}
      <div className="border-y border-ink bg-ink py-4 text-on-ink" aria-hidden>
        <div className="marquee">
          {[...areas, ...areas].map((a, i) => (
            <span key={i} className="flex items-center gap-6 px-6 font-display text-2xl font-bold">{a}<span className="h-2 w-2 rounded-full bg-coral" /></span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-20 sm:grid-cols-3" data-reveal-stagger>
        {[[11, "months is the usual lease you skip"], [7, "days is the shortest trial"], [6, "questions to find your fit"]].map(([n, t]) => (
          <div key={String(t)} className="rounded-[2rem] border border-line bg-card p-8">
            <p className="text-7xl font-extrabold tracking-tight tabular-nums text-coral" data-count={n}>{n}</p>
            <p className="mt-2 text-ink-2">{t}</p>
          </div>
        ))}
      </section>

      {/* Steps */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <h2 className="max-w-2xl text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[0.95]">One journey, from first search to final move-out</h2>
          <TrialThread className="hidden h-3 w-56 text-coral md:block" />
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3" data-reveal-stagger>
          {steps.map((s, i) => (
            <li key={s.title} className="group relative overflow-hidden rounded-[2rem] border border-line bg-card p-8 transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-lift">
              <span className="absolute -right-3 -top-6 font-display text-[8rem] font-extrabold leading-none text-stone transition group-hover:text-coral/20">{i + 1}</span>
              <s.icon className="relative h-8 w-8 text-coral" />
              <h3 className="relative mt-6 text-2xl">{s.title}</h3>
              <p className="relative mt-3 leading-relaxed text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Photo collage with parallax */}
      <section className="mx-auto mt-20 grid max-w-6xl gap-5 px-5 md:grid-cols-12">
        <div className="relative h-[26rem] overflow-hidden rounded-[2rem] md:col-span-7" data-reveal>
          <img src={living1} alt="Sunlit shared living room" className="absolute inset-0 h-[130%] w-full object-cover" data-parallax="0.15" />
          <div className="absolute bottom-5 left-5 rounded-full bg-card px-4 py-2 text-sm font-semibold">HSR Layout · 2BHK share</div>
        </div>
        <div className="grid gap-5 md:col-span-5">
          <div className="relative h-[12.5rem] overflow-hidden rounded-[2rem]" data-reveal>
            <img src={bedroom1} alt="Bright bedroom" className="absolute inset-0 h-[130%] w-full object-cover" data-parallax="0.12" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="relative h-[12.5rem] overflow-hidden rounded-[2rem]" data-reveal><img src={balcony1} alt="Balcony with plants" className="h-full w-full object-cover" /></div>
            <div className="relative h-[12.5rem] overflow-hidden rounded-[2rem]" data-reveal><img src={kitchen1} alt="Shared kitchen" className="h-full w-full object-cover" /></div>
          </div>
        </div>
      </section>

      {/* Lived-in */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-2 md:items-center">
        <div data-reveal>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral">Lived-in reports</p>
          <h2 className="mt-3 text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[0.95]">What a listing won&apos;t tell you</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">Water hours, power cuts, the noise at 11 pm. Only guests who booked a trial stay can report on a home.</p>
        </div>
        <div className="rotate-1 rounded-[2rem] bg-ink p-8 text-on-ink shadow-lift transition hover:rotate-0" data-reveal>
          <p className="text-sm font-semibold text-on-ink/70">HSR Layout 2BHK · from 4 trial stays</p>
          <ul className="mt-5 space-y-4">
            {[[Droplets, "Water 6 to 9 am and 6 to 9 pm, tank backup"], [Zap, "Short power cuts about once a week"], [Volume2, "Quiet lane, busy main road two minutes away"], [ShieldCheck, "Well lit at night, guard at the gate"]].map(([I, t]) => {
              const Icon = I as typeof Droplets;
              return <li key={t as string} className="flex gap-3"><Icon className="h-5 w-5 shrink-0 text-coral" />{t as string}</li>;
            })}
          </ul>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-2" data-reveal-stagger>
        <div className="rounded-[2rem] bg-stone p-9">
          <KeyRound className="h-8 w-8 text-coral" />
          <h3 className="mt-5 text-3xl">For renters</h3>
          <ul className="mt-5 space-y-3 text-ink-2">
            <li>Live with people whose days look like yours</li>
            <li>See the clauses that could cost you before you sign</li>
            <li>Get your deposit back with evidence on your side</li>
          </ul>
          <Link href="/start" className="btn-primary mt-8">Take the quiz</Link>
        </div>
        <div className="rounded-[2rem] bg-coral p-9 text-on-ink">
          <Scale className="h-8 w-8" />
          <h3 className="mt-5 text-3xl">For hosts</h3>
          <ul className="mt-5 space-y-3 text-on-ink/90">
            <li>See how a tenant lives in your home before a year-long commitment</li>
            <li>Every room documented, so damage claims rest on evidence</li>
            <li>Well-matched tenants stay longer and fill rooms faster</li>
          </ul>
          <Link href={user ? "/host/new" : "/auth?mode=signup"} className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold transition hover:-translate-y-0.5">List a home <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mt-24 h-56 w-full overflow-hidden sm:h-72 md:h-80"><HeroStreet /></div>

      <section className="mx-auto max-w-6xl px-5 pt-20 text-center">
        <Camera className="mx-auto h-8 w-8 text-coral" aria-hidden="true" />
        <h2 className="mx-auto mt-5 max-w-3xl text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95]" data-reveal>Your next home is a trial stay away</h2>
        <Link href="/start" className="btn-primary mt-10">Find your fit <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
  );
}

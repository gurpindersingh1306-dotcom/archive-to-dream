import Link from "@/components/AppLink";
import { Droplets, Zap, ShieldCheck, Volume2, KeyRound, Scale, Camera } from "lucide-react";
import { DurationDemo } from "@/components/DurationDemo";
import { HeroStreet } from "@/components/HeroStreet";
import { Logo, TrialThread } from "@/components/ui";

const steps = [
  { title: "Find your fit", body: "Answer six quick questions about how you live. We show the three homes and households that suit you, and say why." },
  { title: "Try it for a week or a month", body: "Book a trial stay. On day one, record every room's condition with timestamped photos that both sides confirm." },
  { title: "Make it your home", body: "If it feels right, turn the stay into a lease in one tap. Your evidence, agreement and deposit record come with you." },
];

export default function Landing() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-14 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div>
          <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl">Try the home. Try the flatmates. Then sign.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Moving to a new city shouldn&apos;t mean an 11-month lease on a flat you&apos;ve seen once. Stay for a week or a month first. If the home and the people fit, make it permanent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/start" className="rounded-xl bg-ink px-5 py-3 font-medium text-white hover:bg-ink-2">Find your fit</Link>
            <Link href="#how" className="rounded-xl border border-line bg-white px-5 py-3 font-medium text-ink hover:border-ink/30">See how it works</Link>
          </div>
          <p className="mt-6 text-sm text-muted">Launching in Bengaluru for interns, students and new joiners.</p>
        </div>
        <DurationDemo />
      </section>

      <div className="h-56 w-full overflow-hidden sm:h-72 md:h-80">
        <HeroStreet />
      </div>

      <section id="how" className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">One continuous journey, from first search to final move-out</h2>
          <TrialThread className="mt-8 hidden h-3 w-full text-teal md:block" />
          <ol className="mt-6 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <p className="font-display text-sm font-semibold text-teal">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">What a listing won&apos;t tell you</h2>
          <p className="mt-4 max-w-md leading-relaxed text-ink-2">
            Water hours, power cuts, the noise at 11 pm. Only people who completed a trial stay can report on a home, so you hear it from someone who actually lived there.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-6">
          <p className="text-sm font-medium">Lived-in reports, HSR Layout 2BHK</p>
          <ul className="mt-4 space-y-3 text-sm text-ink-2">
            <li className="flex gap-3"><Droplets className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />Water 6 to 9 am and 6 to 9 pm, tank backup</li>
            <li className="flex gap-3"><Zap className="h-4 w-4 shrink-0 text-amber" aria-hidden="true" />Short power cuts about once a week</li>
            <li className="flex gap-3"><Volume2 className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />Quiet lane, busy main road two minutes away</li>
            <li className="flex gap-3"><ShieldCheck className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />Well lit at night, guard at the gate</li>
          </ul>
          <p className="mt-4 text-xs text-muted">From 4 trial stays. Sample data for the demo.</p>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-20 md:grid-cols-2">
          <div className="rounded-2xl bg-paper p-7">
            <KeyRound className="h-6 w-6 text-teal" aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-semibold">For renters</h3>
            <ul className="mt-4 space-y-2 leading-relaxed text-ink-2">
              <li>Live with people whose days look like yours</li>
              <li>See the clauses that could cost you before you sign</li>
              <li>Get your deposit back with evidence on your side</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-ink p-7 text-white">
            <Scale className="h-6 w-6 text-[#9fd8cf]" aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-semibold">For hosts</h3>
            <ul className="mt-4 space-y-2 leading-relaxed text-white/80">
              <li>See how a tenant lives in your home before a year-long commitment</li>
              <li>Every room documented, so damage claims rest on evidence</li>
              <li>Well-matched tenants stay longer and fill rooms faster</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <Camera className="mx-auto h-6 w-6 text-teal" aria-hidden="true" />
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold sm:text-4xl">Your next home is a trial stay away</h2>
        <Link href="/start" className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 font-medium text-white hover:bg-ink-2">Find your fit</Link>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted">
          <Logo />
          <p>Hackathon prototype. All listings, people and reports are sample data.</p>
        </div>
      </footer>
    </main>
  );
}

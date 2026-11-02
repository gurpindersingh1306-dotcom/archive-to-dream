
import { useState } from "react";
import { useRouter } from "@/components/AppLink";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, UserRound, Users, Home } from "lucide-react";
import { areas, durations, quiz } from "@/lib/quiz";
import { inr } from "@/lib/match";
import { saveProfile } from "@/lib/profile";
import { demoProfile } from "@/lib/data";
import { QuizIcon } from "@/components/ui";
import type { Gender, Habits, HouseholdPref, Living, Profile } from "@/lib/types";

const livingOptions: { value: Living; label: string; sub: string; icon: typeof Home }[] = [
  { value: "flatmates", label: "Share with flatmates", sub: "We'll match you on how you actually live", icon: Users },
  { value: "alone", label: "Live on my own", sub: "Studios, 1BHKs and private rooms", icon: UserRound },
  { value: "either", label: "Either works", sub: "Show me the best fits of both", icon: Home },
];
const genders: { value: Gender; label: string }[] = [
  { value: "woman", label: "Woman" }, { value: "man", label: "Man" }, { value: "unspecified", label: "Prefer not to say" },
];
const prefs: { value: HouseholdPref; label: string }[] = [
  { value: "single", label: "Women-only or men-only homes" }, { value: "mixed", label: "Mixed homes" }, { value: "either", label: "Either is fine" },
];

export default function Start() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>({ ...demoProfile, name: "", habits: {} });
  const total = 4 + quiz.length;
  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const later = (fn: () => void) => { fn(); setTimeout(next, 240); };

  const finish = () => { saveProfile(p); router.push("/matches"); };

  let content: React.ReactNode;
  if (step === 0) {
    content = (
      <Q title="How long do you need a place?" hint="You can always extend a trial into a longer stay.">
        <div className="grid gap-3 sm:grid-cols-2">
          {durations.map((d) => (
            <Choice key={d.value} active={p.duration === d.value} onClick={() => later(() => setP({ ...p, duration: d.value }))}>
              <span className="font-medium">{d.label}</span><span className="text-sm text-muted">{d.sub}</span>
            </Choice>
          ))}
        </div>
      </Q>
    );
  } else if (step === 1) {
    content = (
      <Q title="Where, and what's your monthly budget?" hint="Pick the area closest to your office or college.">
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <button key={a} onClick={() => setP({ ...p, area: a })} aria-pressed={p.area === a}
              className={`rounded-lg border px-3 py-2 text-sm transition ${p.area === a ? "border-teal bg-teal-soft text-teal-deep" : "border-line bg-white hover:border-ink/30"}`}>{a}</button>
          ))}
        </div>
        <label htmlFor="budget" className="mt-8 flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-2">Monthly budget</span>
          <span className="font-display text-2xl font-semibold tabular-nums">{inr(p.budget)}</span>
        </label>
        <input id="budget" type="range" min={8000} max={40000} step={500} value={p.budget} onChange={(e) => setP({ ...p, budget: Number(e.target.value) })} className="mt-3 w-full" />
        <button onClick={next} className="mt-8 w-full rounded-xl bg-ink py-3 font-medium text-white hover:bg-ink-2">Continue</button>
      </Q>
    );
  } else if (step < 2 + quiz.length) {
    const q = quiz[step - 2];
    const multi = q.rows.length > 1;
    const pick = (key: keyof Habits, value: string) => {
      const habits = { ...p.habits, [key]: value } as Habits;
      setP({ ...p, habits });
      if (q.rows.every((r) => habits[r.key])) setTimeout(next, 260);
    };
    content = (
      <Q title={q.question} hint={q.hint}>
        <div className="space-y-6">
          {q.rows.map((row) => (
            <div key={row.key}>
              {row.label && <p className="mb-2 text-sm font-medium text-ink-2">{row.label}</p>}
              <div className={multi ? "grid grid-cols-3 gap-2" : "grid gap-3"}>
                {row.options.map((o) => (
                  <Choice key={o.value} row={!multi} active={p.habits[row.key] === o.value} onClick={() => pick(row.key, o.value)}>
                    <QuizIcon name={o.icon} className="h-5 w-5 shrink-0 text-teal" />
                    <span className={`font-medium ${multi ? "text-sm" : ""}`}>{o.label}</span>
                  </Choice>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={next} className="mt-5 w-full text-sm text-muted hover:text-ink">Skip this question</button>
      </Q>
    );
  } else if (step === 2 + quiz.length) {
    content = (
      <Q title="How do you want to live?" hint="Your answers are shared with a household only as a fit summary, never word for word.">
        <div className="grid gap-3">
          {livingOptions.map(({ value, label, sub, icon: I }) => (
            <Choice key={value} row active={p.living === value} onClick={() => later(() => setP({ ...p, living: value }))}>
              <I className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
              <span><span className="block font-medium">{label}</span><span className="block text-sm text-muted">{sub}</span></span>
            </Choice>
          ))}
        </div>
      </Q>
    );
  } else {
    content = (
      <Q title="Which homes should we show you?" hint="Many PGs and shared flats are women-only or men-only. This only filters homes, it never affects your fit score.">
        <p className="mb-2 text-sm font-medium text-ink-2">I am</p>
        <div className="grid grid-cols-3 gap-2">
          {genders.map((g) => (
            <Choice key={g.value} active={p.gender === g.value} onClick={() => setP({ ...p, gender: g.value })}><span className="text-sm font-medium">{g.label}</span></Choice>
          ))}
        </div>
        <p className="mb-2 mt-6 text-sm font-medium text-ink-2">I&apos;m comfortable living in</p>
        <div className="grid gap-2">
          {prefs.map((x) => (
            <Choice key={x.value} row active={p.householdPref === x.value} onClick={() => setP({ ...p, householdPref: x.value })}><span className="font-medium">{x.label}</span></Choice>
          ))}
        </div>
        <button onClick={finish} className="mt-8 w-full rounded-xl bg-ink py-3 font-medium text-white hover:bg-ink-2">See my matches</button>
      </Q>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label="Back" className="rounded-lg p-2 text-ink-2 hover:bg-white disabled:opacity-30">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 gap-1" aria-label={`Step ${step + 1} of ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-teal" : "bg-line"}`} />
          ))}
        </div>
        <span className="w-12 text-right text-xs tabular-nums text-muted">{step + 1}/{total}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="mt-10">
          {content}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function Q({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section>
      <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
      <p className="mt-2 text-ink-2">{hint}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Choice({ active, onClick, children, row }: { active: boolean; onClick: () => void; children: React.ReactNode; row?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} aria-pressed={active}
      className={`flex ${row ? "items-center gap-3" : "flex-col items-start gap-1.5"} rounded-xl border p-4 text-left transition-colors ${active ? "border-teal bg-teal-soft" : "border-line bg-white hover:border-ink/30"}`}>
      {children}
    </motion.button>
  );
}

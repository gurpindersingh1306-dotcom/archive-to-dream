import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, FileText, ShieldAlert, MessageCircleQuestion } from "lucide-react";
import { TermsExplainer } from "@/components/TermsExplainer";
import { sampleTerms } from "@/lib/data";

export const Route = createFileRoute("/explain")({
  head: () => ({
    meta: [
      { title: "Terms explainer | LeaseIt" },
      { name: "description", content: "Paste any rental agreement or house rules and get every clause explained in plain language, with risky terms flagged." },
      { property: "og:title", content: "Terms explainer | LeaseIt" },
      { property: "og:description", content: "Every clause of your rental agreement, explained in plain language." },
    ],
  }),
  component: ExplainPage,
});

function ExplainPage() {
  const [terms, setTerms] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="max-w-3xl">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral">AI terms explainer</p>
        <h1 className="mt-3 text-[clamp(2.6rem,5vw,4.2rem)] leading-[0.95]" data-split>Know what you&apos;re signing.</h1>
        <p className="mt-5 text-lg text-ink-2" data-reveal>Paste a rental agreement, house rules or any terms and conditions. We explain each clause in everyday words, flag the ones that could cost you, and answer your questions.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section data-reveal>
          <label htmlFor="terms" className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Your terms</span>
            <span className="font-normal text-muted tabular-nums">{terms.length.toLocaleString()} / 15,000</span>
          </label>
          <textarea id="terms" rows={16} maxLength={15000} value={terms} onChange={(e) => { setTerms(e.target.value); setSubmitted(null); }} className="field mt-2 font-mono text-sm"
            placeholder="Paste the agreement here, or try the sample." />
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setSubmitted(terms)} disabled={terms.trim().length < 20} className="btn-primary">Use these terms</button>
            <button onClick={() => { setTerms(sampleTerms); setSubmitted(sampleTerms); }} className="btn-ghost">Try a sample agreement</button>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3" data-reveal-stagger>
            {[[Bot, "Clause by clause", "Every term rewritten in plain words"], [ShieldAlert, "Risks flagged", "Spot unfair deductions and lock-ins"], [MessageCircleQuestion, "Ask anything", "Follow-up questions, answered"]].map(([I, t, d]) => {
              const Icon = I as typeof Bot;
              return <li key={t as string} className="rounded-2xl border border-line bg-card p-4"><Icon className="h-5 w-5 text-coral" /><p className="mt-2 font-semibold">{t as string}</p><p className="text-sm text-ink-2">{d as string}</p></li>;
            })}
          </ul>
        </section>
        <section>
          {submitted ? <TermsExplainer key={submitted} terms={submitted} redirect="/explain" /> : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-[2rem] border border-dashed border-line p-8 text-center text-ink-2">
              Your plain-language explanation will appear here.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

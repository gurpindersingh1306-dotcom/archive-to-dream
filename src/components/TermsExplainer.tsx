import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Lightbulb, Send, Sparkles } from "lucide-react";
import Link from "@/components/AppLink";
import { useAuth } from "@/lib/auth";
import { askAboutTerms, explainTerms, type TermsExplanation } from "@/lib/terms.functions";

const riskStyle = {
  low: { label: "Standard", cls: "bg-green-soft text-green" },
  medium: { label: "Check this", cls: "bg-amber-soft text-amber" },
  high: { label: "Watch out", cls: "bg-teal-soft text-teal-deep" },
} as const;

const starters = ["When do I get my deposit back?", "Can I leave early?", "What happens if something breaks?"];

export function TermsExplainer({ terms, redirect }: { terms: string; redirect: string }) {
  const { user, ready } = useAuth();
  const explain = useServerFn(explainTerms);
  const ask = useServerFn(askAboutTerms);
  const [result, setResult] = useState<TermsExplanation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);

  const run = async () => {
    setBusy(true); setError("");
    try { setResult(await explain({ data: { terms } })); }
    catch (e) { setError(e instanceof Error ? e.message : "Couldn't explain these terms."); }
    finally { setBusy(false); }
  };

  const send = async (question: string) => {
    const text = question.trim();
    if (!text || thinking) return;
    const history = chat;
    setChat([...history, { role: "user", content: text }]); setQ(""); setThinking(true);
    try {
      const r = await ask({ data: { terms, question: text, history } });
      setChat((c) => [...c, { role: "assistant", content: r.answer }]);
    } catch (e) {
      setChat((c) => [...c, { role: "assistant", content: e instanceof Error ? e.message : "Couldn't answer right now." }]);
    } finally { setThinking(false); }
  };

  if (ready && !user) return (
    <div className="rounded-[1.5rem] bg-ink p-5 text-on-ink">
      <p className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5 text-coral" />Terms explainer</p>
      <p className="mt-1 text-sm text-on-ink/70">Sign in and our AI explains every clause in plain language, flags the risky ones and answers your questions.</p>
      <Link href={`/auth?redirect=${encodeURIComponent(redirect)}`} className="mt-4 inline-flex rounded-full bg-coral px-5 py-2 text-sm font-semibold text-on-ink">Sign in to explain</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {!result && (
        <button onClick={run} disabled={busy || terms.trim().length < 20} className="btn-primary">
          <Sparkles className="h-4 w-4" />{busy ? "Reading every clause" : "Explain in plain language"}
        </button>
      )}
      {busy && (
        <div className="space-y-2" aria-label="Explaining">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone" style={{ animationDelay: `${i * 120}ms` }} />)}
        </div>
      )}
      {error && <p role="alert" className="rounded-2xl bg-teal-soft p-3 text-sm text-teal-deep">{error} <button onClick={run} className="font-semibold underline">Try again</button></p>}

      {result && (
        <>
          <div className="rounded-[1.5rem] bg-ink p-5 text-on-ink">
            <p className="flex items-center gap-2 text-sm font-semibold text-coral"><Bot className="h-4 w-4" />In short</p>
            <p className="mt-2 leading-relaxed">{result.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              {(["high", "medium", "low"] as const).map((r) => {
                const n = result.clauses.filter((c) => c.risk === r).length;
                return n ? <span key={r} className={`rounded-full px-2.5 py-1 ${riskStyle[r].cls}`}>{n} {riskStyle[r].label.toLowerCase()}</span> : null;
              })}
            </div>
          </div>
          <ul className="space-y-3">
            {result.clauses.map((c, i) => (
              <motion.li key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[1.5rem] border border-line bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-lg font-bold">{c.title}</p>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${riskStyle[c.risk].cls}`}>{riskStyle[c.risk].label}</span>
                </div>
                <p className="mt-2 leading-relaxed">{c.plain}</p>
                {c.tip && <p className="mt-3 flex gap-2 rounded-xl bg-paper p-3 text-sm text-ink-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-coral" />{c.tip}</p>}
                <details className="mt-3 text-sm text-muted"><summary className="cursor-pointer select-none hover:text-ink">Original wording</summary><p className="mt-2 italic">&ldquo;{c.original}&rdquo;</p></details>
              </motion.li>
            ))}
          </ul>

          <div className="rounded-[1.5rem] border border-line bg-card p-5">
            <p className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5 text-coral" />Ask about these terms</p>
            <div className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {chat.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "ml-auto bg-ink text-on-ink" : "bg-paper"}`}>{m.content}</motion.div>
                ))}
              </AnimatePresence>
              {thinking && <div className="w-20 animate-pulse rounded-3xl bg-paper px-4 py-2.5 text-sm text-muted">Thinking</div>}
            </div>
            {chat.length === 0 && (
              <div className="mt-2 flex flex-wrap gap-2">{starters.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink">{s}</button>)}</div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); void send(q); }} className="mt-3 flex gap-2">
              <label htmlFor="terms-q" className="sr-only">Your question</label>
              <input id="terms-q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={1000} className="field" placeholder="e.g. Can my friend stay over for a week?" />
              <button aria-label="Ask" disabled={thinking} className="btn-primary !px-4"><Send className="h-4 w-4" /></button>
            </form>
          </div>
          <p className="text-xs text-muted">AI explanations help you understand the terms. They aren&apos;t legal advice, so check anything important with the host or a lawyer.</p>
        </>
      )}
    </div>
  );
}

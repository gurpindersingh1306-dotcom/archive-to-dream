
import Link from "@/components/AppLink";
import { runAI } from "@/lib/ai.functions";
import { LocalityPanel } from "@/components/LocalityPanel";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bus, CheckCircle2, Droplets, MessageCircle, RefreshCw, Send, ShieldCheck, Sparkles, Volume2, X, Zap } from "lucide-react";
import { durations } from "@/lib/quiz";
import { useProfile } from "@/lib/profile";
import { useAllListings } from "@/lib/store";
import { useReviews } from "@/lib/db";
import { useNavigate } from "@tanstack/react-router";
import { Star, FileText } from "lucide-react";
import { TermsExplainer } from "@/components/TermsExplainer";
import { inr, priceFor, scoreListing, type FitKey } from "@/lib/match";
import { TrustRow } from "@/components/ui";
import { CountUp, FitBar, Gallery } from "@/components/visuals";
import type { Duration, Flatmate, Listing, LivedInReport } from "@/lib/types";

const askCopy: Record<FitKey, { button: string; message: string; topic: string }> = {
  rhythm: { button: "Ask about routines", message: "Hi! What does a usual weekday look like in the flat, mornings and nights?", topic: "default" },
  cleanliness: { button: "Ask about dishes", message: "Hi! How do dishes and cleaning usually work in the flat?", topic: "cleanliness" },
  guests: { button: "Ask about guests", message: "Hi! How often do friends come over, and is there a usual time they leave?", topic: "guests" },
  noise: { button: "Ask about noise", message: "Hi! I take calls from home sometimes. How quiet is the flat during the day?", topic: "noise" },
  kitchen: { button: "Ask about the kitchen", message: "Hi! What's okay to cook in the kitchen?", topic: "default" },
  smoking: { button: "Ask about smoking", message: "Hi! What are the house rules on smoking and drinking?", topic: "smoking" },
  pets: { button: "Ask about pets", message: "Hi! Could you tell me about pets in the flat?", topic: "pets" },
  sharing: { button: "Ask about bills", message: "Hi! How do you split groceries and bills?", topic: "default" },
};
const reportIcon: Record<LivedInReport["icon"], typeof Droplets> = { water: Droplets, power: Zap, noise: Volume2, safety: ShieldCheck, commute: Bus };
const householdLabel = { women: "Women-only home", men: "Men-only home", mixed: "Mixed home" };

export function ListingView({ id }: { id: string }) {
  const all = useAllListings();
  const profile = useProfile();
  const l = all?.find((x) => x.id === id);
  const [duration, setDuration] = useState<Duration>("1m");
  const [chat, setChat] = useState<{ open: boolean; draft: string; topic: string }>({ open: false, draft: "", topic: "default" });
  const [ai, setAi] = useState<{ text: string; source: string } | null>(null);
  const [justListed, setJustListed] = useState(false);
  const { reviews } = useReviews(id);
  const nav = useNavigate();

  useEffect(() => { if (profile) setDuration(profile.duration); }, [profile]);
  useEffect(() => { setJustListed(new URLSearchParams(window.location.search).has("new")); }, []);

  useEffect(() => {
    if (!profile || !l) return;
    let live = true;
    const lite = { ...l, photos: undefined } as unknown as Listing;
    runAI({ data: { task: "match-explain", listingId: l.id, listing: lite, profile } })
      .then((d) => live && d.text && setAi(d))
      .catch(() => live && setAi({ text: scoreListing(profile, l).reason, source: "fallback" }));
    return () => { live = false; };
  }, [profile, l]);

  if (!all || !profile) return <main className="mx-auto max-w-6xl px-5 py-16 text-muted">Loading the home</main>;
  if (!l) return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="text-3xl font-semibold">This home isn&apos;t listed anymore</h1>
      <p className="mt-2 text-ink-2">It may have been removed by the host.</p>
      <Link href="/matches" className="mt-6 inline-block rounded-xl bg-ink px-5 py-3 font-medium text-white">See your matches</Link>
    </main>
  );

  const match = scoreListing(profile, l);
  const price = priceFor(l, duration);
  const openChat = (k?: FitKey) => l.hostId ? nav({ to: "/inbox", search: { listing: l.id } }) : setChat({ open: true, draft: k ? askCopy[k].message : "", topic: k ? askCopy[k].topic : "default" });
  const minLabel = durations.find((d) => d.value === l.minStay)?.label;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      {justListed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-3 rounded-xl bg-green-soft p-4 text-green">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm"><span className="font-semibold">Your home is listed.</span> This is what renters see. The fit score uses your own quiz answers, or a sample renter if you haven&apos;t taken it.</p>
          <Link href="/host" className="ml-auto shrink-0 text-sm font-medium underline">Your listings</Link>
        </motion.div>
      )}
      <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Your matches</Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <Gallery listing={l} />
          <div>
            <p className="text-sm text-muted">{l.area}, Bengaluru · {l.kind} · {householdLabel[l.householdType]}</p>
            <h1 className="mt-1 text-4xl sm:text-5xl">{l.title}</h1>
            {l.blurb && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-2">{l.blurb}</p>}
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
              <span className="flex items-center gap-1.5"><Bus className="h-4 w-4 text-muted" aria-hidden="true" />{l.commuteMin} min to {l.commuteTo}</span>
              <span>Hosted by {l.host} since {l.hostSince}</span>
            </p>
          </div>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">How you&apos;d fit here</h2>
              <span className={`font-display text-3xl font-semibold ${match.score >= 80 ? "text-teal" : match.score >= 65 ? "text-ink" : "text-amber"}`}><CountUp to={match.score} suffix="%" /></span>
            </div>
            <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {match.parts.map((part, i) => (
                <li key={part.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-medium">{part.label}</span>
                  <span className={`text-sm ${part.score >= 0.65 ? "text-green" : "text-amber"}`}>{part.note}</span>
                  <FitBar score={part.score} delay={i * 0.05} />
                  {part.score < 0.65 ? (
                    <button onClick={() => openChat(part.key)} className="flex items-center gap-1 whitespace-nowrap rounded-md border border-amber/40 bg-amber-soft px-2 py-1 text-xs font-medium text-amber hover:border-amber">
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />{askCopy[part.key].button}
                    </button>
                  ) : (
                    <button onClick={() => openChat(part.key)} className="text-xs text-muted hover:text-ink">Ask</button>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-paper p-4">
              {ai ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="leading-relaxed text-ink-2">{ai.text}</p>
                  {ai.source !== "fallback" && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />Written by AI from both sides&apos; answers</p>}
                </motion.div>
              ) : (
                <div className="space-y-2" aria-label="Writing a summary"><div className="h-3 w-full animate-pulse rounded bg-line" /><div className="h-3 w-2/3 animate-pulse rounded bg-line" /></div>
              )}
            </div>
          </section>

          {l.flatmates.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Who you&apos;d live with</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">{l.flatmates.map((f) => <FlatmateCard key={f.name} f={f} />)}</div>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-lg font-semibold">House rules</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
                <li>Quiet after {l.rules.quietAfter}</li>
                <li>Guests: {{ rarely: "rarely, with notice", sometimes: "a few times a month", often: "welcome most days" }[l.rules.guests]}</li>
                <li>Kitchen: {{ veg: "vegetarian only", egg: "vegetarian plus eggs", nonveg: "non-veg is fine", any: "anything goes" }[l.rules.food]}</li>
                <li>Smoking: {l.rules.smoking === "no" ? "not allowed" : "balcony only"} · Drinking: {l.rules.drinking ? "fine" : "not allowed"}</li>
                <li>Pets: {l.rules.pets ? "allowed" : "not allowed"}</li>
                {l.rules.other.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-lg font-semibold">Shared spaces</h2>
              <div className="mt-3 flex flex-wrap gap-2">{l.shared.map((s) => <span key={s} className="rounded-md bg-paper px-2.5 py-1 text-sm text-ink-2">{s}</span>)}</div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Lived-in reports</h2>
              {reviews.length > 0 && <span className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-coral text-coral" />{(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)} · {reviews.length}</span>}
            </div>
            {reviews.length || l.reports.length ? (
              <>
                <ul className="mt-4 space-y-3">
                  {reviews.map((r) => { const I = reportIcon[r.topic]; return (
                    <li key={r.id} className="flex gap-3 text-sm text-ink-2"><I className={`mt-0.5 h-4 w-4 shrink-0 ${r.tone === "good" ? "text-green" : "text-amber"}`} aria-hidden="true" /><span>{r.body} <span className="text-xs text-muted">· verified guest, {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span></span></li>
                  ); })}
                  {l.reports.map((r) => { const I = reportIcon[r.icon]; return (
                    <li key={r.label} className="flex gap-3 text-sm text-ink-2"><I className={`mt-0.5 h-4 w-4 shrink-0 ${r.tone === "good" ? "text-green" : "text-amber"}`} aria-hidden="true" />{r.label}</li>
                  ); })}
                </ul>
                <p className="mt-4 text-xs text-muted">Only guests who booked a trial stay can post a report.{l.reports.length ? " Sample reports are marked as demo data." : ""}</p>
              </>
            ) : <p className="mt-3 text-sm text-ink-2">No trial stays yet. Reports appear after the first renter stays here.</p>}
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-coral" /><h2 className="text-lg font-semibold">Terms &amp; conditions</h2></div>
            {l.terms ? (<>
              <details className="mt-3 rounded-2xl bg-paper p-4 text-sm text-ink-2">
                <summary className="cursor-pointer select-none font-semibold text-ink">Read the full terms{!l.hostId ? " (sample agreement)" : ""}</summary>
                <p className="mt-3 whitespace-pre-line leading-relaxed">{l.terms}</p>
              </details>
              <div className="mt-4"><TermsExplainer terms={l.terms} redirect={`/homes/${l.id}`} /></div>
            </>) : <p className="mt-3 text-sm text-ink-2">The host hasn&apos;t added terms yet. Ask for them before you book, then paste them into the <Link href="/explain" className="font-semibold underline">terms explainer</Link>.</p>}
          </section>

          <LocalityPanel area={l.area} />

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold">What&apos;s been checked</h2>
            <div className="mt-4"><TrustRow listing={l} /></div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-line bg-white p-6 shadow-lift">
            <p className="text-sm font-medium text-ink-2">Stay length</p>
            <div className="mt-2 grid grid-cols-4 gap-1 rounded-xl bg-paper p-1" role="radiogroup" aria-label="Stay length">
              {durations.map((d) => (
                <button key={d.value} role="radio" aria-checked={duration === d.value} onClick={() => setDuration(d.value)}
                  className={`rounded-lg px-1 py-2 text-xs font-medium transition ${duration === d.value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{d.label}</button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={duration} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-5">
                <p className="font-display text-3xl font-semibold tabular-nums">{inr(price.total)}</p>
                <p className="text-sm text-muted">{price.unit} · {price.note}</p>
              </motion.div>
            </AnimatePresence>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Long-term rent</dt><dd className="tabular-nums">{inr(l.monthly)}/month</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Deposit if you sign a lease</dt><dd className="tabular-nums">{inr(l.deposit)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Minimum stay</dt><dd>{minLabel}</dd></div>
            </dl>
            {l.trialToLease && <p className="mt-4 flex gap-2 rounded-lg bg-green-soft p-3 text-sm text-green"><RefreshCw className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Like it? Turn your trial into a lease without starting over.</p>}
            {l.byYou ? <p className="mt-5 rounded-2xl bg-paper p-3 text-sm text-ink-2">This is your listing. Requests show up under Trial stays.</p> : <Link href={`/homes/${l.id}/trial`} className="btn-primary mt-5 w-full">Book a trial stay</Link>}
            {!l.byYou && <button onClick={() => openChat()} className="btn-ghost mt-2 w-full">Message the household</button>}
          </div>
        </aside>
      </div>
      <ChatPanel listing={l} state={chat} onClose={() => setChat({ ...chat, open: false })} />
    </main>
  );
}

function summarise(f: Flatmate) {
  const h = f.habits;
  return [
    { office: "Office most days", hybrid: "Hybrid", wfh: "Works from home", night: "Night shifts", student: "Student or intern" }[h.work],
    { early: "Up before 7", mid: "Up by 9", late: "Late riser" }[h.wake],
    { now: "Dishes right away", beforebed: "Dishes before bed", later: "Relaxed about dishes" }[h.dishes],
    { rarely: "Rarely hosts", sometimes: "Hosts sometimes", often: "Hosts often" }[h.guests],
    { quiet: "Likes quiet", some: "Some noise is fine", lively: "Lively" }[h.noise],
    ...(h.pets === "has" ? ["Has a pet"] : []),
    ...(h.smoke === "smokes" ? ["Smokes outside"] : []),
  ];
}

function FlatmateCard({ f }: { f: Flatmate }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-soft font-semibold text-teal-deep">{f.name.replace(/^(Mr\.|Mrs\.)\s*/, "")[0]}</div>
        <div><p className="font-medium">{f.name}{f.age ? `, ${f.age}` : ""}</p><p className="text-sm text-muted">{f.work}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{summarise(f).map((t) => <span key={t} className="rounded-md bg-paper px-2 py-1 text-xs text-ink-2">{t}</span>)}</div>
    </div>
  );
}

type Msg = { from: "you" | "them"; text: string };

function ChatPanel({ listing, state, onClose }: { listing: Listing; state: { open: boolean; draft: string; topic: string }; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (state.open) setDraft(state.draft); }, [state]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "you", text }]);
    setDraft(""); setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { from: "them", text: listing.answers[state.topic] ?? listing.answers.default ?? "Thanks for asking! Let's set up a quick call." }]); }, 1400);
  };
  const who = listing.flatmates.length ? listing.flatmates.map((f) => f.name).join(", ") : listing.host;

  return (
    <AnimatePresence>
      {state.open && (
        <motion.div className="fixed inset-0 z-40 flex justify-end bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside role="dialog" aria-label={`Chat with ${who}`} onClick={(e) => e.stopPropagation()} initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }} className="flex h-full w-full max-w-md flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line p-4">
              <div><p className="font-medium">{who}</p><p className="text-xs text-muted">{listing.title}</p></div>
              <button onClick={onClose} aria-label="Close chat" className="rounded-lg p-2 hover:bg-paper"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.length === 0 && <p className="rounded-lg bg-paper p-3 text-sm text-ink-2">Questions go to the whole household. Your quiz answers are shared only as a fit summary.</p>}
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === "you" ? "ml-auto bg-ink text-white" : "bg-paper text-ink"}`}>{m.text}</motion.div>
              ))}
              {typing && <div className="flex w-16 gap-1 rounded-2xl bg-paper px-4 py-3">{[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />)}</div>}
              <div ref={endRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-line p-4">
              <label htmlFor="msg" className="sr-only">Message</label>
              <input id="msg" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about guests, dishes, commute" className="flex-1 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-teal" />
              <button type="submit" aria-label="Send" className="rounded-xl bg-ink px-3 text-white hover:bg-ink-2"><Send className="h-4 w-4" /></button>
            </form>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

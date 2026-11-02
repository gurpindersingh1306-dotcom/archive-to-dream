
import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/components/AppLink";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ImagePlus, Plus, Trash2, Star, RefreshCw, Bus, Users, UserRound } from "lucide-react";
import { areas, durations, quiz } from "@/lib/quiz";
import { inr } from "@/lib/match";
import { saveHostListing } from "@/lib/store";
import { HomeVisual } from "@/components/visuals";
import type { Duration, Flatmate, Habits, HouseholdType, HouseRules, Listing } from "@/lib/types";

const kinds: Listing["kind"][] = ["Shared flat", "PG room", "Studio", "1BHK", "Room in a family home"];
const households: { value: HouseholdType; label: string }[] = [{ value: "mixed", label: "Mixed" }, { value: "women", label: "Women only" }, { value: "men", label: "Men only" }];
const presetSpaces = ["Kitchen", "Living room", "Balcony", "Terrace", "Washing machine", "Work nook", "Garden", "Gym", "Parking"];
const quietTimes = ["10 pm", "10:30 pm", "11 pm", "midnight"];
const steps = ["The basics", "Pricing", "Photos", "Who lives there", "House rules", "Review"];
const habitShort: Record<keyof Habits, string> = { work: "Weekday", wake: "Up by", sleep: "Lights out", dishes: "Dishes", guests: "Guests", noise: "Noise", food: "Food", smoke: "Smoking and drinking", pets: "Pets", sharing: "Groceries" };
const habitFields = quiz.flatMap((q) => q.rows.map((r) => ({ key: r.key, options: r.options })));
const blankHabits = Object.fromEntries(habitFields.map((f) => [f.key, f.options[0].value])) as Required<Habits>;

async function resizeImage(file: File, max = 1200, quality = 0.78): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally { URL.revokeObjectURL(url); }
}

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-lg border px-3 py-2 text-sm transition ${active ? "border-teal bg-teal-soft text-teal-deep" : "border-line bg-white hover:border-ink/30"}`}>{children}</button>
);
const Field = ({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: string }) => (
    <div><label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-2">{label}</label>{children}{hint && <p className="mt-1 text-xs text-muted">{hint}</p>}</div>
);

export default function NewListing() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    host: "", title: "", area: "HSR Layout", kind: "Shared flat" as Listing["kind"], householdType: "mixed" as HouseholdType, blurb: "",
    commuteTo: "", commuteMin: 20, monthly: 15000, weekly: 4400, depositMonths: 2, minStay: "1w" as Duration, trialToLease: true,
    photos: [] as string[], alone: false, flatmates: [] as Flatmate[], shared: ["Kitchen", "Living room"], otherRules: "",
    rules: { guests: "sometimes", quietAfter: "10:30 pm", food: "any", smoking: "no", drinking: true, pets: false, other: [] } as HouseRules,
  });
  const set = (patch: Partial<typeof f>) => { setF((x) => ({ ...x, ...patch })); setError(""); };
  const setRules = (patch: Partial<HouseRules>) => set({ rules: { ...f.rules, ...patch } });

  const preview: Listing = useMemo(() => ({
    id: `preview-${f.title || "new"}`, title: f.title || "Your listing title", area: f.area, kind: f.kind, householdType: f.householdType,
    weekly: f.weekly, monthly: f.monthly, deposit: f.monthly * f.depositMonths, minStay: f.minStay,
    commuteMin: f.commuteMin, commuteTo: f.commuteTo || "nearby offices", trialToLease: f.trialToLease,
    host: f.host || "You", hostSince: 2026, blurb: f.blurb, photos: f.photos.length ? f.photos : undefined,
    flatmates: f.alone ? [] : f.flatmates, rules: { ...f.rules, other: f.otherRules.split("\n").map((s) => s.trim()).filter(Boolean) },
    shared: f.shared, reports: [], reportCount: 0, trust: { idVerified: false, ownershipDocs: "not-provided", inspected: false },
    answers: { default: "Thanks for your interest! Happy to answer questions or set up a visit." },
  }), [f]);

  const validate = () => {
    if (step === 0) {
      if (f.host.trim().length < 2) return "Add your name as it should appear to renters.";
      if (f.title.trim().length < 8) return "Give the listing a title of at least 8 characters.";
      if (f.area === "Anywhere") return "Choose the area the home is in.";
    }
    if (step === 1 && (f.monthly < 3000 || f.weekly < 500)) return "Enter a monthly rent of at least ₹3,000 and a weekly trial price of at least ₹500.";
    if (step === 3 && !f.alone && f.flatmates.some((m) => !m.name.trim())) return "Add a first name for each flatmate, or remove the empty one.";
    return "";
  };
  const next = () => { const e = validate(); if (e) { setError(e); return; } setStep((s) => Math.min(steps.length - 1, s + 1)); };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const room = 6 - f.photos.length;
      const imgs = await Promise.all(Array.from(files).filter((x) => x.type.startsWith("image/")).slice(0, room).map((x) => resizeImage(x)));
      set({ photos: [...f.photos, ...imgs] });
    } catch { setError("One of those files couldn't be read. Try a JPG or PNG."); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const publish = () => {
    const id = `host-${Date.now().toString(36)}`;
    try {
      saveHostListing({ ...preview, id, host: f.host.trim(), title: f.title.trim() });
      router.push(`/homes/${id}?new=1`);
    } catch {
      setError("Your browser's storage is full. Remove a photo or two and publish again.");
    }
  };

  const input = "w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-teal";

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <button onClick={() => (step === 0 ? router.push("/host") : setStep(step - 1))} aria-label="Back" className="rounded-lg p-2 text-ink-2 hover:bg-white"><ArrowLeft className="h-5 w-5" /></button>
            <ol className="flex flex-1 gap-1">
              {steps.map((s, i) => <li key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-teal" : "bg-line"}`} aria-label={s} />)}
            </ol>
            <span className="text-xs tabular-nums text-muted">{step + 1}/{steps.length}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.section key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="mt-8">
              <h1 className="text-3xl font-semibold">{steps[step]}</h1>

              {step === 0 && (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Your name" htmlFor="host"><input id="host" className={input} value={f.host} onChange={(e) => set({ host: e.target.value })} placeholder="Meera K." /></Field>
                    <Field label="Area" htmlFor="area">
                      <select id="area" className={input} value={f.area} onChange={(e) => set({ area: e.target.value })}>{areas.filter((a) => a !== "Anywhere").map((a) => <option key={a}>{a}</option>)}</select>
                    </Field>
                  </div>
                  <Field label="Listing title" htmlFor="title" hint="Say what makes it special: light, a balcony, the people."><input id="title" className={input} value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="Bright room in a 2BHK share" /></Field>
                  <Field label="What are you listing?"><div className="flex flex-wrap gap-2">{kinds.map((k) => <Chip key={k} active={f.kind === k} onClick={() => set({ kind: k })}>{k}</Chip>)}</div></Field>
                  <Field label="Who can live here?"><div className="flex flex-wrap gap-2">{households.map((h) => <Chip key={h.value} active={f.householdType === h.value} onClick={() => set({ householdType: h.value })}>{h.label}</Chip>)}</div></Field>
                  <Field label="Describe it in one or two sentences" htmlFor="blurb"><textarea id="blurb" rows={3} className={input} value={f.blurb} onChange={(e) => set({ blurb: e.target.value })} placeholder="Corner room with morning light, a balcony full of plants and two calm flatmates." /></Field>
                  <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                    <Field label="Nearest offices or college" htmlFor="ct"><input id="ct" className={input} value={f.commuteTo} onChange={(e) => set({ commuteTo: e.target.value })} placeholder="Outer Ring Road tech parks" /></Field>
                    <Field label="Minutes away" htmlFor="cm"><input id="cm" type="number" min={1} className={input} value={f.commuteMin} onChange={(e) => set({ commuteMin: Number(e.target.value) })} /></Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="mt-6 space-y-6">
                  <Field label="Long-term monthly rent" htmlFor="mr">
                    <div className="flex items-center gap-4">
                      <input id="mr" type="range" min={5000} max={45000} step={500} value={f.monthly} onChange={(e) => set({ monthly: Number(e.target.value) })} className="flex-1" />
                      <span className="w-28 text-right font-display text-2xl font-semibold tabular-nums">{inr(f.monthly)}</span>
                    </div>
                  </Field>
                  <Field label="Weekly trial price" htmlFor="wk" hint={`Suggested: ${inr(Math.round((f.monthly * 0.3) / 100) * 100)}, about 30% of monthly rent. Trials usually cost a little more per day.`}>
                    <div className="flex gap-2">
                      <input id="wk" type="number" min={500} step={100} className={input} value={f.weekly} onChange={(e) => set({ weekly: Number(e.target.value) })} />
                      <button type="button" onClick={() => set({ weekly: Math.round((f.monthly * 0.3) / 100) * 100 })} className="whitespace-nowrap rounded-xl border border-line px-3 text-sm hover:border-ink/30">Use suggested</button>
                    </div>
                  </Field>
                  <Field label="Deposit for a long-term lease" hint={`${inr(f.monthly * f.depositMonths)} at the current rent.`}>
                    <div className="flex gap-2">{[1, 2, 3].map((n) => <Chip key={n} active={f.depositMonths === n} onClick={() => set({ depositMonths: n })}>{n} {n === 1 ? "month" : "months"}</Chip>)}</div>
                  </Field>
                  <Field label="Shortest stay you'll accept"><div className="flex flex-wrap gap-2">{durations.map((d) => <Chip key={d.value} active={f.minStay === d.value} onClick={() => set({ minStay: d.value })}>{d.label}</Chip>)}</div></Field>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-4">
                    <input type="checkbox" checked={f.trialToLease} onChange={(e) => set({ trialToLease: e.target.checked })} className="mt-1 h-4 w-4 accent-teal" />
                    <span><span className="block font-medium">Allow trial stays to become a lease</span><span className="block text-sm text-ink-2">Renters can convert in one tap at the end of their trial. You approve every conversion.</span></span>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6">
                  <p className="text-ink-2">Add up to six photos. The first one is your cover. No photos yet? Renters see an illustration until you add some.</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" id="photos" onChange={(e) => addPhotos(e.target.files)} />
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {f.photos.map((src, i) => (
                      <motion.div key={src.slice(-40) + i} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-0.5 text-xs font-medium text-white">Cover</span>}
                        <div className="absolute right-2 top-2 flex gap-1">
                          {i > 0 && <button type="button" onClick={() => set({ photos: [src, ...f.photos.filter((_, k) => k !== i)] })} aria-label="Make cover photo" className="rounded-md bg-white/90 p-1.5 hover:bg-white"><Star className="h-4 w-4" /></button>}
                          <button type="button" onClick={() => set({ photos: f.photos.filter((_, k) => k !== i) })} aria-label="Remove photo" className="rounded-md bg-white/90 p-1.5 hover:bg-white"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </motion.div>
                    ))}
                    {f.photos.length < 6 && (
                      <label htmlFor="photos" className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-white text-sm text-ink-2 hover:border-teal hover:text-teal">
                        <ImagePlus className="h-6 w-6" aria-hidden="true" />{busy ? "Adding photos" : "Add photos"}
                      </label>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Chip active={!f.alone} onClick={() => set({ alone: false })}>The renter will share with flatmates</Chip>
                    <Chip active={f.alone} onClick={() => set({ alone: true })}>The renter will live alone</Chip>
                  </div>
                  {!f.alone && (
                    <>
                      <p className="text-sm text-ink-2">Answer for each current flatmate, ideally with them. Renters see a short summary, never these answers word for word.</p>
                      {f.flatmates.map((m, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-white p-5">
                          <div className="grid gap-3 sm:grid-cols-[1fr_90px_1.4fr_auto]">
                            <input aria-label="First name" className={input} placeholder="First name" value={m.name} onChange={(e) => set({ flatmates: f.flatmates.map((x, k) => k === i ? { ...x, name: e.target.value } : x) })} />
                            <input aria-label="Age" type="number" className={input} placeholder="Age" value={m.age || ""} onChange={(e) => set({ flatmates: f.flatmates.map((x, k) => k === i ? { ...x, age: Number(e.target.value) } : x) })} />
                            <input aria-label="What they do" className={input} placeholder="What they do" value={m.work} onChange={(e) => set({ flatmates: f.flatmates.map((x, k) => k === i ? { ...x, work: e.target.value } : x) })} />
                            <button type="button" onClick={() => set({ flatmates: f.flatmates.filter((_, k) => k !== i) })} aria-label={`Remove flatmate ${i + 1}`} className="rounded-xl border border-line px-3 text-muted hover:text-red"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {habitFields.map((hf) => (
                              <label key={hf.key} className="text-sm">
                                <span className="mb-1 block text-muted">{habitShort[hf.key]}</span>
                                <select className={input} value={m.habits[hf.key]} onChange={(e) => set({ flatmates: f.flatmates.map((x, k) => k === i ? { ...x, habits: { ...x.habits, [hf.key]: e.target.value } } : x) })}>
                                  {hf.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                      {f.flatmates.length < 4 && (
                        <button type="button" onClick={() => set({ flatmates: [...f.flatmates, { name: "", age: 0, work: "", habits: { ...blankHabits } }] })} className="flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-3 text-sm font-medium text-ink-2 hover:border-teal hover:text-teal">
                          <Plus className="h-4 w-4" aria-hidden="true" />Add a flatmate
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="mt-6 space-y-5">
                  <Field label="Quiet after"><div className="flex flex-wrap gap-2">{quietTimes.map((t) => <Chip key={t} active={f.rules.quietAfter === t} onClick={() => setRules({ quietAfter: t })}>{t}</Chip>)}</div></Field>
                  <Field label="Guests"><div className="flex flex-wrap gap-2">{([["rarely", "Rarely, with notice"], ["sometimes", "A few times a month"], ["often", "Welcome most days"]] as const).map(([v, t]) => <Chip key={v} active={f.rules.guests === v} onClick={() => setRules({ guests: v })}>{t}</Chip>)}</div></Field>
                  <Field label="Kitchen"><div className="flex flex-wrap gap-2">{([["veg", "Vegetarian only"], ["egg", "Veg plus eggs"], ["nonveg", "Non-veg is fine"], ["any", "Anything goes"]] as const).map(([v, t]) => <Chip key={v} active={f.rules.food === v} onClick={() => setRules({ food: v })}>{t}</Chip>)}</div></Field>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Smoking"><div className="flex flex-wrap gap-2"><Chip active={f.rules.smoking === "no"} onClick={() => setRules({ smoking: "no" })}>Not allowed</Chip><Chip active={f.rules.smoking === "balcony"} onClick={() => setRules({ smoking: "balcony" })}>Balcony only</Chip></div></Field>
                    <Field label="Drinking"><div className="flex gap-2"><Chip active={f.rules.drinking} onClick={() => setRules({ drinking: true })}>Fine</Chip><Chip active={!f.rules.drinking} onClick={() => setRules({ drinking: false })}>Not allowed</Chip></div></Field>
                    <Field label="Pets"><div className="flex gap-2"><Chip active={f.rules.pets} onClick={() => setRules({ pets: true })}>Allowed</Chip><Chip active={!f.rules.pets} onClick={() => setRules({ pets: false })}>Not allowed</Chip></div></Field>
                  </div>
                  <Field label="Shared spaces"><div className="flex flex-wrap gap-2">{presetSpaces.map((s) => <Chip key={s} active={f.shared.includes(s)} onClick={() => set({ shared: f.shared.includes(s) ? f.shared.filter((x) => x !== s) : [...f.shared, s] })}>{s}</Chip>)}</div></Field>
                  <Field label="Anything else renters should know" htmlFor="other" hint="One rule per line."><textarea id="other" rows={3} className={input} value={f.otherRules} onChange={(e) => set({ otherRules: e.target.value })} placeholder={"Cleaning rota on the fridge\nGate closes at midnight"} /></Field>
                </div>
              )}

              {step === 5 && (
                <div className="mt-6 space-y-4">
                  <dl className="divide-y divide-line rounded-2xl border border-line bg-white">
                    {[
                      ["Listing", `${f.title} · ${f.kind} in ${f.area}`],
                      ["Pricing", `${inr(f.weekly)}/week trial · ${inr(f.monthly)}/month · ${inr(f.monthly * f.depositMonths)} deposit`],
                      ["Trial to lease", f.trialToLease ? "Allowed, you approve each conversion" : "Not offered"],
                      ["Photos", f.photos.length ? `${f.photos.length} added` : "None yet, illustrations will show"],
                      ["Household", f.alone ? "Renter lives alone" : f.flatmates.length ? f.flatmates.map((m) => m.name).join(", ") : "No flatmates added"],
                      ["Rules", `Quiet after ${f.rules.quietAfter} · Smoking ${f.rules.smoking === "no" ? "not allowed" : "balcony only"} · Pets ${f.rules.pets ? "allowed" : "not allowed"}`],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[120px_1fr] gap-4 p-4 text-sm"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                  <p className="text-sm text-ink-2">Your ID and ownership documents can be added later. Until then, renters see them marked as not provided.</p>
                </div>
              )}

              {error && <p role="alert" className="mt-5 text-sm text-red">{error}</p>}
              <div className="mt-8 flex gap-3">
                {step < steps.length - 1 ? (
                  <button onClick={next} className="rounded-xl bg-ink px-6 py-3 font-medium text-white hover:bg-ink-2">Continue</button>
                ) : (
                  <button onClick={publish} className="rounded-xl bg-teal px-6 py-3 font-medium text-white hover:bg-teal-deep">Publish listing</button>
                )}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-sm font-medium text-ink-2">How renters will see it</p>
            <motion.div layout className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative">
                <HomeVisual listing={preview} className="h-44" />
                {f.trialToLease && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-green"><RefreshCw className="h-3 w-3" aria-hidden="true" />Trial to lease</span>}
              </div>
              <div className="p-5">
                <p className="text-sm text-muted">{f.area} · {f.kind}</p>
                <p className="mt-1 text-lg font-semibold leading-snug">{preview.title}</p>
                <p className="mt-3 text-sm"><span className="font-semibold tabular-nums">{inr(f.weekly)}</span> <span className="text-muted">for 1 week · {inr(f.monthly)}/month long term</span></p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
                  <span className="flex items-center gap-1.5"><Bus className="h-4 w-4 text-muted" aria-hidden="true" />{f.commuteMin} min to {preview.commuteTo}</span>
                  <span className="flex items-center gap-1.5">{f.alone ? <UserRound className="h-4 w-4 text-muted" aria-hidden="true" /> : <Users className="h-4 w-4 text-muted" aria-hidden="true" />}{f.alone ? "Just you" : `${f.flatmates.length} ${f.flatmates.length === 1 ? "flatmate" : "flatmates"}`}</span>
                </div>
                <p className="mt-4 rounded-lg bg-paper p-3 text-sm text-muted">Each renter sees their own fit score and a reason here.</p>
              </div>
            </motion.div>
          </div>
        </aside>
      </div>
    </main>
  );
}

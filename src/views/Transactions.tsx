import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, CalendarRange, Download, FilePlus2, Printer, Receipt, Search, Wallet, X, CircleAlert, ShieldCheck, RotateCcw, Wrench } from "lucide-react";
import { fmtDate, monthly, receiptHtml, statusLabel, summarise, transactionsFor, typeLabel, type Role, type Transaction, type TxStatus, type TxType } from "@/lib/finance";
import { inr } from "@/lib/match";
import { DemoBadge } from "@/components/LocalityMap";

const statusTone: Record<TxStatus, string> = {
  paid: "bg-green-soft text-green", pending: "bg-amber-soft text-amber", overdue: "bg-red/10 text-red", refunded: "bg-teal-soft text-teal-deep",
};
const ranges = [
  { v: "all", label: "All time" }, { v: "30", label: "Last 30 days" }, { v: "90", label: "Last 90 days" }, { v: "custom", label: "Custom" },
] as const;
const TODAY = "2026-11-02";

function daysBefore(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() - days); return d.toISOString().slice(0, 10);
}

export default function TransactionsPage() {
  const [role, setRole] = useState<Role>("tenant");
  const [extra, setExtra] = useState<Record<Role, Transaction[]>>({ tenant: [], landlord: [] });
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [type, setType] = useState<TxType | "all">("all");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [range, setRange] = useState<(typeof ranges)[number]["v"]>("all");
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState(TODAY);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Transaction | null>(null);
  const [creating, setCreating] = useState(false);

  const all = useMemo(() => [...extra[role], ...transactionsFor(role)].map((t) => (paidIds.has(t.id) ? { ...t, status: "paid" as const, method: "UPI · simulated" } : t)), [role, extra, paidIds]);
  const filtered = all.filter((t) => {
    if (type !== "all" && t.type !== type) return false;
    if (status !== "all" && t.status !== status) return false;
    const start = range === "custom" ? from : range === "all" ? "0000" : daysBefore(TODAY, Number(range));
    const end = range === "custom" ? to : "9999";
    if (t.date < start || t.date > end) return false;
    const s = q.trim().toLowerCase();
    return !s || [t.id, t.invoice, t.description, t.counterparty].some((x) => x.toLowerCase().includes(s));
  }).sort((a, b) => b.date.localeCompare(a.date));
  const sum = summarise(all);
  const months = monthly(all);
  const maxNet = Math.max(1, ...months.map((m) => Math.abs(m.net)));

  const download = (t: Transaction) => {
    const blob = new Blob([receiptHtml(t, role)], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${t.invoice}.html`; a.click(); URL.revokeObjectURL(a.href);
  };
  const print = (t: Transaction) => { const w = window.open("", "_blank"); if (w) { w.document.write(receiptHtml(t, role)); w.document.close(); w.print(); } };
  const exportCsv = () => {
    const rows = [["Transaction ID", "Invoice", "Date", "Type", "Description", "Counterparty", "Amount", "Status"], ...filtered.map((t) => [t.id, t.invoice, t.date, typeLabel[t.type], t.description, t.counterparty, String(t.amount), statusLabel[t.status]])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tryout-${role}-transactions.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const cards = role === "tenant"
    ? [
        { label: "Paid so far", value: sum.settled, icon: Wallet, tone: "text-ink" },
        { label: "Outstanding dues", value: sum.outstanding, icon: CircleAlert, tone: "text-amber", sub: sum.overdue ? `${inr(sum.overdue)} overdue` : "Nothing overdue" },
        { label: "Deposit in escrow", value: sum.deposits, icon: ShieldCheck, tone: "text-teal" },
        { label: "Refunds received", value: sum.refunds, icon: RotateCcw, tone: "text-green" },
      ]
    : [
        { label: "Rent & charges received", value: sum.settled - sum.expenses, icon: ArrowDownLeft, tone: "text-green" },
        { label: "Due from tenants", value: sum.outstanding, icon: CircleAlert, tone: "text-amber", sub: sum.overdue ? `${inr(sum.overdue)} overdue` : "Nothing overdue" },
        { label: "Deposits held", value: sum.deposits, icon: ShieldCheck, tone: "text-teal" },
        { label: "Repair expenses", value: sum.expenses, icon: Wrench, tone: "text-ink" },
      ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted"><Receipt className="h-4 w-4" aria-hidden="true" />Transactions & invoices <DemoBadge text="Simulated payments" /></p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{role === "tenant" ? "Your rent and payments" : "Income across your homes"}</h1>
          <p className="mt-1 text-ink-2">{role === "tenant" ? "Riya S. · Bright room in a 2BHK share, HSR Layout" : "Meera K. · 2 homes, 2 tenants"}</p>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 ring-1 ring-line" role="tablist" aria-label="View as">
          {(["tenant", "landlord"] as const).map((r) => (
            <button key={r} role="tab" aria-selected={role === r} onClick={() => { setRole(r); setOpen(null); }}
              className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition ${role === r ? "bg-ink text-white" : "text-ink-2 hover:bg-paper"}`}>{r} view</button>
          ))}
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.label + role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between text-sm text-muted">{c.label}<c.icon className={`h-4 w-4 ${c.tone}`} aria-hidden="true" /></div>
            <p className={`mt-2 font-display text-2xl font-semibold tabular-nums ${c.tone}`}>{inr(c.value)}</p>
            {c.sub && <p className="mt-1 text-xs text-muted">{c.sub}</p>}
          </motion.div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold">Monthly summary</h2>
          <p className="text-sm text-muted">Net {role === "tenant" ? "paid out" : "received"} per month, settled transactions only</p>
          <div className="mt-6 flex h-44 items-end gap-4">
            {months.map((m) => {
              const v = role === "tenant" ? -m.net : m.net;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs tabular-nums text-ink-2">{inr(v)}</span>
                  <motion.div className={`w-full max-w-14 rounded-t-lg ${v >= 0 ? "bg-teal" : "bg-amber"}`} initial={{ height: 0 }} animate={{ height: `${Math.max(6, (Math.abs(m.net) / maxNet) * 120)}px` }} transition={{ duration: 0.6 }} />
                  <span className="text-xs text-muted">{fmtDate(m.month + "-01").split(" ").slice(1).join(" ")}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold">Upcoming & outstanding</h2>
          <ul className="mt-4 space-y-2">
            {all.filter((t) => t.status === "pending" || t.status === "overdue").map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl bg-paper p-3">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.description}</p><p className="text-xs text-muted">Due {fmtDate(t.due)} · <span className={t.status === "overdue" ? "text-red" : ""}>{statusLabel[t.status]}</span></p></div>
                <span className="text-sm font-semibold tabular-nums">{inr(t.amount)}</span>
                {role === "tenant"
                  ? <button onClick={() => setPaidIds((s) => new Set(s).add(t.id))} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-2">Pay</button>
                  : <button onClick={() => setOpen(t)} className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium hover:border-ink/30">Remind</button>}
              </li>
            ))}
            {!all.some((t) => t.status === "pending" || t.status === "overdue") && <li className="rounded-xl bg-green-soft p-3 text-sm text-green">All settled. Nothing due right now.</li>}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, invoice or description" aria-label="Search transactions" className="w-full rounded-lg border border-line py-2 pl-9 pr-3 text-sm" />
          </div>
          <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value as TxType | "all")} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
            <option value="all">All types</option>{(Object.keys(typeLabel) as TxType[]).map((k) => <option key={k} value={k}>{typeLabel[k]}</option>)}
          </select>
          <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as TxStatus | "all")} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
            <option value="all">All statuses</option>{(Object.keys(statusLabel) as TxStatus[]).map((k) => <option key={k} value={k}>{statusLabel[k]}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-muted" aria-hidden="true" />
            <select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
              {ranges.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
            </select>
          </div>
          {range === "custom" && (
            <div className="flex items-center gap-2 text-sm">
              <input type="date" aria-label="From" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-line px-2 py-1.5" />
              <span className="text-muted">to</span>
              <input type="date" aria-label="To" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-line px-2 py-1.5" />
            </div>
          )}
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium hover:border-ink/30"><Download className="h-4 w-4" aria-hidden="true" />Export CSV</button>
          {role === "landlord" && <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-ink-2"><FilePlus2 className="h-4 w-4" aria-hidden="true" />New invoice</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Transaction ID</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Amount</th><th className="px-4 py-3" />
            </tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => setOpen(t)} className="cursor-pointer border-b border-line/60 transition hover:bg-paper">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-2">{fmtDate(t.date)}</td>
                  <td className="px-4 py-3"><p className="font-medium">{t.description}</p><p className="text-xs text-muted">{t.counterparty}</p></td>
                  <td className="px-4 py-3 text-ink-2">{typeLabel[t.type]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-2">{t.id}</td>
                  <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-medium ${statusTone[t.status]}`}>{statusLabel[t.status]}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                    <span className="inline-flex items-center gap-1">{t.direction === "in" ? <ArrowDownLeft className="h-3.5 w-3.5 text-green" aria-label="Incoming" /> : <ArrowUpRight className="h-3.5 w-3.5 text-muted" aria-label="Outgoing" />}{inr(t.amount)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); download(t); }} aria-label={`Download ${t.invoice}`} className="rounded-lg p-2 text-ink-2 hover:bg-white hover:text-ink"><Download className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-2">No transactions match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-xs text-muted">{filtered.length} of {all.length} transactions · Simulated data, no real money moves in this demo</p>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 flex justify-end bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.aside role="dialog" aria-label={`Invoice ${open.invoice}`} onClick={(e) => e.stopPropagation()} initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white">
              <div className="flex items-center justify-between border-b border-line p-5">
                <div><p className="text-xs text-muted">Invoice</p><p className="font-mono font-semibold">{open.invoice}</p></div>
                <button onClick={() => setOpen(null)} aria-label="Close" className="rounded-lg p-2 hover:bg-paper"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 p-5">
                <div className="rounded-2xl border border-line bg-paper p-5">
                  <div className="flex items-center justify-between"><span className="font-display text-lg font-semibold">Tryout</span><span className={`rounded-md px-2 py-1 text-xs font-medium ${statusTone[open.status]}`}>{statusLabel[open.status]}</span></div>
                  <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{inr(open.amount)}</p>
                  <p className="text-sm text-ink-2">{open.description}</p>
                  <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                    {[["Transaction ID", open.id], ["Issued", fmtDate(open.date)], ["Due", fmtDate(open.due)], ["Type", typeLabel[open.type]], ["Property", open.property], [role === "tenant" ? "Paid to" : "Billed to", open.counterparty], ["Method", open.method ?? "Not paid yet"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
                    ))}
                  </dl>
                </div>
                <p className="mt-3 text-xs text-muted">Simulated document for demonstration. Not a tax invoice.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-line p-5">
                <button onClick={() => download(open)} className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-medium text-white hover:bg-ink-2"><Download className="h-4 w-4" aria-hidden="true" />Download</button>
                <button onClick={() => print(open)} className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium hover:border-ink/30"><Printer className="h-4 w-4" aria-hidden="true" />Print</button>
                {role === "tenant" && (open.status === "pending" || open.status === "overdue") && (
                  <button onClick={() => { setPaidIds((s) => new Set(s).add(open.id)); setOpen(null); }} className="col-span-2 rounded-xl bg-teal py-3 text-sm font-medium text-white hover:bg-teal-deep">Pay {inr(open.amount)} (simulated)</button>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creating && <NewInvoice onClose={() => setCreating(false)} onCreate={(t) => { setExtra((e) => ({ ...e, landlord: [t, ...e.landlord] })); setCreating(false); setOpen(t); }} count={extra.landlord.length} />}
      </AnimatePresence>
    </main>
  );
}

function NewInvoice({ onClose, onCreate, count }: { onClose: () => void; onCreate: (t: Transaction) => void; count: number }) {
  const [type, setType] = useState<TxType>("maintenance");
  const [description, setDescription] = useState("Plumbing repair, kitchen sink");
  const [amount, setAmount] = useState(1500);
  const [due, setDue] = useState("2026-11-10");
  const [tenant, setTenant] = useState("Riya S.");
  const submit = () => {
    const n = 10500 + count;
    onCreate({ id: `TXN-26-${n}`, invoice: `INV-26-${n}`, date: TODAY, due, type, description, amount, status: "pending", direction: "in", counterparty: tenant,
      property: tenant === "Riya S." ? "Bright room in a 2BHK share, HSR Layout" : "Furnished 1BHK near ITPL, Whitefield" });
  };
  const field = "mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm";
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form role="dialog" aria-label="New invoice" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); submit(); }}
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">New invoice</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-paper"><X className="h-5 w-5" /></button></div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">Tenant<select value={tenant} onChange={(e) => setTenant(e.target.value)} className={field}><option>Riya S.</option><option>Arjun M.</option></select></label>
          <label className="block text-sm font-medium">Type<select value={type} onChange={(e) => setType(e.target.value as TxType)} className={field}>{(["rent", "maintenance", "utility", "additional"] as TxType[]).map((k) => <option key={k} value={k}>{typeLabel[k]}</option>)}</select></label>
          <label className="block text-sm font-medium">Description<input required value={description} onChange={(e) => setDescription(e.target.value)} className={field} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">Amount (₹)<input required type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={field} /></label>
            <label className="block text-sm font-medium">Due date<input required type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} /></label>
          </div>
        </div>
        <button type="submit" className="mt-6 w-full rounded-xl bg-ink py-3 font-medium text-white hover:bg-ink-2">Create invoice</button>
        <p className="mt-2 text-center text-xs text-muted">Simulated. Invoices are kept for this session only.</p>
      </motion.form>
    </motion.div>
  );
}

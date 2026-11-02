// Transactions and invoices. SIMULATED DATA: no real payments are processed.

export type Role = "tenant" | "landlord";
export type TxType = "rent" | "deposit" | "refund" | "maintenance" | "utility" | "additional" | "repair";
export type TxStatus = "paid" | "pending" | "overdue" | "refunded";

export interface Transaction {
  id: string;
  invoice: string;
  date: string; // ISO yyyy-mm-dd
  due: string;
  type: TxType;
  description: string;
  property: string;
  counterparty: string;
  amount: number;
  status: TxStatus;
  method?: string;
  direction: "in" | "out"; // from the viewer's perspective
}

export const typeLabel: Record<TxType, string> = {
  rent: "Rent", deposit: "Security deposit", refund: "Refund", maintenance: "Maintenance", utility: "Utility bill", additional: "Additional charge", repair: "Repair expense",
};
export const statusLabel: Record<TxStatus, string> = { paid: "Paid", pending: "Pending", overdue: "Overdue", refunded: "Refunded" };

const P1 = "Bright room in a 2BHK share, HSR Layout";
const P2 = "Furnished 1BHK near ITPL, Whitefield";

type Seed = Omit<Transaction, "invoice" | "direction"> & { roles: Role[] };
const seed: Seed[] = [
  { id: "TXN-26-10482", date: "2026-11-01", due: "2026-11-05", type: "rent", description: "Rent for November 2026", property: P1, counterparty: "Riya S.", amount: 14500, status: "pending", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10477", date: "2026-10-28", due: "2026-11-05", type: "utility", description: "Electricity (BESCOM) for October, split 1/3", property: P1, counterparty: "Riya S.", amount: 1240, status: "pending", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10451", date: "2026-10-20", due: "2026-10-25", type: "maintenance", description: "Society maintenance, Q4", property: P1, counterparty: "Riya S.", amount: 1800, status: "overdue", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10402", date: "2026-10-03", due: "2026-10-05", type: "rent", description: "Rent for October 2026", property: P1, counterparty: "Riya S.", amount: 14500, status: "paid", method: "UPI · ref 6283910442", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10390", date: "2026-09-29", due: "2026-10-05", type: "utility", description: "Water tanker top-up, September", property: P1, counterparty: "Riya S.", amount: 650, status: "paid", method: "UPI · ref 6271183027", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10355", date: "2026-09-18", due: "2026-09-18", type: "repair", description: "Geyser thermostat replaced", property: P1, counterparty: "Ramesh Plumbing Works", amount: 2300, status: "paid", method: "Bank transfer", roles: ["landlord"] },
  { id: "TXN-26-10321", date: "2026-09-04", due: "2026-09-05", type: "rent", description: "Rent for September 2026", property: P1, counterparty: "Riya S.", amount: 14500, status: "paid", method: "UPI · ref 6233817720", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10298", date: "2026-08-30", due: "2026-08-30", type: "additional", description: "Extra key and access card", property: P1, counterparty: "Riya S.", amount: 500, status: "paid", method: "Card ·· 4421", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10280", date: "2026-08-25", due: "2026-08-25", type: "deposit", description: "Security deposit (2 months, held in escrow)", property: P1, counterparty: "Riya S.", amount: 29000, status: "paid", method: "Bank transfer", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10276", date: "2026-08-18", due: "2026-08-18", type: "rent", description: "Trial stay, 1 week", property: P1, counterparty: "Riya S.", amount: 4100, status: "paid", method: "UPI · ref 6198273311", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10240", date: "2026-08-10", due: "2026-08-10", type: "refund", description: "Trial deposit returned after move-in inspection", property: P1, counterparty: "Riya S.", amount: 3000, status: "refunded", method: "Original payment method", roles: ["tenant", "landlord"] },
  { id: "TXN-26-10466", date: "2026-10-25", due: "2026-11-01", type: "rent", description: "Rent for November 2026", property: P2, counterparty: "Arjun M.", amount: 22000, status: "paid", method: "NEFT", roles: ["landlord"] },
  { id: "TXN-26-10410", date: "2026-10-01", due: "2026-10-01", type: "rent", description: "Rent for October 2026", property: P2, counterparty: "Arjun M.", amount: 22000, status: "paid", method: "NEFT", roles: ["landlord"] },
  { id: "TXN-26-10372", date: "2026-09-22", due: "2026-09-22", type: "repair", description: "AC servicing, 2 units", property: P2, counterparty: "CoolAir Services", amount: 1800, status: "paid", method: "UPI", roles: ["landlord"] },
  { id: "TXN-26-10330", date: "2026-09-01", due: "2026-09-01", type: "rent", description: "Rent for September 2026", property: P2, counterparty: "Arjun M.", amount: 22000, status: "paid", method: "NEFT", roles: ["landlord"] },
];

export function transactionsFor(role: Role): Transaction[] {
  return seed.filter((s) => s.roles.includes(role)).map(({ roles: _r, ...t }) => ({
    ...t,
    invoice: t.id.replace("TXN", "INV"),
    counterparty: role === "tenant" ? (t.type === "repair" ? t.counterparty : "Meera K. (landlord)") : t.counterparty,
    // Tenants pay out (refunds come in); landlords receive (refunds and repairs go out).
    direction: role === "tenant" ? (t.type === "refund" ? "in" : "out") : t.type === "refund" || t.type === "repair" ? "out" : "in",
  }));
}

export function summarise(txs: Transaction[]) {
  const sum = (f: (t: Transaction) => boolean) => txs.filter(f).reduce((a, t) => a + t.amount, 0);
  return {
    settled: sum((t) => t.status === "paid" && t.type !== "deposit"),
    outstanding: sum((t) => t.status === "pending" || t.status === "overdue"),
    overdue: sum((t) => t.status === "overdue"),
    deposits: sum((t) => t.type === "deposit" && t.status === "paid"),
    refunds: sum((t) => t.status === "refunded"),
    expenses: sum((t) => t.type === "repair"),
  };
}

export function monthly(txs: Transaction[]) {
  const map = new Map<string, number>();
  txs.filter((t) => t.status === "paid" || t.status === "refunded").forEach((t) => {
    const k = t.date.slice(0, 7);
    map.set(k, (map.get(k) ?? 0) + (t.direction === "in" ? t.amount : -t.amount));
  });
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, net]) => ({ month, net }));
}

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(m ?? 1) - 1]} ${y}`;
}

export function receiptHtml(t: Transaction, role: Role) {
  const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${t.invoice}</title>
<style>body{font-family:system-ui,sans-serif;color:#13223a;max-width:640px;margin:40px auto;padding:0 20px}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:8px 0;border-bottom:1px solid #e1e4de}td:last-child{text-align:right}.muted{color:#657084;font-size:13px}.total{font-size:20px;font-weight:700}.demo{background:#fbefdc;color:#a8550a;padding:6px 10px;border-radius:6px;font-size:12px;display:inline-block}</style></head>
<body><p class="demo">Simulated receipt for demonstration. Not a tax invoice.</p><h1>LeaseIt ${t.status === "paid" || t.status === "refunded" ? "receipt" : "invoice"} ${t.invoice}</h1>
<p class="muted">Transaction ${t.id} · Issued ${fmtDate(t.date)} · Due ${fmtDate(t.due)}</p>
<table><tr><td>Property</td><td>${t.property}</td></tr><tr><td>${role === "tenant" ? "Paid to" : "Billed to"}</td><td>${t.counterparty}</td></tr>
<tr><td>Type</td><td>${typeLabel[t.type]}</td></tr><tr><td>Description</td><td>${t.description}</td></tr>
<tr><td>Status</td><td>${statusLabel[t.status]}</td></tr><tr><td>Payment method</td><td>${t.method ?? "Not paid yet"}</td></tr>
<tr><td class="total">Amount</td><td class="total">${inr(t.amount)}</td></tr></table>
<p class="muted" style="margin-top:24px">LeaseIt · Live it first, Lease it later.</p></body></html>`;
}

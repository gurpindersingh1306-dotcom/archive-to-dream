import { useState } from "react";
import Link from "@/components/AppLink";
import {
  BedDouble, Building2, Clock, Coffee, Drumstick, Headphones, Moon, MoonStar, Music, PartyPopper,
  Salad, Sparkles, Speaker, Sun, Sunrise, UserRound, UsersRound, UtensilsCrossed, Laptop, House, GraduationCap,
  Hourglass, Egg, Ban, Wine, Cigarette, PawPrint, Heart, Users, Scale, Wallet,
  BadgeCheck, FileText, ClipboardCheck, CircleAlert, Menu, X,
} from "lucide-react";
import type { Listing } from "@/lib/types";

export function TrialThread({ className = "" }: { className?: string }) {
  // The brand motif: a dashed line (trial) that turns solid (lease).
  return (
    <svg viewBox="0 0 120 12" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="6" x2="58" y2="6" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="60" y1="6" x2="108" y2="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="114" cy="6" r="4" fill="currentColor" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
      <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="var(--color-ink)" />
        <line x1="7" y1="14" x2="13" y2="14" stroke="#9fd8cf" strokeWidth="2.4" strokeDasharray="2.4 2.4" />
        <line x1="14" y1="14" x2="21" y2="14" stroke="#fff" strokeWidth="2.4" />
      </svg>
      Tryout
    </Link>
  );
}

const navLinks = [
  { href: "/matches", label: "Your matches" },
  { href: "/locality", label: "Locality" },
  { href: "/transactions", label: "Payments" },
  { href: "/host", label: "List your home" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-ink-2 hover:bg-white [&.active]:bg-white [&.active]:font-medium [&.active]:text-ink">{l.label}</Link>
          ))}
          <Link href="/start" className="ml-1 rounded-lg bg-ink px-4 py-2 font-medium text-white hover:bg-ink-2">Find a home</Link>
        </nav>
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu" className="rounded-lg p-2 text-ink hover:bg-white md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper px-5 pb-4 pt-2 md:hidden" aria-label="Mobile">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-ink-2 hover:bg-white">{l.label}</Link>
          ))}
          <Link href="/start" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-ink px-4 py-3 text-center font-medium text-white">Find a home</Link>
        </nav>
      )}
    </header>
  );
}

const quizIcons = { Sunrise, Sun, Coffee, Moon, BedDouble, Clock, MoonStar, Sparkles, UserRound, UsersRound, PartyPopper, Headphones, Music, Speaker, Salad, Drumstick, UtensilsCrossed, Laptop, House, GraduationCap, Hourglass, Egg, Ban, Wine, Cigarette, PawPrint, Heart, Users, Scale, Wallet, Building2 };
export function QuizIcon({ name, className }: { name: string; className?: string }) {
  const I = quizIcons[name as keyof typeof quizIcons] ?? Sparkles;
  return <I className={className} aria-hidden="true" />;
}

export function MatchPill({ score }: { score: number }) {
  const tone = score >= 80 ? "bg-teal text-white" : score >= 65 ? "bg-teal-soft text-teal-deep" : "bg-amber-soft text-amber";
  return <span className={`rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${tone}`}>{score}% fit</span>;
}

export function TrustRow({ listing }: { listing: Listing }) {
  const items = [
    listing.trust.idVerified
      ? { icon: BadgeCheck, text: "Host ID verified", cls: "text-green" }
      : { icon: CircleAlert, text: "Host ID not verified yet", cls: "text-amber" },
    listing.trust.ownershipDocs === "owner-submitted"
      ? { icon: FileText, text: "Ownership documents submitted by owner, not independently verified", cls: "text-ink-2" }
      : { icon: CircleAlert, text: "Ownership documents not provided", cls: "text-amber" },
    listing.trust.inspected
      ? { icon: ClipboardCheck, text: "Condition recorded at the last trial move-in", cls: "text-green" }
      : { icon: ClipboardCheck, text: "No move-in inspection on record yet", cls: "text-muted" },
  ];
  return (
    <ul className="space-y-2.5">
      {items.map(({ icon: I, text, cls }) => (
        <li key={text} className="flex gap-2.5 text-sm text-ink-2">
          <I className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  );
}

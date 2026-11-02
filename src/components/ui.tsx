import { useState } from "react";
import Link from "@/components/AppLink";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, displayName } from "@/lib/auth";
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

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${light ? "text-on-ink" : "text-ink"}`}>
      <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden="true">
        <rect width="28" height="28" rx="14" fill="var(--color-coral)" />
        <line x1="7" y1="14" x2="13" y2="14" stroke="var(--color-on-ink)" strokeWidth="2.4" strokeDasharray="2.4 2.4" />
        <line x1="14" y1="14" x2="21" y2="14" stroke="var(--color-on-ink)" strokeWidth="2.4" />
      </svg>
      <span>Lease<span className="text-coral">It</span></span>
    </Link>
  );
}

const navLinks = [
  { href: "/matches", label: "Matches" },
  { href: "/locality", label: "Locality" },
  { href: "/bookings", label: "Stays" },
  { href: "/host", label: "Host" },
];

function Avatar({ name, url, size = 8 }: { name: string; url?: string | null; size?: number }) {
  const cls = size === 8 ? "h-8 w-8 text-sm" : "h-10 w-10";
  return url
    ? <img src={url} alt="" className={`${cls} rounded-full object-cover`} />
    : <span className={`${cls} flex items-center justify-center rounded-full bg-coral font-semibold text-on-ink`}>{(name || "?")[0]?.toUpperCase()}</span>;
}
export { Avatar };

export function Nav() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { user, profile, ready, signOut } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const out = async () => {
    setMenu(false); setOpen(false);
    await qc.cancelQueries(); qc.clear();
    await signOut();
    nav({ to: "/auth", replace: true });
  };
  const name = displayName(profile, user?.email ?? "");
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 font-medium text-ink-2 transition hover:text-ink [&.active]:bg-ink [&.active]:text-on-ink">{l.label}</Link>
          ))}
          {ready && (user ? (
            <div className="relative ml-2">
              <button onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-label="Account menu" className="flex items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3 hover:border-ink">
                <Avatar name={name} url={profile?.avatar_url} />
                <span className="max-w-28 truncate font-medium">{name.split(" ")[0]}</span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-lift" onMouseLeave={() => setMenu(false)}>
                  {[["/account", "Account"], ["/bookings", "Trial stays"], ["/inbox", "Messages"], ["/transactions", "Payments"], ["/host", "Your listings"]].map(([h, t]) => (
                    <Link key={h} href={h!} onClick={() => setMenu(false)} className="block rounded-xl px-3 py-2 hover:bg-paper">{t}</Link>
                  ))}
                  <button onClick={out} className="mt-1 w-full rounded-xl px-3 py-2 text-left text-red hover:bg-paper">Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth" className="ml-2 rounded-full px-3.5 py-2 font-medium text-ink hover:bg-stone">Sign in</Link>
              <Link href="/start" className="btn-primary !px-4 !py-2">Find a home</Link>
            </>
          ))}
        </nav>
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu" className="rounded-full p-2 text-ink hover:bg-stone md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper px-5 pb-4 pt-2 md:hidden" aria-label="Mobile">
          {[...navLinks, ...(user ? [{ href: "/inbox", label: "Messages" }, { href: "/transactions", label: "Payments" }, { href: "/account", label: "Account" }] : [])].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-medium text-ink-2 hover:bg-stone">{l.label}</Link>
          ))}
          {user
            ? <button onClick={out} className="mt-2 w-full rounded-full border border-ink py-3 font-medium">Sign out</button>
            : <Link href="/auth" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">Sign in</Link>}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-on-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-on-ink/70">Live it first, Lease it later. Trial stays for interns, students and new joiners in Bengaluru.</p>
        </div>
        <div className="text-sm">
          <p className="font-display font-bold">Renters</p>
          <ul className="mt-3 space-y-2 text-on-ink/70">
            <li><Link href="/start" className="hover:text-coral">Find your fit</Link></li>
            <li><Link href="/matches" className="hover:text-coral">Your matches</Link></li>
            <li><Link href="/locality" className="hover:text-coral">Locality data</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-display font-bold">Hosts</p>
          <ul className="mt-3 space-y-2 text-on-ink/70">
            <li><Link href="/host" className="hover:text-coral">List your home</Link></li>
            <li><Link href="/bookings" className="hover:text-coral">Trial requests</Link></li>
            <li><Link href="/transactions" className="hover:text-coral">Payments</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-on-ink/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-on-ink/50">© 2026 LeaseIt · Sample homes are marked as samples. Payments are simulated, no real money moves.</p>
      </div>
    </footer>
  );
}

const quizIcons = { Sunrise, Sun, Coffee, Moon, BedDouble, Clock, MoonStar, Sparkles, UserRound, UsersRound, PartyPopper, Headphones, Music, Speaker, Salad, Drumstick, UtensilsCrossed, Laptop, House, GraduationCap, Hourglass, Egg, Ban, Wine, Cigarette, PawPrint, Heart, Users, Scale, Wallet, Building2 };
export function QuizIcon({ name, className }: { name: string; className?: string }) {
  const I = quizIcons[name as keyof typeof quizIcons] ?? Sparkles;
  return <I className={className} aria-hidden="true" />;
}

export function MatchPill({ score }: { score: number }) {
  const tone = score >= 80 ? "bg-coral text-on-ink" : score >= 65 ? "bg-teal-soft text-teal-deep" : "bg-amber-soft text-amber";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${tone}`}>{score}% fit</span>;
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

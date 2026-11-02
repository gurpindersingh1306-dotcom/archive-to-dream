import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { sendMessage, useMessages, useNames, type Message } from "@/lib/db";
import { useAllListings } from "@/lib/store";
import { Avatar } from "@/components/ui";

type Search = { listing?: string; renter?: string };

export const Route = createFileRoute("/_authenticated/inbox")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    listing: typeof s.listing === "string" ? s.listing : undefined,
    renter: typeof s.renter === "string" ? s.renter : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages | Tryout" },
      { name: "description", content: "Conversations between renters and hosts." },
      { property: "og:title", content: "Messages | Tryout" },
      { property: "og:description", content: "Conversations between renters and hosts." },
    ],
  }),
  component: Inbox,
});

type Thread = { key: string; listing_id: string; renter_id: string; host_id: string; last: Message | null; msgs: Message[] };

function Inbox() {
  const search = Route.useSearch();
  const { user } = useAuth();
  const { messages, refresh } = useMessages();
  const listings = useAllListings();
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const threads = useMemo(() => {
    const map = new Map<string, Thread>();
    (messages ?? []).forEach((m) => {
      const key = `${m.listing_id}|${m.renter_id}`;
      const t = map.get(key) ?? { key, listing_id: m.listing_id, renter_id: m.renter_id, host_id: m.host_id, last: null, msgs: [] };
      t.msgs.push(m); t.last = m; map.set(key, t);
    });
    // Opening from a booking or listing starts an empty thread.
    if (search.listing && listings && user) {
      const l = listings.find((x) => x.id === search.listing);
      const renter = search.renter ?? user.id;
      const key = `${search.listing}|${renter}`;
      if (l?.hostId && !map.has(key)) map.set(key, { key, listing_id: l.id, renter_id: renter, host_id: l.hostId, last: null, msgs: [] });
    }
    return [...map.values()].sort((a, b) => (b.last?.created_at ?? "9").localeCompare(a.last?.created_at ?? "9"));
  }, [messages, search, listings, user]);

  useEffect(() => {
    if (search.listing) setActive(`${search.listing}|${search.renter ?? user?.id}`);
    else if (!active && threads[0]) setActive(threads[0].key);
  }, [search, threads, active, user]);

  const names = useNames(threads.flatMap((t) => [t.renter_id, t.host_id]));
  const cur = threads.find((t) => t.key === active);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [cur?.msgs.length]);
  const title = (id: string) => listings?.find((l) => l.id === id)?.title ?? "Home";
  const otherId = (t: Thread) => (t.renter_id === user?.id ? t.host_id : t.renter_id);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cur || !draft.trim()) return;
    try { await sendMessage({ listing_id: cur.listing_id, renter_id: cur.renter_id, host_id: cur.host_id, body: draft.trim() }); setDraft(""); refresh(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't send"); }
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-5xl" data-reveal>Messages</h1>
      <div className="mt-8 grid min-h-[520px] overflow-hidden rounded-[2rem] border border-line bg-card md:grid-cols-[300px_1fr]">
        <ul className="border-b border-line md:border-b-0 md:border-r">
          {threads.length === 0 && <li className="p-6 text-sm text-ink-2">No conversations yet. Open a home and tap &ldquo;Message the household&rdquo;.</li>}
          {threads.map((t) => {
            const o = names[otherId(t)];
            return (
              <li key={t.key}>
                <button onClick={() => setActive(t.key)} className={`flex w-full items-center gap-3 p-4 text-left transition ${active === t.key ? "bg-paper" : "hover:bg-paper/60"}`}>
                  <Avatar name={o?.full_name ?? "?"} url={o?.avatar_url} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{o?.full_name || "Tryout member"}</span>
                    <span className="block truncate text-xs text-muted">{title(t.listing_id)}</span>
                    {t.last && <span className="block truncate text-sm text-ink-2">{t.last.body}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <section className="flex min-h-[520px] flex-col">
          {cur ? (<>
            <div className="border-b border-line p-4">
              <p className="font-semibold">{names[otherId(cur)]?.full_name || "Tryout member"}</p>
              <p className="text-xs text-muted">{title(cur.listing_id)} · {cur.host_id === user?.id ? "You're the host" : "You're the renter"}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cur.msgs.length === 0 && <p className="rounded-2xl bg-paper p-3 text-sm text-ink-2">Say hello. Ask about routines, guests or the commute.</p>}
              {cur.msgs.map((m) => (
                <div key={m.id} className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${m.sender_id === user?.id ? "ml-auto bg-ink text-on-ink" : "bg-paper"}`}>
                  {m.body}
                  <span className={`mt-1 block text-[10px] ${m.sender_id === user?.id ? "text-on-ink/50" : "text-muted"}`}>{new Date(m.created_at).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" })}</span>
                </div>
              ))}
              <div ref={end} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-line p-4">
              <label htmlFor="msg" className="sr-only">Message</label>
              <input id="msg" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} className="field" placeholder="Write a message" />
              <button aria-label="Send" className="btn-primary !px-4"><Send className="h-4 w-4" /></button>
            </form>
          </>) : <p className="m-auto text-muted">Pick a conversation</p>}
        </section>
      </div>
    </main>
  );
}

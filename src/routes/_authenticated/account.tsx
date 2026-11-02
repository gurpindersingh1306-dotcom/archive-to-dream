import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Home, KeyRound } from "lucide-react";
import Link from "@/components/AppLink";
import { supabase } from "@/integrations/supabase/client";
import { displayName, uploadImage, useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { durations } from "@/lib/quiz";
import { inr } from "@/lib/match";
import { Avatar } from "@/components/ui";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your account | Tryout" },
      { name: "description", content: "Manage your name, photo, hosting and saved answers." },
      { property: "og:title", content: "Your account | Tryout" },
      { property: "og:description", content: "Manage your Tryout account." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, profile, isHost, refresh } = useAuth();
  const answers = useProfile();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => { setName(profile?.full_name ?? ""); }, [profile]);
  if (!user) return null;

  const save = async (patch: { full_name?: string; avatar_url?: string }) => {
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) throw error;
    await refresh();
  };
  const onName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Name must be at least 2 characters");
    try { await save({ full_name: name.trim() }); toast.success("Saved"); } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
  };
  const onPhoto = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Choose an image file");
    setBusy(true);
    try { const url = await uploadImage("avatars", user.id, f, f.name.replace(/[^\w.]/g, "")); await save({ avatar_url: url }); toast.success("Photo updated"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Upload failed"); }
    finally { setBusy(false); }
  };
  const host = async () => {
    const { error } = await supabase.rpc("become_host");
    if (error) return toast.error(error.message);
    await refresh(); toast.success("You can now list homes");
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-5xl" data-reveal>Your account</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="rounded-[2rem] border border-line bg-card p-6 text-center" data-reveal>
          <div className="relative mx-auto h-28 w-28">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-28 w-28 rounded-full object-cover" />
              : <span className="flex h-28 w-28 items-center justify-center rounded-full bg-coral font-display text-4xl font-bold text-on-ink">{displayName(profile, user.email ?? "?")[0]?.toUpperCase()}</span>}
            <button onClick={() => file.current?.click()} aria-label="Change photo" className="absolute bottom-0 right-0 rounded-full bg-ink p-2.5 text-on-ink hover:bg-coral"><Camera className="h-4 w-4" /></button>
            <input ref={file} type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </div>
          {busy && <p className="mt-2 text-xs text-muted">Uploading</p>}
          <p className="mt-4 font-display text-xl font-bold">{displayName(profile, "")}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <div className="mt-3 flex justify-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-stone px-3 py-1">Renter</span>
            {isHost && <span className="rounded-full bg-coral px-3 py-1 text-on-ink">Host</span>}
          </div>
        </div>

        <div className="space-y-6" data-reveal-stagger>
          <form onSubmit={onName} className="rounded-[2rem] border border-line bg-card p-6">
            <h2 className="text-xl">Profile</h2>
            <label className="mt-4 block text-sm font-medium">Name shown to hosts and flatmates<input value={name} onChange={(e) => setName(e.target.value)} className="field mt-1.5" /></label>
            <button className="btn-primary mt-4 !py-2">Save</button>
          </form>

          <div className="rounded-[2rem] border border-line bg-card p-6">
            <div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-coral" /><h2 className="text-xl">Your living answers</h2></div>
            {answers && !answers.isDemo ? (
              <p className="mt-2 text-ink-2">{durations.find((d) => d.value === answers.duration)?.label} · {answers.area} · around {inr(answers.budget)} a month. Saved to your account, so your matches follow you on any device.</p>
            ) : <p className="mt-2 text-ink-2">You haven&apos;t answered the quiz yet. It takes two minutes.</p>}
            <Link href="/start" className="btn-ghost mt-4 !py-2">{answers && !answers.isDemo ? "Edit answers" : "Take the quiz"}</Link>
          </div>

          <div className="rounded-[2rem] bg-ink p-6 text-on-ink">
            <div className="flex items-center gap-2"><Home className="h-5 w-5 text-coral" /><h2 className="text-xl">Hosting</h2></div>
            {isHost ? (<>
              <p className="mt-2 text-on-ink/70">You can list homes and accept trial stays.</p>
              <Link href="/host" className="mt-4 inline-flex rounded-full bg-coral px-5 py-2 font-semibold text-on-ink">Your listings</Link>
            </>) : (<>
              <p className="mt-2 text-on-ink/70">Have a room or a flat? Turn on hosting to list it.</p>
              <button onClick={host} className="mt-4 rounded-full bg-coral px-5 py-2 font-semibold text-on-ink">Start hosting</button>
            </>)}
          </div>
        </div>
      </div>
    </main>
  );
}

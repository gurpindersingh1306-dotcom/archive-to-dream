import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Home, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

type Search = { redirect?: string; mode?: "signin" | "signup" };

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/matches");

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: s.mode === "signup" ? "signup" : s.mode === "signin" ? "signin" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in | Tryout" },
      { name: "description", content: "Sign in or create a Tryout account to book trial stays, list your home and keep your matches." },
      { property: "og:title", content: "Sign in | Tryout" },
      { property: "og:description", content: "Book trial stays, list your home and keep your matches in one account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const nav = useNavigate();
  const { user, ready } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode ?? "signin");
  const [role, setRole] = useState<"renter" | "host">("renter");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const target = safePath(search.redirect);

  useEffect(() => {
    if (ready && user) nav({ to: target, replace: true });
  }, [ready, user, target, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Add your name so hosts and flatmates know who you are.");
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + target, data: { full_name: name.trim(), role } },
        });
        if (error) throw error;
        setSent("Check your inbox to confirm your email, then sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  };

  const google = async () => {
    try { sessionStorage.setItem("tryout-after-auth", target); } catch {}
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in didn't finish. Please try again.");
  };

  useEffect(() => {
    if (!user) return;
    try { const t = sessionStorage.getItem("tryout-after-auth"); if (t) { sessionStorage.removeItem("tryout-after-auth"); nav({ to: safePath(t), replace: true }); } } catch {}
  }, [user, nav]);

  return (
    <main className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
      <div className="hidden md:block" data-reveal>
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral">Tryout account</p>
        <h1 className="mt-4 text-6xl leading-[0.95]">Your next home, without the guesswork.</h1>
        <ul className="mt-8 space-y-4 text-ink-2">
          <li className="flex gap-3"><KeyRound className="h-5 w-5 shrink-0 text-coral" />Book trial stays and keep every receipt in one place</li>
          <li className="flex gap-3"><Home className="h-5 w-5 shrink-0 text-coral" />List a room and accept renters you've met</li>
          <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-coral" />Message hosts and households directly</li>
        </ul>
      </div>

      <div className="rounded-[2rem] border border-line bg-card p-7 shadow-lift sm:p-9" data-reveal>
        {sent ? (
          <div className="py-8 text-center">
            <Mail className="mx-auto h-10 w-10 text-coral" />
            <h2 className="mt-4 text-2xl">Check your email</h2>
            <p className="mt-2 text-ink-2">{sent}</p>
            <button onClick={() => { setSent(null); setMode("signin"); }} className="btn-ghost mt-6">Back to sign in</button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl">{mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset your password"}</h2>
            <p className="mt-1 text-sm text-ink-2">
              {mode === "signin" ? "Good to see you again." : mode === "signup" ? "Takes less than a minute." : "We'll email you a link."}
            </p>

            {mode !== "forgot" && (
              <>
                <button type="button" onClick={google} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-line bg-card py-3 font-semibold transition hover:border-ink">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
                  Continue with Google
                </button>
                <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or with email<span className="h-px flex-1 bg-line" /></div>
              </>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-2 rounded-full bg-paper p-1" role="radiogroup" aria-label="I want to">
                    {(["renter", "host"] as const).map((r) => (
                      <button key={r} type="button" role="radio" aria-checked={role === r} onClick={() => setRole(r)}
                        className={`rounded-full py-2 text-sm font-semibold transition ${role === r ? "bg-ink text-on-ink" : "text-ink-2"}`}>
                        {r === "renter" ? "Find a home" : "List my home"}
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm font-medium">Your name<input required value={name} onChange={(e) => setName(e.target.value)} className="field mt-1.5" placeholder="Riya Sharma" autoComplete="name" /></label>
                </>
              )}
              <label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5" placeholder="you@example.com" autoComplete="email" /></label>
              {mode !== "forgot" && (
                <label className="block text-sm font-medium">Password<input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1.5" autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
              )}
              {mode === "signin" && <button type="button" onClick={() => setMode("forgot")} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">Forgot password?</button>}
              <button disabled={busy} className="btn-primary w-full">{busy ? "Please wait" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}</button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-2">
              {mode === "signin" ? <>New to Tryout? <button onClick={() => setMode("signup")} className="font-semibold text-ink underline underline-offset-4">Create an account</button></>
                : <>Already have an account? <button onClick={() => setMode("signin")} className="font-semibold text-ink underline underline-offset-4">Sign in</button></>}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

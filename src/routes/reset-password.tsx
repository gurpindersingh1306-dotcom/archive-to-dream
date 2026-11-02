import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | Tryout" },
      { name: "description", content: "Choose a new password for your Tryout account." },
      { property: "og:title", content: "Set a new password | Tryout" },
      { property: "og:description", content: "Choose a new password for your Tryout account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setOk(true);
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY") setOk(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/matches" });
  };

  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <div className="rounded-[2rem] border border-line bg-card p-8 shadow-lift">
        <h1 className="text-3xl">Set a new password</h1>
        {ok ? (
          <form onSubmit={save} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">New password<input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1.5" autoComplete="new-password" /></label>
            <button disabled={busy} className="btn-primary w-full">{busy ? "Saving" : "Save password"}</button>
          </form>
        ) : (
          <p className="mt-3 text-ink-2">Open this page from the reset link in your email. Links expire after a while, so request a new one from the sign-in page if needed.</p>
        )}
      </div>
    </main>
  );
}

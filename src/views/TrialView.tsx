
import Link from "@/components/AppLink";
import { useAllListings } from "@/lib/store";
import { TrialThread } from "@/components/ui";

export function TrialView({ id }: { id: string }) {
  const all = useAllListings();
  const l = all?.find((x) => x.id === id);
  if (!all) return null;
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <TrialThread className="mx-auto h-3 w-40 text-teal" />
      <h1 className="mt-6 text-3xl font-semibold">Trial booking{l ? ` for ${l.title}` : ""}</h1>
      <p className="mt-3 text-ink-2">Booking, the move-in inspection and the lease conversion are the next part of the build.</p>
      <Link href={l ? `/homes/${l.id}` : "/matches"} className="mt-8 inline-block rounded-xl border border-line bg-white px-5 py-3 font-medium hover:border-ink/30">{l ? "Back to the listing" : "See your matches"}</Link>
    </main>
  );
}

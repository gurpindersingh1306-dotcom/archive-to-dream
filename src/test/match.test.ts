import { describe, expect, it } from "vitest";
import { demoProfile, listings } from "@/lib/data";
import { rankListings, trustFor } from "@/lib/match";

describe("matches", () => {
  it("has many distinct sample homes", () => {
    expect(listings.length).toBeGreaterThanOrEqual(45);
    expect(new Set(listings.map((l) => l.id)).size).toBe(listings.length);
  });

  it("gives different top 3 for different renters", () => {
    const night = { ...demoProfile, area: "Anywhere", budget: 14000, gender: "man" as const, habits: { ...demoProfile.habits, work: "night" as const, wake: "late" as const, sleep: "after1" as const } };
    const a = rankListings(demoProfile, listings).slice(0, 3).map((m) => m.listing.id);
    const b = rankListings(night, listings).slice(0, 3).map((m) => m.listing.id);
    expect(a).not.toEqual(b);
  });

  it("flags homes over budget and without ownership papers", () => {
    const l = listings.find((x) => x.trust.ownershipDocs === "not-provided")!;
    const t = trustFor({ ...demoProfile, budget: l.monthly - 1000 }, l);
    expect(t.checks[0]).toEqual({ label: "₹1,000 over budget", ok: false });
    expect(t.checks.find((c) => c.label === "Ownership papers checked")?.ok).toBe(false);
  });
});

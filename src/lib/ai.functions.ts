import { createServerFn } from "@tanstack/react-start";
import { getListing } from "./data";
import { scoreListing } from "./match";
import type { Listing, Profile } from "./types";

type Input = { task: string; listingId?: string; listing?: Listing; profile?: Profile };

// Replaces the old POST /api/ai route. The Gemini key stays on the server.
export const runAI = createServerFn({ method: "POST" })
  .validator((d: Input) => d)
  .handler(async ({ data: body }) => {
    const { askAI } = await import("./ai");
    if (body.task !== "match-explain") throw new Error("Unknown task");
    const listing = (body.listingId ? getListing(body.listingId) : undefined) ?? body.listing;
    const profile = body.profile;
    if (!listing || !profile) throw new Error("Unknown listing or profile");

    const match = scoreListing(profile, listing);
    const household = listing.flatmates.length
      ? listing.flatmates.map((f) => `${f.name} (${f.work}): ${JSON.stringify(f.habits)}`).join("\n")
      : "No flatmates. House rules: " + JSON.stringify(listing.rules);

    const prompt = `Renter habits: ${JSON.stringify(profile.habits)}
Home: ${listing.title}, ${listing.area}. House rules: ${JSON.stringify(listing.rules)}.
Household:
${household}
Fit scores (0-1): ${match.parts.map((p) => `${p.label} ${p.score.toFixed(2)}`).join(", ")}

Write 2 short sentences for the renter: what will feel easy living here, and the one thing worth asking about before booking. Mention flatmates by first name. No scores, no numbers.`;

    return askAI(prompt, {
      system:
        "You help renters in India judge whether they will live well with a household. Warm, plain, honest. Never mention religion, caste or region.",
      fallback: match.reason,
      maxTokens: 160,
    });
  });

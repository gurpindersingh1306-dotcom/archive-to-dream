<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- tsconfig keeps noUncheckedIndexedAccess/exactOptionalPropertyTypes/noPropertyAccessFromIndexSignature off: the migrated Tryout code was written without them.
- Locality (src/lib/locality.ts) and finance (src/lib/finance.ts) data are deterministic simulated demo data; swap for real sources behind the same functions.
- Data lives in Lovable Cloud: listings (jsonb `data` + photo links), bookings, transactions, reviews, messages, profiles, renter_preferences, user_roles. Sample homes in src/lib/data.ts stay in code and are merged after real listings; bookings on them (no host) auto-confirm via a DB trigger.
- Booking status changes, invoice creation on acceptance and "pay" are enforced by DB triggers/RPCs (bookings_before_update, bookings_after_change, pay_transaction), not client code: keeps renters and hosts from editing each other's records.
- Storage buckets are private (workspace blocks public buckets); uploads store a 10-year signed URL via uploadImage in src/lib/auth.tsx.
- Signed-in pages live under src/routes/_authenticated (client-only gate redirecting to /auth); auth state comes from AuthProvider/useAuth in src/lib/auth.tsx.
- Scroll motion is global: useScrollMotion (src/lib/motion.ts) animates elements with data-reveal, data-reveal-stagger, data-parallax, data-split (static text only) and data-count.


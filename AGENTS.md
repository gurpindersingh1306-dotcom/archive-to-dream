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

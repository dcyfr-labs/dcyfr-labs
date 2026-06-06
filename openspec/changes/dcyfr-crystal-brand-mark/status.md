<!-- TLP:AMBER - Internal Use Only -->

# Status: DCYFR Crystal Brand-Mark

**Change:** [dcyfr-crystal-brand-mark](./proposal.md) · **Opened:** 2026-06-05 · **Migrated here:** 2026-06-05
**Status:** **GRADUATED — vectors authored + wired (gated). Awaiting brand-owner (Drew) approval before any production cutover.**

> Status of record (not the `tasks.md` checkboxes).

| Piece | State | Notes |
|-------|-------|-------|
| Exploration + lane decision | **done** | EVOLVE ratified 2026-06-05 (Drew). 10 gpt-image-1.5 renders. [findings](./exploration-findings.md). |
| Owned faceted vector (dark/light) | **done** | `src/assets/brand/dcyfr-mark-crystal-{dark,light}.svg`; same silhouette, 8 facets, 3-tone pinwheel. Render + reduction verified. |
| Flat / mono / favicon mark | **done (unchanged)** | Favicon stays the flat silhouette (faceting muddies ≤32px). `dcyfr-mark-flat.svg`. |
| Lockups | **done** | mark + DCYFR (Alegreya); horizontal + stacked; dark/light/mono. Wordmark outline = production step. |
| Wiring (logo-config / CrystalMark / OG / tokens) | **done (gated)** | See [design-decisions.md](./design-decisions.md) §5. Behind Drew's approval — must not merge to prod. |
| Brand-owner approval | **PENDING** | The gate. No favicon/OG/token cutover until approved. |
| Preview-deploy QA of OG (Satori) | **pending** | Verify the 96px crystal renders on a Vercel preview before promotion. |

## Decisions log

- **2026-06-05** — Exploration run (Rei, worktree `vibrant-merkle-3009b1`); two findings:
  (1) no 3D render survives favicon scale → flat-primary + crystal-hero architecture;
  (2) faceting the sparkle keeps the AI cliché → crystal *treatment* is the win. Rei
  recommended *replace → faceted "D"*; final lane deferred to Drew.
- **2026-06-05** — **Drew ratified EVOLVE** (keep the four-point sparkle, crystallize it)
  — brand continuity over differentiation.
- **2026-06-05** — **Graduation (this change).** Hand-authored the owned faceted vector
  (reusing the exact `LOGO_PATH` silhouette, 8 facets, 3-tone pinwheel), light + mono
  derivations, and mark+wordmark lockups; reduction test re-confirmed favicon = flat;
  migrated the change from rei-workspace into `dcyfr-labs/dcyfr-labs/openspec/changes/`
  and wired `logo-config.ts` / `<CrystalMark>` / OG / `design-tokens.ts` (gated). Opened
  a **draft/gated PR** — must not merge to production until Drew approves the vector.

## Notes

- The homepage hero (dcyfr-labs#695) is brand **art**, not this mark change.
- Governance gate honored: this mark change references the completed exploration
  ([specs/dcyfr-brand-mark/spec.md](./specs/dcyfr-brand-mark/spec.md)). On approval +
  merge, promote the spec delta to `openspec/specs/dcyfr-brand-mark/`.

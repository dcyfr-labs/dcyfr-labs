<!-- TLP:AMBER - Internal Use Only -->

# Tasks: DCYFR Crystal Brand-Mark

> Status of record is [status.md](./status.md); decisions in [design-decisions.md](./design-decisions.md).

## 0. Decide the question

- [x] keep the sparkle vs differentiate → rendered side by side
- [x] **evolve vs replace → DECIDED 2026-06-05: EVOLVE** (Drew)

## 1. Explore (imagegen)

- [x] Mark-only variations (A1–A7), app-icon reductions, flat derivations (F1–F3)
- [x] Evaluate vs open questions; recommend a lane

## 2. Productionize (this change)

- [x] Hand-author an **owned vector** of the faceted sparkle — dark + light surface
      (`src/assets/brand/dcyfr-mark-crystal-{dark,light}.svg`; same silhouette, 8 facets)
- [x] Flat single-colour / mono derivation (`dcyfr-mark-flat.svg`) — **= favicon**
- [x] Decide favicon: **flat silhouette, not faceted** (reduction test) — resolved
- [x] Lockups (mark + DCYFR wordmark), horizontal + stacked, light/dark/mono
- [x] Owned generator + source of truth (`scripts/brand/build-crystal-mark.mjs`,
      `logo-config.ts` facet constants)
- [x] Migrate the change into `dcyfr-labs/dcyfr-labs/openspec/changes/`
- [x] Wire `design-tokens.ts` (`BRAND_MARK`), `<CrystalMark>`, OG card — **gated**
- [x] Favicon / apple-icon: intentionally **unchanged** (flat)

## 3. Approval gate (blocked on Drew)

- [ ] **Brand-owner approves the authored vector** (gate — nothing ships to prod before this)
- [ ] QA the OG card on a Vercel preview deploy (Satori multi-path render)
- [ ] On approval: outline lockup wordmark; adopt `<CrystalMark>` in chosen large-logo
      placements; promote spec delta to `openspec/specs/dcyfr-brand-mark/`
- [ ] (Optional/deferred) motion study; per-brand-site rollout

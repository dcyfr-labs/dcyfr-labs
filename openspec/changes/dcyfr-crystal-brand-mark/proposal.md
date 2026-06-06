<!-- TLP:AMBER - Internal Use Only -->

# Proposal: DCYFR Crystal Brand-Mark

**Change ID:** `dcyfr-crystal-brand-mark`
**Information Classification:** TLP:AMBER (Limited Distribution)
**Date opened:** 2026-06-05 (exploration) · **Migrated here:** 2026-06-05 (graduation)
**Status:** **Graduated — vectors authored, awaiting brand-owner approval before production cutover.**
**Owner:** Drew (brand).
**Origin:** Grew out of the Rei imagegen exploration in `~/Code` (rei-workspace),
branches `docs/crystal-brand-mark-change` + `claude/vibrant-merkle-3009b1` (commits
b2ab055, 9975b5b, 692cb61). Migrated into this repo because **the brand mark belongs to
dcyfr-labs**. Production decisions: [design-decisions.md](./design-decisions.md).

---

## Why

During the 2026-06-05 imagegen sessions, rendering the current DCYFR mark — a
four-pointed "sparkle"/shine glyph (`LOGO_PATH`) — as a **faceted, luminous crystal**
(Final Fantasy "Crystal" inspiration) produced unexpectedly strong, on-brand results.
The homepage hero now uses a crystal-sanctum render (dcyfr-labs#695, **brand art, not a
mark change**). That raised a real brand question:

> Should the DCYFR **identity** evolve toward the crystal — and if so, how far?

The exploration answered it. **Decision (ratified 2026-06-05, Drew): EVOLVE** — keep the
four-point sparkle silhouette, adopt a flat crystal-facet treatment. Not a replacement,
not the "D" monogram.

## What this delivers

- **Owned, hand-authored faceted vector** of the sparkle (dark + light surface) — same
  silhouette, divided into 8 flat facets. Not an AI render (trademark cleanliness).
- **Flat silhouette** retained for favicon / small / mono / print (the faceting blurs
  below ~32px — reduction test).
- **Lockups** — mark + DCYFR wordmark, horizontal + stacked, light/dark/mono.
- **Wiring** (gated) — `logo-config.ts` (facet geometry), `<CrystalMark>` component,
  `design-tokens.ts` (`BRAND_MARK`), and the OG card. Favicon intentionally unchanged.

## Open questions — resolved

1. **Keep the four-pointed sparkle?** → **Yes (evolve).** Brand continuity over
   differentiation (Drew, over Rei's *replace→D* recommendation).
2. **2D flat vs 3D rendered primary?** → **Flat primary + crystal-facet treatment;** the
   luminous 3D render stays hero/marketing only.
3. **Evolve vs replace?** → **Evolve.**
4. **Legibility/reproduction?** → Favicon = flat silhouette (faceting muddies ≤32px).
5. **AI vs hand-crafted?** → **Hand-authored owned vector** (this change). AI renders are
   reference only.

## Out of scope / gated

No favicon/OG/`design-tokens.ts` cutover ships to production until **Drew approves the
authored vector**. The wiring exists in this change's PR but must not merge to prod
before approval. The homepage hero render (dcyfr-labs#695) is brand art, not this mark.

## References

- Current logo source of truth: `src/lib/logo-config.ts` (`LOGO_PATH`).
- Owned assets: `src/assets/brand/` (built by `scripts/brand/build-crystal-mark.mjs`).
- Exploration record: [exploration-findings.md](./exploration-findings.md).
- Governance gate: [specs/dcyfr-brand-mark/spec.md](./specs/dcyfr-brand-mark/spec.md).

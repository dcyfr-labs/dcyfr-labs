<!-- TLP:AMBER - Internal Use Only -->

# Design Decisions: DCYFR Crystal Brand-Mark (graduation)

**Session:** 2026-06-05 · Graduates the exploration ([exploration-findings.md](./exploration-findings.md))
to production design. Decision of record: **EVOLVE** (Drew, 2026-06-05).

> All assets are authored and wired but **gated**: nothing ships to favicon / OG /
> tokens in production until Drew approves the authored vector.

## 1. Geometry — keep the exact silhouette, facet the inside

The faceted mark **reuses the exact existing `LOGO_PATH` silhouette** (verified
pixel-faithful to `~/Documents/DCYFR Labs/assets/logo/svg-icon.svg`). The outline is
divided into **8 flat facets — 2 per arm** — by straight internal seams:

- 4 **spines**: center (50,50) → each tip (N/E/S/W).
- 4 **seams**: center → each valley. A valley is the 45° midpoint of an existing edge,
  at `(68.89, 31.29)` (NE) and its mirrors — taken exactly from the `LOGO_PATH` bezier
  segment joins, so no new outer geometry is introduced.

The outer edges keep the sparkle's **soft concave curves**; only the internal seams are
straight. Rationale:

- **Maximal continuity / zero favicon risk** — the silhouette is byte-identical to
  today's mark, so the favicon and small uses are unchanged.
- **Perfect mark↔favicon coherence** — the favicon is the exact flat shadow of the
  faceted mark.
- **A deliberate differentiator** — the AI reference (E1/E2) used a *slimmer, sharp
  straight-edged* star. We kept DCYFR's authentic fuller, soft-curved silhouette. The
  AI render's proportions were treated as reference only. This both honors "evolve =
  continuity" and reads less like the generic sharp AI sparkle.

## 2. Facet colouring — 3-tone pinwheel

A clean, reproducible, 4-fold-friendly scheme (not a literal copy of the inconsistent
AI renders). Light halves `{TL, RT, BR, LB}` catch the highlight; the vertical-arm dark
halves `{TR, BL}` carry the bright crystal accent.

| | highlight (4) | accent (TR, BL) | mid/shadow (RB, LT) | underlay |
|---|---|---|---|---|
| **dark** surface | white `#f9fafb` | cyan `#38bdf8` | electric blue `#2563eb` | blue |
| **light** surface | electric blue `#2563eb` | sky `#0ea5e9` | navy `#020617` | navy |

A full-silhouette `base` underlay hides anti-alias hairlines between facets. All values
are the dcyfr identity palette (deep navy + electric blue/cyan — **never purple**).

## 3. Favicon — stays the FLAT silhouette (open question resolved)

Reduction test on the authored vectors: the faceted mark is crisp at 512/64px, **muddy
at 32px, an unreadable blob at 16px**; the flat silhouette stays clean at every size.

**Decision: the favicon does NOT take faceting — it stays the plain flat silhouette.**
The faceted ("crystal") mark is a **≥64px-only** treatment (large logo, OG/social,
hero). This is encoded in `logo-config.ts`, `design-tokens.ts` (`BRAND_MARK`), and the
component docs.

## 4. Lockups

Mark + **DCYFR** wordmark in **Alegreya SemiBold** (the brand logo face, `--font-serif`),
horizontal + stacked, each in dark / light / mono. Metrics measured against the live
font (DCYFR = 250px @70, 167px @46). Lockup SVGs use live `<text>`; **production should
outline the wordmark to paths** (font-independent). The mark itself is already pure
outlined vector.

## 5. What was wired (gated — do not merge to prod before approval)

| Surface | Change |
|---|---|
| `src/lib/logo-config.ts` | + `CRYSTAL_FACET_PATHS`, `CRYSTAL_FACET_ORDER`, `CRYSTAL_MARK_COLORS`, `CRYSTAL_MARK_SCHEME` (owned geometry + scheme; source of truth) |
| `src/components/common/crystal-mark.tsx` | new `<CrystalMark surface>` (DOM + Satori-safe inline SVG) |
| `src/app/opengraph-image.tsx` | OG card brand header now renders the faceted crystal @96px; footer sparkle stays **flat** |
| `src/lib/design-tokens.ts` | + `BRAND_MARK` identity-colour tokens + the size rule |
| `src/assets/brand/*.svg` | 9 owned assets (marks + lockups) via `scripts/brand/build-crystal-mark.mjs` |
| `src/app/icon*.tsx`, `apple-icon*.tsx` | **UNCHANGED** — favicon intentionally stays flat |

## 6. Provenance (open-Q5 — trademark cleanliness)

The production mark is a **hand-authored owned vector** derived deterministically from
DCYFR's own `LOGO_PATH`. No pixels originate from an AI render — the gpt-image-1.5
renders (E1/E2) were directional reference only. Reproducible from
`scripts/brand/build-crystal-mark.mjs`.

## 7. Open items for the approval session

- Brand-owner sign-off on the authored vector (the gate).
- Verify the OG card renders correctly on a Vercel **preview deploy** (Satori multi-path
  + the 96px crystal) before any production promotion.
- On approval: outline the lockup wordmark to paths; decide large-logo placements
  (nav/hero) that should adopt `<CrystalMark>`; then promote the spec delta to
  `openspec/specs/dcyfr-brand-mark/`.
- Optional follow-ups deferred: motion study (rotating/refracting crystal), per-brand-site
  (`dcyfr-{bot,work,…}`) rollout.

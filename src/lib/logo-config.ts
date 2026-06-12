/**
 * Logo Configuration
 *
 * Centralized configuration for the site's logo SVG.
 * This is the single source of truth for the logo path data.
 * All icon generation routes and the Logo component should reference this.
 */

/**
 * The SVG path data for the sparkle/star logo
 *
 * This path is used across:
 * - Logo component (/src/components/logo.tsx)
 * - Favicon generation (/src/app/icon.tsx, /src/app/icon-dark.tsx)
 * - Apple icon generation (/src/app/apple-icon.tsx, /src/app/apple-icon-dark.tsx)
 * - Social preview images (/src/app/opengraph-image.tsx, /src/app/twitter-image.tsx)
 */
export const LOGO_PATH =
  'M 100 51.397411 C 91.768944 54.80574 85.209213 57.873196 80.320602 60.599865 C 75.431992 63.32653 71.623482 66.030434 68.894951 68.711655 C 66.211899 71.392883 63.506153 75.164703 60.777626 80.027267 C 58.049099 84.889832 54.934074 91.547333 51.432468 100 L 48.635742 100 C 45.088661 91.547333 41.950901 84.889832 39.222374 80.027267 C 36.493847 75.164703 33.810837 71.392883 31.17326 68.711655 C 28.444733 66.030434 24.636229 63.32653 19.747612 60.599865 C 14.859005 57.873196 8.27653 54.80574 -0 51.397411 L -0 48.602589 C 8.322005 45.19426 14.927217 42.126804 19.815825 39.400135 C 24.704441 36.67347 28.490208 33.969566 31.17326 31.288345 C 33.810837 28.607117 36.493847 24.835297 39.222374 19.972733 C 41.950901 15.110176 45.088661 8.452667 48.635742 0 L 51.432468 0 C 54.934074 8.452667 58.049099 15.110176 60.777626 19.972733 C 63.506153 24.835297 66.211899 28.607117 68.894951 31.288345 C 71.532532 33.969566 75.29557 36.67347 80.184174 39.400135 C 85.072792 42.126804 91.677994 45.19426 100 48.602589 Z';

export const LOGO_VIEWBOX = '0 0 100 100';

/**
 * Logo configuration for different contexts
 */
export const LOGO_CONFIG = {
  /** SVG path data */
  path: LOGO_PATH,

  /** ViewBox for SVG rendering */
  viewBox: LOGO_VIEWBOX,

  /** Default dimensions for the Logo component */
  defaultSize: 24,

  /** Recommended sizes for different contexts */
  sizes: {
    /** Small icons, UI elements */
    small: 16,
    /** Navigation, inline text */
    medium: 20,
    /** Headers, prominent placement */
    large: 28,
    /** Extra large for hero sections and main headers **/
    xlarge: 48,
    /** Hero sections */
    hero: 48,
  },
} as const;

// ============================================================================
// CRYSTAL BRAND-MARK (faceted treatment)
// ============================================================================
/**
 * The "evolve" crystal-facet treatment of the sparkle (ratified 2026-06-05).
 *
 * Same silhouette as {@link LOGO_PATH} — NOT a replacement — divided into 8 flat
 * facets (2 per arm) by straight internal seams (4 spines center->tip, 4 seams
 * center->valley, where each valley is the 45deg midpoint of an existing edge).
 * The outer edges keep the sparkle's soft concave curves; the crystal read comes
 * from the straight spines + the flat-tone facet split.
 *
 * USE THE FACETED MARK AT >= 64px ONLY (large logo, OG/social, hero-adjacent).
 * For the favicon, app icon, small sizes, monochrome and single-colour print, use
 * the FLAT silhouette ({@link LOGO_PATH}) — the facets blur into a muddy blob at
 * 16-32px (proven by the reduction test in the brand-mark exploration). The favicon
 * intentionally stays plain.
 *
 * Geometry + colours are the owned source for `src/assets/brand/*.svg`; keep them in
 * sync via `scripts/brand/build-crystal-mark.mjs`. Governance + provenance:
 * `openspec/changes/dcyfr-crystal-brand-mark/`.
 */
export const CRYSTAL_MARK_COLORS = {
  /** slate-950 — deep navy surface / deepest facet */
  navy: '#020617',
  /** gray-50 — highlight facet on dark surfaces */
  white: '#f9fafb',
  /** blue-600 — electric blue, the brand primary facet */
  blue: '#2563eb',
  /** sky-400 — bright crystal accent on dark surfaces */
  cyan: '#38bdf8',
  /** sky-500 — deeper crystal accent that contrasts on light surfaces */
  sky: '#0ea5e9',
} as const;

/** Paint order for the 8 facets (TL/TR top arm, RT/RB right, BR/BL bottom, LB/LT left). */
export const CRYSTAL_FACET_ORDER = ['TL', 'TR', 'RT', 'RB', 'BR', 'BL', 'LB', 'LT'] as const;

/** The 8 facet sub-paths (viewBox `0 0 100 100`, center 50,50). Derived from LOGO_PATH. */
export const CRYSTAL_FACET_PATHS: Record<(typeof CRYSTAL_FACET_ORDER)[number], string> = {
  TL: 'M50 50L31.17326 31.288345C33.810837 28.607117 36.493847 24.835297 39.222374 19.972733C41.950901 15.110176 45.088661 8.452667 48.635742 0L50 0Z',
  TR: 'M50 50L50 0L51.432468 0C54.934074 8.452667 58.049099 15.110176 60.777626 19.972733C63.506153 24.835297 66.211899 28.607117 68.894951 31.288345Z',
  RT: 'M50 50L68.894951 31.288345C71.532532 33.969566 75.29557 36.67347 80.184174 39.400135C85.072792 42.126804 91.677994 45.19426 100 48.602589L100 50Z',
  RB: 'M50 50L100 50L100 51.397411C91.768944 54.80574 85.209213 57.873196 80.320602 60.599865C75.431992 63.32653 71.623482 66.030434 68.894951 68.711655Z',
  BR: 'M50 50L68.894951 68.711655C66.211899 71.392883 63.506153 75.164703 60.777626 80.027267C58.049099 84.889832 54.934074 91.547333 51.432468 100L50 100Z',
  BL: 'M50 50L50 100L48.635742 100C45.088661 91.547333 41.950901 84.889832 39.222374 80.027267C36.493847 75.164703 33.810837 71.392883 31.17326 68.711655Z',
  LB: 'M50 50L31.17326 68.711655C28.444733 66.030434 24.636229 63.32653 19.747612 60.599865C14.859005 57.873196 8.27653 54.80574 0 51.397411L0 50Z',
  LT: 'M50 50L0 50L0 48.602589C8.322005 45.19426 14.927217 42.126804 19.815825 39.400135C24.704441 36.67347 28.490208 33.969566 31.17326 31.288345Z',
};

/**
 * Per-surface facet colours (3-tone pinwheel). Light halves {TL,RT,BR,LB} catch the
 * highlight; the vertical-arm dark halves {TR,BL} carry the bright accent. `base` is a
 * full-silhouette underlay that hides anti-alias hairlines between facets.
 */
export const CRYSTAL_MARK_SCHEME = {
  dark: {
    base: CRYSTAL_MARK_COLORS.blue,
    TL: CRYSTAL_MARK_COLORS.white, RT: CRYSTAL_MARK_COLORS.white,
    BR: CRYSTAL_MARK_COLORS.white, LB: CRYSTAL_MARK_COLORS.white,
    TR: CRYSTAL_MARK_COLORS.cyan, BL: CRYSTAL_MARK_COLORS.cyan,
    RB: CRYSTAL_MARK_COLORS.blue, LT: CRYSTAL_MARK_COLORS.blue,
  },
  light: {
    base: CRYSTAL_MARK_COLORS.navy,
    TL: CRYSTAL_MARK_COLORS.blue, RT: CRYSTAL_MARK_COLORS.blue,
    BR: CRYSTAL_MARK_COLORS.blue, LB: CRYSTAL_MARK_COLORS.blue,
    TR: CRYSTAL_MARK_COLORS.sky, BL: CRYSTAL_MARK_COLORS.sky,
    RB: CRYSTAL_MARK_COLORS.navy, LT: CRYSTAL_MARK_COLORS.navy,
  },
} as const;

export type CrystalMarkSurface = keyof typeof CRYSTAL_MARK_SCHEME;

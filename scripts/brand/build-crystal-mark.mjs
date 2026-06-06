#!/usr/bin/env node
/**
 * Build the DCYFR crystal brand-mark SVG assets (owned vectors).
 *
 *   node scripts/brand/build-crystal-mark.mjs
 *
 * Emits standalone, transparent-background SVGs to src/assets/brand/. These are the
 * design-handoff / non-React assets; the app renders the same geometry via
 * <CrystalMark> + the constants in src/lib/logo-config.ts (the source of truth — keep
 * the facet paths + scheme here in sync with it).
 *
 * The mark is the "evolve" crystal-facet treatment of the existing sparkle: the exact
 * LOGO_PATH silhouette divided into 8 flat facets (2 per arm) by straight internal
 * seams. Outer edges keep the sparkle's soft concave curves. Favicon stays the flat
 * silhouette — the facets blur below ~32px (reduction test). See
 * openspec/changes/dcyfr-crystal-brand-mark/ for the decision + provenance.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../../src/assets/brand/', import.meta.url));

const COLORS = {
  navy: '#020617', white: '#f9fafb', blue: '#2563eb', cyan: '#38bdf8', sky: '#0ea5e9',
};

const SILHOUETTE =
  'M100 51.397411C91.768944 54.80574 85.209213 57.873196 80.320602 60.599865C75.431992 63.32653 71.623482 66.030434 68.894951 68.711655C66.211899 71.392883 63.506153 75.164703 60.777626 80.027267C58.049099 84.889832 54.934074 91.547333 51.432468 100L48.635742 100C45.088661 91.547333 41.950901 84.889832 39.222374 80.027267C36.493847 75.164703 33.810837 71.392883 31.17326 68.711655C28.444733 66.030434 24.636229 63.32653 19.747612 60.599865C14.859005 57.873196 8.27653 54.80574 0 51.397411L0 48.602589C8.322005 45.19426 14.927217 42.126804 19.815825 39.400135C24.704441 36.67347 28.490208 33.969566 31.17326 31.288345C33.810837 28.607117 36.493847 24.835297 39.222374 19.972733C41.950901 15.110176 45.088661 8.452667 48.635742 0L51.432468 0C54.934074 8.452667 58.049099 15.110176 60.777626 19.972733C63.506153 24.835297 66.211899 28.607117 68.894951 31.288345C71.532532 33.969566 75.29557 36.67347 80.184174 39.400135C85.072792 42.126804 91.677994 45.19426 100 48.602589Z';

const FACETS = {
  TL: 'M50 50L31.17326 31.288345C33.810837 28.607117 36.493847 24.835297 39.222374 19.972733C41.950901 15.110176 45.088661 8.452667 48.635742 0L50 0Z',
  TR: 'M50 50L50 0L51.432468 0C54.934074 8.452667 58.049099 15.110176 60.777626 19.972733C63.506153 24.835297 66.211899 28.607117 68.894951 31.288345Z',
  RT: 'M50 50L68.894951 31.288345C71.532532 33.969566 75.29557 36.67347 80.184174 39.400135C85.072792 42.126804 91.677994 45.19426 100 48.602589L100 50Z',
  RB: 'M50 50L100 50L100 51.397411C91.768944 54.80574 85.209213 57.873196 80.320602 60.599865C75.431992 63.32653 71.623482 66.030434 68.894951 68.711655Z',
  BR: 'M50 50L68.894951 68.711655C66.211899 71.392883 63.506153 75.164703 60.777626 80.027267C58.049099 84.889832 54.934074 91.547333 51.432468 100L50 100Z',
  BL: 'M50 50L50 100L48.635742 100C45.088661 91.547333 41.950901 84.889832 39.222374 80.027267C36.493847 75.164703 33.810837 71.392883 31.17326 68.711655Z',
  LB: 'M50 50L31.17326 68.711655C28.444733 66.030434 24.636229 63.32653 19.747612 60.599865C14.859005 57.873196 8.27653 54.80574 0 51.397411L0 50Z',
  LT: 'M50 50L0 50L0 48.602589C8.322005 45.19426 14.927217 42.126804 19.815825 39.400135C24.704441 36.67347 28.490208 33.969566 31.17326 31.288345Z',
};
const ORDER = ['TL', 'TR', 'RT', 'RB', 'BR', 'BL', 'LB', 'LT'];

const SCHEME = {
  dark: { base: COLORS.blue, TL: COLORS.white, RT: COLORS.white, BR: COLORS.white, LB: COLORS.white, TR: COLORS.cyan, BL: COLORS.cyan, RB: COLORS.blue, LT: COLORS.blue },
  light: { base: COLORS.navy, TL: COLORS.blue, RT: COLORS.blue, BR: COLORS.blue, LB: COLORS.blue, TR: COLORS.sky, BL: COLORS.sky, RB: COLORS.navy, LT: COLORS.navy },
};

const WORDMARK_FONT = "Alegreya, Georgia, 'Times New Roman', serif";

const markInner = (surface) => {
  const s = SCHEME[surface];
  return [`<path d="${SILHOUETTE}" fill="${s.base}"/>`, ...ORDER.map((id) => `<path d="${FACETS[id]}" fill="${s[id]}"/>`)].join('');
};
const svg = (vb, w, h, inner, label = 'DCYFR') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" fill="none" shape-rendering="geometricPrecision" role="img" aria-label="${label}"><title>${label}</title>${inner}</svg>\n`;

const facetedMark = (surface) => svg('0 0 100 100', 100, 100, markInner(surface));
const flatMark = (fill = 'currentColor') => svg('0 0 100 100', 100, 100, `<path d="${SILHOUETTE}" fill="${fill}"/>`);

// production lockups outline this Alegreya SemiBold wordmark; until then it is live <text>
const wordmark = (x, y, size, fill, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="${WORDMARK_FONT}" font-weight="600" font-size="${size}" letter-spacing="1.5" text-anchor="${anchor}" fill="${fill}">DCYFR</text>`;

const lockupH = ({ surface, markFill, textFill }) => {
  const mark = surface ? `<g>${markInner(surface)}</g>` : `<path d="${SILHOUETTE}" fill="${markFill}"/>`;
  return svg('0 0 390 100', 390, 100, mark + wordmark(126, 74, 70, textFill));
};
const lockupS = ({ surface, markFill, textFill }) => {
  const inner = surface ? markInner(surface) : `<path d="${SILHOUETTE}" fill="${markFill}"/>`;
  return svg('0 0 196 158', 196, 158, `<g transform="translate(48 0)">${inner}</g>` + wordmark(98, 148, 46, textFill, 'middle'));
};

mkdirSync(OUT, { recursive: true });
const files = {
  'dcyfr-mark-crystal-dark.svg': facetedMark('dark'),
  'dcyfr-mark-crystal-light.svg': facetedMark('light'),
  'dcyfr-mark-flat.svg': flatMark('currentColor'),
  'dcyfr-lockup-horizontal-dark.svg': lockupH({ surface: 'dark', textFill: COLORS.white }),
  'dcyfr-lockup-horizontal-light.svg': lockupH({ surface: 'light', textFill: COLORS.navy }),
  'dcyfr-lockup-horizontal-mono.svg': lockupH({ markFill: 'currentColor', textFill: 'currentColor' }),
  'dcyfr-lockup-stacked-dark.svg': lockupS({ surface: 'dark', textFill: COLORS.white }),
  'dcyfr-lockup-stacked-light.svg': lockupS({ surface: 'light', textFill: COLORS.navy }),
  'dcyfr-lockup-stacked-mono.svg': lockupS({ markFill: 'currentColor', textFill: 'currentColor' }),
};
for (const [name, body] of Object.entries(files)) writeFileSync(OUT + name, body);
console.log(`Wrote ${Object.keys(files).length} SVGs to src/assets/brand/`);

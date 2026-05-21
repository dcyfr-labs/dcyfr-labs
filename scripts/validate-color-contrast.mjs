#!/usr/bin/env node

/**
 * Color Contrast Validation
 *
 * Validates WCAG 2.1 AA/AAA contrast ratios for the design-system color
 * tokens. Token values are read directly from src/app/globals.css — the
 * source of truth — never hardcoded, so this check cannot silently drift
 * from the real theme.
 *
 * WCAG AA normal text: 4.5:1 · AAA normal text: 7:1
 *
 * Run:  node scripts/validate-color-contrast.mjs
 * Exit: 0 = every pair clears AA · 1 = one or more fail
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import wcagContrast from 'wcag-contrast';

/**
 * Convert an `oklch(L C H)` string to an 8-bit sRGB `[r, g, b]` triple.
 * Implements the OKLab → linear-sRGB transform (Björn Ottosson), so chroma
 * and hue are honored — not just grayscale. Out-of-gamut channels are
 * clamped into sRGB before gamma encoding.
 */
export function oklchToSrgb(oklch) {
  const parsed = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (!parsed) throw new Error(`Invalid OKLCH value: ${oklch}`);

  const L = parseFloat(parsed[1]);
  const C = parseFloat(parsed[2]);
  const hRadians = (parseFloat(parsed[3]) * Math.PI) / 180;
  const a = C * Math.cos(hRadians);
  const b = C * Math.sin(hRadians);

  // OKLab → nonlinear LMS
  const lPrime = L + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = L - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = L - 0.0894841775 * a - 1.291485548 * b;

  // LMS → linear sRGB
  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return linear.map((channel) => {
    const clamped = Math.min(1, Math.max(0, channel));
    const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
    return Math.round(encoded * 255);
  });
}

/**
 * Parse light (`:root`) and dark (`.dark`) color tokens from globals.css.
 * The dark theme is the `:root` baseline with `.dark` overrides applied,
 * mirroring the CSS cascade — a token not redefined in `.dark` inherits
 * its `:root` value.
 */
export function parseThemes(css) {
  const extract = (block) => {
    const tokens = {};
    for (const token of block.matchAll(/--([a-z-]+):\s*(oklch\([^)]+\))/gi)) {
      tokens[token[1]] = token[2];
    }
    return tokens;
  };

  const darkStart = css.search(/\.dark\s*\{/);
  if (darkStart === -1) {
    const all = extract(css);
    return { light: all, dark: all };
  }

  const light = extract(css.slice(0, darkStart));
  const darkEnd = css.indexOf('}', darkStart);
  const darkOverrides = extract(css.slice(darkStart, darkEnd === -1 ? undefined : darkEnd));
  return { light, dark: { ...light, ...darkOverrides } };
}

// Text-on-background token pairs to check (normal-size text).
const CONTRAST_PAIRS = [
  { text: 'foreground', bg: 'background' },
  { text: 'muted-foreground', bg: 'background' },
  { text: 'muted-foreground', bg: 'muted' },
  { text: 'primary-foreground', bg: 'primary' },
  { text: 'success-foreground', bg: 'success' },
  { text: 'warning-foreground', bg: 'warning' },
  { text: 'error-foreground', bg: 'error' },
  { text: 'info-foreground', bg: 'info' },
];

const WCAG_AA = 4.5;
const WCAG_AAA = 7;

function toHex([r, g, b]) {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function evaluateTheme(theme, themeName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${themeName.toUpperCase()} THEME — CONTRAST VALIDATION`);
  console.log(`${'='.repeat(60)}\n`);

  let passed = 0;
  let failed = 0;

  for (const { text, bg } of CONTRAST_PAIRS) {
    const textValue = theme[text];
    const bgValue = theme[bg];

    if (!textValue || !bgValue) {
      failed++;
      const missing = !textValue ? `--${text}` : `--${bg}`;
      console.log(
        `${'❌ MISSING'.padEnd(10)} ${text} on ${bg} — ${missing} not found in globals.css`
      );
      continue;
    }

    const ratio = wcagContrast.hex(toHex(oklchToSrgb(textValue)), toHex(oklchToSrgb(bgValue)));
    const passesAA = ratio >= WCAG_AA;
    const passesAAA = ratio >= WCAG_AAA;
    const status = passesAAA ? '✅ AAA' : passesAA ? '✅ AA' : '❌ FAIL';

    if (passesAA) passed++;
    else failed++;

    console.log(
      `${status.padEnd(10)} ${text.padEnd(20)} on ${bg.padEnd(20)} = ${ratio.toFixed(2)}:1`
    );
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Results: ${passed} passed / ${failed} failed`);

  return { passed, failed };
}

function main() {
  console.log('\n🎨 WCAG COLOR CONTRAST VALIDATION\n');
  console.log('Tokens sourced from src/app/globals.css');
  console.log('Standards: WCAG AA normal text 4.5:1 · AAA normal text 7:1');

  const cssPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'globals.css');
  const { light, dark } = parseThemes(readFileSync(cssPath, 'utf8'));

  const lightResults = evaluateTheme(light, 'Light');
  const darkResults = evaluateTheme(dark, 'Dark');

  const totalPassed = lightResults.passed + darkResults.passed;
  const totalFailed = lightResults.failed + darkResults.failed;

  console.log(`\n${'='.repeat(60)}`);
  console.log('OVERALL SUMMARY');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Light: ${lightResults.passed}/${lightResults.passed + lightResults.failed} passed`);
  console.log(`Dark:  ${darkResults.passed}/${darkResults.passed + darkResults.failed} passed`);
  console.log(`Total: ${totalPassed}/${totalPassed + totalFailed}`);

  if (totalFailed > 0) {
    console.log('\n❌ Some contrast ratios need improvement');
    process.exit(1);
  }
  console.log('\n✅ All contrast ratios meet WCAG AA standards!');
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

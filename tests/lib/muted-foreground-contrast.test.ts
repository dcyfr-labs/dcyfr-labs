import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guards the #632 regression: light-mode `--muted-foreground` must clear
 * WCAG AA (4.5:1) not only against the page background but against
 * `bg-muted`-tinted surfaces, which are a common composition. At
 * oklch(0.556) the muted / muted-foreground pair sits at ~4.34:1 — below AA.
 */

const globalsCss = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

/**
 * First occurrence of each custom property is the light-mode `:root` value;
 * `.dark` overrides appear later in the file.
 */
function lightModeToken(name: string): string {
  const match = globalsCss.match(new RegExp(`--${name}:\\s*(oklch\\([^)]+\\))`));
  if (!match) throw new Error(`Token --${name} not found in globals.css`);
  return match[1];
}

/**
 * WCAG relative luminance of an achromatic `oklch(L 0 0)` color. For chroma 0
 * the OKLab to linear-sRGB transform collapses to R=G=B=L^3, and that
 * linear-light value is itself the relative luminance — so Y = L^3.
 */
function achromaticLuminance(oklch: string): number {
  const match = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+[\d.]+\s*\)/i);
  if (!match) throw new Error(`Unparseable OKLCH value: ${oklch}`);
  const lightness = Number(match[1]);
  const chroma = Number(match[2]);
  if (chroma > 0.001) {
    throw new Error(`Contrast guard only handles achromatic tokens; got ${oklch}`);
  }
  return lightness ** 3;
}

function contrastRatio(a: string, b: string): number {
  const ya = achromaticLuminance(a);
  const yb = achromaticLuminance(b);
  const lighter = Math.max(ya, yb);
  const darker = Math.min(ya, yb);
  return (lighter + 0.05) / (darker + 0.05);
}

const WCAG_AA_NORMAL = 4.5;

describe('light-mode --muted-foreground contrast (#632)', () => {
  const mutedForeground = lightModeToken('muted-foreground');
  const background = lightModeToken('background');
  const muted = lightModeToken('muted');

  it('clears WCAG AA against the page background', () => {
    expect(contrastRatio(mutedForeground, background)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it('clears WCAG AA against bg-muted-tinted surfaces', () => {
    expect(contrastRatio(mutedForeground, muted)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });
});

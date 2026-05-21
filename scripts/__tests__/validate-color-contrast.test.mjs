import { describe, it, expect } from 'vitest';
import { oklchToSrgb, parseThemes } from '../validate-color-contrast.mjs';

describe('oklchToSrgb', () => {
  it('converts pure white and black exactly', () => {
    expect(oklchToSrgb('oklch(1 0 0)')).toEqual([255, 255, 255]);
    expect(oklchToSrgb('oklch(0 0 0)')).toEqual([0, 0, 0]);
  });

  it('converts achromatic grays via the OKLab curve, not lightness*255', () => {
    // oklch(0.556 0 0) resolves to sRGB ~#737373 (115), NOT 0.556*255 = 142.
    const [r, g, b] = oklchToSrgb('oklch(0.556 0 0)');
    expect(r).toBe(g);
    expect(g).toBe(b);
    expect(r).toBeGreaterThanOrEqual(114);
    expect(r).toBeLessThanOrEqual(116);
  });

  it('converts the near-white page background accurately', () => {
    const [r] = oklchToSrgb('oklch(0.985 0 0)');
    expect(r).toBeGreaterThanOrEqual(249);
    expect(r).toBeLessThanOrEqual(251);
  });

  it('handles chromatic colors (chroma + hue), not just grayscale', () => {
    // sRGB pure red #ff0000 is approximately oklch(0.6279 0.2577 29.2338).
    const [r, g, b] = oklchToSrgb('oklch(0.6279 0.2577 29.2338)');
    expect(r).toBeGreaterThanOrEqual(252);
    expect(g).toBeLessThanOrEqual(3);
    expect(b).toBeLessThanOrEqual(3);
  });
});

describe('parseThemes', () => {
  const fixture = `
:root {
  --background: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --success: oklch(0.527 0.153 163.228);
}
.dark {
  --background: oklch(0.125 0 0);
  --muted-foreground: oklch(0.708 0 0);
}
`;

  it('extracts light-mode :root tokens', () => {
    const { light } = parseThemes(fixture);
    expect(light['background']).toBe('oklch(0.985 0 0)');
    expect(light['muted-foreground']).toBe('oklch(0.556 0 0)');
    expect(light['success']).toBe('oklch(0.527 0.153 163.228)');
  });

  it('applies .dark overrides over the :root baseline', () => {
    const { dark } = parseThemes(fixture);
    expect(dark['background']).toBe('oklch(0.125 0 0)');
    expect(dark['muted-foreground']).toBe('oklch(0.708 0 0)');
  });

  it('inherits :root tokens not overridden by .dark (CSS cascade)', () => {
    const { dark } = parseThemes(fixture);
    // --success is not redefined in .dark, so it cascades from :root.
    expect(dark['success']).toBe('oklch(0.527 0.153 163.228)');
  });
});

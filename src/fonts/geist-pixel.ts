import localFont from 'next/font/local';

/**
 * Geist Pixel display fonts — Square and Grid only.
 *
 * The `geist/font/pixel` barrel declares all five pixel variants
 * (Square, Grid, Circle, Line, Triangle) with `localFont()` at module
 * scope, so importing *any* of them makes Next emit + `<link rel=preload>`
 * all five — ~75KB of Circle/Line/Triangle that this site never renders
 * (only `font-pixel-square` and `font-pixel-grid` appear in design-tokens).
 *
 * Declaring just the two used variants here keeps the exact same CSS
 * variables, weight, and fallback stack as the upstream package while
 * dropping the three dead preloads. The .woff2 files are vendored from
 * `geist/dist/fonts/geist-pixel/` (decorative display fonts — stable, not
 * versioned independently).
 *
 * Note: `next/font` requires every `localFont()` option to be an inline
 * literal — the compiler plugin rejects values referenced from a shared
 * const, so the fallback stack is repeated verbatim in each call (this is
 * also why the upstream geist package repeats it).
 */

export const GeistPixelSquare = localFont({
  src: './GeistPixel-Square.woff2',
  variable: '--font-geist-pixel-square',
  weight: '500',
  fallback: [
    'Geist Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace',
  ],
  adjustFontFallback: false,
});

export const GeistPixelGrid = localFont({
  src: './GeistPixel-Grid.woff2',
  variable: '--font-geist-pixel-grid',
  weight: '500',
  fallback: [
    'Geist Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace',
  ],
  adjustFontFallback: false,
});

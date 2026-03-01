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

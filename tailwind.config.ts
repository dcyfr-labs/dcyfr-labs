import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Tailwind CSS v4 Configuration
 *
 * IMPORTANT: Tailwind v4 uses CSS variables from @layer directives in globals.css
 * instead of a traditional config-based theme. This config file is minimal and
 * primarily exists for:
 * 1. IDE autocomplete and IntelliSense support in VS Code
 * 2. Plugin registration and content discovery
 * 3. Future compatibility if Tailwind changes auto-discovery behavior
 *
 * Theme values (colors, spacing, typography) are defined in src/app/globals.css
 * using Tailwind v4 CSS variable syntax (@layer base { --color-*: ... })
 *
 * References:
 * - https://tailwindcss.com/blog/tailwindcss-v4
 * - https://tailwindcss.com/docs/installation/using-postcss
 * - src/lib/design-tokens.ts (JS token exports)
 * - src/app/globals.css (CSS variable definitions)
 */

const config: Config = {
  content: [
    // Next.js App Router pages and layouts
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // React components
    './src/components/**/*.{js,ts,jsx,tsx}',
    // MDX content
    './src/content/**/*.{md,mdx}',
  ],

  theme: {
    extend: {
      fontFamily: {
        // Use system fonts by default (defined in globals.css)
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--font-serif)', ...defaultTheme.fontFamily.serif],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },

      // Colors defined via CSS variables in globals.css
      // These are referenced for IDE autocomplete only
      colors: {
        // Semantic colors (defined in globals.css @layer base)
        // bg-primary, text-primary, border-primary, etc.
        // These use CSS variables and adapt to light/dark mode
      },

      // Spacing defined via CSS variables in globals.css
      // space-* classes reference CSS variables
      spacing: {
        // Values are from design-tokens.ts SPACING constants
        // defined as CSS variables in globals.css
      },

      // Container queries (modern CSS alternative to breakpoints)
      containers: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
      },

      // Animation utilities for motion design
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        fadeOut: {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        slideIn: {
          'from': { transform: 'translateY(10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // Cursor utilities for interactive elements
      cursor: {
        pointer: 'pointer',
        'not-allowed': 'not-allowed',
      },

      // Opacity utilities with semantic names
      opacity: {
        disabled: '0.5',
        hover: '0.9',
      },

      // Z-index scale (matching design system)
      zIndex: {
        hide: '-1',
        auto: 'auto',
        base: '0',
        dropdown: '1000',
        sticky: '1020',
        overlay: '1030',
        modal: '1040',
        popover: '1050',
        tooltip: '1070',
      },

      // Border radius (semantic values)
      borderRadius: {
        none: '0',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },

      // Transition timing (consistent motion)
      transitionDuration: {
        fast: '100ms',
        base: '200ms',
        slow: '300ms',
      },

      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },

  plugins: [
    // No plugins required - using shadcn/ui components instead
    // Plugin registration would go here if needed
  ],
};

export default config;

/**
 * DCYFR Labs Token Provider Implementation
 *
 * Provides design tokens from dcyfr-labs design system to Design Token MCP.
<<<<<<< HEAD
 * Implements TokenProvider interface.
 */

=======
 * Implements TokenProvider interface from @dcyfr/ai/mcp.
 */

import type { TokenProvider, TokenCategory } from '@dcyfr/ai/mcp';
>>>>>>> 38cdf95ddc6322e511fa69eb9a4bb2fb967a192f
import {
  SPACING,
  SPACING_VALUES,
  TYPOGRAPHY,
  CONTAINER_WIDTHS,
  BREAKPOINTS,
} from '@/lib/design-tokens';

/**
<<<<<<< HEAD
 * Token category definition
 */
export interface TokenCategory {
  name: string;
  tokens: Record<string, any>; // Allow nested objects for spacing, typography, etc.
  patterns: RegExp[];
  description: string;
}

/**
 * Token provider interface
 */
export interface TokenProvider {
  getTokenCategories(): TokenCategory[];
  getSpacingTokens(): Record<string, number>;
  getTokenImportStatement(): string;
  getDocumentationUrl(): string;
}

/**
=======
>>>>>>> 38cdf95ddc6322e511fa69eb9a4bb2fb967a192f
 * DCYFR Labs design token provider
 */
export class DcyfrLabsTokenProvider implements TokenProvider {
  /**
   * Get all token categories with patterns and descriptions
   */
  getTokenCategories(): TokenCategory[] {
    return [
      {
        name: 'spacing',
        tokens: {
          ...SPACING,
          ...SPACING_VALUES,
        },
        patterns: [
          /gap-\d+/,
          /space-[xy]-\d+/,
          /p[trblxy]?-\d+/,
          /m[trblxy]?-\d+/,
          /w-\d+/,
          /h-\d+/,
        ],
        description: 'Spacing tokens for padding, margin, gaps, and sizes',
      },
      {
        name: 'typography',
<<<<<<< HEAD
        tokens: TYPOGRAPHY,
=======
        tokens: TYPOGRAPHY as Record<string, string | number>,
>>>>>>> 38cdf95ddc6322e511fa69eb9a4bb2fb967a192f
        patterns: [
          /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
          /font-(normal|medium|semibold|bold)/,
          /leading-\d+/,
          /tracking-\w+/,
        ],
        description: 'Typography tokens for text styling',
      },
      {
        name: 'containers',
<<<<<<< HEAD
        tokens: CONTAINER_WIDTHS,
=======
        tokens: CONTAINER_WIDTHS as Record<string, string | number>,
>>>>>>> 38cdf95ddc6322e511fa69eb9a4bb2fb967a192f
        patterns: [/max-w-\w+/, /min-w-\w+/],
        description: 'Container width tokens',
      },
      {
        name: 'breakpoints',
<<<<<<< HEAD
        tokens: BREAKPOINTS,
=======
        tokens: BREAKPOINTS as Record<string, string | number>,
>>>>>>> 38cdf95ddc6322e511fa69eb9a4bb2fb967a192f
        patterns: [/(sm|md|lg|xl|2xl):/],
        description: 'Responsive breakpoint tokens',
      },
    ];
  }

  /**
   * Get spacing tokens (for numeric value suggestions)
   */
  getSpacingTokens(): Record<string, number> {
    // Convert SPACING_VALUES to numeric
    return {
      xs: 2,
      sm: 3,
      md: 4,
      lg: 6,
      xl: 8,
    };
  }

  /**
   * Get import statement for tokens (used in suggestions)
   */
  getTokenImportStatement(): string {
    return "Import design tokens: import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from '@/lib/design-tokens'";
  }

  /**
   * Get documentation URL for design tokens
   */
  getDocumentationUrl(): string {
    return 'docs/ai/design-system.md';
  }
}

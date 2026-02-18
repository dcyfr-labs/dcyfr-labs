#!/usr/bin/env node

/**
 * Design Token Validation Script
 *
 * Scans all TypeScript/TSX files for design token usage and validates
 * that they exist in the design-tokens.ts file.
 *
 * Usage:
 *   node scripts/validate-design-tokens.mjs
 *
 * Exit codes:
 *   0 - All tokens are valid
 *   1 - Invalid tokens found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define valid design tokens based on design-tokens.ts structure
// This is a comprehensive list of all valid token paths
const VALID_TOKENS = {
  CONTAINER_WIDTHS: ['prose', 'narrow', 'thread', 'standard', 'content', 'archive', 'dashboard'],
  CONTAINER_PADDING: true,
  NAVIGATION_HEIGHT: true,
  ARCHIVE_CONTAINER_PADDING: true,
  CONTAINER_VERTICAL_PADDING: true,
  MOBILE_SAFE_PADDING: true,

  ACTIVITY_IMAGE: {
    container: true,
    sizes: ['header', 'reply'],
    image: true,
  },

  SPACING: [
    'section', 'subsection', 'content', 'prose', 'proseHero', 'proseSection',
    'compact', 'list', 'postList', 'image', 'blogLayout', 'contentGrid', 'subsectionAlt',
    'xs', 'sm', 'md', 'lg', 'xl', '2xl', '1.5', '0.5',
    { sectionDivider: ['container', 'heading', 'grid'] },
    { activity: ['threadGap', 'replyGap', 'contentGap', 'actionGap'] },
  ],

  SPACING_VALUES: ['xs', 'sm', 'md', 'lg', 'xl'],

  SPACING_SCALE: ['0.5', '1.5', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],

  TYPOGRAPHY: {
    h1: ['standard', 'hero', 'article', 'project', 'mdx'],
    h2: ['standard', 'featured', 'mdx'],
    h3: ['standard', 'mdx'],
    h4: ['mdx'],
    h5: ['mdx'],
    h6: ['mdx'],
    display: ['error', 'stat', 'statLarge'],
    description: true,
    metadata: true,
    body: true,
    label: ['standard', 'small', 'xs'],
    activity: ['title', 'subtitle', 'description', 'metadata', 'replyTitle', 'replyDescription'],
    accordion: ['heading', 'trigger'],
    logo: ['small', 'medium', 'large'],
    pixel: {
      square: ['xl', 'large', 'medium', 'small'],
      grid: ['xl', 'large', 'medium', 'small'],
    },
  },

  SEMANTIC_COLORS: {
    text: ['primary', 'secondary', 'muted', 'accent', 'destructive'],
    background: true,
    border: true,
    alert: {
      critical: ['border', 'container', 'text', 'icon', 'label'],
      warning: ['border', 'container', 'text', 'icon', 'label'],
      info: ['border', 'container', 'text', 'icon', 'label'],
      success: ['border', 'container', 'text', 'icon', 'label'],
      notice: ['border', 'container', 'text', 'icon', 'label'],
    },
    status: ['success', 'warning', 'error', 'info', 'neutral', 'inProgress'],
    interactive: ['hover', 'active', 'focus', 'disabled'],
    highlight: ['primary', 'mark'],
    activity: {
      action: ['default', 'active', 'liked', 'bookmarked'],
    },
    accent: {
      // Color list: cyan, blue, purple, indigo, violet, emerald, teal, lime, green, orange, amber, yellow, pink, red, rose, sky, slate, neutral
      _properties: ['badge', 'text', 'bg', 'light', 'dark'],
    },
    syntax: ['keyword', 'string', 'function', 'comment', 'variable', 'operator', 'constant', 'class', 'number', 'punctuation', 'tag', 'attribute'],
  },

  OPACITY: ['ghost', 'subtle', 'muted', 'medium', 'strong'],

  ANIMATION: {
    duration: ['instant', 'fast', 'normal', 'slow'],
    easing: ['default', 'in', 'out', 'inOut'],
    transition: ['base', 'fast', 'slow', 'movement', 'appearance', 'theme', 'colors'],
    reveal: ['hidden', 'visible', 'up', 'down', 'left', 'right', 'scale'],
    hover: ['lift'],
    interactive: ['press'],
    stagger: ['1', '2', '3', '4', '5', '6'],
    activity: ['like', 'pulse', 'countIncrement'],
    effects: ['countUp', 'shimmer', 'pulse', 'float'],
  },

  ANIMATION_CONSTANTS: {
    duration: ['instant', 'fast', 'normal'],
    easing: ['default', 'in', 'out', 'inOut'],
    stagger: ['fast', 'normal', 'slow'],
    transition: ['opacity', 'colors', 'transform', 'all'],
    types: ['fadeIn', 'fadeOut', 'slideUp', 'slideDown', 'scaleUp', 'scaleDown', 'optimisticUpdate'],
  },

  ARCHIVE_ANIMATIONS: {
    container: {
      hidden: true,
      visible: true,
    },
    item: {
      hidden: true,
      visible: true,
    },
    cardHover: true,
    filterBar: {
      hidden: true,
      visible: true,
    },
  },

  ARCHIVE_CARD_VARIANTS: {
    elevated: {
      container: true,
      imageWrapper: true,
      image: true,
      overlay: true,
      badgeContainer: true,
      badge: true,
      glassCard: true,
      content: true,
    },
    background: {
      container: true,
      imageWrapper: true,
      image: true,
      overlay: true,
      content: true,
      glassCard: true,
    },
    sideBySide: {
      container: true,
      imageWrapper: true,
      image: true,
      content: true,
    },
  },

  VIEW_MODES: {
    grid: {
      grid: true,
      cardPadding: true,
      imageHeight: true,
    },
    list: {
      grid: true,
      cardPadding: true,
      imageHeight: true,
    },
    magazine: {
      grid: true,
      cardPadding: true,
      imageHeight: true,
    },
    masonry: {
      grid: true,
      cardPadding: true,
      imageHeight: true,
    },
  },

  APP_TOKENS: {
    GESTURES: {
      swipeThreshold: true,
      longPressDelay: true,
      tapMaxDuration: true,
      tapMaxMovement: true,
    },
    ANIMATIONS: {
      pageTransition: true,
      optimisticUpdate: true,
      pullToRefresh: true,
      commandPalette: true,
      modal: true,
      toast: true,
    },
    TOUCH_TARGETS: {
      minimum: true,
      comfortable: true,
      large: true,
    },
    Z_INDEX: {
      base: true,
      sticky: true,
      fab: true,
      dropdown: true,
      modal: true,
      commandPalette: true,
      toast: true,
    },
    KEYBOARD: {
      keyBadge: true,
      separator: true,
    },
  },

  BORDERS: {
    card: true,
    button: true,
    input: true,
    badge: true,
    circle: true,
    dialog: true,
    dropdown: true,
    container: true,
  },

  SCROLL_OFFSET: ['heading', 'section'],

  Z_INDEX: true,
  FOCUS_RING: true,
  HOVER_EFFECTS: true,
  SHADOWS: true,
  BUTTON_SIZES: true,
  TOUCH_TARGET: true,
  BREAKPOINTS: true,
  CONTENT_HIERARCHY: true,
  PROGRESSIVE_TEXT: true,
  FONT_CONTRAST: true,
  SERIES_COLORS: true,
  PAGE_LAYOUT: true,
  HERO_VARIANTS: true,
  SCROLL_BEHAVIOR: true,
};

// Common mistakes mapping
const COMMON_MISTAKES = {
  'TYPOGRAPHY.caption': 'TYPOGRAPHY.label.small or TYPOGRAPHY.metadata',
  'TYPOGRAPHY.small': 'TYPOGRAPHY.label.small',
  'TYPOGRAPHY.xs': 'TYPOGRAPHY.label.xs',
  'TYPOGRAPHY.small.muted': 'TYPOGRAPHY.label.small or TYPOGRAPHY.metadata',
  'TYPOGRAPHY.depth.accent': 'TYPOGRAPHY.body or TYPOGRAPHY.label.*',
  'TYPOGRAPHY.depth.subtle': 'TYPOGRAPHY.metadata or TYPOGRAPHY.label.*',
  'CONTAINER_WIDTHS.wide': 'CONTAINER_WIDTHS.dashboard or CONTAINER_WIDTHS.archive',
  'CONTAINER_WIDTHS.full': 'CONTAINER_WIDTHS.dashboard',
  'SEMANTIC_COLORS.status.neutral': 'SEMANTIC_COLORS.status.info or muted styles',
};

const errors = [];

/**
 * Recursively find all TypeScript/TSX files
 */
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, coverage, etc.
      if (!['node_modules', '.next', 'coverage', '.git', 'dist', 'build'].includes(file)) {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Skip design-tokens.ts itself and type definition files
      if (!file.includes('design-tokens') && !file.endsWith('.d.ts')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Extract design token usage from file content
 */
function extractTokenUsage(content, filePath) {
  const tokenPattern = /\b(APP_TOKENS|ANIMATION_CONSTANTS|ARCHIVE_ANIMATIONS|CONTAINER_WIDTHS|ACTIVITY_IMAGE|SPACING|SPACING_VALUES|SPACING_SCALE|TYPOGRAPHY|SEMANTIC_COLORS|OPACITY|SERIES_COLORS|HOVER_EFFECTS|ANIMATION|ARCHIVE_CARD_VARIANTS|VIEW_MODES|BORDERS|SHADOWS|BREAKPOINTS|Z_INDEX|FOCUS_RING|TOUCH_TARGET|BUTTON_SIZES|SCROLL_OFFSET|PAGE_LAYOUT|HERO_VARIANTS|SCROLL_BEHAVIOR|CONTENT_HIERARCHY|PROGRESSIVE_TEXT|FONT_CONTRAST|CONTAINER_PADDING|NAVIGATION_HEIGHT|ARCHIVE_CONTAINER_PADDING|CONTAINER_VERTICAL_PADDING|MOBILE_SAFE_PADDING)\.([a-zA-Z0-9_.]+)/g;
  const matches = [...content.matchAll(tokenPattern)];

  matches.forEach((match) => {
    const [, tokenGroup, tokenPath] = match;
    validateToken(tokenGroup, tokenPath, filePath);
  });
}

/**
 * Validate an array node in the token path
 */
function validateArrayNode(current, part, tokenGroup, tokenPath, filePath) {
  // Check if path is an object within the array
  const objectEntry = current.find(item => typeof item === 'object' && item[part]);
  if (objectEntry && objectEntry[part]) {
    return { ok: true, next: objectEntry[part] };
  }
  // Check if the part is directly in the array
  if (!current.includes(part)) {
    const fullToken = `${tokenGroup}.${tokenPath}`;
    const suggestion = COMMON_MISTAKES[fullToken] || `Check design-tokens.ts for valid ${tokenGroup} values`;
    errors.push({ file: filePath, token: fullToken, message: `Invalid token path. Did you mean: ${suggestion}?` });
    return { ok: false, next: null };
  }
  // Arrays are terminal — valid but can't navigate further
  return { ok: true, next: null, terminal: true };
}

/**
 * Validate an object node in the token path
 */
function validateObjectNode(current, part, pathParts, i, tokenGroup, tokenPath, filePath) {
  // Special handling for SEMANTIC_COLORS.accent.{colorName}.{property}
  if (tokenGroup === 'SEMANTIC_COLORS' && pathParts[0] === 'accent' && i === 1) {
    if (pathParts.length >= 3) {
      const property = pathParts[2];
      const validProperties = current._properties || ['badge', 'text', 'bg', 'light', 'dark'];
      if (!validProperties.includes(property)) {
        errors.push({
          file: filePath,
          token: `${tokenGroup}.${tokenPath}`,
          message: `Invalid accent color property. Valid properties: ${validProperties.join(', ')}`,
        });
      }
    }
    return { ok: true, next: null, terminal: true };
  }
  const next = current[part];
  if (!next) {
    const fullToken = `${tokenGroup}.${tokenPath}`;
    const suggestion = COMMON_MISTAKES[fullToken] || `Check design-tokens.ts for valid ${tokenGroup} paths`;
    errors.push({ file: filePath, token: fullToken, message: `Invalid token path. Did you mean: ${suggestion}?` });
    return { ok: false, next: null };
  }
  return { ok: true, next, terminal: i === pathParts.length - 1 && next === true };
}

/**
 * Validate that a token path exists in VALID_TOKENS
 */
function validateToken(tokenGroup, tokenPath, filePath) {
  const pathParts = tokenPath.split('.');
  let current = VALID_TOKENS[tokenGroup];

  if (!current) {
    errors.push({ file: filePath, token: `${tokenGroup}.${tokenPath}`, message: `Unknown token group: ${tokenGroup}` });
    return;
  }

  if (current === true) return;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (Array.isArray(current)) {
      const result = validateArrayNode(current, part, tokenGroup, tokenPath, filePath);
      if (!result.ok || result.terminal) return;
      current = result.next;
    } else if (typeof current === 'object') {
      const result = validateObjectNode(current, part, pathParts, i, tokenGroup, tokenPath, filePath);
      if (!result.ok || result.terminal) return;
      current = result.next;
  }
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const files = findTsFiles(srcDir);

console.log(`🔍 Scanning ${files.length} TypeScript files for design token usage...\n`);

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  extractTokenUsage(content, file);
});

if (errors.length === 0) {
  console.log('✅ All design tokens are valid!\n');
  process.exit(0);
} else {
  console.log(`❌ Found ${errors.length} invalid design token(s):\n`);

  errors.forEach((error) => {
    const relativePath = path.relative(process.cwd(), error.file);
    console.log(`  ${relativePath}`);
    console.log(`    Token: ${error.token}`);
    console.log(`    ${error.message}\n`);
  });

  process.exit(1);
}

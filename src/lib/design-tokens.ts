/**
 * Design Tokens - Single Source of Truth for Design Decisions
 *
 * This file centralizes all design decisions to ensure consistency across the site.
 * Use these constants instead of magic strings in components.
 *
 * @see /docs/design/ux-ui-consistency-analysis.md for rationale and usage guidelines
 */

// ============================================================================
// FLUID TYPOGRAPHY UTILITIES
// ============================================================================

/**
 * Fluid typography using CSS clamp() for viewport-responsive sizing
 *
 * Benefits:
 * - Eliminates 90% of media query-based font sizing
 * - Continuous scaling across all viewports
 * - Respects user zoom preferences (accessibility)
 * - Better performance (no breakpoint recalculations)
 *
 * Formula: clamp(min-rem, calc(base-rem + viewport-multiplier), max-rem)
 *
 * @see Modern UI/UX Design Standards Report (2025)
 * @see https://web.dev/articles/baseline-in-action-fluid-type
 */

/**
 * Tailwind size reference (for conversion):
 * - text-sm: 0.875rem (14px)
 * - text-base: 1rem (16px)
 * - text-lg: 1.125rem (18px)
 * - text-xl: 1.25rem (20px)
 * - text-2xl: 1.5rem (24px)
 * - text-3xl: 1.875rem (30px)
 * - text-4xl: 2.25rem (36px)
 * - text-5xl: 3rem (48px)
 */

/**
 * Converts fixed Tailwind sizes to fluid clamp() values
 *
 * Examples:
 * - text-3xl md:text-4xl → text-[clamp(1.875rem,4vw+1rem,2.25rem)]
 * - text-xl md:text-2xl → text-[clamp(1.25rem,2.5vw+0.75rem,1.5rem)]
 * - text-lg md:text-xl → text-[clamp(1.125rem,2vw+0.75rem,1.25rem)]
 */

// ============================================================================
// CONTAINER WIDTHS
// ============================================================================

/**
 * Semantic container width patterns based on content type
 *
 * @example
 * ```tsx
 * <div className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING}`}>
 *   {content}
 * </div>
 * ```
 */
export const CONTAINER_WIDTHS = {
  /** Prose/reading content - optimal line length (45-75 chars/line per typography research) */
  prose: "max-w-4xl",

  /** Narrow width for forms and focused content (contact forms) */
  narrow: "max-w-4xl",

  /** Thread-style single-column feed (Threads-inspired activity timeline) */
  thread: "max-w-2xl",

  /** Standard width for core pages (homepage, about, contact, resume) */
  standard: "max-w-5xl",

  /** Content-heavy pages with sidebar (individual blog posts, project detail pages) */
  content: "max-w-6xl",

  /** Archive/listing pages with filters and grids (blog listing, projects listing) */
  archive: "max-w-7xl",

  /** Full-width dashboard pages with data tables, charts, and analytics (dashboard pages, dev tools) */
  dashboard: "max-w-[1536px]",
} as const;

/**
 * Standard horizontal padding for all containers
 * Provides consistent edge spacing across breakpoints
 */
export const CONTAINER_PADDING = "px-4 sm:px-6 md:px-8" as const;

/**
 * Horizontal padding for archive container (reduced vertical padding)
 */
export const ARCHIVE_CONTAINER_PADDING = "px-4 sm:px-6 md:px-8" as const;

/**
 * Standard vertical padding for page containers
 * Provides consistent top/bottom spacing
 */
export const CONTAINER_VERTICAL_PADDING = "py-8 md:py-12" as const;

/**
 * Mobile-safe bottom padding that accounts for BottomNav (64px) + safe clearance
 * - Mobile: 96px (BottomNav 64px + 32px clearance)
 * - Desktop: 32px (standard padding, no BottomNav)
 */
export const MOBILE_SAFE_PADDING = "pb-24 md:pb-8" as const;

/**
 * Utility function to build complete container classes
 *
 * @param width - Container width variant
 * @returns Complete className string with centering, width, and padding
 *
 * @example
 * ```tsx
 * <div className={getContainerClasses('narrow')}>
 *   <article>{content}</article>
 * </div>
 * ```
 */
export function getContainerClasses(
  width: keyof typeof CONTAINER_WIDTHS = "standard"
): string {
  return `mx-auto ${CONTAINER_WIDTHS[width]} pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12 ${CONTAINER_PADDING}`;
}

/**
 * Dynamic Content Depth Classifier
 *
 * Analyzes content characteristics and returns appropriate depth styling.
 * Implements varying depth based on paragraph length and position.
 *
 * @param options - Content analysis options
 * @returns Appropriate depth class string
 *
 * @example
 * ```tsx
 * const depthClass = getContentDepthClass({
 *   length: paragraph.length,
 *   position: 'body',
 *   isContextual: false
 * });
 * <p className={depthClass}>{paragraph}</p>
 * ```
 */
export function getContentDepthClass(options: {
  /** Character length of content */
  length?: number;
  /** Position in content flow */
  position?: "opening" | "body" | "closing";
  /** Whether content is contextual/supporting */
  isContextual?: boolean;
  /** Whether to apply font contrast system */
  useFontContrast?: boolean;
}): string {
  const {
    length = 0,
    position = "body",
    isContextual = false,
    useFontContrast = false,
  } = options;

  // Base font system
  if (useFontContrast) {
    return FONT_CONTRAST.base;
  }

  // Contextual content
  if (isContextual) {
    return PROGRESSIVE_TEXT.contextual;
  }

  // Position-based styling
  if (position === "opening") {
    return PROGRESSIVE_TEXT.opening;
  }

  if (position === "closing") {
    return PROGRESSIVE_TEXT.closing;
  }

  // Length-based styling
  if (length > 300) {
    return PROGRESSIVE_TEXT.extended;
  }

  return PROGRESSIVE_TEXT.body;
}

/**
 * Content Block Depth Helper
 *
 * Applies consistent hierarchy patterns to content blocks.
 * Based on the about page's content organization patterns.
 *
 * @param variant - Content block type
 * @returns Object with title, content, and container classes
 *
 * @example
 * ```tsx
 * const styles = getContentBlockStyles('primary');
 * <div className={styles.container}>
 *   <h3 className={styles.title}>Title</h3>
 *   <p className={styles.content}>Content</p>
 * </div>
 * ```
 */
export function getContentBlockStyles(
  variant: keyof typeof CONTENT_HIERARCHY
): {
  title: string;
  content: string;
  container: string;
} {
  return CONTENT_HIERARCHY[variant];
}

// ============================================================================
// ACTIVITY IMAGE PRESENTATION
// ============================================================================

/**
 * Activity feed image presentation tokens (Medium/Substack inspired)
 * Provides consistent aspect ratios and sizing for featured images in activities
 *
 * @example
 * ```tsx
 * {activity.meta?.image && (
 *   <div className={cn(ACTIVITY_IMAGE.container, ACTIVITY_IMAGE.sizes.header)}>
 *     <Image src={activity.meta.image.url} fill className={ACTIVITY_IMAGE.image} />
 *   </div>
 * )}
 * ```
 */
export const ACTIVITY_IMAGE = {
  /** Base container with 16:9 aspect ratio and overflow handling, with light background for transparent images */
  container:
    "aspect-[16/9] relative overflow-hidden rounded-lg mb-4 bg-muted/30 dark:bg-muted/10",

  /** Image size variants for different activity types - width controls size via aspect ratio */
  sizes: {
    /** Primary activity header (larger, more prominent) - full width, aspect ratio controls height */
    header: "w-full",
    /** Reply/nested activity (smaller, compact) - full width, aspect ratio controls height */
    reply: "w-full",
  },

  /** Image styling with hover zoom effect */
  image:
    "object-cover w-full h-full transition-transform duration-300 hover:scale-105",
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Typography patterns for consistent heading hierarchy and text styles
 *
 * @example
 * ```tsx
 * <h1 className={TYPOGRAPHY.h1.standard}>Page Title</h1>
 * <p className={TYPOGRAPHY.description}>Page description</p>
 * ```
 */
export const TYPOGRAPHY = {
  /** H1 heading variants for different contexts */
  h1: {
    /** Standard page titles (about, projects, contact, blog listing)
     * Fluid: 30px (mobile) → 36px (desktop)
     */
    standard:
      "text-[clamp(1.875rem,4vw+1rem,2.25rem)] font-semibold tracking-tight",

    /** Archive/listing page titles (about, blog archive, portfolio archive)
     * Fluid: 30px (mobile) → 36px (desktop)
     */
    hero: "font-serif text-[clamp(1.875rem,4vw+1rem,2.25rem)] font-semibold tracking-tight ws-sm",

    /** Blog post titles (larger, more prominent)
     * Fluid: 30px (mobile) → 48px (desktop)
     */
    article:
      "font-serif text-[clamp(1.875rem,5vw+0.75rem,3rem)] font-semibold tracking-tight leading-tight ws-md",

    /** Portfolio project titles
     * Fluid: 30px (mobile) → 48px (desktop)
     */
    project:
      "font-serif text-[clamp(1.875rem,5vw+0.75rem,3rem)] font-semibold tracking-tight leading-tight ws-md",

    /** MDX content headings
     * Fluid: 30px (mobile) → 36px (desktop)
     */
    mdx: "text-[clamp(1.875rem,4vw+1rem,2.25rem)] font-semibold tracking-tight ws-sm",
  },

  /** H2 heading variants */
  h2: {
    /** Standard section headings
     * Fluid: 20px (mobile) → 24px (desktop)
     */
    standard: "text-[clamp(1.25rem,2.5vw+0.75rem,1.5rem)] font-medium ws-xs",

    /** Featured content headings (blog post cards, featured sections)
     * Fluid: 24px (mobile) → 30px (desktop)
     */
    featured:
      "font-serif text-[clamp(1.5rem,3vw+0.875rem,1.875rem)] font-semibold tracking-tight ws-sm",

    /** MDX content headings
     * Fluid: 24px (mobile) → 30px (desktop)
     */
    mdx: "text-[clamp(1.5rem,3vw+0.875rem,1.875rem)] font-semibold tracking-tight ws-sm",
  },

  /** H3 heading variants */
  h3: {
    /** Standard subsection headings
     * Fluid: 18px (mobile) → 20px (desktop)
     */
    standard: "text-[clamp(1.125rem,2vw+0.75rem,1.25rem)] font-medium ws-xs",

    /** MDX content headings
     * Fluid: 18px (mobile) → 20px (desktop)
     */
    mdx: "font-sans text-[clamp(1.125rem,2vw+0.75rem,1.25rem)] font-bold tracking-tight ws-xs",
  },

  /** H4 heading variants */
  h4: {
    /** MDX content headings
     * Fluid: 16px (mobile) → 18px (desktop)
     */
    mdx: "font-sans text-[clamp(1rem,1.5vw+0.75rem,1.125rem)] font-bold tracking-tight",
  },

  /** H5 heading variants */
  h5: {
    /** MDX content headings
     * Fluid: 14px (mobile) → 16px (desktop)
     */
    mdx: "font-sans text-[clamp(0.875rem,1vw+0.75rem,1rem)] font-semibold tracking-tight",
  },

  /** H6 heading variants */
  h6: {
    /** MDX content headings
     * Stays at 14px across viewports
     */
    mdx: "font-sans text-sm font-semibold tracking-tight",
  },

  /** Special display text (stats, error titles, large numbers) */
  display: {
    /** Error page titles
     * Fluid: 30px (mobile) → 36px (desktop)
     */
    error: "text-[clamp(1.875rem,4vw+1rem,2.25rem)] font-bold ws-xs",

    /** Large statistics/metrics display
     * Stays at 30px across viewports (single value, no scaling needed)
     */
    stat: "text-3xl font-bold tracking-tight ws-xs",

    /** Extra large statistics display (homepage stats)
     * Fluid: 36px (mobile) → 48px (desktop)
     */
    statLarge: "text-[clamp(2.25rem,4.5vw+1rem,3rem)] font-bold ws-sm",
  },

  /** Lead text / page descriptions
   * Fluid: 18px (mobile) → 20px (desktop)
   */
  description:
    "text-[clamp(1.125rem,2vw+0.75rem,1.25rem)] text-muted-foreground ws-xs",

  /** Metadata text (dates, reading time, etc.) */
  metadata: "text-sm text-muted-foreground",

  /** Body text for long-form content */
  body: "text-base text-foreground leading-relaxed ws-xs",

  /** Label and small UI text */
  label: {
    /** Card/section labels (e.g., "Trending Posts", "Recommendations") */
    standard: "text-base font-semibold",
    /** Smaller labels for list items, badges */
    small: "text-sm font-semibold",
    /** Extra small labels */
    xs: "text-xs font-semibold",
  },

  /** Activity feed typography (content-focused, Medium/Substack inspired) */
  activity: {
    /** Primary activity titles (larger, prominent, good hierarchy)
     * Fluid: 20px (mobile) → 24px (tablet) → 30px (desktop)
     */
    title:
      "text-[clamp(1.25rem,3vw+0.75rem,1.875rem)] font-semibold tracking-tight",

    /** Activity subtitles (optional secondary text)
     * Fluid: 16px (mobile) → 18px (desktop)
     */
    subtitle: "text-[clamp(1rem,1.5vw+0.75rem,1.125rem)] text-muted-foreground",

    /** Activity descriptions (enhanced readability, optimal line height)
     * Stays at 16px (base size, no scaling needed)
     */
    description: "text-base leading-relaxed text-foreground/90",

    /** Activity metadata (timestamps, counts, badges)
     * Stays at 14px (small text, no scaling needed)
     */
    metadata: "text-sm text-muted-foreground",

    /** Reply/nested activity titles (smaller than primary, still readable)
     * Fluid: 16px (mobile) → 18px (desktop)
     */
    replyTitle: "text-[clamp(1rem,1.5vw+0.75rem,1.125rem)] font-medium",

    /** Reply descriptions (compact but readable)
     * Stays at 14px (small text, no scaling needed)
     */
    replyDescription: "text-sm leading-relaxed text-muted-foreground",
  },

  /** Accordion/FAQ specific styling */
  accordion: {
    /** FAQ section heading */
    heading: "font-semibold text-2xl",
    /** FAQ question trigger */
    trigger: "text-left text-lg font-bold",
  },

  /** Logo/branding text */
  logo: {
    /** Small logo text (mobile nav, compact views)
     * Stays at 14px (small text, no scaling needed)
     */
    small: "text-sm font-serif font-semibold leading-none",

    /** Medium logo text (default)
     * Fluid: 20px (mobile) → 24px (desktop)
     */
    medium:
      "text-[clamp(1.25rem,2.5vw+0.75rem,1.5rem)] font-serif font-semibold leading-none",

    /** Large logo text (headers, hero sections)
     * Fluid: 30px (mobile) → 36px (desktop)
     */
    large:
      "text-[clamp(1.875rem,4vw+1rem,2.25rem)] font-serif font-semibold leading-none",
  },

  /**
   * Depth-Based Text Hierarchy
   *
   * Creates visual hierarchy through progressive text treatments.
   * Inspired by the about page's varying depth patterns.
   *
   * Usage: Apply to content blocks, subsections, and contextual information
   *
   * @example
   * ```tsx
   * <div className={TYPOGRAPHY.depth.primary}>Main content here</div>
   * <div className={TYPOGRAPHY.depth.secondary}>Supporting information</div>
   * <div className={TYPOGRAPHY.depth.tertiary}>Contextual details</div>
   * ```
   */
  depth: {
    /** Primary content - emphasized, full contrast */
    primary: "font-medium text-foreground",

    /** Secondary content - medium emphasis, slight reduction */
    secondary: "font-normal text-foreground/90",

    /** Tertiary content - supporting information, muted */
    tertiary: "font-normal text-muted-foreground",

    /** Accent content - highlighted information */
    accent: "font-semibold text-foreground",

    /** Subtle content - least emphasis, background information */
    subtle: "font-light text-muted-foreground/70",
  },
} as const;

// ============================================================================
// CONTENT HIERARCHY
// ============================================================================

/**
 * Content Hierarchy Patterns
 *
 * Defines consistent patterns for creating depth and emphasis in content blocks.
 * Based on the varying depth style from the about page, these patterns create
 * visual hierarchy through strategic use of font weights and text opacity.
 *
 * Use Cases:
 * - Blog post content sections
 * - About page information blocks
 * - Card descriptions and supporting text
 * - Contextual information panels
 *
 * @example
 * ```tsx
 * <div className={CONTENT_HIERARCHY.primary.container}>
 *   <h3 className={CONTENT_HIERARCHY.primary.title}>Section Title</h3>
 *   <p className={CONTENT_HIERARCHY.primary.content}>Main content here</p>
 *   <p className={CONTENT_HIERARCHY.supporting.content}>Supporting details</p>
 * </div>
 * ```
 */
export const CONTENT_HIERARCHY = {
  /** Primary content blocks - main information */
  primary: {
    title: "font-medium text-foreground",
    content: "text-foreground leading-relaxed",
    container: "space-y-3",
  },

  /** Supporting content blocks - contextual information */
  supporting: {
    title: "font-medium text-foreground/90",
    content: "text-muted-foreground leading-relaxed",
    container: "space-y-2 mt-1",
  },

  /** Accent content blocks - highlighted information */
  accent: {
    title: "font-semibold text-foreground",
    content: "text-foreground/95 leading-relaxed",
    container: "space-y-3",
  },

  /** Subtle content blocks - background information */
  subtle: {
    title: "font-normal text-muted-foreground",
    content: "text-muted-foreground/80 leading-relaxed text-sm",
    container: "space-y-2",
  },
} as const;

/**
 * Progressive Text Patterns
 *
 * Dynamic text styling based on paragraph position or content length.
 * Implements the "muted text dynamically by paragraph length" concept.
 *
 * Usage: Apply programmatically based on content analysis or position.
 *
 * @example
 * ```tsx
 * // For first paragraph
 * <p className={PROGRESSIVE_TEXT.opening}>Introduction text</p>
 *
 * // For subsequent paragraphs
 * <p className={PROGRESSIVE_TEXT.body}>Regular body text</p>
 *
 * // For final/closing paragraphs
 * <p className={PROGRESSIVE_TEXT.closing}>Closing thoughts</p>
 * ```
 */
export const PROGRESSIVE_TEXT = {
  /** Opening paragraph - full emphasis */
  opening: "text-foreground font-normal leading-relaxed text-lg",

  /** Body paragraphs - standard treatment */
  body: "text-foreground leading-relaxed",

  /** Long paragraphs - slightly reduced emphasis */
  extended: "text-foreground/95 leading-relaxed text-[15px]",

  /** Closing paragraphs - subtle reduction */
  closing: "text-foreground/90 leading-relaxed",

  /** Contextual paragraphs - background information */
  contextual: "text-muted-foreground leading-relaxed text-sm",
} as const;

/**
 * Font Weight Contrast System
 *
 * Establishes clear contrast between thin base fonts and bold weights.
 * Addresses the "thinner base font in contrast to bold weight" requirement.
 *
 * @example
 * ```tsx
 * <p className={FONT_CONTRAST.base}>Base content with thin weight</p>
 * <strong className={FONT_CONTRAST.emphasis}>Bold contrast text</strong>
 * <h3 className={FONT_CONTRAST.heading}>Heading with proper contrast</h3>
 * ```
 */
export const FONT_CONTRAST = {
  /** Base text - lighter weight for better contrast */
  base: "font-light text-foreground leading-relaxed",

  /** Medium emphasis - slight increase from base */
  medium: "font-normal text-foreground leading-relaxed",

  /** Strong emphasis - clear contrast from base */
  emphasis: "font-semibold text-foreground",

  /** Bold elements - maximum contrast */
  bold: "font-bold text-foreground",

  /** Heading contrast - optimized for headings */
  heading: "font-medium text-foreground",
} as const;

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing patterns for consistent vertical rhythm
 *
 * IMPORTANT: These tokens are for VERTICAL spacing (space-y-*) only.
 * For inline/horizontal spacing (gap-*, p-*, px-*, py-*), use numeric values.
 *
 * Valid Usage:
 * ✅ <div className={SPACING.section}>        // Vertical spacing between sections
 * ✅ <div className="flex gap-4">            // Horizontal gap (use numbers)
 * ✅ <div className="space-y-2">             // Small vertical spacing (use numbers)
 *
 * Invalid Usage:
 * ❌ <div className={`gap-${SPACING.compact}`}>     // SPACING has no 'compact' property
 * ❌ <div className={`space-y-${SPACING.tight}`}>  // SPACING has no 'tight' property
 * ❌ <div className={`p-${SPACING.content}`}>      // SPACING is for space-y only
 *
 * Available Properties:
 * - section: Major page sections (space-y-8 md:space-y-10 lg:space-y-14)
 * - subsection: Related content blocks (space-y-5 md:space-y-6 lg:space-y-8)
 * - content: Within content blocks (space-y-3 md:space-y-4 lg:space-y-5)
 * - prose: Running text paragraphs (space-y-5 md:space-y-6 lg:space-y-8)
 * - compact: Lists and alerts (space-y-2)
 *
 * @see /docs/ai/enforcement-rules.md#design-token-enforcement
 * @see /docs/ai/design-system-quick-ref.md for AI code generation guide
 *
 * @example Major page sections (largest gaps)
 * ```tsx
 * <div className={SPACING.section}>
 *   <section>Hero Section</section>
 *   <section>Features Section</section>
 *   <section>CTA Section</section>
 * </div>
 * ```
 *
 * @example Related content blocks within a section
 * ```tsx
 * <section>
 *   <h2>About Me</h2>
 *   <div className={SPACING.subsection}>
 *     <div>Experience block</div>
 *     <div>Skills block</div>
 *     <div>Education block</div>
 *   </div>
 * </section>
 * ```
 *
 * @example Content within a block (tightest spacing)
 * ```tsx
 * <div className={SPACING.content}>
 *   <h3>Project Title</h3>
 *   <p>Project description</p>
 *   <ul>Tech stack</ul>
 * </div>
 * ```
 *
 * @example Correct usage with numbers for gaps and padding
 * ```tsx
 * // ✅ Use numbers for flex/grid gaps
 * <div className="flex gap-4">
 *   <Button>Primary</Button>
 *   <Button>Secondary</Button>
 * </div>
 *
 * // ✅ Use numbers for padding
 * <div className="p-6 rounded-lg">
 *   <p>Card content</p>
 * </div>
 *
 * // ✅ Use numbers for tight vertical spacing
 * <ul className="space-y-2">
 *   <li>Item 1</li>
 *   <li>Item 2</li>
 * </ul>
 * ```
 */
export const SPACING = {
  /** Between major page sections (largest gaps) */
  section: "space-y-8 md:space-y-10 lg:space-y-14",

  /** Between related content blocks within a section */
  subsection: "space-y-5 md:space-y-6 lg:space-y-8",

  /** Within content blocks (tightest spacing) */
  content: "space-y-3 md:space-y-4 lg:space-y-5",
  // NOTE: Do NOT use SPACING.content in ArticleLayout wrapper
  // Blog content uses prose CSS classes from globals.css for natural paragraph spacing

  /** Running text and prose paragraphs (better readability for long-form content) */
  prose: "space-y-5 md:space-y-6 lg:space-y-8",
  // NOTE: Only use SPACING.prose for manually structured sections
  // Blog/article content relies on prose CSS classes, not design tokens

  /** Page hero/header sections with prose wrapper */
  proseHero: "prose space-y-4",

  /** Generic prose sections */
  proseSection: "prose space-y-4",

  /** Compact vertical spacing for lists and alerts (improved mobile space utilization) */
  compact: "space-y-2",

  /** Reduced spacing for list items (optimized for mobile scaling) - minimal gap between items */
  list: "",

  /** Blog post card lists (compact, optimized spacing for post grids) */
  postList: "space-y-2",

  /** Image elements in blog content (top/bottom margins) */
  image: "my-6 md:my-8",

  /** Blog post layout spacing (intentional gap-8 for visual hierarchy) */
  blogLayout: "gap-8",

  /** Content grid spacing (card grids, portfolio items) */
  contentGrid: "gap-6",

  /** Alternative subsection spacing (backwards compatibility, single value) */
  subsectionAlt: "space-y-6",

  /** Section divider spacing (bordered sections like "Other Projects", "Related Posts") */
  sectionDivider: {
    /** Container spacing: top margin and padding for bordered sections */
    container: "mt-8 md:mt-10 lg:mt-12 pt-6 md:pt-7 lg:pt-8",
    /** Heading bottom margin */
    heading: "mb-4 md:mb-5 lg:mb-6",
    /** Grid gap for card layouts */
    grid: "gap-4",
  },

  /** Activity feed spacing (content-focused, generous breathing room) */
  activity: {
    /** Spacing between individual threads (generous for visual separation) */
    threadGap: "space-y-8 md:space-y-10",
    /** Spacing between replies within a thread (comfortable but connected) */
    replyGap: "space-y-4",
    /** Spacing within activity content (title, description, metadata) */
    contentGap: "space-y-3",
    /** Spacing between action buttons (like, bookmark, share) */
    actionGap: "gap-6",
  },

  // Numeric-like properties for use in template literals (TEMPORARY - should be refactored)
  // These map to standard Tailwind values: xs=2, sm=3, md=4, lg=6, xl=8, 2xl=10
  xs: "2",
  sm: "3",
  md: "4",
  lg: "6",
  xl: "8",
  "2xl": "10",
  "1.5": "3",
  "0.5": "1",
} as const;

// ============================================================================
// NUMERIC SPACING (for padding, gaps, margins - NOT space-y)
// ============================================================================

/**
 * Numeric spacing values for use with padding (p-*), gaps (gap-*), margins (m-*)
 * These complement SPACING which is only for vertical spacing (space-y-*)
 */
export const SPACING_VALUES = {
  xs: "2", // 0.5rem
  sm: "3", // 0.75rem
  md: "4", // 1rem
  lg: "6", // 1.5rem
  xl: "8", // 2rem
} as const;

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

/**
 * Semantic color tokens for consistent alert, status, and interactive states
 * All colors automatically handle dark mode via CSS custom properties
 *
 * Philosophy:
 * - Success: Positive outcomes, confirmations, active states (green)
 * - Warning: Cautions, important notices, pending states (amber/yellow)
 * - Error: Errors, destructive actions, critical issues (red)
 * - Info: Informational content, neutral highlights (blue)
 * - Semantic accents: Categorization and theming (cyan, orange, purple, etc.)
 *
 * @example Alert state
 * ```tsx
 * <div className={SEMANTIC_COLORS.alert.critical.container}>
 *   <IconComponent className={SEMANTIC_COLORS.alert.critical.icon} />
 *   <p className={SEMANTIC_COLORS.alert.critical.text}>Error message</p>
 * </div>
 * ```
 *
 * @example Status indicator
 * ```tsx
 * <Badge className={SEMANTIC_COLORS.status.success}>Complete</Badge>
 * ```
 *
 * @example Interactive focus state
 * ```tsx
 * <button className={SEMANTIC_COLORS.interactive.focus}>Button</button>
 * ```
 */
export const SEMANTIC_COLORS = {
  /** Alert/notification state colors */
  alert: {
    critical: {
      border: "border-l-4 border-l-error",
      container: "bg-error-subtle",
      text: "text-error",
      icon: "text-error-dark dark:text-error-light",
      label: "text-error",
    },
    warning: {
      border: "border-l-4 border-l-warning",
      container: "bg-warning-subtle",
      text: "text-warning-foreground",
      icon: "text-warning-dark dark:text-warning-light",
      label: "text-warning-dark dark:text-warning-light",
    },
    info: {
      border: "border-l-4 border-l-info",
      container: "bg-info-subtle",
      text: "text-info",
      icon: "text-info-dark dark:text-info-light",
      label: "text-info",
    },
    success: {
      border: "border-l-4 border-l-success",
      container: "bg-success-subtle",
      text: "text-success",
      icon: "text-success-dark dark:text-success-light",
      label: "text-success",
    },
  },

  /** Status indicators (analytics, progress, metrics) */
  status: {
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    info: "bg-info text-info-foreground",
    inProgress: "bg-warning text-warning-foreground",
    error: "bg-error text-error-foreground",
    neutral: "bg-muted text-muted-foreground dark:bg-muted/50",
  },

  /** Activity feed interaction states (content-focused, subtle actions) */
  activity: {
    action: {
      /** Default state - subtle, low contrast (appears on hover) */
      default: "text-muted-foreground/60 hover:text-muted-foreground",
      /** Active state - full contrast when focused/hovered */
      active: "text-foreground hover:text-foreground/80",
      /** Liked state - warm red color */
      liked: "text-error dark:text-error-light",
      /** Bookmarked state - warm amber color */
      bookmarked: "text-warning dark:text-warning-light",
    },
  },

  /** Chart colors (map to CSS custom properties) */
  chart: {
    primary: "bg-chart-1 text-chart-1",
    secondary: "bg-chart-2 text-chart-2",
    tertiary: "bg-chart-3 text-chart-3",
    quaternary: "bg-chart-4 text-chart-4",
    quinary: "bg-chart-5 text-chart-5",
  },

  /** Interactive element states */
  interactive: {
    hover: "hover:bg-muted/50 dark:hover:bg-muted/30",
    active: "active:bg-muted dark:active:bg-muted/40",
    focus:
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
    disabled:
      "disabled:pointer-events-none disabled:opacity-50 dark:disabled:opacity-40",
  },

  /** Content highlighting and marks */
  highlight: {
    primary: "bg-warning-subtle text-foreground",
    mark: "bg-primary/10 dark:bg-primary/20 text-foreground",
    muted: "bg-muted/50 dark:bg-muted/30 text-muted-foreground",
  },

  /**
   * Semantic accent colors for categorization
   *
   * Comprehensive color library with consistent structure:
   * - badge: Background + text + border for badge components
   * - text: Text color only
   * - bg: Background color only
   * - light: 15% lighter variant
   * - dark: 15% darker variant
   *
   * Currently mapped to greyscale (chroma = 0)
   * To add color: Update CSS variables in globals.css (change chroma from 0 to 0.15-0.20)
   *
   * P3 wide-gamut support: @media (color-gamut: p3) queries ready for colorization
   *
   * Color groups:
   * - Blues: blue, cyan, sky, indigo, teal
   * - Greens: green, emerald, lime
   * - Purples/Pinks: purple, violet, pink, fuchsia, rose
   * - Reds/Oranges: red, orange, amber
   * - Yellows: yellow
   * - Neutrals: slate, neutral
   */
  accent: {
    // Blues
    blue: {
      badge:
        "bg-semantic-blue-subtle text-semantic-blue border-semantic-blue/20",
      text: "text-semantic-blue",
      bg: "bg-semantic-blue",
      light: "bg-semantic-blue-light text-foreground",
      dark: "bg-semantic-blue-dark text-background",
    },
    cyan: {
      badge:
        "bg-semantic-cyan-subtle text-semantic-cyan border-semantic-cyan/20",
      text: "text-semantic-cyan",
      bg: "bg-semantic-cyan",
      light: "bg-semantic-cyan-light text-foreground",
      dark: "bg-semantic-cyan-dark text-background",
    },
    sky: {
      badge: "bg-semantic-sky-subtle text-semantic-sky border-semantic-sky/20",
      text: "text-semantic-sky",
      bg: "bg-semantic-sky",
      light: "bg-semantic-sky-light text-foreground",
      dark: "bg-semantic-sky-dark text-background",
    },
    indigo: {
      badge:
        "bg-semantic-indigo-subtle text-semantic-indigo border-semantic-indigo/20",
      text: "text-semantic-indigo",
      bg: "bg-semantic-indigo",
      light: "bg-semantic-indigo-light text-foreground",
      dark: "bg-semantic-indigo-dark text-background",
    },
    teal: {
      badge:
        "bg-semantic-teal-subtle text-semantic-teal border-semantic-teal/20",
      text: "text-semantic-teal",
      bg: "bg-semantic-teal",
      light: "bg-semantic-teal-light text-foreground",
      dark: "bg-semantic-teal-dark text-background",
    },

    // Greens
    green: {
      badge:
        "bg-semantic-green-subtle text-semantic-green border-semantic-green/20",
      text: "text-semantic-green",
      bg: "bg-semantic-green",
      light: "bg-semantic-green-light text-foreground",
      dark: "bg-semantic-green-dark text-background",
    },
    emerald: {
      badge:
        "bg-semantic-emerald-subtle text-semantic-emerald border-semantic-emerald/20",
      text: "text-semantic-emerald",
      bg: "bg-semantic-emerald",
      light: "bg-semantic-emerald-light text-foreground",
      dark: "bg-semantic-emerald-dark text-background",
    },
    lime: {
      badge:
        "bg-semantic-lime-subtle text-semantic-lime border-semantic-lime/20",
      text: "text-semantic-lime",
      bg: "bg-semantic-lime",
      light: "bg-semantic-lime-light text-foreground",
      dark: "bg-semantic-lime-dark text-background",
    },

    // Purples & Pinks
    purple: {
      badge:
        "bg-semantic-purple-subtle text-semantic-purple border-semantic-purple/20",
      text: "text-semantic-purple",
      bg: "bg-semantic-purple",
      light: "bg-semantic-purple-light text-foreground",
      dark: "bg-semantic-purple-dark text-background",
    },
    violet: {
      badge:
        "bg-semantic-violet-subtle text-semantic-violet border-semantic-violet/20",
      text: "text-semantic-violet",
      bg: "bg-semantic-violet",
      light: "bg-semantic-violet-light text-foreground",
      dark: "bg-semantic-violet-dark text-background",
    },
    pink: {
      badge:
        "bg-semantic-pink-subtle text-semantic-pink border-semantic-pink/20",
      text: "text-semantic-pink",
      bg: "bg-semantic-pink",
      light: "bg-semantic-pink-light text-foreground",
      dark: "bg-semantic-pink-dark text-background",
    },
    fuchsia: {
      badge:
        "bg-semantic-fuchsia-subtle text-semantic-fuchsia border-semantic-fuchsia/20",
      text: "text-semantic-fuchsia",
      bg: "bg-semantic-fuchsia",
      light: "bg-semantic-fuchsia-light text-foreground",
      dark: "bg-semantic-fuchsia-dark text-background",
    },
    rose: {
      badge:
        "bg-semantic-rose-subtle text-semantic-rose border-semantic-rose/20",
      text: "text-semantic-rose",
      bg: "bg-semantic-rose",
      light: "bg-semantic-rose-light text-foreground",
      dark: "bg-semantic-rose-dark text-background",
    },

    // Reds & Oranges
    red: {
      badge: "bg-semantic-red-subtle text-semantic-red border-semantic-red/20",
      text: "text-semantic-red",
      bg: "bg-semantic-red",
      light: "bg-semantic-red-light text-foreground",
      dark: "bg-semantic-red-dark text-background",
    },
    orange: {
      badge:
        "bg-semantic-orange-subtle text-semantic-orange border-semantic-orange/20",
      text: "text-semantic-orange",
      bg: "bg-semantic-orange",
      light: "bg-semantic-orange-light text-foreground",
      dark: "bg-semantic-orange-dark text-background",
    },
    amber: {
      badge:
        "bg-semantic-amber-subtle text-semantic-amber border-semantic-amber/20",
      text: "text-semantic-amber",
      bg: "bg-semantic-amber",
      light: "bg-semantic-amber-light text-foreground",
      dark: "bg-semantic-amber-dark text-background",
    },

    // Yellows
    yellow: {
      badge:
        "bg-semantic-yellow-subtle text-semantic-yellow border-semantic-yellow/20",
      text: "text-semantic-yellow",
      bg: "bg-semantic-yellow",
      light: "bg-semantic-yellow-light text-foreground",
      dark: "bg-semantic-yellow-dark text-background",
    },

    // Neutrals & Grays
    slate: {
      badge:
        "bg-semantic-slate-subtle text-semantic-slate border-semantic-slate/20",
      text: "text-semantic-slate",
      bg: "bg-semantic-slate",
      light: "bg-semantic-slate-light text-foreground",
      dark: "bg-semantic-slate-dark text-background",
    },
    neutral: {
      badge:
        "bg-semantic-neutral-subtle text-semantic-neutral border-semantic-neutral/20",
      text: "text-semantic-neutral",
      bg: "bg-semantic-neutral",
      light: "bg-semantic-neutral-light text-foreground",
      dark: "bg-semantic-neutral-dark text-background",
    },
  },
} as const;

/**
 * Opacity scale for standardized transparency values
 * Use with colors: <div className={`bg-red-500 ${OPACITY.medium}`}>
 */
export const OPACITY = {
  /** Barely visible (5%) */
  ghost: "/5",
  /** Very subtle (10%) */
  subtle: "/10",
  /** Muted (20%) */
  muted: "/20",
  /** Medium transparency (50%) */
  medium: "/50",
  /** Strong/prominent (80%) */
  strong: "/80",
} as const;

// ============================================================================
// SERIES COLORS
// ============================================================================

/**
 * Series color palette for blog series theming
 *
 * Provides semantic color schemes for series badges, cards, and navigation.
 * All colors are optimized for light/dark mode with accessible contrast ratios.
 *
 * Color Selection Philosophy:
 * - Maps to semantic color categories (success, warning, error, info, accents)
 * - Semantic names tied to common series themes (tutorial, security, performance, etc.)
 * - WCAG AA contrast compliance for text on backgrounds
 * - Consistent with existing design token system
 *
 * @example
 * ```tsx
 * // Using series colors in components
 * <Badge className={SERIES_COLORS.tutorial.badge}>
 *   Tutorial Series
 * </Badge>
 *
 * <Card className={SERIES_COLORS.security.card}>
 *   {content}
 * </Card>
 * ```
 */
export const SERIES_COLORS = {
  /** Default series color (primary brand) */
  default: {
    /** Badge background/text */
    badge: "bg-primary/10 text-primary border-primary/20",
    /** Card accent (border, highlights) */
    card: "border-primary/20 hover:border-primary/40",
    /** Icon color */
    icon: "text-primary",
    /** Gradient key for hero images */
    gradient: "brand.primary" as const,
  },

  /** Tutorial/educational series (blue → info) */
  tutorial: {
    badge: SEMANTIC_COLORS.accent.sky.badge,
    card: "border-semantic-sky/20 hover:border-semantic-sky/40",
    icon: SEMANTIC_COLORS.accent.sky.text,
    gradient: "brand.primary" as const,
  },

  /** Security/hardening series (shield theme - cyan) */
  security: {
    badge: SEMANTIC_COLORS.accent.cyan.badge,
    card: "border-semantic-cyan/20 hover:border-semantic-cyan/40",
    icon: SEMANTIC_COLORS.accent.cyan.text,
    gradient: "brand.accent" as const,
  },

  /** Performance/optimization series (lightning theme - orange) */
  performance: {
    badge: SEMANTIC_COLORS.accent.orange.badge,
    card: "border-semantic-orange/20 hover:border-semantic-orange/40",
    icon: SEMANTIC_COLORS.accent.orange.text,
    gradient: "warm.fire" as const,
  },

  /** Architecture/design series (violet) */
  architecture: {
    badge: SEMANTIC_COLORS.accent.violet.badge,
    card: "border-semantic-violet/20 hover:border-semantic-violet/40",
    icon: SEMANTIC_COLORS.accent.violet.text,
    gradient: "brand.secondary" as const,
  },

  /** Development/coding series (emerald) */
  development: {
    badge: SEMANTIC_COLORS.accent.emerald.badge,
    card: "border-semantic-emerald/20 hover:border-semantic-emerald/40",
    icon: SEMANTIC_COLORS.accent.emerald.text,
    gradient: "cool.teal" as const,
  },

  /** Testing/QA series (green → success) */
  testing: {
    badge: "bg-success-subtle text-success border-success/20",
    card: "border-success/20 hover:border-success/40",
    icon: "text-success",
    gradient: "cool.forest" as const,
  },

  /** DevOps/deployment series (sky) */
  devops: {
    badge: SEMANTIC_COLORS.accent.sky.badge,
    card: "border-semantic-sky/20 hover:border-semantic-sky/40",
    icon: SEMANTIC_COLORS.accent.sky.text,
    gradient: "cool.sky" as const,
  },

  /** Career/soft skills series (warning → amber) */
  career: {
    badge:
      "bg-warning-subtle text-warning-dark dark:text-warning-light border-warning/20",
    card: "border-warning/20 hover:border-warning/40",
    icon: "text-warning-dark dark:text-warning-light",
    gradient: "warm.amber" as const,
  },

  /** Deep dive/advanced series (indigo) */
  advanced: {
    badge: SEMANTIC_COLORS.accent.indigo.badge,
    card: "border-semantic-indigo/20 hover:border-semantic-indigo/40",
    icon: SEMANTIC_COLORS.accent.indigo.text,
    gradient: "cool.ocean" as const,
  },

  /** Design/UI/UX series (pink) */
  design: {
    badge: SEMANTIC_COLORS.accent.pink.badge,
    card: "border-semantic-pink/20 hover:border-semantic-pink/40",
    icon: SEMANTIC_COLORS.accent.pink.text,
    gradient: "warm.rose" as const,
  },

  /** Quick tips/snippets series (lime) */
  tips: {
    badge: SEMANTIC_COLORS.accent.lime.badge,
    card: "border-semantic-lime/20 hover:border-semantic-lime/40",
    icon: SEMANTIC_COLORS.accent.lime.text,
    gradient: "vibrant.neon" as const,
  },

  /** Troubleshooting/debugging series (error → red) */
  debugging: {
    badge: "bg-error-subtle text-error border-error/20",
    card: "border-error/20 hover:border-error/40",
    icon: "text-error",
    gradient: "warm.fire" as const,
  },

  /** Neutral/general series (muted) */
  general: {
    badge: "bg-muted/50 text-muted-foreground border-border",
    card: "border-border hover:border-muted-foreground/40",
    icon: "text-muted-foreground",
    gradient: "neutral.slate" as const,
  },
} as const;

/**
 * Valid series color theme names
 */
export type SeriesColorTheme = keyof typeof SERIES_COLORS;

/**
 * Get series color configuration by theme name
 * Falls back to 'default' if theme not found
 *
 * @param theme - Series color theme name
 * @returns Series color configuration object
 *
 * @example
 * ```tsx
 * const colors = getSeriesColors('security');
 * <Badge className={colors.badge}>Security Series</Badge>
 * ```
 */
export function getSeriesColors(theme: string = "default") {
  return SERIES_COLORS[theme as SeriesColorTheme] || SERIES_COLORS.default;
}

// ============================================================================
// HOVER EFFECTS
// ============================================================================

/**
 * Hover effect patterns for interactive elements
 * Ensures consistent feedback across different component types
 *
 * All hover effects include:
 * - Smooth transitions (duration-300)
 * - Shadow elevation changes
 * - Optional transforms (lift, scale)
 * - Active state feedback
 *
 * @example Standard card hover (most common)
 * ```tsx
 * import { Card } from '@/components/ui/card'
 * import { HOVER_EFFECTS } from '@/lib/design-tokens'
 *
 * <Card className={HOVER_EFFECTS.card}>
 *   <CardHeader>
 *     <CardTitle>Project Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Project details...
 *   </CardContent>
 * </Card>
 * ```
 *
 * @example CTA card with border highlight
 * ```tsx
 * <Card className={HOVER_EFFECTS.cardCTA}>
 *   <CardHeader>
 *     <CardTitle>Get Started</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Sign up today!
 *   </CardContent>
 * </Card>
 * ```
 *
 * @example Interactive link
 * ```tsx
 * <Link href="/blog" className={HOVER_EFFECTS.link}>
 *   Read more →
 * </Link>
 * ```
 *
 * @example Button with feedback
 * ```tsx
 * <button className={cn('px-6 py-3 rounded-md', HOVER_EFFECTS.button)}>
 *   Click me
 * </button>
 * ```
 */
export const HOVER_EFFECTS = {
  /** Standard card hover (projects, posts, content cards) */
  card: "transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md",

  /** CTA card hover - highlights border instead of background */
  cardCTA:
    "transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md",

  /** Subtle hover for secondary/inline cards */
  cardSubtle:
    "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",

  /** Featured/hero cards (already prominent, minimal transform) */
  cardFeatured:
    "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md",

  /** Minimal hover for tertiary/subtle cards (shadow only) */
  cardMinimal: "transition-shadow duration-200 hover:shadow-md",

  /** Lift effect on hover (larger shadow + small upward transform) */
  cardLift: "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",

  /** Interactive buttons (FAB, CTAs) */
  button: "transition-shadow hover:shadow-xl active:scale-95 active:shadow-lg",

  /** Text links */
  link: "hover:underline underline-offset-4 decoration-skip-ink-none will-change-auto transition-colors active:opacity-70",

  /** Card glow effect on hover */
  cardGlow: "transition-all duration-300 hover:shadow-glow",

  /** Card tilt effect on hover (3D transform) */
  cardTilt:
    "transition-transform duration-300 hover:rotate-1 hover:scale-[1.02]",
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

/**
 * Animation System - Performance-First, CSS-Native
 *
 * Philosophy:
 * 1. CSS handles everything - no JavaScript animation libraries needed
 * 2. Use transform + opacity only (GPU-accelerated, 60fps)
 * 3. CSS handles reduced-motion globally via @media query
 * 4. Simple utility classes for common patterns
 *
 * The CSS custom properties are defined in globals.css under @theme inline.
 * These TypeScript constants reference those values for documentation.
 *
 * @example
 * ```tsx
 * // Scroll reveal with stagger (CSS classes)
 * {items.map((item, i) => (
 *   <div
 *     key={item.id}
 *     className={cn(
 *       ANIMATION.reveal.base,
 *       ANIMATION.reveal.up,
 *       isVisible && ANIMATION.reveal.visible,
 *       `stagger-${i + 1}`
 *     )}
 *   >
 *     {item.content}
 *   </div>
 * ))}
 *
 * // Simple hover effect
 * <Card className={ANIMATION.hover.lift}>...</Card>
 *
 * // Color transition (theme changes)
 * <div className={ANIMATION.transition.colors}>...</div>
 * ```
 *
 * @see src/app/globals.css for CSS custom properties and utility classes
 */
export const ANIMATION = {
  /** Duration scale (references CSS custom properties) */
  duration: {
    instant: "duration-[0ms]", // --duration-instant (0ms) - No animation
    fast: "duration-[150ms]", // --duration-fast (150ms) - Quick interactions
    normal: "duration-[300ms]", // --duration-normal (300ms) - Standard transitions
    slow: "duration-[500ms]", // --duration-slow (500ms) - Complex animations
  },

  /** Easing functions for animation curves */
  easing: {
    default: "ease", // Default cubic-bezier
    in: "ease-in", // Slow start
    out: "ease-out", // Slow end
    inOut: "ease-in-out", // Slow start and end
  },

  /** Transition utilities - Performance optimized */
  transition: {
    /** Base (opacity + transform, 300ms) - Default choice */
    base: "transition-base",
    /** Fast variant (opacity + transform, 150ms) */
    fast: "transition-fast",
    /** Slow variant (opacity + transform, 500ms) */
    slow: "transition-slow",
    /** Movement only (transform, 150ms) - Best for hover/interactive */
    movement: "transition-movement",
    /** Appearance (opacity + transform, 300ms) - Best for reveals */
    appearance: "transition-appearance",
    /** Theme (colors, 150ms) - Best for theme changes/hover states */
    theme: "transition-theme",
    /** @deprecated Use .transition-theme instead */
    colors: "transition-colors",
  },

  /** Scroll-reveal animation classes */
  reveal: {
    /** Initial hidden state - add this by default */
    hidden: "reveal-hidden",
    /** Visible state - add when element enters viewport */
    visible: "reveal-visible",
    /** Direction variants (combine with hidden/visible) */
    up: "reveal-up",
    down: "reveal-down",
    left: "reveal-left",
    right: "reveal-right",
    scale: "reveal-scale",
  },

  /** Hover effects */
  hover: {
    lift: "hover-lift", // Subtle lift on hover
  },

  /** Interactive feedback */
  interactive: {
    press: "press-effect", // Scale down on active/press
  },

  /** Stagger delays for lists (50ms increments) */
  stagger: {
    1: "stagger-1",
    2: "stagger-2",
    3: "stagger-3",
    4: "stagger-4",
    5: "stagger-5",
    6: "stagger-6",
  },

  /** Activity feed engagement animations */
  activity: {
    /** Like button interaction (scale down on click, smooth transition) */
    like: "transition-all duration-200 active:scale-95",
    /** Pulse animation (one-time pulse effect for reactions) */
    pulse: "animate-pulse-once",
    /** Count increment (scale up briefly when count changes) */
    countIncrement: "transition-transform duration-300 scale-110",
  },

  /** Homepage visual effect animations */
  effects: {
    /** Count-up animation for number reveals */
    countUp: "animate-count-up",
    /** Shimmer effect for loading and polish */
    shimmer: "animate-shimmer",
    /** Subtle pulse for interactive elements */
    pulse: "animate-pulse-subtle",
    /** Floating animation for parallax elements */
    float: "animate-float",
  },
} as const;

/**
 * @deprecated Use ANIMATION instead. These are kept for backwards compatibility.
 * Animation duration patterns for consistent motion design
 */
export const ANIMATIONS = {
  /** Fast transitions (hover states, small movements) */
  fast: "duration-200",

  /** Standard transitions (most UI interactions) */
  standard: "duration-300",

  /** Slow transitions (dramatic reveals, page transitions) */
  slow: "duration-500",
} as const;

// ============================================================================
// BORDERS & SHADOWS
// ============================================================================

/**
 * Border radius patterns for consistent rounded corners
 */
export const BORDERS = {
  /** Default card/component border radius */
  card: "rounded-lg",

  /** Button border radius */
  button: "rounded-md",

  /** Input border radius */
  input: "rounded-md",

  /** Badge border radius */
  badge: "rounded-md",

  /** Circular elements (avatars, FABs) */
  circle: "rounded-full",

  /** Dialog/modal border radius */
  dialog: "rounded-lg",

  /** Dropdown/popover border radius */
  dropdown: "rounded-md",

  /** Larger containers (hero sections, containers) */
  container: "rounded-xl",
} as const;

/**
 * Shadow elevation patterns
 *
 * Includes both the 3-tier content hierarchy system and semantic UI shadows.
 *
 * @example
 * ```tsx
 * // Content hierarchy (code blocks, tables, alerts)
 * <pre className={SHADOWS.tier1.combined}>...</pre>
 *
 * // Semantic UI shadows
 * <Card className={SHADOWS.card.rest}>
 *   {content}
 * </Card>
 * ```
 */
export const SHADOWS = {
  /** Tier 1: Reference content - Code blocks, important callouts (most prominent) */
  tier1: {
    /** Light mode shadow */
    light: "shadow-[0_2px_8px_rgb(0_0_0_/_0.12)]",
    /** Dark mode shadow */
    dark: "dark:shadow-[0_2px_8px_rgb(0_0_0_/_0.3)]",
    /** Combined (light + dark) */
    combined:
      "shadow-[0_2px_8px_rgb(0_0_0_/_0.12)] dark:shadow-[0_2px_8px_rgb(0_0_0_/_0.3)]",
  },

  /** Tier 2: Data content - Tables, structured content (medium prominence) */
  tier2: {
    /** Light mode shadow */
    light: "shadow-[0_1px_4px_rgb(0_0_0_/_0.08)]",
    /** Dark mode shadow */
    dark: "dark:shadow-[0_1px_4px_rgb(0_0_0_/_0.2)]",
    /** Combined (light + dark) */
    combined:
      "shadow-[0_1px_4px_rgb(0_0_0_/_0.08)] dark:shadow-[0_1px_4px_rgb(0_0_0_/_0.2)]",
    /** Hover state for interactive depth */
    hover:
      "hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.12)] dark:hover:shadow-[0_4px_12px_rgb(0_0_0_/_0.25)]",
  },

  /** Tier 3: Inline/embedded content - Alert banners, context clues (subtle) */
  tier3: {
    /** Light mode shadow */
    light: "shadow-[0_1px_2px_rgb(0_0_0_/_0.05)]",
    /** Dark mode shadow */
    dark: "dark:shadow-[0_1px_2px_rgb(0_0_0_/_0.15)]",
    /** Combined (light + dark) */
    combined:
      "shadow-[0_1px_2px_rgb(0_0_0_/_0.05)] dark:shadow-[0_1px_2px_rgb(0_0_0_/_0.15)]",
  },

  /** Subtle elevation (cards at rest) */
  sm: "shadow-sm",

  /** Standard elevation (hover states) */
  md: "shadow-md",

  /** High elevation (focused elements, modals) */
  lg: "shadow-lg",

  /** Maximum elevation (floating action buttons) */
  xl: "shadow-xl",

  /** Extra shadow (overlay, stacked elements) */
  "2xl": "shadow-2xl",

  /** Semantic card shadows */
  card: {
    rest: "shadow-sm",
    hover: "shadow-md",
    active: "shadow-lg",
  },

  /** Dropdown/popover shadows */
  dropdown: "shadow-lg",

  /** Modal shadows */
  modal: "shadow-xl",

  /** FAB shadows */
  fab: "shadow-xl",

  /** No shadow */
  none: "shadow-none",
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

/**
 * Standard breakpoint values for consistent responsive behavior
 * Based on Tailwind's default breakpoints
 */
export const BREAKPOINTS = {
  sm: "640px", // Small devices (phones in landscape)
  md: "768px", // Medium devices (tablets)
  lg: "1024px", // Large devices (laptops)
  xl: "1280px", // Extra large devices (desktops)
  "2xl": "1536px", // 2X large devices (large desktops)
} as const;

/**
 * Touch target sizes and button sizing for mobile accessibility
 *
 * Following Apple HIG and Material Design guidelines:
 * - Minimum touch target: 44x44px (accessible for most users)
 * - Comfortable spacing: 8px minimum between targets
 * - Mobile-first: All buttons 44px+ on mobile, can reduce on desktop with md: prefix
 *
 * @example
 * ```tsx
 * // Icon button (mobile first)
 * <button className={TOUCH_TARGET.iconMobile}>
 *   <Icon />
 * </button>
 *
 * // Text button (mobile first)
 * <button className={TOUCH_TARGET.textMobile}>
 *   Action
 * </button>
 *
 * // Responsive icon (44px mobile, 36px tablet+)
 * <button className="h-11 w-11 md:h-9 md:w-9">
 *   <Icon />
 * </button>
 * ```
 */
export const TOUCH_TARGET = {
  // ========== Size Standards ==========
  /** Minimum touch target (44x44px per WCAG AAA) */
  minimum: "44px",

  /** Comfortable touch target (48x48px) */
  comfortable: "48px",

  /** Large touch target for thumbs (56x56px) */
  large: "56px",

  /** Minimum spacing between targets (8px) */
  spacing: "8px",

  // ========== Mobile Icon Buttons (default) ==========
  /** Icon-only button (44x44px) - matches min touch target */
  iconMobile: "h-11 w-11",

  /** Small icon button (36x36px) - for dense layouts, use with caution */
  iconSmall: "h-9 w-9",

  // ========== Mobile Text Buttons ==========
  /** Standard text button (44px height with padding) */
  textMobile: "h-11 px-4",

  /** Large text button (48px height) */
  textLarge: "h-12 px-5",

  /** Small text button (36px height) - use sparingly */
  textSmall: "h-9 px-3",

  // ========== Combined Button Sizes ==========
  /** Standard button/link size (square) */
  standard: "h-12 w-12",

  /** Minimum recommended size (44x44px) */
  min: "min-h-11 min-w-11",

  // ========== Desktop Responsive Sizing ==========
  /** Icon button: 44px mobile, 36px tablet+, 32px desktop+ */
  iconResponsive: "h-11 w-11 md:h-9 md:w-9 lg:h-8 lg:w-8",

  /** Text button: 44px mobile, 40px tablet+, 36px desktop+ */
  textResponsive: "h-11 md:h-10 lg:h-9 px-4 md:px-3 lg:px-2",

  // ========== Action Group Spacing ==========
  /** Spacing between action buttons in a group (like, reply, share) */
  actionGroupGap: "gap-2 md:gap-1",

  // ========== Special Cases ==========
  /** FAB (floating action button) - always prominent */
  fab: "h-14 w-14",

  /** Mobile menu toggle button */
  menuToggle: "h-11 w-11",

  /** Close/dismiss button */
  close: "h-11 w-11 md:h-9 md:w-9",
} as const;

/**
 * Predefined button size classes for common patterns
 * Combines height, padding, and responsive breakpoints
 */
export const BUTTON_SIZES = {
  // ========== Mobile-First Variants ==========
  /** Icon-only buttons (mobile) */
  iconMobile: "h-11 w-11",

  /** Small text buttons (mobile) - fits activity action buttons */
  smallMobile: "h-11 px-3",

  /** Standard buttons (mobile) */
  standardMobile: "h-11 px-4",

  /** Large CTA buttons (mobile) */
  largeMobile: "h-12 px-6",

  // ========== Desktop Variants ==========
  /** Icon-only buttons (desktop) */
  iconDesktop: "h-9 w-9",

  /** Standard buttons (desktop) */
  standardDesktop: "h-10 px-5",

  /** Large buttons (desktop) */
  largeDesktop: "h-11 px-6",

  // ========== Responsive (Mobile-First) ==========
  /** Icon button with responsive sizing (44px → 36px → 32px) */
  iconResponsive: "h-11 w-11 md:h-9 md:w-9 lg:h-8 lg:w-8",

  /** Text button with responsive sizing */
  textResponsive: "h-11 md:h-10 px-4 md:px-3",

  /** Large button with responsive sizing */
  largeResponsive: "h-12 md:h-11 px-6 md:px-5",
} as const;

// ============================================================================
// PAGE LAYOUT PATTERNS
// ============================================================================

/**
 * Page-level layout patterns for core pages (/, /about, /contact, /resume)
 * Ensures consistent structure and spacing across all main pages
 *
 * @example
 * ```tsx
 * <div className={PAGE_LAYOUT.wrapper}>
 *   <PageHero />
 *   <PageSection>{content}</PageSection>
 * </div>
 * ```
 */
export const PAGE_LAYOUT = {
  /** Root page wrapper - provides consistent vertical rhythm */
  wrapper: "min-h-screen",

  /** Hero section spacing - larger than standard sections */
  hero: {
    /** Container for hero content - responsive top padding (mobile-first, scales up) */
    container: `mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pt-16 md:pt-24 lg:pt-32`,
    /** Hero title + description wrapper */
    content: SPACING.proseHero,
  },

  /** Archive page hero (blog, work, portfolio listings) - matches standard hero spacing */
  archiveHero: {
    /** Container for archive hero - consistent with standard hero for unified layout */
    container: `mx-auto ${CONTAINER_WIDTHS.archive} ${ARCHIVE_CONTAINER_PADDING} pt-16 md:pt-24 lg:pt-32 pb-8 md:pb-12`,
    /** Archive hero title + description wrapper */
    content: SPACING.proseHero,
    /** Padding variants for different archive hero styles */
    padding: {
      /** Full variant - maximum breathing room with background images */
      full: "pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20",
      /** Medium variant - moderate padding for minimal backgrounds */
      medium: "pt-24 md:pt-28 lg:pt-32 pb-10 md:pb-14",
      /** Minimal variant - standard padding without backgrounds */
      minimal: "pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12",
    },
  },

  /** Standard page section spacing */
  section: {
    /** Section container - no vertical padding (handled by parent gap) */
    container: `mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING}`,
    /** Section content wrapper */
    content: SPACING.subsection,
  },

  /** Prose/reading-optimized section (about page, long-form content) */
  proseSection: {
    /** Container for prose content - optimal reading width (65ch) */
    container: `mx-auto ${CONTAINER_WIDTHS.prose} ${CONTAINER_PADDING}  pt-6 md:pt-8 lg:pt-10 pb-6 md:pb-8 lg:pb-10`,
    /** Prose content wrapper */
    content: SPACING.prose,
  },

  /** Narrow section for forms (contact page) */
  narrowSection: {
    /** Container for narrow content */
    container: `mx-auto ${CONTAINER_WIDTHS.narrow} ${CONTAINER_PADDING}`,
    /** Content wrapper */
    content: SPACING.content,
  },
} as const;

/**
 * Hero section variants for different page types
 */
export const HERO_VARIANTS = {
  /** Standard hero (about, contact, projects) */
  standard: {
    title: TYPOGRAPHY.h1.standard,
    description: TYPOGRAPHY.description,
    spacing: SPACING.proseHero,
  },

  /** Homepage hero (larger, more prominent) */
  homepage: {
    title: TYPOGRAPHY.h1.hero,
    description: TYPOGRAPHY.description,
    spacing: SPACING.proseHero,
  },

  /** Article hero (blog posts) */
  article: {
    title: TYPOGRAPHY.h1.article,
    description: TYPOGRAPHY.description,
    spacing: SPACING.proseHero,
  },
} as const;

// ============================================================================
// SCROLL BEHAVIOR
// ============================================================================

/**
 * Scroll behavior and navigation settings
 *
 * @example
 * ```tsx
 * // Smooth scroll with offset for fixed header
 * window.scrollTo({
 *   top: targetY - SCROLL_BEHAVIOR.offset.standard,
 *   behavior: SCROLL_BEHAVIOR.behavior.smooth
 * });
 * ```
 */
export const SCROLL_BEHAVIOR = {
  /** Scroll behavior modes */
  behavior: {
    smooth: "smooth" as const,
    instant: "auto" as const,
  },

  /** Standard scroll offsets for fixed headers */
  offset: {
    /** Standard header height (80px) */
    standard: 80,
    /** Tall header or with announcement bar (100px) */
    tall: 100,
    /** Mobile with bottom nav (104px from bottom + header) */
    mobile: 104,
  },

  /** Scroll thresholds for UI elements */
  threshold: {
    /** Show back-to-top button after ~1.5 viewports */
    backToTop: 400,
    /** Show floating elements after minimal scroll */
    floating: 200,
  },

  /** Scroll snap settings */
  snap: {
    /** Scroll snap type for section navigation */
    type: "scroll-snap-y scroll-snap-mandatory" as const,
    /** Scroll snap alignment */
    align: "scroll-snap-start" as const,
  },
} as const;

// ============================================================================
// WORD SPACING
// ============================================================================

/**
 * Word spacing scale for improved typography and readability
 * Applied to headings and body text for better visual hierarchy
 *
 * Reference: https://tailkits.com/blog/tailwind-css-word-spacing/
 *
 * Usage patterns:
 * - ws-xs (0.05em): Metadata, small text, inline elements
 * - ws-sm (0.1em): Headings, lead text, subtle spacing
 * - ws-base (0.15em): Default body text, standard reading
 * - ws-md (0.25em): Large article titles, emphasized text
 * - ws-lg (0.5em): Extra-large display text, special emphasis
 * - ws-xl (0.75em): Decorative/ceremonial text
 * - ws-2xl (1em): Maximum spacing, special occasions
 *
 * @example
 * ```tsx
 * // Large article title with increased word spacing
 * <h1 className="text-5xl font-serif ws-md">Long Article Title Here</h1>
 *
 * // Body text with subtle spacing
 * <p className={`${TYPOGRAPHY.body} ws-xs`}>Reading content...</p>
 *
 * // Responsive word spacing
 * <h2 className="text-2xl ws-xs md:ws-sm">Responsive Heading</h2>
 * ```
 */
export const WORD_SPACING = {
  /** Extra small spacing for metadata and fine print (0.05em) */
  xs: "ws-xs",

  /** Small spacing for headings and lead text (0.1em) */
  sm: "ws-sm",

  /** Base spacing for standard body text (0.15em) */
  base: "ws-base",

  /** Medium spacing for large article titles (0.25em) */
  md: "ws-md",

  /** Large spacing for display text (0.5em) */
  lg: "ws-lg",

  /** Extra large spacing for special emphasis (0.75em) */
  xl: "ws-xl",

  /** Maximum spacing for decorative text (1em) */
  "2xl": "ws-2xl",
} as const;

// ============================================================================
// COMPONENT-SPECIFIC PATTERNS
// ============================================================================

/**
 * Grid layout patterns for consistent multi-column layouts
 *
 * @example
 * ```tsx
 * <div className={GRID_PATTERNS.two}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 * </div>
 * ```
 */
export const GRID_PATTERNS = {
  /** Two-column grid (1 col mobile, 2 col tablet+) */
  two: "grid grid-cols-1 md:grid-cols-2 gap-6",

  /** Three-column grid (1 col mobile, 3 col desktop) */
  three: "grid grid-cols-1 md:grid-cols-3 gap-6",

  /** Four-column grid (2 cols mobile, 4 cols desktop) */
  four: "grid grid-cols-2 md:grid-cols-4 gap-4",

  /** Auto-responsive grid (1 → 2 → 3 → 4 columns) */
  auto: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
} as const;

/**
 * Form input patterns for consistent form styling
 *
 * @example
 * ```tsx
 * import { cn } from "@/lib/utils";
 * <input
 *   className={cn(
 *     FORM_PATTERNS.input.base,
 *     FORM_PATTERNS.input.padding,
 *     FORM_PATTERNS.input.focus
 *   )}
 * />
 * ```
 */
export const FORM_PATTERNS = {
  /** Input base styles (border, background) */
  input: {
    base: "border border-input bg-background dark:bg-background/50",
    padding: "px-3 py-2",
    focus:
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
    disabled:
      "disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:opacity-40",
  },

  /** Textarea styles (extends input) */
  textarea: {
    base: "border border-input bg-background dark:bg-background/50 resize-none",
    padding: "px-3 py-2",
    focus:
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
  },

  /** Label styles */
  label:
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
} as const;

/**
 * Reusable class combinations for common component patterns
 */
export const COMPONENT_PATTERNS = {
  /** Page hero section (title + description) */
  pageHero: `${SPACING.proseHero}`,

  /** Card base styles (before hover effects) */
  card: `${BORDERS.card} border overflow-hidden`,

  /** Section wrapper */
  section: SPACING.section,

  /** Content wrapper */
  contentBlock: SPACING.content,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/** Type for container width variants */
export type ContainerWidth = keyof typeof CONTAINER_WIDTHS;

/** Type for heading variants */
export type HeadingVariant = keyof typeof TYPOGRAPHY.h1;

/** Type for hover effect variants */
export type HoverEffect = keyof typeof HOVER_EFFECTS;

/** Type for animation durations */
export type AnimationDuration = keyof typeof ANIMATIONS;

/** Type for word spacing variants */
export type WordSpacingVariant = keyof typeof WORD_SPACING;

/** Type for semantic color categories */
export type SemanticColorCategory = keyof typeof SEMANTIC_COLORS;

/** Type for alert state variants */
export type AlertVariant = keyof typeof SEMANTIC_COLORS.alert;

/** Type for status variants */
export type StatusVariant = keyof typeof SEMANTIC_COLORS.status;

/** Type for grid layout patterns */
export type GridPattern = keyof typeof GRID_PATTERNS;

// ============================================================================
// GRADIENTS
// ============================================================================

/**
 * Centralized gradient definitions for hero images, backgrounds, and UI elements
 * All gradients are designed for 1200×630px OG images with sufficient contrast
 * for text overlays on social media cards.
 *
 * Organization:
 * - brand: Primary brand gradients (blue, violet, cyan)
 * - warm: Warm color palettes (red, orange, yellow, pink)
 * - cool: Cool color palettes (blue, teal, green, indigo)
 * - neutral: Grayscale and muted tones
 * - vibrant: High-contrast, saturated combinations
 *
 * @example
 * ```tsx
 * // In components
 * <div className="bg-[linear-gradient(135deg,#3b82f6_0%,#8b5cf6_100%)]" />
 *
 * // In scripts
 * import { GRADIENTS } from '@/lib/design-tokens';
 * const bgGradient = GRADIENTS.brand.primary;
 * ```
 */
export const GRADIENTS = {
  /** Primary brand gradients */
  brand: {
    /** Primary brand gradient: blue-500 → violet-500 */
    primary: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",

    /** Secondary brand gradient: violet-500 → pink-500 */
    secondary: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",

    /** Accent brand gradient: blue-500 → cyan-500 */
    accent: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",

    /** Inverted brand gradient: violet-500 → blue-500 */
    inverted: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
  },

  /** Warm color gradients */
  warm: {
    /** Sunset: orange-500 → red-500 → pink-500 */
    sunset: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",

    /** Fire: red-500 → orange-500 */
    fire: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",

    /** Amber: yellow-500 → orange-500 */
    amber: "linear-gradient(135deg, #eab308 0%, #f97316 100%)",

    /** Rose: pink-400 → rose-500 */
    rose: "linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)",

    /** Coral: orange-400 → pink-500 */
    coral: "linear-gradient(135deg, #fb923c 0%, #ec4899 100%)",
  },

  /** Cool color gradients */
  cool: {
    /** Ocean: sky-500 → blue-600 → indigo-600 */
    ocean: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)",

    /** Teal: emerald-500 → teal-500 */
    teal: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",

    /** Sky: cyan-400 → blue-500 */
    sky: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",

    /** Forest: green-600 → emerald-500 */
    forest: "linear-gradient(135deg, #16a34a 0%, #10b981 100%)",

    /** Arctic: cyan-300 → indigo-400 */
    arctic: "linear-gradient(135deg, #67e8f9 0%, #818cf8 100%)",
  },

  /** Neutral/grayscale gradients */
  neutral: {
    /** Slate: slate-700 → slate-900 */
    slate: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",

    /** Charcoal: slate-800 → slate-950 */
    charcoal: "linear-gradient(135deg, #1e293b 0%, #020617 100%)",

    /** Silver: slate-400 → slate-600 */
    silver: "linear-gradient(135deg, #94a3b8 0%, #475569 100%)",

    /** Midnight: slate-900 → blue-950 */
    midnight: "linear-gradient(135deg, #0f172a 0%, #172554 100%)",
  },

  /** Vibrant/high-contrast gradients */
  vibrant: {
    /** Electric: purple-500 → fuchsia-500 */
    electric: "linear-gradient(135deg, #a855f7 0%, #d946ef 100%)",

    /** Neon: lime-400 → green-500 */
    neon: "linear-gradient(135deg, #a3e635 0%, #22c55e 100%)",

    /** Plasma: violet-600 → fuchsia-500 → orange-500 */
    plasma: "linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f97316 100%)",

    /** Aurora: emerald-400 → cyan-400 → blue-500 */
    aurora: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #3b82f6 100%)",
  },

  /** Effect gradients for animations and visual polish */
  effects: {
    /** Shimmer effect: subtle animated gradient for loading states */
    shimmer:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",

    /** Glow effect: soft gradient for hover states and borders */
    glow: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)",

    /** Glow effect (dark mode): enhanced glow for dark backgrounds */
    glowDark:
      "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)",
  },
} as const;

/**
 * Gradient keys for deterministic randomization
 * Flattened array of all gradient paths for indexing
 */
export const GRADIENT_KEYS = [
  "brand.primary",
  "brand.secondary",
  "brand.accent",
  "brand.inverted",
  "warm.sunset",
  "warm.fire",
  "warm.amber",
  "warm.rose",
  "warm.coral",
  "cool.ocean",
  "cool.teal",
  "cool.sky",
  "cool.forest",
  "cool.arctic",
  "neutral.slate",
  "neutral.charcoal",
  "neutral.silver",
  "neutral.midnight",
  "vibrant.electric",
  "vibrant.neon",
  "vibrant.plasma",
  "vibrant.aurora",
] as const;

/**
 * Get gradient value from dot-notation key
 * @example getGradient("brand.primary") → "linear-gradient(...)"
 */
export function getGradient(key: string): string {
  const [category, variant] = key.split(".") as [
    keyof typeof GRADIENTS,
    string,
  ];
  return (
    (GRADIENTS[category] as Record<string, string>)[variant] ||
    GRADIENTS.brand.primary
  );
}

// ============================================================================
// IMAGE PLACEHOLDERS
// ============================================================================

/**
 * Standard blur placeholder for Next.js Image components
 * Provides smooth loading experience with subtle gray placeholder
 *
 * Usage:
 * - Add placeholder="blur" to Image component
 * - Add blurDataURL={IMAGE_PLACEHOLDER.blur} for inline images
 * - For external images, consider using plaiceholder library
 *
 * @example
 * ```tsx
 * <Image
 *   src="/images/avatar.jpg"
 *   alt="Avatar"
 *   fill
 *   placeholder="blur"
 *   blurDataURL={IMAGE_PLACEHOLDER.blur}
 * />
 * ```
 */
export const IMAGE_PLACEHOLDER = {
  /** Standard gray blur placeholder (matches muted background) */
  blur: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=",
} as const;

// ============================================================================
// APP-SPECIFIC TOKENS (Interactive Features)
// ============================================================================

/**
 * App-specific design tokens for interactive, app-like features
 *
 * These tokens support progressive web app features, command palette,
 * gestures, and other native-like interactions.
 *
 * @example
 * ```tsx
 * <div className={`transition-all ${APP_TOKENS.ANIMATIONS.pageTransition}`}>
 *   {content}
 * </div>
 * ```
 */
export const APP_TOKENS = {
  /** Gesture interaction thresholds and parameters */
  GESTURES: {
    /** Minimum distance to trigger swipe action */
    swipeThreshold: "50px",
    /** Duration to hold for long-press detection */
    longPressDelay: "500ms",
    /** Maximum time for tap detection */
    tapMaxDuration: "200ms",
    /** Maximum movement allowed for tap */
    tapMaxMovement: "10px",
  },

  /** Animation timing and easing for app interactions */
  ANIMATIONS: {
    /** Page/view transition timing */
    pageTransition: "duration-200 ease-in-out",
    /** Optimistic UI update feedback */
    optimisticUpdate: "duration-100 ease-out",
    /** Pull-to-refresh animation */
    pullToRefresh: "duration-300",
    /** Command palette open/close */
    commandPalette: "duration-200 ease-in-out",
    /** Modal/dialog transitions */
    modal: "duration-150 ease-out",
    /** Toast notification entrance */
    toast: "duration-300 ease-out",
  },

  /** Touch target sizes following accessibility guidelines */
  TOUCH_TARGETS: {
    /** iOS Human Interface Guidelines minimum (44x44pt) */
    minimum: "min-h-[44px] min-w-[44px]",
    /** Material Design comfortable target (48x48dp) */
    comfortable: "min-h-[48px] min-w-[48px]",
    /** Generous target for frequently-used actions */
    large: "min-h-[56px] min-w-[56px]",
  },

  /** Z-index layering system for app UI elements */
  Z_INDEX: {
    /** Base content layer */
    base: "z-0",
    /** Sticky headers and navigation */
    sticky: "z-10",
    /** Floating action buttons */
    fab: "z-20",
    /** Dropdown menus and tooltips */
    dropdown: "z-30",
    /** Modal overlays */
    modal: "z-40",
    /** Command palette */
    commandPalette: "z-50",
    /** Toast notifications */
    toast: "z-60",
  },

  /** Keyboard shortcuts display formatting */
  KEYBOARD: {
    /** Key badge styling (Cmd, K, etc.) */
    keyBadge:
      "px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded",
    /** Shortcut separator (between keys) */
    separator: "text-muted-foreground/50",
  },
} as const;

/**
 * Modern Archive Card Variants
 *
 * Optimized card layouts for blog and work archive pages.
 * Fixes washed-out image issue with elevated images and lighter overlays.
 *
 * @example
 * ```tsx
 * // Elevated card with prominent image
 * <article className={ARCHIVE_CARD_VARIANTS.elevated.container}>
 *   <div className={ARCHIVE_CARD_VARIANTS.elevated.imageWrapper}>
 *     <Image className={ARCHIVE_CARD_VARIANTS.elevated.image} ... />
 *     <div className={ARCHIVE_CARD_VARIANTS.elevated.overlay} />
 *   </div>
 *   <div className={ARCHIVE_CARD_VARIANTS.elevated.content}>
 *     {content}
 *   </div>
 * </article>
 * ```
 */
export const ARCHIVE_CARD_VARIANTS = {
  /** Elevated image card - image on top, content below (recommended) */
  elevated: {
    container:
      "group rounded-xl border bg-card overflow-hidden hover:shadow-xl transition-all duration-300",
    imageWrapper:
      "relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-muted/50 dark:bg-muted/30",
    image:
      "object-cover group-hover:scale-105 transition-transform duration-500",
    /** Modern dark overlay matching blog cards */
    overlay:
      "absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70",
    badgeContainer: "absolute bottom-3 left-3 flex gap-2 z-10",
    badge:
      "backdrop-blur-md bg-white/20 dark:bg-white/20 border border-white/30 text-white",
    glassCard: "bg-background/95 backdrop-blur-sm rounded-lg p-4",
    content: "p-4 md:p-6 space-y-3",
  },

  /** Background image card - reduced overlay for visibility */
  background: {
    container:
      "group relative rounded-xl border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 min-h-[280px] md:min-h-[320px]",
    imageWrapper: "absolute inset-0 z-0 bg-muted/50 dark:bg-muted/30",
    image:
      "object-cover group-hover:scale-105 transition-transform duration-500",
    /** Modern dark overlay */
    overlay:
      "absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70",
    content: "relative z-10 p-6 md:p-8 flex flex-col justify-end h-full",
    /** Elevated glass card for content */
    glassCard: "bg-background/80 backdrop-blur-md rounded-t-2xl p-6 border-t",
  },

  /** Side-by-side layout - image left, content right */
  sideBySide: {
    container:
      "group flex gap-4 rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow duration-300",
    imageWrapper:
      "relative w-48 flex-shrink-0 overflow-hidden bg-muted/50 dark:bg-muted/30",
    image:
      "object-cover group-hover:scale-105 transition-transform duration-500",
    overlay: "hidden",
    badgeContainer: "flex gap-2",
    badge: "inline-flex",
    glassCard: "hidden",
    content: "flex-1 p-4 md:p-6 flex flex-col justify-between",
  },

  /** Hero card - large featured card */
  hero: {
    container:
      "group relative rounded-2xl overflow-hidden h-[500px] md:h-[600px] cursor-pointer hover:shadow-2xl transition-shadow duration-300",
    imageWrapper: "absolute inset-0 z-0 bg-muted/50 dark:bg-muted/30",
    image:
      "object-cover group-hover:scale-105 transition-transform duration-700",
    /** Modern dark overlay */
    overlay:
      "absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70",
    content: "absolute inset-x-0 bottom-0 p-6 md:p-12 text-white z-10",
    contentWrapper: "max-w-3xl",
  },
} as const;

/**
 * Archive Animation Variants (Framer Motion)
 *
 * Pre-configured animation variants for consistent archive page animations.
 * Use with Framer Motion for staggered card reveals.
 *
 * @example
 * ```tsx
 * <motion.div
 *   variants={ARCHIVE_ANIMATIONS.container}
 *   initial="hidden"
 *   animate="visible"
 * >
 *   {items.map((item, i) => (
 *     <motion.div
 *       key={item.id}
 *       variants={ARCHIVE_ANIMATIONS.item}
 *       transition={{ delay: i * 0.05 }}
 *     >
 *       <Card />
 *     </motion.div>
 *   ))}
 * </motion.div>
 * ```
 */
export const ARCHIVE_ANIMATIONS = {
  /** Container with stagger children */
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  /** Individual item fade-up */
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  },

  /** Card hover animation */
  cardHover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },

  /** Floating filter bar entrance */
  filterBar: {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  },
} as const;

/**
 * View Mode Options
 *
 * Layout configurations for different view modes in archive pages.
 *
 * @example
 * ```tsx
 * <div className={VIEW_MODES[viewMode].grid}>
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </div>
 * ```
 */
export const VIEW_MODES = {
  /** Compact grid - auto-fit columns */
  grid: {
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    cardPadding: "p-4",
    imageHeight: "aspect-[16/9]",
  },

  /** List view - single column with more detail */
  list: {
    grid: "space-y-6",
    cardPadding: "p-6",
    imageHeight: "aspect-[21/9]",
  },

  /** Magazine - hero + grid */
  magazine: {
    grid: "space-y-6",
    cardPadding: "p-4 md:p-6",
    imageHeight: "aspect-[16/9] md:aspect-[21/9]",
  },

  /** Masonry - Pinterest-style */
  masonry: {
    grid: "columns-1 md:columns-2 lg:columns-3 gap-6",
    cardPadding: "p-4 mb-6 break-inside-avoid",
    imageHeight: "aspect-auto",
  },
} as const;

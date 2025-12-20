/**
 * Design Tokens - Single Source of Truth for Design Decisions
 * 
 * This file centralizes all design decisions to ensure consistency across the site.
 * Use these constants instead of magic strings in components.
 * 
 * @see /docs/design/ux-ui-consistency-analysis.md for rationale and usage guidelines
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
  width: keyof typeof CONTAINER_WIDTHS = 'standard'
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
  position?: 'opening' | 'body' | 'closing';
  /** Whether content is contextual/supporting */
  isContextual?: boolean;
  /** Whether to apply font contrast system */
  useFontContrast?: boolean;
}): string {
  const { length = 0, position = 'body', isContextual = false, useFontContrast = false } = options;

  // Base font system
  if (useFontContrast) {
    return FONT_CONTRAST.base;
  }

  // Contextual content
  if (isContextual) {
    return PROGRESSIVE_TEXT.contextual;
  }

  // Position-based styling
  if (position === 'opening') {
    return PROGRESSIVE_TEXT.opening;
  }
  
  if (position === 'closing') {
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
    /** Standard page titles (about, projects, contact, blog listing) */
    standard: "text-3xl md:text-4xl font-semibold tracking-tight",
    
    /** Archive/listing page titles (about, blog archive, portfolio archive) */
    hero: "font-serif text-3xl md:text-4xl font-semibold tracking-tight ws-sm",
    
    /** Blog post titles (larger, more prominent) */
    article: "font-serif text-3xl md:text-5xl font-semibold tracking-tight leading-tight ws-md",
    
    /** Portfolio project titles */
    project: "font-serif text-3xl md:text-5xl font-semibold tracking-tight leading-tight ws-md",
    
    /** MDX content headings */
    mdx: "text-3xl md:text-4xl font-semibold tracking-tight ws-sm",
  },
  
  /** H2 heading variants */
  h2: {
    /** Standard section headings */
    standard: "text-xl md:text-2xl font-medium ws-xs",
    
    /** Featured content headings (blog post cards, featured sections) */
    featured: "font-serif text-2xl md:text-3xl font-semibold tracking-tight ws-sm",
    
    /** MDX content headings */
    mdx: "text-2xl md:text-3xl font-semibold tracking-tight ws-sm",
  },
  
  /** H3 heading variants */
  h3: {
    /** Standard subsection headings */
    standard: "text-lg md:text-xl font-medium ws-xs",
    
    /** MDX content headings */
    mdx: "font-sans text-lg md:text-xl font-bold tracking-tight ws-xs",
  },
  
  /** H4 heading variants */
  h4: {
    /** MDX content headings */
    mdx: "font-sans text-base md:text-lg font-bold tracking-tight",
  },
  
  /** H5 heading variants */
  h5: {
    /** MDX content headings */
    mdx: "font-sans text-sm md:text-base font-semibold tracking-tight",
  },
  
  /** H6 heading variants */
  h6: {
    /** MDX content headings */
    mdx: "font-sans text-sm font-semibold tracking-tight",
  },
  
  /** Special display text (stats, error titles, large numbers) */
  display: {
    /** Error page titles */
    error: "text-3xl md:text-4xl font-bold ws-xs",
    
    /** Large statistics/metrics display */
    stat: "text-3xl font-bold tracking-tight ws-xs",
    
    /** Extra large statistics display (homepage stats) */
    statLarge: "text-4xl md:text-5xl font-bold ws-sm",
  },
  
  /** Lead text / page descriptions */
  description: "text-lg md:text-xl text-muted-foreground ws-xs",
  
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
  
  /** Accordion/FAQ specific styling */
  accordion: {
    /** FAQ section heading */
    heading: "font-semibold text-2xl",
    /** FAQ question trigger */
    trigger: "text-left text-lg font-bold",
  },
  
  /** Logo/branding text */
  logo: {
    /** Small logo text (mobile nav, compact views) */
    small: "text-sm font-serif font-semibold leading-none",
    /** Medium logo text (default) */
    medium: "text-xl md:text-2xl font-serif font-semibold leading-none",
    /** Large logo text (headers, hero sections) */
    large: "text-3xl md:text-4xl font-serif font-semibold leading-none",
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
 * - section: Major page sections (space-y-10 md:space-y-12)
 * - subsection: Related content blocks (space-y-6 md:space-y-8)
 * - content: Within content blocks (space-y-4)
 * - proseHero: Page hero/header sections
 * - proseSection: Generic prose sections
 * - image: Image elements in blog content
 * 
 * @see /docs/ai/enforcement-rules.md#design-token-enforcement
 * 
 * @example
 * ```tsx
 * // Correct - use SPACING for vertical space-y patterns
 * <div className={SPACING.section}>
 *   <section>...</section>
 *   <section>...</section>
 * </div>
 * 
 * // Correct - use numbers for gap, padding, small spacing
 * <div className="flex gap-4">
 *   <div className="p-4">...</div>
 *   <div className="space-y-2">...</div>
 * </div>
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
} as const;

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

/**
 * Semantic color tokens for consistent alert, status, and interactive states
 * All colors automatically handle dark mode via Tailwind's dark: modifier
 * 
 * @example
 * ```tsx
 * // Alert state
 * <div className={SEMANTIC_COLORS.alert.critical.container}>
 *   <IconComponent className={SEMANTIC_COLORS.alert.critical.icon} />
 *   <p className={SEMANTIC_COLORS.alert.critical.text}>Error message</p>
 * </div>
 * 
 * // Status indicator
 * <Badge className={SEMANTIC_COLORS.status.success}>Complete</Badge>
 * 
 * // Interactive focus state
 * <button className={SEMANTIC_COLORS.interactive.focus}>Button</button>
 * ```
 */
export const SEMANTIC_COLORS = {
  /** Alert/notification state colors */
  alert: {
    critical: {
      border: "border-l-4 border-l-destructive/60",
      container: "bg-destructive/10 dark:bg-destructive/20",
      text: "text-destructive dark:text-destructive/90",
      icon: "text-destructive dark:text-destructive/80",
      label: "text-destructive dark:text-destructive/90",
    },
    warning: {
      border: "border-l-4 border-l-amber-500/60 dark:border-l-amber-500/70",
      container: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-900 dark:text-amber-100",
      icon: "text-amber-600 dark:text-amber-400",
      label: "text-amber-700 dark:text-amber-300",
    },
    info: {
      border: "border-l-4 border-l-primary/60",
      container: "bg-primary/10 dark:bg-primary/20",
      text: "text-primary dark:text-primary/90",
      icon: "text-primary dark:text-primary/80",
      label: "text-primary dark:text-primary/90",
    },
    success: {
      border: "border-l-4 border-l-green-500/60 dark:border-l-green-500/70",
      container: "bg-green-500/10 dark:bg-green-500/20",
      text: "text-green-900 dark:text-green-100",
      icon: "text-green-600 dark:text-green-400",
      label: "text-green-700 dark:text-green-300",
    },
  },
  
  /** Status indicators (analytics, progress, metrics) */
  status: {
    success: "bg-green-500 text-green-50 dark:bg-green-600 dark:text-green-50",
    warning: "bg-yellow-500 text-yellow-50 dark:bg-yellow-600 dark:text-yellow-50",
    info: "bg-blue-500 text-blue-50 dark:bg-blue-600 dark:text-blue-50",
    inProgress: "bg-amber-500 text-amber-50 dark:bg-amber-600 dark:text-amber-50",
    error: "bg-red-500 text-red-50 dark:bg-red-600 dark:text-red-50",
    neutral: "bg-muted text-muted-foreground dark:bg-muted/50",
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
    focus: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
    disabled: "disabled:pointer-events-none disabled:opacity-50 dark:disabled:opacity-40",
  },
  
  /** Content highlighting and marks */
  highlight: {
    primary: "bg-yellow-200/80 dark:bg-yellow-500/30 text-foreground",
    mark: "bg-primary/10 dark:bg-primary/20 text-foreground",
    muted: "bg-muted/50 dark:bg-muted/30 text-muted-foreground",
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
 * - Maps to existing gradient categories (brand, warm, cool, neutral, vibrant)
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
  /** Default series color (primary brand blue) */
  default: {
    /** Badge background/text */
    badge: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90 border-primary/20",
    /** Card accent (border, highlights) */
    card: "border-primary/20 hover:border-primary/40",
    /** Icon color */
    icon: "text-primary dark:text-primary/90",
    /** Gradient key for hero images */
    gradient: "brand.primary" as const,
  },

  /** Tutorial/educational series (blue → violet) */
  tutorial: {
    badge: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/20",
    card: "border-blue-500/20 hover:border-blue-500/40",
    icon: "text-blue-600 dark:text-blue-400",
    gradient: "brand.primary" as const,
  },

  /** Security/hardening series (shield theme - cyan → indigo) */
  security: {
    badge: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-500/20",
    card: "border-cyan-500/20 hover:border-cyan-500/40",
    icon: "text-cyan-600 dark:text-cyan-400",
    gradient: "brand.accent" as const,
  },

  /** Performance/optimization series (lightning theme - orange → red) */
  performance: {
    badge: "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border-orange-500/20",
    card: "border-orange-500/20 hover:border-orange-500/40",
    icon: "text-orange-600 dark:text-orange-400",
    gradient: "warm.fire" as const,
  },

  /** Architecture/design series (violet → pink) */
  architecture: {
    badge: "bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border-violet-500/20",
    card: "border-violet-500/20 hover:border-violet-500/40",
    icon: "text-violet-600 dark:text-violet-400",
    gradient: "brand.secondary" as const,
  },

  /** Development/coding series (emerald → teal) */
  development: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20",
    card: "border-emerald-500/20 hover:border-emerald-500/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    gradient: "cool.teal" as const,
  },

  /** Testing/QA series (green theme) */
  testing: {
    badge: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20",
    card: "border-green-500/20 hover:border-green-500/40",
    icon: "text-green-600 dark:text-green-400",
    gradient: "cool.forest" as const,
  },

  /** DevOps/deployment series (sky → blue) */
  devops: {
    badge: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/20",
    card: "border-sky-500/20 hover:border-sky-500/40",
    icon: "text-sky-600 dark:text-sky-400",
    gradient: "cool.sky" as const,
  },

  /** Career/soft skills series (amber → orange) */
  career: {
    badge: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20",
    card: "border-amber-500/20 hover:border-amber-500/40",
    icon: "text-amber-600 dark:text-amber-400",
    gradient: "warm.amber" as const,
  },

  /** Deep dive/advanced series (indigo → purple) */
  advanced: {
    badge: "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-500/20",
    card: "border-indigo-500/20 hover:border-indigo-500/40",
    icon: "text-indigo-600 dark:text-indigo-400",
    gradient: "cool.ocean" as const,
  },

  /** Design/UI/UX series (pink → rose) */
  design: {
    badge: "bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 border-pink-500/20",
    card: "border-pink-500/20 hover:border-pink-500/40",
    icon: "text-pink-600 dark:text-pink-400",
    gradient: "warm.rose" as const,
  },

  /** Quick tips/snippets series (lime → green) */
  tips: {
    badge: "bg-lime-500/10 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300 border-lime-500/20",
    card: "border-lime-500/20 hover:border-lime-500/40",
    icon: "text-lime-600 dark:text-lime-400",
    gradient: "vibrant.neon" as const,
  },

  /** Troubleshooting/debugging series (red → orange) */
  debugging: {
    badge: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20",
    card: "border-red-500/20 hover:border-red-500/40",
    icon: "text-red-600 dark:text-red-400",
    gradient: "warm.fire" as const,
  },

  /** Neutral/general series (slate) */
  general: {
    badge: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 border-slate-500/20",
    card: "border-slate-500/20 hover:border-slate-500/40",
    icon: "text-slate-600 dark:text-slate-400",
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
export function getSeriesColors(theme: string = 'default') {
  return SERIES_COLORS[theme as SeriesColorTheme] || SERIES_COLORS.default;
}

// ============================================================================
// HOVER EFFECTS
// ============================================================================

/**
 * Hover effect patterns for interactive elements
 * Ensures consistent feedback across different component types
 * 
 * @example
 * ```tsx
 * <Card className={HOVER_EFFECTS.card}>
 *   {content}
 * </Card>
 * ```
 */
export const HOVER_EFFECTS = {
  /** Standard card hover (projects, posts, content cards) */
  card: "transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md",
  
  /** CTA card hover - highlights border instead of background */
  cardCTA: "transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md",
  
  /** Subtle hover for secondary/inline cards */
  cardSubtle: "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
  
  /** Featured/hero cards (already prominent, minimal transform) */
  cardFeatured: "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md",
  
  /** Minimal hover for tertiary/subtle cards (shadow only) */
  cardMinimal: "transition-shadow duration-200 hover:shadow-md",
  
  /** Lift effect on hover (larger shadow + small upward transform) */
  cardLift: "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
  
  /** Interactive buttons (FAB, CTAs) */
  button: "transition-shadow hover:shadow-xl active:scale-95 active:shadow-lg",
  
  /** Text links */
  link: "hover:underline underline-offset-4 will-change-auto transition-colors active:opacity-70",
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
    instant: "duration-[0ms]",    // --duration-instant (0ms) - No animation
    fast: "duration-[150ms]",     // --duration-fast (150ms) - Quick interactions
    normal: "duration-[300ms]",   // --duration-normal (300ms) - Standard transitions
    slow: "duration-[500ms]",     // --duration-slow (500ms) - Complex animations
  },
  
  /** Easing functions for animation curves */
  easing: {
    default: "ease",        // Default cubic-bezier
    in: "ease-in",          // Slow start
    out: "ease-out",        // Slow end
    inOut: "ease-in-out",   // Slow start and end
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
    lift: "hover-lift",           // Subtle lift on hover
  },
  
  /** Interactive feedback */
  interactive: {
    press: "press-effect",        // Scale down on active/press
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
 * @example
 * ```tsx
 * // Using semantic shadow pattern
 * <Card className={SHADOWS.card.rest}>
 *   {content}
 * </Card>
 * ```
 */
export const SHADOWS = {
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
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

/**
 * Standard breakpoint values for consistent responsive behavior
 * Based on Tailwind's default breakpoints
 */
export const BREAKPOINTS = {
  sm: "640px",   // Small devices (phones in landscape)
  md: "768px",   // Medium devices (tablets)
  lg: "1024px",  // Large devices (laptops)
  xl: "1280px",  // Extra large devices (desktops)
  "2xl": "1536px", // 2X large devices (large desktops)
} as const;

/**
 * Touch target size for mobile accessibility
 */
export const TOUCH_TARGET = {
  /** Minimum recommended size (44x44px) */
  min: "min-h-11 min-w-11",
  
  /** Standard button/link size */
  standard: "h-12 w-12",
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
    /** Container for hero content - top padding accounts for sticky header */
    container: `mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12`,
    /** Hero title + description wrapper */
    content: SPACING.proseHero,
  },
  
  /** Archive page hero (blog, work, portfolio listings) - matches standard hero spacing */
  archiveHero: {
    /** Container for archive hero - consistent with standard hero for unified layout */
    container: `mx-auto ${CONTAINER_WIDTHS.archive} ${ARCHIVE_CONTAINER_PADDING} pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12`,
    /** Archive hero title + description wrapper */
    content: SPACING.proseHero,
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
    focus: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
    disabled: "disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:opacity-40",
  },
  
  /** Textarea styles (extends input) */
  textarea: {
    base: "border border-input bg-background dark:bg-background/50 resize-none",
    padding: "px-3 py-2",
    focus: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
  },
  
  /** Label styles */
  label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
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
  const [category, variant] = key.split(".") as [keyof typeof GRADIENTS, string];
  return (GRADIENTS[category] as Record<string, string>)[variant] || GRADIENTS.brand.primary;
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

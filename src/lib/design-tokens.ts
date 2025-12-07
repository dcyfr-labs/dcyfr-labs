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
 * @see /docs/ai/ENFORCEMENT_RULES.md#design-token-enforcement
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
  section: "space-y-10 md:space-y-12",
  
  /** Between related content blocks within a section */
  subsection: "space-y-6 md:space-y-8",
  
  /** Within content blocks (tightest spacing) */
  content: "space-y-4",
  
  /** Running text and prose paragraphs (better readability for long-form content) */
  prose: "space-y-6 md:space-y-8",
  
  /** Page hero/header sections with prose wrapper */
  proseHero: "prose space-y-4",
  
  /** Generic prose sections */
  proseSection: "prose space-y-4",
  
  /** Image elements in blog content (top/bottom margins) */
  image: "mt-6 mb-6 md:mt-8 md:mb-8",
} as const;

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
  card: "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-muted/30 active:scale-[0.98] active:shadow-md",
  
  /** Subtle hover for secondary/inline cards */
  cardSubtle: "transition-all duration-300 hover:shadow-md hover:bg-muted/50 active:scale-[0.99]",
  
  /** Featured/hero cards (already prominent, minimal transform) */
  cardFeatured: "transition-all duration-300 hover:shadow-xl active:scale-[0.99]",
  
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
} as const;

/**
 * Shadow elevation patterns
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
    container: `mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pt-12 md:pt-14 lg:pt-16 pb-10 md:pb-12 lg:pb-14 mb-12`,
    /** Hero title + description wrapper */
    content: SPACING.proseHero,
  },
  
  /** Archive page hero (blog, work, portfolio listings) - matches standard hero spacing */
  archiveHero: {
    /** Container for archive hero - consistent with standard hero for unified layout */
    container: `mx-auto ${CONTAINER_WIDTHS.archive} ${ARCHIVE_CONTAINER_PADDING} pt-12 md:pt-14 lg:pt-16 pb-10 md:pb-12 lg:pb-14 mb-12`,
    /** Archive hero title + description wrapper */
    content: SPACING.proseHero,
  },
  
  /** Standard page section spacing */
  section: {
    /** Section container - no vertical padding (handled by parent gap) */
    container: `mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} py-0`,
    /** Section content wrapper */
    content: SPACING.subsection,
  },
  
  /** Prose/reading-optimized section (about page, long-form content) */
  proseSection: {
    /** Container for prose content */
    container: `mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} py-6 md:py-8`,
    /** Prose content wrapper */
    content: SPACING.prose,
  },
  
  /** Narrow section for forms (contact page) */
  narrowSection: {
    /** Container for narrow content */
    container: `mx-auto ${CONTAINER_WIDTHS.narrow} ${CONTAINER_PADDING} py-10 md:py-14`,
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

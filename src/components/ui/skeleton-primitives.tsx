import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Design-Token-Aware Skeleton Primitives
 * 
 * These primitives automatically size based on the design system's typography
 * and spacing tokens. Using these ensures skeletons stay in sync with content
 * without manual dimension updates.
 * 
 * @see /docs/components/skeleton-sync-strategy.md
 */

// ============================================================================
// TYPOGRAPHY SKELETONS
// ============================================================================

export interface SkeletonTextProps {
  /** Number of lines to render */
  lines?: number;
  /** Width of last line (as Tailwind class like "w-3/4" or "w-full") */
  lastLineWidth?: string;
  /** Additional classes */
  className?: string;
  /** Gap between lines */
  gap?: "tight" | "normal" | "loose";
}

/**
 * Multi-line text skeleton for body content.
 * Automatically creates realistic text block appearance.
 */
export function SkeletonText({ 
  lines = 3, 
  lastLineWidth = "w-3/4",
  className,
  gap = "normal"
}: SkeletonTextProps) {
  const gapClass = {
    tight: "space-y-1",
    normal: "space-y-2",
    loose: "space-y-3",
  }[gap];

  return (
    <div className={cn(gapClass, className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? lastLineWidth : "w-full"
          )} 
        />
      ))}
    </div>
  );
}

export interface SkeletonHeadingProps {
  /** Heading level - determines height based on typography tokens */
  level: "h1" | "h2" | "h3" | "h4";
  /** Width (as Tailwind class) */
  width?: string;
  /** Variant affects size at different breakpoints */
  variant?: "standard" | "hero" | "article";
  /** Additional classes */
  className?: string;
}

/**
 * Heading skeleton tied to typography token sizes.
 * Heights match the actual heading typography scale.
 */
export function SkeletonHeading({ 
  level, 
  width = "w-3/4",
  variant = "standard",
  className 
}: SkeletonHeadingProps) {
  // Heights match TYPOGRAPHY tokens in design-tokens.ts
  const heights: Record<string, Record<string, string>> = {
    h1: {
      standard: "h-8 md:h-10",      // text-3xl md:text-4xl
      hero: "h-10 md:h-12",          // larger for homepage
      article: "h-10 md:h-14",       // text-3xl md:text-5xl
    },
    h2: {
      standard: "h-6 md:h-8",        // text-xl md:text-2xl
      hero: "h-8 md:h-10",
      article: "h-8 md:h-10",
    },
    h3: {
      standard: "h-5 md:h-6",        // text-lg md:text-xl
      hero: "h-6 md:h-7",
      article: "h-6 md:h-7",
    },
    h4: {
      standard: "h-4 md:h-5",        // text-base md:text-lg
      hero: "h-5 md:h-6",
      article: "h-5 md:h-6",
    },
  };

  return (
    <Skeleton className={cn(heights[level][variant], width, className)} />
  );
}

export interface SkeletonDescriptionProps {
  /** Number of lines */
  lines?: number;
  /** Width of last line */
  lastLineWidth?: string;
  /** Additional classes */
  className?: string;
}

/**
 * Description/lead text skeleton.
 * Matches TYPOGRAPHY.description size (text-lg md:text-xl).
 */
export function SkeletonDescription({ 
  lines = 2, 
  lastLineWidth = "w-3/4",
  className 
}: SkeletonDescriptionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-5 md:h-6", // text-lg md:text-xl
            i === lines - 1 ? lastLineWidth : "w-full"
          )} 
        />
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENT SKELETONS
// ============================================================================

export interface SkeletonAvatarProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional classes */
  className?: string;
}

/**
 * Avatar skeleton with standard sizes.
 */
export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20 md:h-24 md:w-24",
    xl: "h-32 w-32 md:h-40 md:w-40",
  };

  return <Skeleton className={cn(sizes[size], "rounded-full", className)} />;
}

export interface SkeletonBadgeProps {
  /** Number of badges */
  count?: number;
  /** Additional classes for container */
  className?: string;
}

/**
 * Badge group skeleton for tags, categories, etc.
 */
export function SkeletonBadges({ count = 3, className }: SkeletonBadgeProps) {
  // Varying widths for realistic appearance
  const widths = ["w-12", "w-16", "w-14", "w-20", "w-10"];
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn("h-5", widths[i % widths.length])} 
        />
      ))}
    </div>
  );
}

export interface SkeletonButtonProps {
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Width (as Tailwind class) */
  width?: string;
  /** Additional classes */
  className?: string;
}

/**
 * Button skeleton matching standard button sizes.
 */
export function SkeletonButton({ 
  size = "default", 
  width = "w-24",
  className 
}: SkeletonButtonProps) {
  const heights = {
    sm: "h-8",
    default: "h-10",
    lg: "h-12",
  };

  return (
    <Skeleton className={cn(heights[size], width, "rounded-md", className)} />
  );
}

export interface SkeletonMetadataProps {
  /** Include date skeleton */
  showDate?: boolean;
  /** Include reading time skeleton */
  showReadingTime?: boolean;
  /** Include view count skeleton */
  showViews?: boolean;
  /** Additional classes */
  className?: string;
}

/**
 * Metadata line skeleton for blog posts, articles.
 * Matches TYPOGRAPHY.metadata size.
 */
export function SkeletonMetadata({ 
  showDate = true, 
  showReadingTime = true, 
  showViews = false,
  className 
}: SkeletonMetadataProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {showDate && <Skeleton className="h-4 w-24" />}
      {showDate && showReadingTime && <Skeleton className="h-3 w-1" />}
      {showReadingTime && <Skeleton className="h-4 w-16" />}
      {showViews && (
        <>
          <Skeleton className="h-3 w-1" />
          <Skeleton className="h-4 w-12" />
        </>
      )}
    </div>
  );
}

// ============================================================================
// CONTENT BLOCK SKELETONS
// ============================================================================

export interface SkeletonParagraphsProps {
  /** Number of paragraph blocks */
  count?: number;
  /** Lines per paragraph */
  linesPerParagraph?: number;
  /** Additional classes */
  className?: string;
}

/**
 * Multiple paragraph skeleton for article/blog content.
 */
export function SkeletonParagraphs({ 
  count = 3, 
  linesPerParagraph = 3,
  className 
}: SkeletonParagraphsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonText 
          key={i} 
          lines={linesPerParagraph} 
          lastLineWidth={i === count - 1 ? "w-2/3" : "w-4/5"}
        />
      ))}
    </div>
  );
}

export interface SkeletonImageProps {
  /** Aspect ratio */
  aspectRatio?: "square" | "video" | "wide" | "portrait";
  /** Additional classes */
  className?: string;
}

/**
 * Image placeholder skeleton with standard aspect ratios.
 */
export function SkeletonImage({ 
  aspectRatio = "video", 
  className 
}: SkeletonImageProps) {
  const ratios = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
  };

  return (
    <Skeleton className={cn("w-full", ratios[aspectRatio], className)} />
  );
}

// ============================================================================
// CARD SKELETONS
// ============================================================================

export interface SkeletonCardProps {
  /** Card variant determines internal structure */
  variant?: "post" | "project" | "simple";
  /** Show image placeholder */
  showImage?: boolean;
  /** Additional classes */
  className?: string;
}

/**
 * Complete card skeleton matching common card patterns.
 * Use this for consistent card loading states.
 */
export function SkeletonCard({ 
  variant = "simple", 
  showImage = true,
  className 
}: SkeletonCardProps) {
  if (variant === "post") {
    return (
      <div className={cn("rounded-lg border overflow-hidden", className)}>
        {showImage && <SkeletonImage aspectRatio="video" />}
        <div className="p-4 space-y-3">
          <SkeletonMetadata />
          <SkeletonHeading level="h3" width="w-3/4" />
          <SkeletonText lines={2} />
          <SkeletonBadges count={3} />
        </div>
      </div>
    );
  }

  if (variant === "project") {
    return (
      <div className={cn("rounded-lg border overflow-hidden relative", className)}>
        {/* Background */}
        <div className="absolute inset-0 bg-muted/20" />
        
        {/* Content */}
        <div
           
          className="relative z-10 p-4 sm:p-6 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <SkeletonHeading level="h3" width="w-2/3" />
          <SkeletonText lines={2} />
          <SkeletonBadges count={3} />
        </div>
      </div>
    );
  }

  // Simple card
  return (
    <div className={cn("rounded-lg border p-4 space-y-3", className)}>
      <SkeletonHeading level="h3" width="w-2/3" />
      <SkeletonText lines={2} />
    </div>
  );
}

// ============================================================================
// LIST SKELETONS
// ============================================================================

export interface SkeletonListProps<T extends SkeletonCardProps["variant"]> {
  /** Number of items */
  count?: number;
  /** Item variant */
  variant?: T;
  /** Layout style */
  layout?: "list" | "grid";
  /** Grid columns */
  columns?: 1 | 2 | 3;
  /** Additional classes */
  className?: string;
}

/**
 * List of skeleton cards with configurable layout.
 */
export function SkeletonList({ 
  count = 3, 
  variant = "simple",
  layout = "list",
  columns = 2,
  className 
}: SkeletonListProps<SkeletonCardProps["variant"]>) {
  const layoutClass = layout === "grid" 
    ? `grid gap-4 ${columns === 1 ? "" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`
    : "space-y-4";

  return (
    <div className={cn(layoutClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}

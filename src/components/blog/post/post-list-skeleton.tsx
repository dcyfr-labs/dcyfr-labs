import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  SkeletonHeading,
  SkeletonText,
  SkeletonMetadata,
  SkeletonBadges,
  SkeletonImage,
} from '@/components/ui/skeleton-primitives';
import { SPACING, SPACING_VALUES, ANIMATIONS, ARCHIVE_CARD_VARIANTS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

/**
 * Skeleton loader for blog post list.
 * Displays while posts are loading.
 *
 * This component uses design-token-aware skeleton primitives to ensure
 * dimensions stay in sync with actual content automatically.
 *
 * ⚠️ SYNC REQUIRED WITH: src/components/blog/post/modern-post-card.tsx
 *
 * Structure must match ModernPostCard:
 * - Container: SPACING.postList vertical spacing
 * - Padding: p-{SPACING_VALUES.sm} sm:p-{SPACING_VALUES.md}
 * - Headings: SkeletonHeading (auto-sized to TYPOGRAPHY tokens)
 * - Text: SkeletonText (multi-line with proper gaps)
 * - Metadata: SkeletonMetadata (date, reading time, views)
 * - Animation: ANIMATIONS.stagger.normal (100ms between items)
 *
 * Layout variants:
 * - compact (default): SPACING.postList with border cards, background images
 * - grid: 2-column card layout with images
 * - list: Single column with larger cards
 * - magazine: Alternating large/small hero layout
 *
 * Last sync: 2026-01-31
 *
 * @see /docs/components/skeleton-sync-strategy.md
 */

interface PostListSkeletonProps {
  count?: number;
  /** @deprecated Use count instead. Provided for backward compatibility with BlogListSkeleton */
  itemCount?: number;
  layout?: 'magazine' | 'grid' | 'list' | 'compact' | 'grouped';
  /** Whether to include the full page wrapper (layout toggle, etc.) */
  includeWrapper?: boolean;
}

/**
 * Skeleton for layout toggle - matches the structure in DynamicBlogContent
 */
function LayoutToggleSkeleton() {
  return (
    <div className="mb-6 flex justify-end">
      <Skeleton className="h-9 w-[180px]" />
    </div>
  );
}

export function PostListSkeleton({
  count: countProp,
  itemCount,
  layout = 'compact',
  includeWrapper = true,
}: PostListSkeletonProps) {
  // Support both count and itemCount for backward compatibility
  const count = countProp ?? itemCount ?? 3;

  /**
   * Renders the skeleton content based on layout
   */
  function renderSkeletonContent() {
    // Compact layout (default) - dense list style
    if (layout === 'compact') {
      return (
        <div className={SPACING.postList}>
          {Array.from({ length: count }).map((_, i) => (
            <article
              key={i}
              className="group rounded-lg border overflow-hidden relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              style={{
                animationDelay: `${ANIMATIONS.stagger.normal * i}ms`,
                animation: ANIMATIONS.types.fadeIn,
              }}
            >
              {/* Background placeholder with gradient overlay */}
              <div className="absolute inset-0 z-0 bg-muted/20">
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background/80" />
              </div>

              {/* Post content - matches actual structure */}
              <div className={cn("relative z-10", `p-${SPACING_VALUES.sm} sm:p-${SPACING_VALUES.md}`)}>
                {/* Metadata row - using primitive */}
                <SkeletonMetadata
                  showDate
                  showReadingTime
                  showViews={false}
                  className={`mb-${SPACING_VALUES.sm}`}
                />

                {/* Title - using typography-aware primitive */}
                <SkeletonHeading level="h4" variant="standard" width="w-3/4" className={`mb-${SPACING_VALUES.xs}`} />

                {/* Summary - using multi-line primitive */}
                <SkeletonText lines={2} lastLineWidth="w-5/6" gap="tight" />
              </div>
            </article>
          ))}
        </div>
      );
    }

    // Grid layout
    if (layout === 'grid') {
      return renderGridSkeleton(count);
    }

    // List layout
    if (layout === 'list') {
      return renderListSkeleton(count);
    }

    // Magazine layout
    if (layout === 'magazine') {
      return renderMagazineSkeleton(count);
    }

    // Grouped layout
    if (layout === 'grouped') {
      return renderGroupedSkeleton();
    }

    // Fallback to compact with design tokens
    return (
      <div className={SPACING.content}>
        {Array.from({ length: count }).map((_, i) => (
          <article
            key={i}
            className={cn(
              "group rounded-lg border overflow-hidden relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
              `p-${SPACING_VALUES.md}`
            )}
            style={{
              animationDelay: `${ANIMATIONS.stagger.normal * i}ms`,
              animation: ANIMATIONS.types.fadeIn,
            }}
          >
            <SkeletonHeading level="h3" variant="standard" width="w-3/4" className={`mb-${SPACING_VALUES.sm}`} />
            <SkeletonText lines={1} lastLineWidth="w-full" gap="tight" />
          </article>
        ))}
      </div>
    );
  }

  // When includeWrapper is true, wrap skeleton in the same structure as DynamicBlogContent
  // This ensures the grid layout is consistent during SSR and initial hydration
  if (includeWrapper) {
    return (
      <div id="blog-posts" className="w-full">
        {/* Layout toggle skeleton (desktop only) */}
        <LayoutToggleSkeleton />

        <div>{renderSkeletonContent()}</div>
      </div>
    );
  }

  // Without wrapper, just return the skeleton content directly
  return renderSkeletonContent();
}

/**
 * Grid layout skeleton - 2-column card layout with images
 */
function renderGridSkeleton(count: number) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={cn("overflow-hidden", ARCHIVE_CARD_VARIANTS.elevated)}
          style={{
            animationDelay: `${ANIMATIONS.stagger.normal * i}ms`,
            animation: ANIMATIONS.types.fadeIn,
            transition: ANIMATIONS.transition.all,
          }}
        >
          {/* Image placeholder with aspect ratio */}
          <div className="relative">
            <SkeletonImage aspectRatio="video" />

            {/* Gradient overlay matching ModernPostCard */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

            {/* Floating badges - bottom left (matches ModernPostCard badgeContainer) */}
            <div className="absolute bottom-3 left-3 flex gap-2 z-10">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-14" />
            </div>

            {/* Quick actions overlay - top right (shown on hover in real card) */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>

          <CardHeader className={`pb-${SPACING_VALUES.sm}`}>
            {/* Title - auto-sized to typography tokens */}
            <SkeletonHeading level="h3" variant="standard" width="w-3/4" />
          </CardHeader>

          <CardContent className="pt-0">
            {/* Summary - multi-line primitive */}
            <SkeletonText lines={2} lastLineWidth="w-5/6" gap="tight" className={`mb-${SPACING_VALUES.sm}`} />

            {/* Metadata - using primitive */}
            <SkeletonMetadata showDate showReadingTime showViews={false} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * List layout skeleton - single column expanded cards
 */
function renderListSkeleton(count: number) {
  return (
    <div className={SPACING.subsection}>
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={cn("overflow-hidden", ARCHIVE_CARD_VARIANTS.elevated)}
          style={{
            animationDelay: `${ANIMATIONS.stagger.normal * i}ms`,
            animation: ANIMATIONS.types.fadeIn,
            transition: ANIMATIONS.transition.all,
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Image placeholder - square aspect ratio for side-by-side */}
            <div className="w-full md:w-64 shrink-0 relative">
              <SkeletonImage aspectRatio="square" />

              {/* Gradient overlay matching ModernPostCard */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

              {/* Floating badges - bottom left */}
              <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-14" />
              </div>

              {/* Quick actions overlay - top right */}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>

            <div className={`flex-1 p-${SPACING_VALUES.md}`}>
              {/* Metadata - using primitive */}
              <SkeletonMetadata showDate showReadingTime showViews className={`mb-${SPACING_VALUES.sm}`} />

              {/* Title - larger heading for list layout */}
              <SkeletonHeading level="h2" variant="article" width="w-3/4" className={`mb-${SPACING_VALUES.sm}`} />

              {/* Summary - 3 lines for expanded layout */}
              <SkeletonText lines={3} lastLineWidth="w-2/3" gap="tight" className={`mb-${SPACING_VALUES.sm}`} />

              {/* Tags - using badge primitive */}
              <SkeletonBadges count={2} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Magazine layout skeleton - alternating large/small
 */
function renderMagazineSkeleton(count: number) {
  return (
    <div className={SPACING.subsection}>
      {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
        <div
          key={i}
          className="grid md:grid-cols-5 gap-0"
          style={{
            animationDelay: `${ANIMATIONS.stagger.normal * i}ms`,
            animation: ANIMATIONS.types.fadeIn,
          }}
        >
          {/* Large featured card */}
          <div className={`md:col-span-3 ${i % 2 === 0 ? '' : 'md:order-last'}`}>
            <Card
              className={cn(
                "h-full overflow-hidden rounded-none md:rounded-lg",
                ARCHIVE_CARD_VARIANTS.background
              )}
              style={{ transition: ANIMATIONS.transition.all }}
            >
              <div className="relative">
                <SkeletonImage aspectRatio="wide" />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

                {/* Floating badges - bottom left */}
                <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>

                {/* Quick actions overlay - top right */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>

              <CardContent className={`p-${SPACING_VALUES.md}`}>
                <SkeletonHeading level="h2" variant="article" width="w-3/4" className={`mb-${SPACING_VALUES.sm}`} />
                <SkeletonText lines={2} lastLineWidth="w-5/6" gap="tight" />
              </CardContent>
            </Card>
          </div>

          {/* Smaller card */}
          <div className="md:col-span-2">
            <Card
              className={cn(
                "h-full overflow-hidden rounded-none md:rounded-lg",
                ARCHIVE_CARD_VARIANTS.elevated
              )}
              style={{ transition: ANIMATIONS.transition.all }}
            >
              <div className="relative">
                <SkeletonImage aspectRatio="video" />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

                {/* Floating badges - bottom left */}
                <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>

                {/* Quick actions overlay - top right */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>

              <CardContent className={`p-${SPACING_VALUES.md}`}>
                <SkeletonHeading level="h3" variant="standard" width="w-3/4" className={`mb-${SPACING_VALUES.sm}`} />
                <SkeletonText lines={1} lastLineWidth="w-full" gap="tight" />
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Grouped layout skeleton - categorized posts by category
 */
function renderGroupedSkeleton() {
  return (
    <div className={SPACING.subsection}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`border-b pb-${SPACING_VALUES.md} last:border-b-0`}>
          {/* Category heading - using typography-aware primitive */}
          <SkeletonHeading level="h3" variant="standard" width="w-48" className={`mb-${SPACING_VALUES.md}`} />

          {/* Posts in this category */}
          <div className={SPACING.content}>
            {Array.from({ length: 4 }).map((_, j) => (
              <article
                key={j}
                className="group rounded-lg border overflow-hidden relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                style={{
                  animationDelay: `${ANIMATIONS.stagger.fast * j}ms`,
                  animation: ANIMATIONS.types.fadeIn,
                }}
              >
                {/* Background placeholder */}
                <div className="absolute inset-0 z-0 bg-muted/20">
                  <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background/80" />
                </div>

                {/* Compact post content */}
                <div className={cn("relative z-10", `p-${SPACING_VALUES.sm} sm:p-${SPACING_VALUES.md}`)}>
                  {/* Metadata - using primitive */}
                  <SkeletonMetadata showDate showReadingTime showViews={false} className={`mb-${SPACING_VALUES.sm}`} />

                  {/* Title */}
                  <SkeletonHeading level="h4" variant="standard" width="w-3/4" className={`mb-${SPACING_VALUES.xs}`} />

                  {/* Summary */}
                  <SkeletonText lines={2} lastLineWidth="w-5/6" gap="tight" />
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

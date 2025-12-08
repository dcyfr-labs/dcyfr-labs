import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  SkeletonHeading, 
  SkeletonText, 
  SkeletonMetadata, 
  SkeletonBadges 
} from "@/components/ui/skeleton-primitives";
import { SPACING } from "@/lib/design-tokens";

/**
 * Skeleton loader for blog post list.
 * Displays while posts are loading.
 * 
 * This component uses design-token-aware skeleton primitives to ensure
 * dimensions stay in sync with actual content automatically.
 * 
 * ⚠️ STRUCTURE SYNC: src/components/blog/post/post-list.tsx
 * 
 * Layout variants:
 * - compact (default): SPACING.postList with border cards, background images
 * - grid: 2-column card layout with images
 * - list: Single column with larger cards
 * - magazine: Alternating large/small hero layout
 * 
 * @see /docs/components/skeleton-sync-strategy.md
 */

interface PostListSkeletonProps {
  count?: number;
  layout?: "grid" | "list" | "magazine" | "compact";
}

export function PostListSkeleton({ count = 3, layout = "compact" }: PostListSkeletonProps) {
  // Compact layout (default) - dense list style
  if (layout === "compact") {
    return (
      <div className={SPACING.postList}>
        {Array.from({ length: count }).map((_, i) => (
          <article key={i} className="group rounded-lg border overflow-hidden relative">
            {/* Background placeholder with gradient overlay */}
            <div className="absolute inset-0 z-0 bg-muted/20">
              <div className="absolute inset-0 bg-linear-to-b from-background/60 via-background/70 to-background/80" />
            </div>

            {/* Post content - matches actual structure */}
            <div className="relative z-10 p-3 sm:p-4">
              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-2">
                <Skeleton className="h-4 w-16" /> {/* Badge */}
                <Skeleton className="h-4 w-24" /> {/* Date */}
                <Skeleton className="h-3 w-1" />  {/* Separator */}
                <Skeleton className="h-4 w-16" /> {/* Reading time */}
                <Skeleton className="h-3 w-1 hidden md:inline-block" />  {/* Separator (desktop) */}
                <Skeleton className="h-4 w-32 hidden md:inline-block" /> {/* Tags (desktop) */}
              </div>
              
              {/* Title */}
              <Skeleton className="h-5 sm:h-6 md:h-7 w-3/4 mb-1" />
              
              {/* Summary - 2 lines */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  // Grid layout - 2-column card layout with images
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            {/* Image placeholder */}
            <Skeleton className="h-48 w-full" />
            <CardHeader className="pb-2">
              {/* Title */}
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="pt-0">
              {/* Summary */}
              <div className="space-y-1 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              {/* Metadata */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // List layout - single column expanded cards
  if (layout === "list") {
    return (
      <div className="space-y-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image placeholder */}
              <Skeleton className="h-48 md:h-auto md:w-64 shrink-0" />
              <div className="flex-1 p-4">
                {/* Metadata */}
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Title */}
                <Skeleton className="h-7 w-3/4 mb-2" />
                {/* Summary */}
                <div className="space-y-1 mb-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                {/* Tags */}
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Magazine layout - alternating large/small
  if (layout === "magazine") {
    return (
      <div className="space-y-8">
        {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
          <div key={i} className="grid md:grid-cols-5 gap-0">
            {/* Large featured card */}
            <div className={`md:col-span-3 ${i % 2 === 0 ? '' : 'md:order-last'}`}>
              <Card className="h-full overflow-hidden rounded-none md:rounded-lg">
                <Skeleton className="h-64 md:h-80 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-7 w-3/4 mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Smaller card */}
            <div className="md:col-span-2">
              <Card className="h-full overflow-hidden rounded-none md:rounded-lg">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback to compact
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="group rounded-lg border overflow-hidden relative p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </article>
      ))}
    </div>
  );
}

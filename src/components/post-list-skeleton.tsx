import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for blog post list.
 * Displays while posts are loading.
 * 
 * ⚠️ SYNC REQUIRED WITH: src/components/post-list.tsx
 * 
 * Structure must match PostList default layout:
 * - space-y-4 container
 * - article: group, rounded-lg, border, overflow-hidden, relative
 * - absolute background div with gradient overlay
 * - relative z-10 content wrapper with p-3 sm:p-4 padding
 * - Metadata row: flex-wrap, items-center, gap-x-2 gap-y-1, text-xs
 * - Title with responsive sizing
 * - Summary with line-clamp-2
 * 
 * Last synced: 2025-11-22
 * 
 * @see /docs/components/skeleton-sync-strategy.md for skeleton sync guidelines
 */
export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
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

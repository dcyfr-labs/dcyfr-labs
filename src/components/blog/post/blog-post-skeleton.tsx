import { Skeleton } from "@/components/ui/skeleton";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

/**
 * Skeleton loader for blog post content page.
 * Displays while MDX content is loading.
 * 
 * ⚠️ SKELETON SYNC REQUIRED
 * When updating blog post page structure, also update this skeleton:
 * - src/app/blog/[slug]/page.tsx (main blog post layout)
 * 
 * Key structural elements that must match:
 * - container: CONTAINER_WIDTHS.content (max-w-7xl)
 * - grid layout: lg:grid-cols-[280px_1fr]
 * - Left sidebar (hidden on mobile)
 * - Main content area with article
 * 
 * Last synced: 2025-11-27
 * 
 * @see /docs/components/blog-post-skeleton.md for detailed documentation
 * @see /docs/components/skeleton-sync-strategy.md for skeleton sync guidelines
 */
export function BlogPostSkeleton() {
  return (
    <div className={`container ${CONTAINER_WIDTHS.archive} mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-8`}>
      <div className="grid gap-8 items-start lg:grid-cols-[280px_1fr]">
        {/* Left Sidebar skeleton (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* ToC skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-2 pl-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
            {/* Metadata skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <article className="min-w-0">
          {/* Breadcrumbs */}
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Header */}
          <header className="mb-8">
            {/* Date and reading time */}
            <Skeleton className="h-4 w-48 mb-4" />
            
            {/* Title */}
            <Skeleton className="h-10 w-3/4 mb-4" />
            
            {/* Description */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </header>

          {/* Content */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

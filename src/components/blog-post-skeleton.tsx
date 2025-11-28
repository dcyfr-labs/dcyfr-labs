import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for blog post content page.
 * Displays while MDX content is loading.
 * 
 * ⚠️ SKELETON SYNC REQUIRED
 * When updating blog post page structure, also update this skeleton:
 * - src/app/blog/[slug]/page.tsx (main blog post layout)
 * 
 * Key structural elements that must match:
 * - article: mx-auto, max-w-3xl, py-14 md:py-20
 * - header section:
 *   - Date/updated info (text-xs, text-muted-foreground)
 *   - Title (h1, text-3xl md:text-4xl)
 *   - Summary (text-lg md:text-xl, text-muted-foreground)
 *   - Badges/tags section (flex-wrap, gap-2)
 * - prose content: mt-8, space-y-4 (8 paragraph blocks)
 * - Optional sections: Share buttons, comments, sources, related posts
 * 
 * Last synced: 2025-11-04
 * 
 * @see /docs/components/blog-post-skeleton.md for detailed documentation
 * @see /docs/components/skeleton-sync-strategy.md for skeleton sync guidelines
 */
export function BlogPostSkeleton() {
  return (
    <article className="mx-auto max-w-3xl py-14 md:py-20">
      {/* Header */}
      <header>
        {/* Date and updated info */}
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
          <Skeleton className="h-5 w-24" />
        </div>
      </header>

      {/* Content */}
      <div className="mt-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </article>
  );
}

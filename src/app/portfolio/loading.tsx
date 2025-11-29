import { ProjectCardSkeleton } from "@/components/projects/project-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";

/**
 * Loading state for portfolio page.
 * Uses same container structure as page.tsx to prevent layout shift.
 * 
 * @see src/app/portfolio/page.tsx - Must match structure exactly
 */
export default function Loading() {
  return (
    <div className={`container ${CONTAINER_WIDTHS.archive} mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-20 pb-8`}>
      {/* Header - matches page.tsx structure */}
      <div className="mb-8">
        <h1 className={TYPOGRAPHY.h1.hero}>Portfolio</h1>
        <p className="text-muted-foreground">A collection of our projects showcasing cyber architecture, development, and design.</p>
      </div>

      {/* Filters skeleton - matches ProjectFilters structure */}
      <div className="mb-8">
        <div className="space-y-6">
          {/* Search input - full width */}
          <Skeleton className="h-10 w-full" />
          
          {/* Filter controls row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex flex-wrap gap-3">
              <Skeleton className="h-10 flex-1 min-w-[130px]" /> {/* Status */}
              <Skeleton className="h-10 flex-1 min-w-[130px]" /> {/* Sort */}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid - 3 columns on lg, 2 on sm, 1 on mobile */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>

      {/* ProjectsCTA skeleton */}
      <div className="mt-12">
        <Card>
          <CardContent className="p-6 text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto mb-4" />
            <Skeleton className="h-10 w-32 mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

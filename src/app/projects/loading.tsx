import { ProjectCardSkeleton } from "@/components/projects/project-card-skeleton";
import { ArchiveLayout } from "@/components/layouts/archive-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading state for projects page.
 * Uses ArchiveLayout component to match actual page structure.
 * 
 * @see src/app/projects/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <ArchiveLayout
      title="Projects"
      description="Browse my portfolio of development projects, open-source contributions, and published work."
    >
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

      {/* Results count skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
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
    </ArchiveLayout>
  );
}

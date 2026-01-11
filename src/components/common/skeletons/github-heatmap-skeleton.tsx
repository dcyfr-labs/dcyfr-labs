import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for GitHub heatmap component.
 * Displays while contribution data is loading.
 *
 * Matches the structure of GitHubHeatmap component:
 * - Header with title and username link
 * - Statistics grid (5 stat cards)
 * - Contribution heatmap grid
 * - Footer with total contributions and date range
 */
export function GitHubHeatmapSkeleton() {
  return (
    <Card className="p-6 min-h-[400px]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Skeleton className="h-6 w-32" /> {/* "GitHub Activity" title */}
          <Skeleton className="h-4 w-24" /> {/* @username link */}
        </div>

        {/* Statistics Grid - 5 stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/50 rounded-lg p-3 border border-border"
            >
              <Skeleton className="h-4 w-20 mb-2" /> {/* Stat label */}
              <Skeleton className="h-8 w-12 mb-1" /> {/* Stat value */}
              <Skeleton className="h-3 w-8" /> {/* "days" or unit */}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1 min-w-full">
            {Array.from({ length: 53 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-3 rounded-sm" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer with contributions summary */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
          <Skeleton className="h-4 w-56" />{" "}
          {/* "X contributions in the last year" */}
          <Skeleton className="h-4 w-32" /> {/* Date range */}
        </div>
      </div>
    </Card>
  );
}

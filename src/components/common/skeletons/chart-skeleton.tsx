/**
 * Chart Skeleton
 *
 * Loading skeleton for analytics charts and data visualizations.
 * Used in dashboard pages and analytics sections.
 */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonHeading } from "@/components/ui/skeleton-primitives";

export interface ChartSkeletonProps {
  /** Chart type affects skeleton appearance */
  variant?: "bar" | "line" | "pie" | "donut";
  /** Show title skeleton */
  showTitle?: boolean;
  /** Show legend skeleton */
  showLegend?: boolean;
  /** Additional classes */
  className?: string;
}

// Deterministic bar heights for skeleton (no random values for React purity)
const BAR_HEIGHTS = ["60%", "85%", "45%", "75%", "50%", "90%", "65%", "55%"];

/**
 * Skeleton for chart components
 * Provides visual placeholder while data loads
 */
export function ChartSkeleton({
  variant = "bar",
  showTitle = true,
  showLegend = false,
  className,
}: ChartSkeletonProps) {
  return (
    <Card className={`p-6 ${className || ""}`}>
      {/* Title */}
      {showTitle && (
        <div className="mb-4">
          <SkeletonHeading level="h3" width="w-48" />
        </div>
      )}

      {/* Chart area */}
      <div className="h-64 w-full mb-4">
        {variant === "bar" && (
          <div className="h-full flex items-end justify-around gap-2">
            {BAR_HEIGHTS.map((height, i) => (
              <Skeleton
                key={i}
                className="w-full"
                style={{ height }}
              />
            ))}
          </div>
        )}

        {variant === "line" && (
          <div className="h-full w-full relative">
            <Skeleton className="absolute inset-0" />
          </div>
        )}

        {(variant === "pie" || variant === "donut") && (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-sm" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

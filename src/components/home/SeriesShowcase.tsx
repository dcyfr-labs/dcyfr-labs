"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import type { SeriesMetadata } from "@/data/posts";
import { TYPOGRAPHY, HOVER_EFFECTS, ANIMATION, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface SeriesShowcaseProps {
  /** Array of blog series to display */
  series: SeriesMetadata[];
  /** Maximum number of series to show */
  maxSeries?: number;
  /** Class name for container */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate progress percentage (all posts are published, so always 100%)
 * Can be enhanced later to track draft/in-progress posts
 */
function getProgressPercentage(series: SeriesMetadata): number {
  // For now, all published series are complete
  return 100;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SeriesShowcase Component
 *
 * Displays blog series with visual progress indicators.
 * Shows series metadata, post count, reading time, and completion status.
 *
 * Features:
 * - Gradient backgrounds per series
 * - Animated progress bars
 * - Post count and reading time badges
 * - Click to view all posts in series
 * - Smooth animations with stagger
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <SeriesShowcase
 *   series={allSeries}
 *   maxSeries={3}
 * />
 * ```
 */
export function SeriesShowcase({
  series,
  maxSeries = 3,
  className,
}: SeriesShowcaseProps) {
  const displaySeries = series.slice(0, maxSeries);

  if (displaySeries.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {displaySeries.map((item, index) => {
        const progress = getProgressPercentage(item);

        return (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={`/blog/series/${item.slug}`} className="block h-full group">
              <Card
                className={cn(
                  "h-full relative overflow-hidden",
                  HOVER_EFFECTS.card,
                  HOVER_EFFECTS.cardGlow
                )}
              >
                {/* Accent border */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-0.5 z-20 opacity-0 group-hover:opacity-100 border-t-2 border-primary",
                    ANIMATION.transition.appearance
                  )}
                />

                <CardHeader className={cn("pb-3", SPACING.compact)}>
                  {/* Series icon + title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={cn(
                          "p-2 rounded-lg bg-muted/50 group-hover:bg-muted group-hover:scale-110",
                          ANIMATION.transition.base
                        )}
                      >
                        <BookOpen
                          className={cn(
                            "h-5 w-5 text-muted-foreground group-hover:text-foreground",
                            ANIMATION.transition.theme
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <CardTitle className={cn(TYPOGRAPHY.h3.standard, "text-base")}>
                        {item.name}
                      </CardTitle>
                    </div>
                  </div>

                  {/* Metadata badges */}
                  <div className="flex items-center gap-2 pt-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs shrink-0 group-hover:scale-110",
                        ANIMATION.transition.movement
                      )}
                    >
                      {item.postCount} {item.postCount === 1 ? "post" : "posts"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs shrink-0 group-hover:scale-110",
                        ANIMATION.transition.movement
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                      {item.totalReadingTime} min
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className={SPACING.compact}>
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-4 text-sm text-muted-foreground group-hover:text-foreground",
                      ANIMATION.transition.theme
                    )}
                  >
                    <span>View series</span>
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 group-hover:translate-x-1",
                        ANIMATION.transition.movement
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

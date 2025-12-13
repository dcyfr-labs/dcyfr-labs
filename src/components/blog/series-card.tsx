"use client";

import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { SeriesMetadata } from "@/data/posts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HOVER_EFFECTS, SPACING, TYPOGRAPHY, BORDERS, ANIMATION, getSeriesColors } from "@/lib/design-tokens";
import { trackSeriesCardClick } from "@/lib/analytics";

export interface SeriesCardProps {
  /** Series metadata */
  series: SeriesMetadata;
  /** Position in the grid (0-indexed) */
  position?: number;
}

/**
 * SeriesCard Component
 *
 * Displays a series card in the series index page with metadata and theming.
 * Features:
 * - Color theming based on series.color
 * - Lucide icon support (series.icon)
 * - Post count and total reading time
 * - Clickable link to series archive page
 * - Hover effects with color-matched borders
 * - Analytics tracking on click
 *
 * @example
 * ```tsx
 * <SeriesCard series={seriesMetadata} position={0} />
 * ```
 */
export function SeriesCard({ series, position = 0 }: SeriesCardProps) {
  const colors = getSeriesColors(series.color);

  // Dynamically load Lucide icon if specified
  const IconComponent = series.icon
    ? (LucideIcons[series.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>) || BookOpen
    : BookOpen;

  const handleClick = () => {
    trackSeriesCardClick(
      series.slug,
      series.name,
      series.postCount,
      position
    );
  };

  return (
    <Link
      href={`/blog/series/${series.slug}`}
      className="block group"
      onClick={handleClick}
    >
      <Card
        className={cn(
          "h-full",
          HOVER_EFFECTS.card,
          colors.card
        )}
      >
        <CardHeader className={SPACING.compact}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "shrink-0 p-2",
              BORDERS.card,
              "transition-colors",
              colors.badge
            )}>
              <IconComponent className={cn("h-6 w-6", colors.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                TYPOGRAPHY.h3.standard,
                "group-hover:text-primary transition-colors line-clamp-2"
              )}>
                {series.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className={SPACING.content}>
          <CardDescription className="line-clamp-3">
            {series.description}
          </CardDescription>

          <div className={cn("flex flex-wrap gap-3", TYPOGRAPHY.metadata)}>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>
                {series.postCount} {series.postCount === 1 ? "post" : "posts"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{series.totalReadingTime} min</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className={cn(`flex items-center gap-2 ${TYPOGRAPHY.label.small} text-primary group-hover:gap-3 transition-[gap]`, ANIMATION.duration.fast)}>
            <span>Start Series</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

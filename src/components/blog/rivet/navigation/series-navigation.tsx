"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING, BORDERS, TYPOGRAPHY, ANIMATION, SPACING_SCALE } from '@/lib/design-tokens';
import { Button } from "@/components/ui/button";

export interface SeriesItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  isCompleted?: boolean;
}

export interface SeriesNavigationProps {
  seriesTitle: string;
  currentSlug: string;
  items: SeriesItem[];
  showAllParts?: boolean;
  className?: string;
}

/**
 * SeriesNavigation - Multi-part content series navigation
 *
 * Features:
 * - Previous/Next navigation between series items
 * - Optional full series index
 * - Progress indicator
 * - Current item highlighting
 * - Completion status tracking
 * - Responsive design
 *
 * @example
 * ```tsx
 * <SeriesNavigation
 *   seriesTitle="Security Best Practices"
 *   currentSlug="part-2-authentication"
 *   items={[
 *     { id: "1", title: "Part 1: Overview", slug: "part-1-overview" },
 *     { id: "2", title: "Part 2: Authentication", slug: "part-2-authentication" },
 *     { id: "3", title: "Part 3: Authorization", slug: "part-3-authorization" }
 *   ]}
 *   showAllParts
 * />
 * ```
 */
export function SeriesNavigation({
  seriesTitle,
  currentSlug,
  items,
  showAllParts = false,
  className,
}: SeriesNavigationProps) {
  const currentIndex = items.findIndex((item) => item.slug === currentSlug);
  const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
  const nextItem =
    currentIndex < items.length - 1 ? items[currentIndex + 1] : null;
  const currentItem = items[currentIndex];

  const completedCount = items.filter((item) => item.isCompleted).length;
  const progressPercentage = (completedCount / items.length) * 100;

  return (
    <div
      className={cn(
        "series-navigation",
        "border rounded-lg bg-card",
        BORDERS.card,
        `my-${SPACING_SCALE.lg}`,
        className
      )}
    >
      {/* Header */}
       <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <List className="h-4 w-4" />
              <span>Series</span>
            </div>
            <h3 className="text-lg font-semibold">{seriesTitle}</h3>
            {currentItem && (
              <p className="text-sm text-muted-foreground mt-1">
                Part {currentIndex + 1} of {items.length}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>
              {completedCount}/{items.length} completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-primary",
                ANIMATION.transition.base
              )}
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={items.length}
              aria-label={`Series progress: ${completedCount} of ${items.length} completed`}
            />
          </div>
        </div>
      </div>

      {/* All Parts List (Optional) */}
      {showAllParts && (
      <div className="p-4 border-b">
          <h4 className="text-sm font-semibold mb-3">All Parts</h4>
          <ol className={SPACING.compact}>
            {items.map((item, index) => {
              const isCurrent = item.slug === currentSlug;
              return (
                <li key={item.id}>
                  <Link
                    href={`/${item.slug}`}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm",
                      ANIMATION.transition.base,
                      "hover:bg-muted",
                      isCurrent
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground"
                    )}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : item.isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1 min-w-0">{item.title}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Previous/Next Navigation */}
      <div className="p-4">
        <nav
          className="flex items-center justify-between gap-4"
          aria-label="Series navigation"
        >
          {/* Previous */}
          {previousItem ? (
            <Link
              href={`/${previousItem.slug}`}
              className={cn(
                "flex-1 group",
                "p-4 rounded-lg border border-border",
                "hover:border-primary hover:bg-primary/5",
                ANIMATION.transition.base
              )}
            >
              <div className="flex items-start gap-3">
                <ChevronLeft className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    Previous
                  </div>
                  <div className="text-sm font-medium line-clamp-2">
                    {previousItem.title}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {/* Next */}
          {nextItem ? (
            <Link
              href={`/${nextItem.slug}`}
              className={cn(
                "flex-1 group",
                "p-4 rounded-lg border border-border",
                "hover:border-primary hover:bg-primary/5",
                ANIMATION.transition.base
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-xs text-muted-foreground mb-1">Next</div>
                  <div className="text-sm font-medium line-clamp-2">
                    {nextItem.title}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      </div>
    </div>
  );
}

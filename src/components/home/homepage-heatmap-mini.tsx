"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Zap, ArrowRight } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TYPOGRAPHY, SPACING, SEMANTIC_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/activity";
import {
  aggregateActivitiesByDate,
  calculateHeatmapStats,
  getHeatmapColorClass,
} from "@/lib/activity";

// Import styles for react-calendar-heatmap
import "react-calendar-heatmap/dist/styles.css";

// ============================================================================
// TYPES
// ============================================================================

interface HomepageHeatmapMiniProps {
  /** Activity items to visualize */
  activities?: ActivityItem[];
  /** Class name for container */
  className?: string;
  /** Loading state - renders skeleton version */
  loading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Homepage Heatmap Mini Component
 *
 * A compact 3-month activity heatmap for the homepage.
 * Shows activity intensity with simplified stats (active days + current streak).
 * Clicking navigates to the full activity page.
 *
 * **Loading State:**
 * Pass `loading={true}` to render skeleton version that matches the real component structure.
 * This ensures loading states never drift from the actual component layout.
 *
 * @example
 * ```tsx
 * <HomepageHeatmapMini activities={activities} />
 * ```
 *
 * @example
 * // Show loading skeleton
 * <HomepageHeatmapMini loading />
 */
export function HomepageHeatmapMini({
  activities = [],
  className,
  loading = false,
}: HomepageHeatmapMiniProps) {
  const router = useRouter();

  // Calculate date range - last 3 months (always call hooks before returns)
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    start.setDate(1);
    return { startDate: start, endDate: end };
  }, []);

  // Aggregate activities by date
  const heatmapData = useMemo(
    () => aggregateActivitiesByDate(activities, startDate, endDate),
    [activities, startDate, endDate]
  );

  // Calculate statistics
  const stats = useMemo(
    () => calculateHeatmapStats(heatmapData),
    [heatmapData]
  );

  // Handle date click - navigate to activity page with date filter
  const handleDateClick = (
    value: { date: string; count?: number } | undefined
  ) => {
    if (!value || !value.count) {
      // If empty day, just go to activity page
      router.push("/activity");
      return;
    }
    // Navigate to activity page with date filter
    router.push(`/activity?date=${value.date}`);
  };

  // Format date for tooltip
  const formatTooltipDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state - skeleton version matching real component structure
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={className}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4 md:p-8">
            {/* Header with View All skeleton */}
            <div className={cn("flex items-center justify-between gap-4 mb-4 md:mb-6")}>
              <div className="flex items-center gap-4">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>

            {/* Compact Stats Row skeleton */}
            <div className={cn("flex items-center gap-4 mb-4 md:mb-6")}>
              {/* Active Days */}
              <div className="flex items-center gap-4">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>

              {/* Current Streak */}
              <div className="flex items-center gap-4">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Heatmap Calendar skeleton */}
            <div className={SPACING.content}>
              <div className="space-y-2">
                {/* Month labels */}
                <Skeleton className="h-3 w-full mb-2" />
                {/* Heatmap grid - simplified skeleton */}
                {[...Array(4)].map((_, weekIndex) => (
                  <div key={weekIndex} className="flex gap-1">
                    {[...Array(7)].map((_, dayIndex) => (
                      <Skeleton
                        key={dayIndex}
                        className="h-3 w-3 rounded-sm"
                        style={{
                          animationDelay: `${(weekIndex * 7 + dayIndex) * 10}ms`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend skeleton */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-4">
                <Skeleton className="h-3 w-10" />
                <div className="flex items-center gap-4">
                  <Skeleton className="w-2 h-2 rounded-sm" />
                  <Skeleton className="w-2 h-2 rounded-sm" />
                  <Skeleton className="w-2 h-2 rounded-sm" />
                  <Skeleton className="w-2 h-2 rounded-sm" />
                  <Skeleton className="w-2 h-2 rounded-sm" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-8">
          {/* Header with View All */}
          <div
            className={cn(
              "flex items-center justify-between gap-4 mb-4 md:mb-6"
            )}
          >
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  SEMANTIC_COLORS.status.success
                )}
                aria-hidden="true"
              />
              <h3 className={TYPOGRAPHY.h3.standard}>Activity</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/activity")}
              className="text-muted-foreground hover:text-foreground gap-4"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Compact Stats Row */}
          <div className={cn("flex items-center gap-4 mb-4 md:mb-6")}>
            {/* Active Days */}
            <div className="flex items-center gap-4">
              <Calendar className="w-4 h-4 text-chart-1" aria-hidden="true" />
              <span className="text-sm">
                <span className="font-semibold">{stats.activeDays}</span>{" "}
                <span className="text-muted-foreground">active days</span>
              </span>
            </div>

            {/* Current Streak */}
            <div className="flex items-center gap-4">
              <Zap className="w-4 h-4 text-chart-2" aria-hidden="true" />
              <span className="text-sm">
                <span className="font-semibold">{stats.currentStreak}</span>{" "}
                <span className="text-muted-foreground">day streak</span>
              </span>
            </div>
          </div>

          {/* Heatmap Calendar - Compact */}
          <div className={SPACING.content}>
            <div
              className={cn(
                "overflow-x-auto cursor-pointer",
                // Reduce visual weight
                "[&_.react-calendar-heatmap]:text-[10px]"
              )}
              onClick={() => router.push("/activity")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push("/activity");
                }
              }}
              aria-label="View full activity heatmap"
            >
              <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value) return "color-empty";
                  return getHeatmapColorClass(value.count);
                }}
                titleForValue={(value) => {
                  if (!value || value.count === 0) {
                    return `No activities on ${formatTooltipDate(value?.date || "")}`;
                  }
                  return `${value.count} ${value.count === 1 ? "activity" : "activities"} on ${formatTooltipDate(value.date)}`;
                }}
                onClick={handleDateClick}
                showWeekdayLabels={false}
                showMonthLabels={true}
                monthLabels={[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ]}
                showOutOfRangeDays={true}
                gutterSize={3}
              />
            </div>

            {/* Legend - Compact */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-4">
                {}
                <div className="w-2 h-2 rounded-sm bg-muted border border-border" />
                <div className="w-2 h-2 rounded-sm bg-chart-1/20 dark:bg-chart-1/30" />
                <div className="w-2 h-2 rounded-sm bg-chart-1/40 dark:bg-chart-1/50" />
                <div className="w-2 h-2 rounded-sm bg-chart-1/60 dark:bg-chart-1/70" />
                <div className="w-2 h-2 rounded-sm bg-chart-1 dark:bg-chart-1/90" />
              </div>
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

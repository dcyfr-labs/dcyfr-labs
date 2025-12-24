"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Zap, ArrowRight } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TYPOGRAPHY, SPACING, NEON_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/activity/types";
import {
  aggregateActivitiesByDate,
  calculateHeatmapStats,
  getHeatmapColorClass,
} from "@/lib/activity/heatmap";

// Import styles for react-calendar-heatmap
import "react-calendar-heatmap/dist/styles.css";

// ============================================================================
// TYPES
// ============================================================================

interface HomepageHeatmapMiniProps {
  /** Activity items to visualize */
  activities: ActivityItem[];
  /** Class name for container */
  className?: string;
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
 * @example
 * ```tsx
 * <HomepageHeatmapMini activities={activities} />
 * ```
 */
export function HomepageHeatmapMini({
  activities,
  className,
}: HomepageHeatmapMiniProps) {
  const router = useRouter();

  // Calculate date range - last 3 months
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
  const stats = useMemo(() => calculateHeatmapStats(heatmapData), [heatmapData]);

  // Handle date click - navigate to activity page with date filter
  const handleDateClick = (value: { date: string; count?: number } | undefined) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-5">
          {/* Header with View All */}
          <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full animate-pulse", NEON_COLORS.lime.dot)} aria-hidden="true" />
              <h3 className={TYPOGRAPHY.h3.standard}>Activity</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/activity")}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Compact Stats Row */}
          <div className="flex items-center gap-4 mb-3 md:mb-4">
            {/* Active Days */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span className="text-sm">
                <span className="font-semibold">{stats.activeDays}</span>{" "}
                <span className="text-muted-foreground">active days</span>
              </span>
            </div>

            {/* Current Streak */}
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />
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
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ]}
                showOutOfRangeDays={true}
                gutterSize={3}
              />
            </div>

            {/* Legend - Compact */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-0.5">
                {/* eslint-disable-next-line no-restricted-syntax -- Chart visualization colors */}
                <div className="w-2 h-2 rounded-sm bg-muted border border-border" />
                <div className="w-2 h-2 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-2 h-2 rounded-sm bg-green-300 dark:bg-green-800" />
                <div className="w-2 h-2 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-2 h-2 rounded-sm bg-green-500 dark:bg-green-600" />
              </div>
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

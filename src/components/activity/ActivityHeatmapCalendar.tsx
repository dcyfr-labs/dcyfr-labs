"use client";

import { useMemo, useState, useRef } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Zap, Target, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TYPOGRAPHY, SPACING, SEMANTIC_COLORS } from "@/lib/design-tokens";
import type { ActivityItem } from "@/lib/activity";
import {
  aggregateActivitiesByDate,
  calculateHeatmapStats,
  getHeatmapColorClass,
  type ActivityHeatmapDay,
} from "@/lib/activity";
import { exportHeatmapAsImage } from "@/lib/activity";

// Import styles for react-calendar-heatmap
import "react-calendar-heatmap/dist/styles.css";

// ============================================================================
// TYPES
// ============================================================================

interface ActivityHeatmapCalendarProps {
  /** Activity items to visualize */
  activities: ActivityItem[];
  /** Callback when a date is clicked for filtering */
  onDateClick?: (date: string, activityIds: string[]) => void;
  /** Number of months to display (default: 12) */
  monthsToShow?: 3 | 6 | 12;
  /** Class name for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Activity Heatmap Calendar Component
 *
 * Displays a calendar heatmap showing activity intensity over time.
 * Similar to GitHub's contribution graph, but for all activity sources.
 *
 * Features:
 * - 12-month calendar view (configurable)
 * - Color intensity based on activity count
 * - Hover tooltips with date + count + top sources
 * - Click-to-filter interaction
 * - Statistics cards (total, average, streaks, busiest day)
 * - Responsive design (mobile: 3 months, tablet: 6 months, desktop: 12 months)
 * - Keyboard navigation and screen reader support
 *
 * @example
 * ```tsx
 * <ActivityHeatmapCalendar
 *   activities={activities}
 *   onDateClick={(date, ids) => filterToDate(date)}
 *   monthsToShow={12}
 * />
 * ```
 */
export function ActivityHeatmapCalendar({
  activities,
  onDateClick,
  monthsToShow = 12,
  className,
}: ActivityHeatmapCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const heatmapRef = useRef<HTMLDivElement>(null);

  // Calculate date range based on monthsToShow
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();

    // Calculate months ago
    start.setMonth(start.getMonth() - monthsToShow);
    start.setDate(1); // Start from first day of that month

    return { startDate: start, endDate: end };
  }, [monthsToShow]);

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

  // Handle date click
  const handleDateClick = (
    value:
      | {
          date: string;
          count?: number;
          topSources?: string[];
          activityIds?: string[];
        }
      | undefined
  ) => {
    if (!value || !value.count) return;

    setSelectedDate(value.date);
    onDateClick?.(value.date, value.activityIds || []);
  };

  // Format date for tooltip
  const formatTooltipDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle export as image
  const handleExport = async () => {
    if (!heatmapRef.current) {
      alert("Export failed: Heatmap element not found. Please try again.");
      return;
    }

    setIsExporting(true);

    try {
      const result = await exportHeatmapAsImage({
        element: heatmapRef.current,
        quality: 1.0,
        scale: 2,
      });

      if (result.success) {
        alert(`Export successful! Heatmap saved as ${result.filename}`);
      } else {
        alert(`Export failed: ${result.error || "An unknown error occurred."}`);
      }
    } catch (error) {
      alert(
        `Export failed: ${error instanceof Error ? error.message : "An unknown error occurred."}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <Card>
        <CardContent className="p-6" ref={heatmapRef}>
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h3 className={TYPOGRAPHY.h3.standard}>Activity Heatmap</h3>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {stats.totalActivities.toLocaleString()} activities in{" "}
                {monthsToShow} months
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="gap-3"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export PNG"}
              </Button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Activities */}
            <motion.div
              className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar
                  className="w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">
                  Active Days
                </span>
              </div>
              <div className={TYPOGRAPHY.display.stat}>{stats.activeDays}</div>
              <div className="text-xs text-muted-foreground">
                of {heatmapData.length} days
              </div>
            </motion.div>

            {/* Current Streak */}
            <motion.div
              className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap
                  className="w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">
                  Current Streak
                </span>
              </div>
              <div className={TYPOGRAPHY.display.stat}>
                {stats.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground">days</div>
            </motion.div>

            {/* Longest Streak */}
            <motion.div
              className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp
                  className="w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">
                  Best Streak
                </span>
              </div>
              <div className={TYPOGRAPHY.display.stat}>
                {stats.longestStreak}
              </div>
              <div className="text-xs text-muted-foreground">days</div>
            </motion.div>

            {/* Busiest Day */}
            <motion.div
              className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target
                  className="w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">
                  Busiest Day
                </span>
              </div>
              <div className={TYPOGRAPHY.display.stat}>
                {stats.busiestDay?.count || 0}
              </div>
              <div className="text-xs text-muted-foreground">activities</div>
            </motion.div>
          </div>

          {/* Busiest Day Details */}
          {stats.busiestDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm text-muted-foreground flex items-center gap-1.5 mb-4"
            >
              <Target className="h-4 w-4 shrink-0" />
              <span>
                Most active:{" "}
                <span className="font-medium text-foreground">
                  {formatTooltipDate(stats.busiestDay.date)}
                </span>{" "}
                with{" "}
                <span className="font-medium text-foreground">
                  {stats.busiestDay.count} activities
                </span>
              </span>
            </motion.div>
          )}

          {/* Heatmap Calendar */}
          <div className="space-y-4">
            <div className="overflow-x-auto">
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
                  return `${value.count} ${value.count === 1 ? "activity" : "activities"} on ${formatTooltipDate(value.date)}\nTop sources: ${value.topSources.join(", ")}`;
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
                gutterSize={4}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-2.5 h-2.5 rounded-sm bg-muted border border-border"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <motion.div
                  className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.75_0_0)] dark:bg-[oklch(0.35_0_0)]"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <motion.div
                  className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.58_0_0)] dark:bg-[oklch(0.48_0_0)]"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <motion.div
                  className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.45_0_0)] dark:bg-[oklch(0.60_0_0)]"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <motion.div
                  className="w-2.5 h-2.5 rounded-sm border border-border bg-[oklch(0.32_0_0)] dark:bg-[oklch(0.72_0_0)]"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg ${SEMANTIC_COLORS.alert.success.container} ${SEMANTIC_COLORS.alert.success.border}`}
            >
              <p className={`text-sm ${SEMANTIC_COLORS.alert.success.text}`}>
                Filtered to activities from {formatTooltipDate(selectedDate)}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

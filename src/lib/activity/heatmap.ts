/**
 * Activity Heatmap Utilities
 *
 * Aggregates activity items by date for calendar heatmap visualization.
 * Provides data transformation functions to convert timeline data into
 * date-based count maps.
 */

import type { ActivityItem } from "./types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Aggregated activity data for a single date
 */
export interface ActivityHeatmapDay {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Total number of activities on this date */
  count: number;
  /** Top 3 most common sources for this date */
  topSources: string[];
  /** All activity IDs for this date (for click-to-filter) */
  activityIds: string[];
}

/**
 * Statistics about activity distribution
 */
export interface ActivityHeatmapStats {
  /** Total number of activities */
  totalActivities: number;
  /** Number of days with at least one activity */
  activeDays: number;
  /** Average activities per day (across all days) */
  averagePerDay: number;
  /** Busiest day with count */
  busiestDay: {
    date: string;
    count: number;
  } | null;
  /** Current streak of consecutive active days */
  currentStreak: number;
  /** Longest streak of consecutive active days */
  longestStreak: number;
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Aggregate activities by date
 *
 * Converts a list of activities into a date-indexed map with counts
 * and metadata for each day.
 *
 * @param activities - List of activity items
 * @param startDate - Start of date range (defaults to 1 year ago)
 * @param endDate - End of date range (defaults to today)
 * @returns Array of daily activity aggregations
 */
export function aggregateActivitiesByDate(
  activities: ActivityItem[],
  startDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  endDate: Date = new Date()
): ActivityHeatmapDay[] {
  // Create map for efficient lookup
  const dateMap = new Map<string, {
    count: number;
    sources: Map<string, number>;
    activityIds: string[];
  }>();

  // Process each activity
  activities.forEach((activity) => {
    const dateStr = formatDateToISO(activity.timestamp);
    
    // Skip dates outside range
    if (activity.timestamp < startDate || activity.timestamp > endDate) {
      return;
    }

    // Get or create day entry
    const dayEntry = dateMap.get(dateStr) || {
      count: 0,
      sources: new Map<string, number>(),
      activityIds: [],
    };

    // Increment count and track source
    dayEntry.count++;
    dayEntry.sources.set(
      activity.source,
      (dayEntry.sources.get(activity.source) || 0) + 1
    );
    dayEntry.activityIds.push(activity.id);

    dateMap.set(dateStr, dayEntry);
  });

  // Convert map to array format
  const result: ActivityHeatmapDay[] = [];

  // Fill in all dates in range (including empty days)
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = formatDateToISO(currentDate);
    const dayEntry = dateMap.get(dateStr);

    if (dayEntry) {
      // Sort sources by frequency and take top 3
      const sortedSources = Array.from(dayEntry.sources.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([source]) => source);

      result.push({
        date: dateStr,
        count: dayEntry.count,
        topSources: sortedSources,
        activityIds: dayEntry.activityIds,
      });
    } else {
      // Empty day
      result.push({
        date: dateStr,
        count: 0,
        topSources: [],
        activityIds: [],
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

/**
 * Calculate statistics from heatmap data
 *
 * @param heatmapData - Aggregated activity data by date
 * @returns Statistical summary of activity distribution
 */
export function calculateHeatmapStats(
  heatmapData: ActivityHeatmapDay[]
): ActivityHeatmapStats {
  const activeDays = heatmapData.filter(day => day.count > 0);
  const totalActivities = heatmapData.reduce((sum, day) => sum + day.count, 0);
  const averagePerDay = totalActivities / heatmapData.length;

  // Find busiest day
  const busiestDay = heatmapData.reduce<{ date: string; count: number } | null>(
    (max, day) => {
      if (day.count > (max?.count || 0)) {
        return { date: day.date, count: day.count };
      }
      return max;
    },
    null
  );

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(heatmapData);

  return {
    totalActivities,
    activeDays: activeDays.length,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    busiestDay,
    currentStreak,
    longestStreak,
  };
}

/**
 * Calculate current and longest activity streaks
 */
function calculateStreaks(heatmapData: ActivityHeatmapDay[]): {
  currentStreak: number;
  longestStreak: number;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Iterate from most recent to oldest for current streak
  const reversedData = [...heatmapData].reverse();
  
  for (let i = 0; i < reversedData.length; i++) {
    if (reversedData[i].count > 0) {
      tempStreak++;
      
      // Update current streak (only for consecutive days from today)
      if (i === 0 || (i > 0 && reversedData[i - 1].count > 0)) {
        currentStreak = tempStreak;
      }
      
      // Update longest streak
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
function formatDateToISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get color scale class based on activity count
 *
 * Maps activity counts to CSS classes for heatmap visualization
 *
 * @param count - Number of activities
 * @returns CSS class name for color scale
 */
export function getHeatmapColorClass(count: number): string {
  if (count === 0) return "color-empty";
  if (count <= 3) return "color-scale-1";
  if (count <= 6) return "color-scale-2";
  if (count <= 9) return "color-scale-3";
  return "color-scale-4";
}

/**
 * Get color intensity level (0-4) based on count
 *
 * @param count - Number of activities
 * @returns Intensity level for programmatic use
 */
export function getHeatmapIntensity(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

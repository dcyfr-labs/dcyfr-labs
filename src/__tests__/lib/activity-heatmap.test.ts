/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import type { ActivityItem } from "@/lib/activity";
import {
  aggregateActivitiesByDate,
  calculateHeatmapStats,
  getHeatmapColorClass,
  getHeatmapIntensity,
  type ActivityHeatmapDay,
} from "@/lib/activity";

// ============================================================================
// TEST DATA
// ============================================================================

const createMockActivity = (
  id: string,
  date: Date,
  source: ActivityItem["source"] = "blog"
): ActivityItem => ({
  id,
  title: `Activity ${id}`,
  description: "Test activity",
  timestamp: date,
  href: `/test/${id}`,
  source,
  verb: "published",
});

// ============================================================================
// AGGREGATION TESTS
// ============================================================================

describe("aggregateActivitiesByDate", () => {
  it("should aggregate activities by date", () => {
    const activities: ActivityItem[] = [
      createMockActivity("1", new Date("2025-01-01")),
      createMockActivity("2", new Date("2025-01-01")),
      createMockActivity("3", new Date("2025-01-02")),
    ];

    const result = aggregateActivitiesByDate(
      activities,
      new Date("2025-01-01"),
      new Date("2025-01-02")
    );

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2025-01-01");
    expect(result[0].count).toBe(2);
    expect(result[1].date).toBe("2025-01-02");
    expect(result[1].count).toBe(1);
  });

  it("should include empty days in range", () => {
    const activities: ActivityItem[] = [
      createMockActivity("1", new Date("2025-01-01")),
      createMockActivity("2", new Date("2025-01-03")),
    ];

    const result = aggregateActivitiesByDate(
      activities,
      new Date("2025-01-01"),
      new Date("2025-01-03")
    );

    expect(result).toHaveLength(3);
    expect(result[0].count).toBe(1);
    expect(result[1].count).toBe(0); // Empty day
    expect(result[2].count).toBe(1);
  });

  it("should track top sources by frequency", () => {
    const activities: ActivityItem[] = [
      createMockActivity("1", new Date("2025-01-01"), "blog"),
      createMockActivity("2", new Date("2025-01-01"), "blog"),
      createMockActivity("3", new Date("2025-01-01"), "project"),
      createMockActivity("4", new Date("2025-01-01"), "github"),
    ];

    const result = aggregateActivitiesByDate(
      activities,
      new Date("2025-01-01"),
      new Date("2025-01-01")
    );

    expect(result[0].topSources).toEqual(["blog", "project", "github"]);
  });

  it("should limit top sources to 3", () => {
    const activities: ActivityItem[] = [
      createMockActivity("1", new Date("2025-01-01"), "blog"),
      createMockActivity("2", new Date("2025-01-01"), "project"),
      createMockActivity("3", new Date("2025-01-01"), "github"),
      createMockActivity("4", new Date("2025-01-01"), "changelog"),
      createMockActivity("5", new Date("2025-01-01"), "milestone"),
    ];

    const result = aggregateActivitiesByDate(
      activities,
      new Date("2025-01-01"),
      new Date("2025-01-01")
    );

    expect(result[0].topSources).toHaveLength(3);
  });

  it("should store activity IDs for filtering", () => {
    const activities: ActivityItem[] = [
      createMockActivity("1", new Date("2025-01-01")),
      createMockActivity("2", new Date("2025-01-01")),
    ];

    const result = aggregateActivitiesByDate(
      activities,
      new Date("2025-01-01"),
      new Date("2025-01-01")
    );

    expect(result[0].activityIds).toEqual(["1", "2"]);
  });

  it("should filter out activities outside date range", () => {
    const activities: ActivityItem[] = [
      createMockActivity("1", new Date("2024-12-31")),
      createMockActivity("2", new Date("2025-01-01")),
      createMockActivity("3", new Date("2025-01-02")),
    ];

    const result = aggregateActivitiesByDate(
      activities,
      new Date("2025-01-01"),
      new Date("2025-01-01")
    );

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(1);
    expect(result[0].activityIds).toEqual(["2"]);
  });

  it("should handle default date range (1 year)", () => {
    const fixedEndDate = new Date("2025-06-15T12:00:00.000Z");
    const fixedStartDate = new Date("2024-06-15T12:00:00.000Z");

    const activities: ActivityItem[] = [createMockActivity("1", fixedEndDate)];

    const result = aggregateActivitiesByDate(activities, fixedStartDate, fixedEndDate);

    expect(result).toHaveLength(366); // 2024 is a leap year
    // Activity should be in the last element (endDate is inclusive, chronological order)
    expect(result[result.length - 1].count).toBe(1);
    expect(result[result.length - 1].date).toBe("2025-06-15");
  });
});

// ============================================================================
// STATISTICS TESTS
// ============================================================================

describe("calculateHeatmapStats", () => {
  it("should calculate total activities", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 2, topSources: [], activityIds: [] },
      { date: "2025-01-02", count: 3, topSources: [], activityIds: [] },
      { date: "2025-01-03", count: 0, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.totalActivities).toBe(5);
  });

  it("should count active days (days with count > 0)", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 2, topSources: [], activityIds: [] },
      { date: "2025-01-02", count: 0, topSources: [], activityIds: [] },
      { date: "2025-01-03", count: 1, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.activeDays).toBe(2);
  });

  it("should calculate average per day", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 10, topSources: [], activityIds: [] },
      { date: "2025-01-02", count: 0, topSources: [], activityIds: [] },
      { date: "2025-01-03", count: 0, topSources: [], activityIds: [] },
      { date: "2025-01-04", count: 0, topSources: [], activityIds: [] },
      { date: "2025-01-05", count: 0, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.averagePerDay).toBe(2); // 10 / 5 = 2
  });

  it("should find busiest day", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 2, topSources: [], activityIds: [] },
      { date: "2025-01-02", count: 5, topSources: [], activityIds: [] },
      { date: "2025-01-03", count: 1, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.busiestDay).toEqual({
      date: "2025-01-02",
      count: 5,
    });
  });

  it("should return null busiest day if no activities", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 0, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.busiestDay).toBeNull();
  });

  it("should calculate current streak (consecutive days from today)", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 1, topSources: [], activityIds: [] },
      { date: "2025-01-02", count: 1, topSources: [], activityIds: [] },
      { date: "2025-01-03", count: 1, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.currentStreak).toBe(3);
  });

  it("should calculate longest streak", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 1, topSources: [], activityIds: [] },
      { date: "2025-01-02", count: 1, topSources: [], activityIds: [] },
      { date: "2025-01-03", count: 0, topSources: [], activityIds: [] },
      { date: "2025-01-04", count: 1, topSources: [], activityIds: [] },
      { date: "2025-01-05", count: 1, topSources: [], activityIds: [] },
      { date: "2025-01-06", count: 1, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.longestStreak).toBe(3);
  });

  it("should reset streak on empty days", () => {
    const heatmapData: ActivityHeatmapDay[] = [
      { date: "2025-01-01", count: 1, topSources: [], activityIds: [] },
      { date: "2025-01-02", count: 0, topSources: [], activityIds: [] },
      { date: "2025-01-03", count: 1, topSources: [], activityIds: [] },
    ];

    const stats = calculateHeatmapStats(heatmapData);

    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(1);
  });
});

// ============================================================================
// COLOR SCALE TESTS
// ============================================================================

describe("getHeatmapColorClass", () => {
  it("should return 'color-empty' for 0 count", () => {
    expect(getHeatmapColorClass(0)).toBe("color-empty");
  });

  it("should return 'color-scale-1' for counts 1-3", () => {
    expect(getHeatmapColorClass(1)).toBe("color-scale-1");
    expect(getHeatmapColorClass(2)).toBe("color-scale-1");
    expect(getHeatmapColorClass(3)).toBe("color-scale-1");
  });

  it("should return 'color-scale-2' for counts 4-6", () => {
    expect(getHeatmapColorClass(4)).toBe("color-scale-2");
    expect(getHeatmapColorClass(5)).toBe("color-scale-2");
    expect(getHeatmapColorClass(6)).toBe("color-scale-2");
  });

  it("should return 'color-scale-3' for counts 7-9", () => {
    expect(getHeatmapColorClass(7)).toBe("color-scale-3");
    expect(getHeatmapColorClass(8)).toBe("color-scale-3");
    expect(getHeatmapColorClass(9)).toBe("color-scale-3");
  });

  it("should return 'color-scale-4' for counts 10+", () => {
    expect(getHeatmapColorClass(10)).toBe("color-scale-4");
    expect(getHeatmapColorClass(100)).toBe("color-scale-4");
  });
});

describe("getHeatmapIntensity", () => {
  it("should return correct intensity levels", () => {
    expect(getHeatmapIntensity(0)).toBe(0);
    expect(getHeatmapIntensity(1)).toBe(1);
    expect(getHeatmapIntensity(4)).toBe(2);
    expect(getHeatmapIntensity(7)).toBe(3);
    expect(getHeatmapIntensity(10)).toBe(4);
  });
});

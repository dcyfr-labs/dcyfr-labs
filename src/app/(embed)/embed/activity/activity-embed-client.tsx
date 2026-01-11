"use client";

import { useState, useMemo, useEffect } from "react";
import { ThreadedActivityFeed } from "@/components/activity";
import type { ActivityItem, ActivitySource } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

type TimeRangeFilter = "today" | "week" | "month" | "year" | "all";

interface SerializedActivity extends Omit<ActivityItem, "timestamp"> {
  timestamp: string;
}

interface ActivityEmbedClientProps {
  activities: SerializedActivity[];
  error: string | null;
  initialSource?: string;
  initialTimeRange?: string;
  limit?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ActivityEmbedClient({
  activities: serializedActivities,
  error,
  initialSource,
  initialTimeRange,
  limit = 20,
}: ActivityEmbedClientProps) {
  // Deserialize activities
  const activities = useMemo(
    () =>
      serializedActivities.map((activity) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      })),
    [serializedActivities]
  );

  // State
  const [selectedSources] = useState<ActivitySource[]>(
    initialSource ? [initialSource as ActivitySource] : []
  );
  const [timeRange] = useState<TimeRangeFilter>(
    (initialTimeRange as TimeRangeFilter) || "all"
  );

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Source filter
    if (selectedSources.length > 0) {
      filtered = filtered.filter((activity) =>
        selectedSources.includes(activity.source)
      );
    }

    // Time range filter
    const now = new Date();
    const cutoffTimes: Record<TimeRangeFilter, Date | null> = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      all: null,
    };

    const cutoff = cutoffTimes[timeRange];
    if (cutoff) {
      filtered = filtered.filter((activity) => activity.timestamp >= cutoff);
    }

    // Limit results
    return filtered.slice(0, limit);
  }, [activities, selectedSources, timeRange, limit]);

  // Send height to parent via postMessage for responsive iframe
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "activity-embed-resize", height }, "*");
    };

    // Send initial height
    sendHeight();

    // Send height on content changes
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, [filteredActivities]);

  if (error) {
    return (
      <div className="p-4 border rounded-lg text-sm bg-error-subtle border-error-light text-error">
        <p className="font-semibold">Failed to load activity feed</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThreadedActivityFeed activities={filteredActivities} />
    </div>
  );
}

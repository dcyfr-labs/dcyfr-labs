"use client";

import { useState, useMemo } from "react";
import { ActivityFeed, ActivityFilters } from "@/components/activity";
import type { ActivityItem, ActivitySource } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

type TimeRangeFilter = "today" | "week" | "month" | "year" | "all";

interface SerializedActivity extends Omit<ActivityItem, "timestamp"> {
  timestamp: string;
}

interface ActivityPageClientProps {
  activities: SerializedActivity[];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Client component for the activity page with interactive filters
 */
export function ActivityPageClient({ activities }: ActivityPageClientProps) {
  // Filter state
  const [selectedSources, setSelectedSources] = useState<ActivitySource[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRangeFilter>("all");

  // Deserialize and filter activities
  const filteredActivities = useMemo(() => {
    // First, deserialize timestamps
    const deserialized: ActivityItem[] = activities.map((a) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));

    // Filter by sources
    let result = deserialized;
    if (selectedSources.length > 0) {
      result = result.filter((a) => selectedSources.includes(a.source));
    }

    // Filter by time range
    if (selectedTimeRange !== "all") {
      const now = new Date();
      let cutoff: Date;

      switch (selectedTimeRange) {
        case "today":
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }

      result = result.filter((a) => a.timestamp >= cutoff);
    }

    return result;
  }, [activities, selectedSources, selectedTimeRange]);

  // Available sources based on data
  const availableSources: ActivitySource[] = useMemo(() => {
    const sources = new Set<ActivitySource>();
    activities.forEach((a) => sources.add(a.source));
    return Array.from(sources);
  }, [activities]);

  return (
    <div className="space-y-10">
      {/* Filters */}
      <ActivityFilters
        selectedSources={selectedSources}
        onSourcesChange={setSelectedSources}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        availableSources={availableSources}
      />

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredActivities.length} of {activities.length} activities
      </p>

      {/* Feed */}
      <ActivityFeed
        items={filteredActivities}
        variant="timeline"
        showGroups
        emptyMessage="No activities match your filters"
      />
    </div>
  );
}

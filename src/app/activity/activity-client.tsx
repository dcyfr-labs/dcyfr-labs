"use client";

import { useState, useMemo } from "react";
// Use page-exports to only bundle components needed for this page
// This prevents unused activity components from being included in the bundle
import { ActivityFilters, ThreadedActivityGroup } from "@/components/activity/page-exports";
import type { ActivityItem, ActivitySource } from "@/lib/activity";
import { searchActivities, createSearchIndex, groupActivitiesIntoThreads } from "@/lib/activity";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/common";

// ============================================================================
// TYPES & CONSTANTS
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
 * Client component for the activity page with interactive search and timeline
 */
export function ActivityPageClient({
  activities,
}: ActivityPageClientProps) {
  // Hooks
  const { filterActivities: filterBookmarkedActivities } = useBookmarks();
  
  // Filter state
  const [selectedSources, setSelectedSources] = useState<ActivitySource[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRangeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookmarksFilter, setIsBookmarksFilter] = useState(false);

  // Deserialize activities once
  const deserializedActivities = useMemo<ActivityItem[]>(() => {
    return activities.map((a) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));
  }, [activities]);

  // Create search index once
  const searchIndex = useMemo(() => {
    return createSearchIndex(deserializedActivities);
  }, [deserializedActivities]);


  // Filter activities and group into threads in a single pass
  const threads = useMemo(() => {
    let result = deserializedActivities;

    // Apply bookmarks filter first if active
    if (isBookmarksFilter) {
      result = filterBookmarkedActivities(result);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searchResults = searchActivities(result, searchQuery, searchIndex);
      result = searchResults.map((r) => r.item);
    }

    // Filter by sources (only if not using bookmarks filter)
    if (!isBookmarksFilter && selectedSources.length > 0) {
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

    // Group into threads immediately after filtering
    return groupActivitiesIntoThreads(result);
  }, [
    deserializedActivities,
    searchQuery,
    selectedSources,
    selectedTimeRange,
    searchIndex,
    isBookmarksFilter,
    filterBookmarkedActivities,
  ]);

  // Available sources based on data
  const availableSources: ActivitySource[] = useMemo(() => {
    const sources = new Set<ActivitySource>();
    activities.forEach((a) => sources.add(a.source));
    return Array.from(sources);
  }, [activities]);

  // Handle manual source filter changes (disable bookmarks mode)
  const handleSourcesChange = (sources: ActivitySource[]) => {
    setIsBookmarksFilter(false);
    setSelectedSources(sources);
  };

  // Calculate filtered activity count from threads
  const filteredActivityCount = useMemo(() => {
    return threads.reduce((total, thread) => {
      return total + 1 + thread.replies.length;
    }, 0);
  }, [threads]);

  return (
    <>
      {/* Search & Filter Section */}
      <ActivityFilters
        selectedSources={isBookmarksFilter ? [] : selectedSources}
        onSourcesChange={handleSourcesChange}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableSources={availableSources}
        totalCount={activities.length}
        filteredCount={filteredActivityCount}
      />

      <div className={`${CONTAINER_WIDTHS.standard} mx-auto ${CONTAINER_PADDING} py-12 md:py-16 pb-24 md:pb-16`}>
        {/* Timeline Feed - Render threads directly */}
        {threads.length === 0 ? (
          <div className={cn(CONTAINER_WIDTHS.thread, "mx-auto")}>
            <Alert type="info">No activities match your filters</Alert>
          </div>
        ) : (
          <div className={cn(CONTAINER_WIDTHS.thread, "mx-auto")}>
            <div className={SPACING.subsection}>
              {threads.map((thread, index) => (
                <div key={thread.id}>
                  <ThreadedActivityGroup thread={thread} />
                  {/* Divider between threads (except last) */}
                  {index < threads.length - 1 && (
                    <div
                      className="my-12 border-t border-border/50"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

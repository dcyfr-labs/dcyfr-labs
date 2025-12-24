"use client";

import { useState, useMemo } from "react";
import { ActivityFeed, ActivityFilters, ActivityHeatmapCalendar, VirtualActivityFeed } from "@/components/activity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActivityItem, ActivitySource } from "@/lib/activity";
import { searchActivities, createSearchIndex } from "@/lib/activity/search";
import { useBookmarks } from "@/hooks/use-bookmarks";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

/**
 * Feature flag: Enable virtual scrolling for large activity feeds
 * Recommended for 100+ items to improve performance
 */
const ENABLE_VIRTUAL_SCROLLING = true;
const VIRTUAL_SCROLLING_THRESHOLD = 50; // Min items to enable virtual scrolling

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
  // Hooks
  const { filterActivities: filterBookmarkedActivities } = useBookmarks();
  
  // View state
  const [activeView, setActiveView] = useState<"timeline" | "heatmap">("timeline");
  
  // Filter state
  const [selectedSources, setSelectedSources] = useState<ActivitySource[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRangeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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

  // Filter activities
  const filteredActivities = useMemo(() => {
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

    // Filter by specific date (from heatmap click)
    if (selectedDate) {
      const targetDate = new Date(selectedDate);
      result = result.filter((a) => {
        const activityDate = new Date(a.timestamp);
        return (
          activityDate.getFullYear() === targetDate.getFullYear() &&
          activityDate.getMonth() === targetDate.getMonth() &&
          activityDate.getDate() === targetDate.getDate()
        );
      });
    }
    // Otherwise filter by time range
    else if (selectedTimeRange !== "all") {
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
  }, [deserializedActivities, searchQuery, selectedSources, selectedTimeRange, selectedDate, searchIndex, isBookmarksFilter, filterBookmarkedActivities]);

  // Available sources based on data
  const availableSources: ActivitySource[] = useMemo(() => {
    const sources = new Set<ActivitySource>();
    activities.forEach((a) => sources.add(a.source));
    return Array.from(sources);
  }, [activities]);
  // Handle date click from heatmap
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setActiveView("timeline"); // Switch to timeline view to show filtered results
  };

  // Clear date filter when time range changes
  const handleTimeRangeChange = (newTimeRange: TimeRangeFilter) => {
    setSelectedDate(null);
    setSelectedTimeRange(newTimeRange);
  };

  // Handle preset application (including bookmarks)
  const handlePresetApply = (presetId: string, filters: { sources: ActivitySource[]; timeRange: TimeRangeFilter }) => {
    if (presetId === "bookmarks") {
      setIsBookmarksFilter(true);
      setSelectedSources([]);  // Clear source filters for bookmarks
    } else {
      setIsBookmarksFilter(false);
      setSelectedSources(filters.sources);
    }
    setSelectedTimeRange(filters.timeRange);
    setSelectedDate(null);
  };

  // Handle manual source filter changes (disable bookmarks mode)
  const handleSourcesChange = (sources: ActivitySource[]) => {
    setIsBookmarksFilter(false);
    setSelectedSources(sources);
  };

  // Determine whether to use virtual scrolling
  const useVirtualScrolling = ENABLE_VIRTUAL_SCROLLING && 
    filteredActivities.length >= VIRTUAL_SCROLLING_THRESHOLD;

  return (
    <div className="space-y-10">
      {/* Filters */}
      <ActivityFilters
        selectedSources={isBookmarksFilter ? [] : selectedSources}
        onSourcesChange={handleSourcesChange}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={handleTimeRangeChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableSources={availableSources}
        totalCount={activities.length}
        filteredCount={filteredActivities.length}
        onPresetApply={handlePresetApply}
      />

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "timeline" | "heatmap")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap View</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          {useVirtualScrolling ? (
            <VirtualActivityFeed
              items={filteredActivities}
              variant="timeline"
              showGroups
              emptyMessage="No activities match your filters"
            />
          ) : (
            <ActivityFeed
              items={filteredActivities}
              variant="timeline"
              showGroups
              emptyMessage="No activities match your filters"
            />
          )}
        </TabsContent>

        {/* Heatmap Tab */}
        <TabsContent value="heatmap" className="mt-6">
          {/* Responsive month count based on viewport */}
          <div className="space-y-6">
            {/* Desktop: 12 months */}
            <div className="hidden lg:block">
              <ActivityHeatmapCalendar
                activities={deserializedActivities}
                onDateClick={handleDateClick}
                monthsToShow={12}
              />
            </div>
            
            {/* Tablet: 6 months */}
            <div className="hidden md:block lg:hidden">
              <ActivityHeatmapCalendar
                activities={deserializedActivities}
                onDateClick={handleDateClick}
                monthsToShow={6}
              />
            </div>
            
            {/* Mobile: 3 months */}
            <div className="block md:hidden">
              <ActivityHeatmapCalendar
                activities={deserializedActivities}
                onDateClick={handleDateClick}
                monthsToShow={3}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

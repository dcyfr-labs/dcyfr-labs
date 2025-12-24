"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ActivityFilters } from "@/components/activity";
import { ThreadedActivityFeed } from "@/components/activity/ThreadedActivityFeed";
import { FeedInterruption, type FeedInterruptionProps } from "@/components/activity";
import type { ActivityItem, ActivitySource } from "@/lib/activity";
import { searchActivities, createSearchIndex } from "@/lib/activity/search";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type TimeRangeFilter = "today" | "week" | "month" | "year" | "all";

// Feed interruptions for engagement
const FEED_INTERRUPTIONS: FeedInterruptionProps[] = [
  {
    type: "cta",
    title: "Explore the Blog",
    description: "Discover in-depth articles on security, architecture, and modern development practices.",
    href: "/blog",
    buttonLabel: "Browse articles",
    theme: "cyan",
  },
  {
    type: "quote",
    quote: "Security is not a product, but a process. It's about layers, vigilance, and continuous improvement.",
    source: "Security Architecture Philosophy",
    theme: "lime",
  },
  {
    type: "cta",
    title: "View Our Work",
    description: "Check out our portfolio of projects and case studies showcasing real-world solutions.",
    href: "/work",
    buttonLabel: "Explore projects",
    theme: "magenta",
  },
];

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
  }, [deserializedActivities, searchQuery, selectedSources, selectedTimeRange, searchIndex, isBookmarksFilter, filterBookmarkedActivities]);

  // Available sources based on data
  const availableSources: ActivitySource[] = useMemo(() => {
    const sources = new Set<ActivitySource>();
    activities.forEach((a) => sources.add(a.source));
    return Array.from(sources);
  }, [activities]);

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
  };

  // Handle manual source filter changes (disable bookmarks mode)
  const handleSourcesChange = (sources: ActivitySource[]) => {
    setIsBookmarksFilter(false);
    setSelectedSources(sources);
  };

  // Insert interruptions into activities (every 8 items)
  const renderItems = useMemo(() => {
    const items: Array<{ type: 'activity' | 'interruption'; data: any; id: string }> = [];
    const interruptionInterval = 8;
    let interruptionIndex = 0;
    let interruptionCounter = 0; // Unique counter for each interruption instance

    // Group activities into chunks
    for (let i = 0; i < filteredActivities.length; i += interruptionInterval) {
      const chunk = filteredActivities.slice(i, i + interruptionInterval);
      
      items.push({
        type: 'activity',
        data: chunk,
        id: `activities-${i}`,
      });
      
      // Add interruption after chunk (if not last chunk)
      if (
        i + interruptionInterval < filteredActivities.length &&
        interruptionIndex < FEED_INTERRUPTIONS.length
      ) {
        items.push({
          type: 'interruption',
          data: FEED_INTERRUPTIONS[interruptionIndex],
          id: `interruption-${interruptionCounter}`, // Use unique counter
        });
        interruptionIndex = (interruptionIndex + 1) % FEED_INTERRUPTIONS.length;
        interruptionCounter++; // Increment unique counter
      }
    }

    return items;
  }, [filteredActivities]);

  return (
    <motion.div 
      className={cn("space-y-12")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Filters - Modern, threads-like design */}
      <ActivityFilters
        selectedSources={isBookmarksFilter ? [] : selectedSources}
        onSourcesChange={handleSourcesChange}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableSources={availableSources}
        totalCount={activities.length}
        filteredCount={filteredActivities.length}
        onPresetApply={handlePresetApply}
      />

      {/* Timeline Feed with Interruptions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        className="space-y-12"
      >
        {renderItems.length === 0 ? (
          <div className={cn("text-center py-12", SPACING.content)}>
            <p className="text-muted-foreground">No activities match your filters</p>
          </div>
        ) : (
          renderItems.map((item, index) => {
            if (item.type === 'interruption') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                >
                  <FeedInterruption {...item.data} />
                </motion.div>
              );
            }
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
              >
                <ThreadedActivityFeed
                  activities={item.data}
                  emptyMessage=""
                />
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ActivityFilters, EmbedGenerator } from "@/components/activity";
import { ThreadedActivityFeed } from "@/components/activity/ThreadedActivityFeed";
import { TopicCloud } from "@/components/activity/TopicCloud";
import { RelatedTopics } from "@/components/activity/RelatedTopics";
import type { ActivityItem, ActivitySource } from "@/lib/activity";
import { searchActivities, createSearchIndex } from "@/lib/activity/search";
import {
  extractTopics,
  filterByTopics,
  buildCooccurrenceMatrix,
} from "@/lib/activity/topics";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Code } from "lucide-react";

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
  const [showEmbedGenerator, setShowEmbedGenerator] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

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

  // Extract topics and build co-occurrence matrix
  const topics = useMemo(() => {
    return extractTopics(deserializedActivities, {
      minCount: 2, // Only show topics that appear in at least 2 activities
      includeKeywords: false, // Only use tags and categories (more accurate)
    });
  }, [deserializedActivities]);

  const topicCooccurrence = useMemo(() => {
    return buildCooccurrenceMatrix(deserializedActivities);
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

    // Filter by topics
    if (selectedTopics.length > 0) {
      result = filterByTopics(result, selectedTopics);
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
  }, [
    deserializedActivities,
    searchQuery,
    selectedSources,
    selectedTopics,
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

  // Handle topic click (toggle topic selection)
  const handleTopicClick = (topic: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        // Remove topic if already selected
        return prev.filter((t) => t !== topic);
      } else {
        // Add topic if not selected
        return [...prev, topic];
      }
    });
  };

  // No longer split activities into chunks - render as unified timeline
  // Interruptions are disabled to maintain consistent threading across pages

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
      />

      {/* TODO: Topic Cloud - Interactive topic filtering  -- needs refinement
      {topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TopicCloud
            topics={topics}
            selectedTopics={selectedTopics}
            onTopicClick={handleTopicClick}
            maxTopics={50}
          />
        </motion.div>
      )} */}

      {/* TODO: Related Topics - Show recommendations based on selected topics -- needs refinement
      {selectedTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <RelatedTopics
            selectedTopics={selectedTopics}
            cooccurrenceMatrix={topicCooccurrence}
            onTopicClick={handleTopicClick}
            maxPerTopic={5}
          />
        </motion.div>
      )} */}

      {/* Timeline Feed - Unified threading across all activities */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
      >
        {filteredActivities.length === 0 ? (
          <div className={cn("text-center py-12", SPACING.content)}>
            <p className="text-muted-foreground">
              No activities match your filters
            </p>
          </div>
        ) : (
          <ThreadedActivityFeed
            activities={filteredActivities}
            emptyMessage="No activities match your filters"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

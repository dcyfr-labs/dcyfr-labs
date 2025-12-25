"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { getRelatedTopics, type TopicCooccurrence } from "@/lib/activity/topics";
import { Hash } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface RelatedTopicsProps {
  /** Currently selected topics */
  selectedTopics: string[];
  /** Topic co-occurrence matrix */
  cooccurrenceMatrix: TopicCooccurrence;
  /** Callback when a related topic is clicked */
  onTopicClick?: (topic: string) => void;
  /** Maximum number of related topics to show per selected topic */
  maxPerTopic?: number;
  /** CSS class overrides */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Related Topics Component
 *
 * Shows topics that frequently co-occur with the currently selected topics.
 * Helps users discover related content and refine their filtering.
 *
 * Features:
 * - Shows related topics based on co-occurrence analysis
 * - Clickable topics to add to filter
 * - Only shows topics not already selected
 * - Compact, sidebar-friendly design
 */
export function RelatedTopics({
  selectedTopics,
  cooccurrenceMatrix,
  onTopicClick,
  maxPerTopic = 5,
  className,
}: RelatedTopicsProps) {
  // Get related topics for all selected topics
  const relatedTopics = useMemo(() => {
    if (selectedTopics.length === 0) return [];

    // Collect related topics from all selected topics
    const allRelated = new Map<string, number>();

    for (const topic of selectedTopics) {
      const related = getRelatedTopics(topic, cooccurrenceMatrix, maxPerTopic);

      for (const relatedTopic of related) {
        // Skip if already selected
        if (selectedTopics.includes(relatedTopic)) continue;

        // Increment count (topic appears as related for multiple selections)
        allRelated.set(relatedTopic, (allRelated.get(relatedTopic) || 0) + 1);
      }
    }

    // Sort by count (descending) and return top topics
    return Array.from(allRelated.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
      .slice(0, maxPerTopic * 2); // Show up to 2x topics when multiple selected
  }, [selectedTopics, cooccurrenceMatrix, maxPerTopic]);

  if (selectedTopics.length === 0 || relatedTopics.length === 0) {
    return null;
  }

  return (
    <div className={cn(SPACING.content, className)}>
      <div className="flex items-center gap-2 mb-3">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-0")}>Related Topics</h3>
      </div>

      <p className={cn(TYPOGRAPHY.metadata, "mb-3")}>
        Topics that often appear with{" "}
        {selectedTopics.length === 1 ? selectedTopics[0] : "your selection"}
      </p>

      <div className="flex flex-wrap gap-2">
        {relatedTopics.map((topic) => (
          <Badge
            key={topic}
            variant="outline"
            className={cn(
              "cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors",
              "text-xs px-2 py-1"
            )}
            onClick={() => onTopicClick?.(topic)}
            title={`Add "${topic}" to filters`}
          >
            {topic}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default RelatedTopics;

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY, ANIMATION } from "@/lib/design-tokens";
import type { Topic } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

interface TopicCloudProps {
  /** Topics to display */
  topics: Topic[];
  /** Currently selected topics */
  selectedTopics?: string[];
  /** Callback when a topic is clicked */
  onTopicClick?: (topic: string) => void;
  /** Maximum number of topics to display (default: 50) */
  maxTopics?: number;
  /** CSS class overrides */
  className?: string;
}

// ============================================================================
// SIZE CALCULATION
// ============================================================================

/**
 * Calculate font size for a topic based on its frequency
 * Uses a logarithmic scale to prevent extreme size differences
 */
function calculateTopicSize(topic: Topic, allTopics: Topic[]): string {
  if (allTopics.length === 0) return "text-sm";

  const maxCount = Math.max(...allTopics.map((t) => t.count));
  const minCount = Math.min(...allTopics.map((t) => t.count));

  // Normalize to 0-1 range using logarithmic scale
  const range = Math.log(maxCount) - Math.log(minCount) || 1;
  const normalized = (Math.log(topic.count) - Math.log(minCount)) / range;

  // Map to size classes (0 = xs, 1 = 2xl)
  if (normalized >= 0.8) return "text-2xl";
  if (normalized >= 0.6) return "text-xl";
  if (normalized >= 0.4) return "text-lg";
  if (normalized >= 0.2) return "text-base";
  return "text-sm";
}

/**
 * Calculate color intensity based on topic frequency
 */
function calculateTopicColor(topic: Topic, allTopics: Topic[]): string {
  if (allTopics.length === 0) return "bg-muted/50 hover:bg-muted";

  const maxCount = Math.max(...allTopics.map((t) => t.count));
  const minCount = Math.min(...allTopics.map((t) => t.count));

  const range = maxCount - minCount || 1;
  const normalized = (topic.count - minCount) / range;

  // Use different opacity levels
  if (normalized >= 0.8) return "bg-primary/20 hover:bg-primary/30";
  if (normalized >= 0.6) return "bg-primary/15 hover:bg-primary/25";
  if (normalized >= 0.4) return "bg-primary/10 hover:bg-primary/20";
  if (normalized >= 0.2) return "bg-muted/70 hover:bg-muted";
  return "bg-muted/50 hover:bg-muted/70";
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Interactive topic cloud visualization
 *
 * Displays topics as a tag cloud with sizes based on frequency.
 * Topics are clickable to filter activities.
 *
 * Features:
 * - Logarithmic sizing (prevents extreme size differences)
 * - Color intensity based on frequency
 * - Interactive hover and click states
 * - Selected topic highlighting
 * - Responsive layout (wraps naturally)
 * - Smooth animations
 */
export function TopicCloud({
  topics,
  selectedTopics = [],
  onTopicClick,
  maxTopics = 50,
  className,
}: TopicCloudProps) {
  // Limit to maxTopics (already sorted by frequency)
  const displayTopics = useMemo(
    () => topics.slice(0, maxTopics),
    [topics, maxTopics]
  );

  // Selected topics set for O(1) lookup
  const selectedSet = useMemo(
    () => new Set(selectedTopics),
    [selectedTopics]
  );

  if (displayTopics.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground text-sm">
          No topics found. Add tags to your activities to see topic insights.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(SPACING.content, className)}>
      {/* Header */}
      <div className="mb-4">
        <h3 className={TYPOGRAPHY.h3.standard}>Topics</h3>
        <p className={TYPOGRAPHY.metadata}>
          {displayTopics.length} topics across {topics.reduce((sum, t) => sum + t.count, 0)} activities
        </p>
      </div>

      {/* Topic Cloud */}
      <div className="flex flex-wrap gap-4 items-center justify-center py-8">
        {displayTopics.map((topic, index) => {
          const isSelected = selectedSet.has(topic.name);
          const size = calculateTopicSize(topic, displayTopics);
          const color = calculateTopicColor(topic, displayTopics);

          return (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.2,
                delay: Math.min(index * 0.02, 0.5), // Stagger animation
                ease: "easeOut",
              }}
            >
              <Badge
                variant={isSelected ? "default" : "secondary"}
                className={cn(
                  size,
                  "cursor-pointer",
                  ANIMATION.transition.movement,
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : color,
                  "px-3 py-1.5 font-medium"
                )}
                onClick={() => onTopicClick?.(topic.name)}
                title={`${topic.name} (${topic.count} activities, ${topic.percentage.toFixed(1)}%)`}
              >
                {topic.name}
                <span className="ml-1.5 text-xs opacity-70">
                  {topic.count}
                </span>
              </Badge>
            </motion.div>
          );
        })}
      </div>

      {/* Footer stats */}
      {topics.length > maxTopics && (
        <p className={cn(TYPOGRAPHY.metadata, "text-center mt-4")}>
          Showing top {maxTopics} of {topics.length} topics
        </p>
      )}
    </div>
  );
}

export default TopicCloud;

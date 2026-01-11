"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TYPOGRAPHY,
  ANIMATION,
  SPACING,
  SEMANTIC_COLORS,
} from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

interface TopicData {
  tag: string;
  count: number;
}

interface TrendingTopicsPanelProps {
  /** Array of topics with their frequencies */
  topics: TopicData[];
  /** Maximum number of topics to display */
  maxTopics?: number;
  /** Class name for container */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate font size based on frequency (for cloud effect)
 */
function getTopicSize(count: number, minCount: number, maxCount: number): string {
  if (maxCount === minCount) return "text-base";

  const ratio = (count - minCount) / (maxCount - minCount);

  if (ratio > 0.8) return "text-xl";
  if (ratio > 0.6) return "text-lg";
  if (ratio > 0.4) return "text-base";
  if (ratio > 0.2) return "text-sm";
  return "text-sm";
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrendingTopicsPanel Component
 *
 * Displays popular blog topics in an interactive cloud layout.
 * Used within the TrendingSection tabs.
 *
 * Features:
 * - Frequency-based sizing (more popular = larger)
 * - Neon color palette for visual interest
 * - Click to filter blog posts
 * - Post count badges
 * - Smooth animations with stagger
 * - Responsive flexbox layout
 *
 * @example
 * ```tsx
 * <TrendingTopicsPanel
 *   topics={topTopics}
 *   maxTopics={12}
 * />
 * ```
 */
export function TrendingTopicsPanel({
  topics,
  maxTopics = 12,
  className,
}: TrendingTopicsPanelProps) {
  // Limit topics and calculate min/max for sizing
  const displayTopics = topics.slice(0, maxTopics);

  // Empty state
  if (displayTopics.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center">
        <Hash className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className={cn(TYPOGRAPHY.label.standard, "text-muted-foreground")}>
          Popular topics will appear here
        </p>
        <p className={cn(TYPOGRAPHY.body.small, "text-muted-foreground/70 mt-1")}>
          Topics are generated from post tags
        </p>
      </Card>
    );
  }

  const counts = displayTopics.map((t) => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  return (
    <div className={cn(SPACING.content, className)}>
      {/* Topic Cloud */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {displayTopics.map((topic, index) => {
          const sizeClass = getTopicSize(topic.count, minCount, maxCount);

          return (
            <motion.div
              key={topic.tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
            >
              <Link href={`/blog?tag=${encodeURIComponent(topic.tag)}`}>
                <Badge
                  variant="outline"
                  className={cn(
                    sizeClass,
                    ANIMATION.transition.base,
                    "cursor-pointer group relative",
                    "hover:scale-110 active:scale-95",
                    "px-3 py-1.5 md:px-4 md:py-2"
                  )}
                >
                  <span className={cn("transition-colors", ANIMATION.duration.fast)}>
                    {topic.tag}
                  </span>
                  <span
                    className={cn(
                      "ml-1.5 text-xs opacity-70 group-hover:opacity-100",
                      ANIMATION.transition.appearance
                    )}
                  >
                    {topic.count}
                  </span>
                </Badge>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="text-center pt-4">
        <Link
          href="/blog"
          className={cn(
            TYPOGRAPHY.label.small,
            "text-muted-foreground hover:text-primary",
            ANIMATION.transition.theme
          )}
        >
          Browse all topics →
        </Link>
      </div>
    </div>
  );
}

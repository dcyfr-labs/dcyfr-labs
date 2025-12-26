"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TYPOGRAPHY, NEON_COLORS, ANIMATION, type NeonColorVariant } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface TopicData {
  tag: string;
  count: number;
  colorVariant: NeonColorVariant;
}

interface TopicNavigatorProps {
  /** Array of topics with their frequencies */
  topics: TopicData[];
  /** Maximum number of topics to display */
  maxTopics?: number;
  /** Variant for styling (homepage is more vibrant) */
  variant?: "homepage" | "sidebar";
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

/**
 * Get neon color variant based on index (cycles through colors)
 */
function getColorVariant(index: number): NeonColorVariant {
  const colors: NeonColorVariant[] = ["cyan", "lime", "orange", "purple", "magenta"];
  return colors[index % colors.length];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TopicNavigator Component
 *
 * Displays top blog topics in an interactive cloud layout.
 * Topics are sized by frequency and use vibrant neon colors.
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
 * <TopicNavigator
 *   topics={topTopics}
 *   maxTopics={12}
 *   variant="homepage"
 * />
 * ```
 */
export function TopicNavigator({
  topics,
  maxTopics = 12,
  variant = "homepage",
  className,
}: TopicNavigatorProps) {
  // Limit topics and calculate min/max for sizing
  const displayTopics = topics.slice(0, maxTopics);

  if (displayTopics.length === 0) {
    return null;
  }

  const counts = displayTopics.map((t) => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 md:gap-3",
        className
      )}
    >
      {displayTopics.map((topic, index) => {
        const sizeClass = getTopicSize(topic.count, minCount, maxCount);
        const neonColor = NEON_COLORS[topic.colorVariant];

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
                  neonColor.badge,
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
  );
}

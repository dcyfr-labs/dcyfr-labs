"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, BookOpen, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TYPOGRAPHY,
  ANIMATION,
  SPACING,
  SEMANTIC_COLORS,
} from "@/lib/design-tokens";
import type { TrendingTechnology } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

interface TrendingTechnologiesPanelProps {
  /** Array of trending technologies with scores */
  technologies: TrendingTechnology[];
  /** Maximum number of technologies to display */
  maxTechnologies?: number;
  /** Class name for container */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Assign a consistent color to a technology based on its name hash.
 * Uses SEMANTIC_COLORS accent palette for visual variety.
 */
const ACCENT_COLORS = [
  "cyan",
  "blue",
  "purple",
  "emerald",
  "orange",
  "pink",
  "indigo",
  "teal",
  "violet",
  "amber",
  "sky",
  "lime",
] as const;

type AccentColor = (typeof ACCENT_COLORS)[number];

function getTechColor(name: string): AccentColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = Math.trunc(hash); // Convert to 32bit integer
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function getAccentBadge(color: AccentColor): string {
  const colorMap: Record<AccentColor, string> = {
    cyan: SEMANTIC_COLORS.accent.cyan.badge,
    blue: SEMANTIC_COLORS.accent.blue.badge,
    purple: SEMANTIC_COLORS.accent.purple.badge,
    emerald: SEMANTIC_COLORS.accent.emerald.badge,
    orange: SEMANTIC_COLORS.accent.orange.badge,
    pink: SEMANTIC_COLORS.accent.pink.badge,
    indigo: SEMANTIC_COLORS.accent.indigo.badge,
    teal: SEMANTIC_COLORS.accent.teal.badge,
    violet: SEMANTIC_COLORS.accent.violet.badge,
    amber: SEMANTIC_COLORS.accent.amber.badge,
    sky: SEMANTIC_COLORS.accent.sky.badge,
    lime: SEMANTIC_COLORS.accent.lime.badge,
  };
  return colorMap[color];
}

/**
 * Get bar width percentage relative to the max score.
 */
function getBarWidth(score: number, maxScore: number): string {
  if (maxScore === 0) return "0%";
  const pct = Math.max(8, (score / maxScore) * 100);
  return `${pct}%`;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrendingTechnologiesPanel Component
 *
 * Displays trending technologies aggregated from blog posts and projects.
 * Used within the TrendingSection tabs.
 *
 * Features:
 * - Score-based ranking with visual bars
 * - Blog/project mention breakdown
 * - Color-coded badges per technology
 * - Smooth staggered animations
 * - Links to filtered blog view
 *
 * @example
 * ```tsx
 * <TrendingTechnologiesPanel
 *   technologies={trendingTech}
 *   maxTechnologies={12}
 * />
 * ```
 */
export function TrendingTechnologiesPanel({
  technologies,
  maxTechnologies = 12,
  className,
}: TrendingTechnologiesPanelProps) {
  const displayTech = technologies.slice(0, maxTechnologies);

  // Empty state
  if (displayTech.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center">
        <Code2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className={cn(TYPOGRAPHY.label.standard, "text-muted-foreground")}>
          Trending technologies will appear here
        </p>
        <p className={cn(TYPOGRAPHY.body.small, "text-muted-foreground/70 mt-1")}>
          Technologies are aggregated from blog tags and project tech stacks
        </p>
      </Card>
    );
  }

  const maxScore = Math.max(...displayTech.map((t) => t.score));

  return (
    <div className={cn(SPACING.content, className)}>
      {/* Technology List */}
      <div className={SPACING.compact}>
        {displayTech.map((tech, index) => {
          const color = getTechColor(tech.name);
          const badgeClass = getAccentBadge(color);
          const barWidth = getBarWidth(tech.score, maxScore);

          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: "easeOut",
              }}
            >
              <Link
                href={`/blog?tag=${encodeURIComponent(tech.name)}`}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2",
                  "hover:bg-accent/50",
                  ANIMATION.transition.base
                )}
              >
                {/* Rank */}
                <span
                  className={cn(
                    "text-xs font-mono text-muted-foreground/50 w-5 text-right shrink-0",
                    ANIMATION.transition.theme
                  )}
                >
                  {index + 1}
                </span>

                {/* Tech Name + Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    badgeClass,
                    "shrink-0 text-xs font-medium",
                    ANIMATION.transition.base
                  )}
                >
                  {tech.name}
                </Badge>

                {/* Score Bar */}
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full bg-primary/40")}
                      initial={{ width: 0 }}
                      animate={{ width: barWidth }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.04 + 0.2,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>

                {/* Mention Counts */}
                <div className="flex items-center gap-2 shrink-0">
                  {tech.blogMentions > 0 && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-xs text-muted-foreground",
                        ANIMATION.transition.theme
                      )}
                      title={`${tech.blogMentions} blog post${tech.blogMentions !== 1 ? "s" : ""}`}
                    >
                      <BookOpen className="h-3 w-3" />
                      {tech.blogMentions}
                    </span>
                  )}
                  {tech.projectMentions > 0 && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-xs text-muted-foreground",
                        ANIMATION.transition.theme
                      )}
                      title={`${tech.projectMentions} project${tech.projectMentions !== 1 ? "s" : ""}`}
                    >
                      <FolderGit2 className="h-3 w-3" />
                      {tech.projectMentions}
                    </span>
                  )}
                </div>
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
          Explore all technologies →
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingBadge } from "@/components/ui/trending-badge";
import type { TrendingBadgeVariant } from "@/components/ui/trending-badge";
import { Star, TrendingUp, GitFork, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";
import { ANIMATION, TYPOGRAPHY, HOVER_EFFECTS, SPACING, SEMANTIC_COLORS } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface TrendingVelocity {
  /** Rapid growth (>50% in 7 days) */
  isHot: boolean;
  /** Steady growth (>20% in 30 days) */
  isRising: boolean;
  /** Highest score in category */
  isTop: boolean;
  /** Growth rate increasing */
  isAccelerating: boolean;
  /** Growth rate percentage */
  growthRate: number;
}

export interface TrendingProject {
  project: Project;
  stars: number;
  recentStars: number; // Stars gained in recent period
  forks?: number;
  score: number; // Calculated trending score
  velocity?: TrendingVelocity; // Momentum indicators
}

interface TrendingProjectsPanelProps {
  projects: TrendingProject[];
  limit?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the highest priority trending badge for a project
 * Priority: Hot > Accelerating > Rising > Top
 */
function getPrimaryBadge(velocity?: TrendingVelocity): TrendingBadgeVariant | null {
  if (!velocity) return null;

  if (velocity.isHot) return "hot";
  if (velocity.isAccelerating) return "accelerating";
  if (velocity.isRising) return "rising";
  if (velocity.isTop) return "top";

  return null;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrendingProjectsPanel Component
 *
 * Displays trending projects based on GitHub activity.
 * Used within the TrendingSection tabs.
 *
 * Features:
 * - Ranked display (#1, #2, #3)
 * - GitHub star counts with trending indicator
 * - Fork counts
 * - Project category badges
 * - Smooth hover animations
 * - Fallback to recent projects if no GitHub data
 *
 * @example
 * ```tsx
 * <TrendingProjectsPanel
 *   projects={trendingProjects}
 *   limit={5}
 * />
 * ```
 */
export function TrendingProjectsPanel({
  projects,
  limit = 5,
}: TrendingProjectsPanelProps) {
  // Sort by trending score
  const sortedProjects = [...projects]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Empty state
  if (sortedProjects.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center">
        <FolderGit2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className={cn(TYPOGRAPHY.label.standard, "text-muted-foreground")}>
          Trending projects will appear here
        </p>
        <p className={cn(TYPOGRAPHY.body.small, "text-muted-foreground/70 mt-2")}>
          Projects are ranked by GitHub activity
        </p>
      </Card>
    );
  }

  return (
    <div className={SPACING.compact}>
      {sortedProjects.map(({ project, stars, recentStars, forks, score, velocity }, index) => {
        const hasGitHubData = stars > 0;
        const primaryBadge = getPrimaryBadge(velocity);

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
          >
            <Link href={`/projects/${project.slug}`}>
              <Card
                className={cn(
                  "p-4 border cursor-pointer group",
                  ANIMATION.transition.base,
                  HOVER_EFFECTS.cardGlow,
                  "hover:bg-muted/30 hover:border-primary/50 hover:-translate-y-0.5"
                )}
              >
                <div className={SPACING.compact}>
                  {/* Header: Rank + Trending Badge + Category */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          TYPOGRAPHY.label.xs,
                          ANIMATION.transition.movement,
                          "group-hover:scale-110"
                        )}
                      >
                        #{index + 1}
                      </Badge>
                      {primaryBadge && (
                        <TrendingBadge
                          variant={primaryBadge}
                          className={cn(
                            ANIMATION.transition.movement,
                            "group-hover:scale-110"
                          )}
                        />
                      )}
                    </div>
                    {project.category && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          TYPOGRAPHY.label.xs,
                          ANIMATION.transition.theme,
                          "group-hover:bg-primary/20 capitalize"
                        )}
                      >
                        {project.category}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      TYPOGRAPHY.label.standard,
                      "line-clamp-2 leading-snug",
                      ANIMATION.transition.theme,
                      "group-hover:text-primary"
                    )}
                  >
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={cn(
                      TYPOGRAPHY.body.small,
                      "text-muted-foreground line-clamp-2"
                    )}
                  >
                    {project.description}
                  </p>

                  {/* Footer: GitHub Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    {hasGitHubData ? (
                      <>
                        <div
                          className={cn(
                            "flex items-center gap-1 group-hover:text-foreground",
                            ANIMATION.transition.theme
                          )}
                        >
                          <Star
                            className={cn(
                              "h-3 w-3 group-hover:scale-110",
                              ANIMATION.transition.movement
                            )}
                          />
                          <span>{stars.toLocaleString()}</span>
                        </div>

                        {recentStars > 0 && (
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              SEMANTIC_COLORS.alert.success.text,
                              ANIMATION.transition.theme
                            )}
                          >
                            <TrendingUp className="h-3 w-3" />
                            <span>+{recentStars}</span>
                          </div>
                        )}

                        {forks !== undefined && forks > 0 && (
                          <div className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            <span>{forks.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground/70">
                        {project.status === "active" ? "Active" : project.status === "in-progress" ? "In Progress" : "Archived"}
                      </span>
                    )}
                  </div>

                  {/* Tech Stack Pills */}
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tech.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className={cn(
                            TYPOGRAPHY.label.xs,
                            "px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground",
                            "group-hover:bg-muted",
                            ANIMATION.transition.theme
                          )}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech.length > 3 && (
                        <span
                          className={cn(
                            TYPOGRAPHY.label.xs,
                            "px-2 py-0.5 text-muted-foreground/60"
                          )}
                        >
                          +{project.tech.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}

      {/* Footer hint */}
      <div className="text-center pt-2">
        <Link
          href="/projects"
          className={cn(
            TYPOGRAPHY.label.small,
            "text-muted-foreground hover:text-primary",
            ANIMATION.transition.theme
          )}
        >
          View all projects →
        </Link>
      </div>
    </div>
  );
}

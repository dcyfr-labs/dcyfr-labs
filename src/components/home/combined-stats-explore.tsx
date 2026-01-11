"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  Activity,
  ArrowRight,
  Bookmark,
  Heart,
  Rss,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TYPOGRAPHY,
  HOVER_EFFECTS,
  ANIMATION,
  SPACING,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "@/lib/navigation";

// ============================================================================
// TYPES
// ============================================================================

type StatItemProps = {
  value: string | number;
  label: string;
  suffix?: string;
};

interface ExploreCardData {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  count?: number;
  countLabel?: string;
  accentColor: string;
}

interface CombinedStatsExploreProps {
  postsCount: number;
  projectsCount: number;
  yearsOfExperience: number;
  technologiesCount: number;
  activityCount: number;
  totalBookmarks?: number;
  totalLikes?: number;
  className?: string;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatItem({ value, label, suffix }: StatItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-4 md:p-8 rounded-lg border bg-card",
        HOVER_EFFECTS.cardSubtle
      )}
    >
      <div className={cn(TYPOGRAPHY.display.statLarge, "mb-2 md:mb-3")}>
        {value}
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
      <div
        className={cn(
          TYPOGRAPHY.label.small,
          "text-muted-foreground text-center"
        )}
      >
        {label}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CombinedStatsExplore Component
 *
 * Unified section combining:
 * 1. Stats dashboard at the top (6 key metrics: posts, projects, experience, tech, bookmarks, likes)
 * 2. Three primary explore cards (Activity, Blog, Projects)
 * 3. Secondary discovery links at the bottom (Bookmarks, Likes, Subscribe)
 *
 * This consolidates the separate stats and explore sections into a cohesive,
 * visually balanced layout that highlights both metrics and content navigation.
 *
 * @example
 * ```tsx
 * <CombinedStatsExplore
 *   postsCount={12}
 *   projectsCount={3}
 *   yearsOfExperience={7}
 *   technologiesCount={11}
 *   activityCount={36}
 *   totalBookmarks={42}
 *   totalLikes={156}
 * />
 * ```
 */
export function CombinedStatsExplore({
  postsCount,
  projectsCount,
  yearsOfExperience,
  technologiesCount,
  activityCount,
  totalBookmarks = 0,
  totalLikes = 0,
  className,
}: CombinedStatsExploreProps) {
  const cards: ExploreCardData[] = [
    {
      href: "/activity",
      label: "Activity",
      icon: Activity,
      description: "Recent updates, commits, and milestones",
      count: activityCount,
      countLabel: "activities",
      accentColor: "border-primary",
    },
    {
      href: "/blog",
      label: "Blog",
      icon: BookOpen,
      description: "Articles on security, development, and technology",
      count: postsCount,
      countLabel: "articles",
      accentColor: "border-primary",
    },
    {
      href: "/work",
      label: "Projects",
      icon: Briefcase,
      description: "Featured work and open source contributions",
      count: projectsCount,
      countLabel: "projects",
      accentColor: "border-primary",
    },
  ];

  // Get secondary discover links (excluding Activity, Blog, Projects to avoid duplicates)
  const discoverSection = NAVIGATION.mobile.find(
    (section) => section.id === "discover"
  );
  const secondaryLinks =
    discoverSection?.items
      .filter(
        (item) =>
          !["Activity", "Blog", "Projects"].some((name) => item.label === name)
      )
      .map((item) => ({
        ...item,
        label: item.label === "RSS Feeds" ? "Subscribe" : item.label,
      })) || [];

  return (
    <div className={cn("flex flex-col", SPACING.subsection, className)}>
      {/* Stats Grid - Top section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        <StatItem value={postsCount} label="Blog Posts" />
        <StatItem value={projectsCount} label="Projects" />
        <StatItem
          value={yearsOfExperience}
          label="Years Experience"
          suffix="+"
        />
        <StatItem value={technologiesCount} label="Technologies" suffix="+" />
        <StatItem value={totalBookmarks} label="Bookmarks" />
        <StatItem value={totalLikes} label="Likes" />
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-border/50 mb-8" />

      {/* Primary Content Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={card.href} className="block h-full group">
              <Card
                className={cn(
                  "h-full relative overflow-hidden",
                  HOVER_EFFECTS.card,
                  HOVER_EFFECTS.cardGlow
                )}
              >
                {/* Accent border */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-0.5 z-20 opacity-0 group-hover:opacity-100 border-t-2",
                    card.accentColor,
                    ANIMATION.transition.appearance
                  )}
                />

                <CardContent
                  className="p-4 md:p-8 flex flex-col h-full"
                >
                  {/* Icon + Label + Count */}
                  <div
                    className="flex items-start justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "p-2 rounded-lg bg-muted/50 group-hover:bg-muted group-hover:scale-110",
                          ANIMATION.transition.base
                        )}
                      >
                        <card.icon
                          className={cn(
                            "h-5 w-5 text-muted-foreground group-hover:text-foreground",
                            ANIMATION.transition.theme
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <h3
                        className={cn(
                          TYPOGRAPHY.h3.standard,
                          "text-base group-hover:text-foreground",
                          ANIMATION.transition.theme
                        )}
                      >
                        {card.label}
                      </h3>
                    </div>
                    {card.count !== undefined && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs shrink-0 group-hover:scale-110",
                          ANIMATION.transition.movement,
                          ANIMATION.effects.countUp
                        )}
                      >
                        {card.count} {card.countLabel}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground flex-1">
                    {card.description}
                  </p>

                  {/* Arrow indicator */}
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-3 text-sm text-muted-foreground group-hover:text-foreground",
                      ANIMATION.transition.theme
                    )}
                  >
                    <span>Explore</span>
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 group-hover:translate-x-1",
                        ANIMATION.transition.movement
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Secondary Discovery Links */}
      {secondaryLinks.length > 0 && (
        <nav
          aria-label="Discover additional content"
          className={cn(
            "w-full overflow-x-auto scrollbar-hide",
            "-webkit-overflow-scrolling-touch",
            "flex justify-center"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 md:gap-3",
              "py-1 md:py-2",
              "px-4 md:px-8",
              "flex-nowrap"
            )}
          >
            {secondaryLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full",
                      "text-xs md:text-sm text-muted-foreground whitespace-nowrap",
                      "border border-border/50",
                      "hover:border-border hover:text-foreground",
                      ANIMATION.transition.base
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

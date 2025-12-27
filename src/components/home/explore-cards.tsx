"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, Activity, ArrowRight, Bookmark, Heart, Rss } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TYPOGRAPHY, HOVER_EFFECTS, ANIMATION, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "@/lib/navigation";

// ============================================================================
// TYPES
// ============================================================================

interface ExploreCardData {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  count?: number;
  countLabel?: string;
  accentColor: string;
}

interface ExploreCardsProps {
  /** Number of blog posts */
  postCount: number;
  /** Number of projects */
  projectCount: number;
  /** Number of activities */
  activityCount: number;
  /** Class name for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ExploreCards Component
 *
 * Unified explore section with three primary content cards (Activity, Blog, Projects)
 * followed by secondary discovery links (Bookmarks, Likes, RSS Feeds).
 * 
 * Consolidated to eliminate duplicate navigation paths while maintaining
 * discoverability of all content areas.
 *
 * @example
 * ```tsx
 * <ExploreCards
 *   postCount={42}
 *   projectCount={12}
 *   activityCount={156}
 * />
 * ```
 */
export function ExploreCards({
  postCount,
  projectCount,
  activityCount,
  className,
}: ExploreCardsProps) {
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
      count: postCount,
      countLabel: "articles",
      accentColor: "border-primary",
    },
    {
      href: "/work",
      label: "Projects",
      icon: Briefcase,
      description: "Featured work and open source contributions",
      count: projectCount,
      countLabel: "projects",
      accentColor: "border-primary",
    }
  ];

  // Get secondary discover links (excluding Activity, Blog, Projects to avoid duplicates)
  const discoverSection = NAVIGATION.mobile.find(
    (section) => section.id === "discover"
  );
  const secondaryLinks = discoverSection?.items.filter(
    item => !["Activity", "Blog", "Projects"].some(name => item.label === name)
  ) || [];

  return (
    <div className={cn("flex flex-col", SPACING.subsection, className)}>
      {/* Primary Content Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
                  className={cn("absolute inset-x-0 top-0 h-0.5 z-20 opacity-0 group-hover:opacity-100 border-t-2", card.accentColor, ANIMATION.transition.appearance)}
                />

                <CardContent className="p-4 md:p-5 flex flex-col h-full">
                  {/* Icon + Label + Count */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("p-2 rounded-lg bg-muted/50 group-hover:bg-muted group-hover:scale-110", ANIMATION.transition.base)}
                      >
                        <card.icon
                          className={cn("h-5 w-5 text-muted-foreground group-hover:text-foreground", ANIMATION.transition.theme)}
                          aria-hidden="true"
                        />
                      </div>
                      <h3 className={cn(TYPOGRAPHY.h3.standard, "text-base group-hover:text-foreground", ANIMATION.transition.theme)}>
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
                  <div className={cn("flex items-center gap-1 mt-3 text-sm text-muted-foreground group-hover:text-foreground", ANIMATION.transition.theme)}>
                    <span>Explore</span>
                    <ArrowRight
                      className={cn("h-4 w-4 group-hover:translate-x-1", ANIMATION.transition.movement)}
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Secondary Discovery Links - Only render if there are secondary links */}
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
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 md:gap-2",
                      "px-3 py-2 md:px-4 md:py-2.5",
                      "rounded-full",
                      "bg-muted/50 hover:bg-muted",
                      "text-muted-foreground hover:text-foreground",
                      TYPOGRAPHY.label.small,
                      "whitespace-nowrap",
                      ANIMATION.transition.base,
                      "hover:scale-105 active:scale-95",
                      "hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "min-h-11" // Touch target (44px)
                    )}
                    title={link.description}
                    prefetch={link.prefetch ?? false}
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
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

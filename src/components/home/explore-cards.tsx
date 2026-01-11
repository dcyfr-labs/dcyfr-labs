"use client";

import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonText } from "@/components/ui/skeleton-primitives";
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
  postCount?: number;
  /** Number of projects */
  projectCount?: number;
  /** Number of activities */
  activityCount?: number;
  /** Class name for container */
  className?: string;
  /** Loading state - renders skeleton version */
  loading?: boolean;
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
 * **Loading State:**
 * Pass `loading={true}` to render skeleton version that matches the real component structure.
 * This ensures loading states never drift from the actual component layout.
 *
 * **Animation approach:** Uses CSS animations (Tailwind animate-in) instead of Framer Motion.
 * Stagger effects use CSS delay for smooth card entrance animations.
 *
 * @example
 * ```tsx
 * <ExploreCards
 *   postCount={42}
 *   projectCount={12}
 *   activityCount={156}
 * />
 * ```
 *
 * @example
 * // Show loading skeleton
 * <ExploreCards loading />
 */
export function ExploreCards({
  postCount = 0,
  projectCount = 0,
  activityCount = 0,
  className,
  loading = false,
}: ExploreCardsProps) {
  // Loading state - skeleton version matching real component structure
  if (loading) {
    return (
      <div className={cn("flex flex-col", SPACING.subsection, className)}>
        {/* Primary Content Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <Card
              key={index}
              className="h-full"
              style={{
                animationDelay: `${index * 100}ms`, // Stagger effect
              }}
            >
              <CardContent className="p-4 md:p-5 flex flex-col h-full">
                {/* Icon + Label + Count skeleton */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>

                {/* Description skeleton */}
                <div className="flex-1 mb-3">
                  <SkeletonText lines={2} />
                </div>

                {/* Arrow indicator skeleton */}
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary Discovery Links Skeleton */}
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
            {[...Array(3)].map((_, index) => (
              <Skeleton
                key={index}
                className="h-11 w-28 rounded-full"
                style={{
                  animationDelay: `${300 + index * 50}ms`, // Start after primary cards
                }}
              />
            ))}
          </div>
        </nav>
      </div>
    );
  }

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
    },
  ];

  // Get secondary discover links (excluding Activity, Blog, Projects to avoid duplicates)
  const discoverSection = NAVIGATION.mobile.find(
    (section) => section.id === "discover"
  );
  const secondaryLinks =
    discoverSection?.items.filter(
      (item) =>
        !["Activity", "Blog", "Projects"].some((name) => item.label === name)
    ) || [];

  return (
    <div className={cn("flex flex-col", SPACING.subsection, className)}>
      {/* Primary Content Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          // Use CSS stagger delays for smooth entrance animations
          const staggerDelay = index * 100; // 100ms increments

          return (
            <div
              key={card.href}
              className="animate-in fade-in slide-in-from-bottom-4 duration-400"
              style={{ animationDelay: `${staggerDelay}ms` }}
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

                  <CardContent className="p-4 md:p-5 flex flex-col h-full">
                    {/* Icon + Label + Count */}
                    <div className="flex items-start justify-between mb-3">
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
            </div>
          );
        })}
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
              // Base delay + stagger for secondary links
              const staggerDelay = 300 + index * 50; // Start after primary cards

              return (
                <div
                  key={link.href}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${staggerDelay}ms` }}
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
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

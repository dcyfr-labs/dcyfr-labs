"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, Activity, Bookmark, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TYPOGRAPHY, HOVER_EFFECTS, ANIMATION } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

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
 * Four cards providing entry points to main content areas.
 * Shows item counts and brief descriptions.
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
      href: "/blog",
      label: "Blog",
      icon: BookOpen,
      description: "Articles on security, development, and technology",
      count: postCount,
      countLabel: "articles",
    },
    {
      href: "/work",
      label: "Projects",
      icon: Briefcase,
      description: "Featured work and open source contributions",
      count: projectCount,
      countLabel: "projects",
    },
    {
      href: "/activity",
      label: "Activity",
      icon: Activity,
      description: "Recent updates, commits, and milestones",
      count: activityCount,
      countLabel: "activities",
    },
    {
      href: "/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      description: "Curated resources and saved reads",
      countLabel: "saved",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
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
                "h-full",
                HOVER_EFFECTS.card
              )}
            >
              <CardContent className="p-4 md:p-5 flex flex-col h-full">
                {/* Icon + Label + Count */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg bg-muted/50 group-hover:bg-muted", ANIMATION.transition.theme)}>
                      <card.icon
                        className={cn("h-5 w-5 text-muted-foreground group-hover:text-foreground", ANIMATION.transition.theme)}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className={cn(TYPOGRAPHY.h3.standard, "text-base")}>
                      {card.label}
                    </h3>
                  </div>
                  {card.count !== undefined && (
                    <Badge variant="secondary" className="text-xs shrink-0">
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
                    className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

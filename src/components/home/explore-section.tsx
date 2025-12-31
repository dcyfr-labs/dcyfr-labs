"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  Activity,
  ArrowRight,
  Code2,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TYPOGRAPHY,
  HOVER_EFFECTS,
  ANIMATION,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface ExploreSectionProps {
  postsCount: number;
  projectsCount: number;
  yearsOfExperience: number;
  technologiesCount: number;
  activityCount: number;
  className?: string;
}

interface ExploreCardData {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  count: number;
  countLabel: string;
  color: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ExploreSection Component
 *
 * Professional landing page section showcasing key metrics and navigation.
 * Designed to be mobile-first with a clean, modern aesthetic.
 *
 * Features:
 * - Responsive grid layout (1 col mobile → 2 cols tablet → 3 cols desktop)
 * - Large, readable cards with icons and metrics
 * - Smooth hover animations
 * - Clear call-to-action buttons
 * - Semantic color coding
 *
 * @example
 * ```tsx
 * <ExploreSection
 *   postsCount={12}
 *   projectsCount={3}
 *   yearsOfExperience={7}
 *   technologiesCount={11}
 *   activityCount={36}
 * />
 * ```
 */
export function ExploreSection({
  postsCount,
  projectsCount,
  yearsOfExperience,
  technologiesCount,
  activityCount,
  className,
}: ExploreSectionProps) {
  const cards: ExploreCardData[] = [
    {
      href: "/blog",
      title: "Blog",
      icon: BookOpen,
      description: "Articles on security, development, and technology",
      count: postsCount,
      countLabel: "articles",
      color: "text-blue-500",
    },
    {
      href: "/work",
      title: "Projects",
      icon: Briefcase,
      description: "Featured work and open source contributions",
      count: projectsCount,
      countLabel: "projects",
      color: "text-purple-500",
    },
    {
      href: "/activity",
      title: "Activity",
      icon: Activity,
      description: "Recent updates, commits, and milestones",
      count: activityCount,
      countLabel: "updates",
      color: "text-green-500",
    },
  ];

  const statsData = [
    {
      value: yearsOfExperience,
      suffix: "+",
      label: "Years Experience",
      icon: GraduationCap,
      color: "text-amber-500",
    },
    {
      value: technologiesCount,
      suffix: "+",
      label: "Technologies",
      icon: Code2,
      color: "text-cyan-500",
    },
  ];

  return (
    <div className={cn("w-full", className)}>
      {/* Stats Summary - Compact row above main cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className={cn("border-0 bg-muted/30", HOVER_EFFECTS.cardSubtle)}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1">
                      <span className={cn(TYPOGRAPHY.display.statLarge, stat.color)}>
                        {stat.value}
                      </span>
                      {stat.suffix && (
                        <span className={cn("text-xl font-semibold text-muted-foreground")}>
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                    <p className={cn(TYPOGRAPHY.label.small, "text-muted-foreground mt-1")}>
                      {stat.label}
                    </p>
                  </div>
                  <stat.icon className={cn("h-8 w-8 opacity-20", stat.color)} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Explore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <Link href={card.href} className="block h-full group">
              <Card
                className={cn(
                  "h-full border-2 border-border/50 group-hover:border-primary/50",
                  "bg-card group-hover:bg-accent/5",
                  ANIMATION.transition.base,
                  "relative overflow-hidden"
                )}
              >
                {/* Gradient background on hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5",
                    "bg-linear-to-br from-primary via-transparent to-transparent",
                    ANIMATION.transition.appearance
                  )}
                />

                <CardContent className="p-6 md:p-8 relative z-10">
                  {/* Icon */}
                  <div
                    className={cn(
                      "inline-flex p-3 rounded-xl mb-4",
                      "bg-primary/10 group-hover:bg-primary/20",
                      "group-hover:scale-110",
                      ANIMATION.transition.movement
                    )}
                  >
                    <card.icon
                      className={cn(
                        "h-6 w-6",
                        card.color,
                        "group-hover:scale-110",
                        ANIMATION.transition.movement
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      TYPOGRAPHY.h3.standard,
                      "text-xl mb-2 group-hover:text-primary",
                      ANIMATION.transition.theme
                    )}
                  >
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={cn(
                      TYPOGRAPHY.body,
                      "text-muted-foreground mb-6 min-h-10"
                    )}
                  >
                    {card.description}
                  </p>

                  {/* Count Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          TYPOGRAPHY.display.stat,
                          "text-2xl font-bold text-foreground"
                        )}
                      >
                        {card.count}
                      </span>
                      <span className={cn(TYPOGRAPHY.label.small, "text-muted-foreground")}>
                        {card.countLabel}
                      </span>
                    </div>

                    {/* Arrow icon */}
                    <ArrowRight
                      className={cn(
                        "h-5 w-5 text-muted-foreground",
                        "group-hover:text-primary group-hover:translate-x-1",
                        ANIMATION.transition.movement
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 text-center"
      >
        <p className={cn(TYPOGRAPHY.body.small, "text-muted-foreground mb-4")}>
          Interested in working together or have questions?
        </p>
        <Button asChild size="lg" variant="default">
          <Link href="/contact" className="group">
            Get in Touch
            <ArrowRight
              className={cn(
                "ml-2 h-4 w-4 group-hover:translate-x-1",
                ANIMATION.transition.movement
              )}
            />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

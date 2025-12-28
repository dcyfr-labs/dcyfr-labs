"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Quote, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  HOVER_EFFECTS,
  ANIMATION,
  SERIES_COLORS,
  TYPOGRAPHY,
} from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface QuoteCardProps {
  /** Quote text */
  quote: string;
  /** Quote source/author */
  source?: string;
  /** Optional link destination */
  href?: string;
  /** Color theme */
  theme?: "cyan" | "magenta" | "lime" | "orange" | "purple";
  /** Animation delay for staggered reveals */
  animationDelay?: number;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * QuoteCard Component
 *
 * A highlighted quote/insight card with neon accent styling.
 * Perfect for featuring key insights, testimonials, or pull quotes.
 *
 * @example
 * ```tsx
 * <QuoteCard
 *   quote="Security is not a product, but a process."
 *   source="Bruce Schneier"
 *   theme="cyan"
 *   href="/blog/security-mindset"
 * />
 * ```
 */
export function QuoteCard({
  quote,
  source,
  href,
  theme = "cyan",
  animationDelay = 0,
  className,
}: QuoteCardProps) {
  // Map themes to series colors for consistent styling
  const themeMapping: Record<string, typeof SERIES_COLORS.security | typeof SERIES_COLORS.design | typeof SERIES_COLORS.tips | typeof SERIES_COLORS.performance | typeof SERIES_COLORS.architecture | typeof SERIES_COLORS.default> = {
    cyan: SERIES_COLORS.security,
    magenta: SERIES_COLORS.design,
    lime: SERIES_COLORS.tips,
    orange: SERIES_COLORS.performance,
    purple: SERIES_COLORS.architecture,
  };
  const themeColors = themeMapping[theme] || SERIES_COLORS.default;

  const cardContent = (
    <Card
      className={cn(
        "relative overflow-hidden",
        themeColors.card,
        href && HOVER_EFFECTS.cardSubtle,
        className
      )}
    >
      {/* Quote icon */}
      <div
        className={cn(
          "absolute top-3 right-3 opacity-10",
          themeColors.icon
        )}
      >
        <Quote className="w-12 h-12" />
      </div>

      <CardContent className="p-4 md:p-5 relative">
        {/* Quote text */}
        <blockquote
          className={cn(
            TYPOGRAPHY.body,
            "italic leading-relaxed",
            "before:content-['\u201C'] after:content-['\u201D']",
            "before:text-2xl before:text-muted-foreground/50",
            "after:text-2xl after:text-muted-foreground/50"
          )}
        >
          {quote}
        </blockquote>

        {/* Source/author */}
        {source && (
          <cite
            className="block mt-3 text-sm not-italic text-muted-foreground"
          >
            — {source}
          </cite>
        )}

        {/* Link indicator */}
        {href && (
          <div
            className={cn(
              "mt-3 flex items-center gap-1 text-sm text-muted-foreground",
              ANIMATION.transition.theme,
              "group-hover:gap-2"
            )}
          >
            Read more
            <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
    >
      {href ? (
        <Link href={href} className="block group">
          {cardContent}
        </Link>
      ) : (
        <div className="block">
          {cardContent}
        </div>
      )}
    </motion.div>
  );
}

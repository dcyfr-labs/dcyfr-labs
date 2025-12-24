"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Mail,
  Coffee,
  Quote,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  HOVER_EFFECTS,
  ANIMATION,
  NEON_COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  SHADOWS,
} from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export type InterruptionType =
  | "cta"
  | "related-post"
  | "newsletter"
  | "sponsor"
  | "quote";

interface BaseInterruptionProps {
  /** Animation delay for staggered reveals */
  animationDelay?: number;
  /** Additional class names */
  className?: string;
}

interface CTAInterruptionProps extends BaseInterruptionProps {
  type: "cta";
  title: string;
  description: string;
  href: string;
  buttonLabel?: string;
  icon?: React.ReactNode;
  theme?: "cyan" | "magenta" | "lime";
}

interface RelatedPostInterruptionProps extends BaseInterruptionProps {
  type: "related-post";
  title: string;
  summary: string;
  href: string;
  image?: { src: string; alt: string };
  readTime?: string;
  tag?: string;
}

interface NewsletterInterruptionProps extends BaseInterruptionProps {
  type: "newsletter";
  title?: string;
  description?: string;
}

interface SponsorInterruptionProps extends BaseInterruptionProps {
  type: "sponsor";
  title?: string;
  description?: string;
  href?: string;
}

interface QuoteInterruptionProps extends BaseInterruptionProps {
  type: "quote";
  quote: string;
  source?: string;
  theme?: "cyan" | "magenta" | "lime" | "orange" | "purple";
}

export type FeedInterruptionProps =
  | CTAInterruptionProps
  | RelatedPostInterruptionProps
  | NewsletterInterruptionProps
  | SponsorInterruptionProps
  | QuoteInterruptionProps;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function CTAInterruption({
  title,
  description,
  href,
  buttonLabel = "Learn more",
  icon,
  theme = "cyan",
  animationDelay = 0,
  className,
}: CTAInterruptionProps) {
  const themeColors = NEON_COLORS[theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-2",
          themeColors.container,
          SHADOWS.card.rest,
          className
        )}
      >
        {/* Gradient accent */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1",
            GRADIENTS.brand.primary
          )}
        />

        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                themeColors.container
              )}
            >
              {icon || <Sparkles className={cn("w-5 h-5", themeColors.icon)} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn(TYPOGRAPHY.label.standard, "mb-1")}>{title}</h4>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {description}
              </p>
              <Button asChild size="sm" variant="outline" className="group">
                <Link href={href}>
                  {buttonLabel}
                  <ArrowRight
                    className={cn(
                      "ml-1.5 w-3.5 h-3.5",
                      ANIMATION.transition.theme,
                      "group-hover:translate-x-0.5"
                    )}
                  />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RelatedPostInterruption({
  title,
  summary,
  href,
  image,
  readTime,
  tag,
  animationDelay = 0,
  className,
}: RelatedPostInterruptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
    >
      <Link href={href} className="block group">
        <Card
          className={cn(
            "relative overflow-hidden",
            HOVER_EFFECTS.cardSubtle,
            SHADOWS.card.rest,
            className
          )}
        >
          {/* "You might like" label */}
          <div className="px-4 pt-3 pb-2 flex items-center gap-2 text-xs text-muted-foreground border-b border-border/50">
            <BookOpen className="w-3.5 h-3.5" />
            <span>You might like this</span>
          </div>

          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image thumbnail */}
              {image && (
                <div className="relative shrink-0 w-20 h-20 rounded-md overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className={cn(
                      "object-cover",
                      ANIMATION.transition.base,
                      "group-hover:scale-105"
                    )}
                    sizes="80px"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {tag && (
                  <span className="inline-block text-xs text-primary font-medium mb-1">
                    {tag}
                  </span>
                )}
                <h4
                  className={cn(
                    TYPOGRAPHY.label.standard,
                    "line-clamp-2 mb-1",
                    "group-hover:text-primary",
                    ANIMATION.transition.theme
                  )}
                >
                  {title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {summary}
                </p>
                {readTime && (
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {readTime}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function NewsletterInterruption({
  title = "Stay in the loop",
  description = "Get notified about new posts and updates. No spam, unsubscribe anytime.",
  animationDelay = 0,
  className,
}: NewsletterInterruptionProps) {
  const themeColors = NEON_COLORS.magenta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          themeColors.container,
          SHADOWS.card.rest,
          className
        )}
      >
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                "bg-primary/10"
              )}
            >
              <Mail className="w-5 h-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4 className={cn(TYPOGRAPHY.label.standard, "mb-1")}>{title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {description}
              </p>
              <Button asChild size="sm">
                <Link href="/feeds">
                  Subscribe to RSS
                  <ExternalLink className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SponsorInterruption({
  title = "Support this project",
  description = "Help keep this site running and ad-free. Every contribution helps!",
  href = "/sponsors",
  animationDelay = 0,
  className,
}: SponsorInterruptionProps) {
  const themeColors = NEON_COLORS.orange;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-dashed",
          themeColors.container,
          className
        )}
      >
        <CardContent className="p-4 text-center">
          <Coffee className={cn("w-8 h-8 mx-auto mb-2", themeColors.icon)} />
          <h4 className={cn(TYPOGRAPHY.label.standard, "mb-1")}>{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <Button asChild size="sm" variant="outline">
            <Link href={href}>
              Become a Sponsor
              <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuoteInterruption({
  quote,
  source,
  theme = "cyan",
  animationDelay = 0,
  className,
}: QuoteInterruptionProps) {
  const themeColors = NEON_COLORS[theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-l-4",
          themeColors.container,
          className
        )}
        style={{
          borderLeftColor: `hsl(var(--${theme === "cyan" ? "primary" : theme === "magenta" ? "destructive" : theme === "lime" ? "success" : theme === "orange" ? "warning" : "secondary"}))`,
        }}
      >
        {/* Quote icon */}
        <div
          className={cn(
            "absolute top-3 right-3 opacity-10",
            themeColors.icon
          )}
        >
          <Quote className="w-10 h-10" />
        </div>

        <CardContent className="p-4 md:p-5 relative">
          <blockquote
            className={cn(
              TYPOGRAPHY.body,
              "italic leading-relaxed",
              "before:content-['\u201C'] after:content-['\u201D']",
              "before:text-xl before:text-muted-foreground/50",
              "after:text-xl after:text-muted-foreground/50"
            )}
          >
            {quote}
          </blockquote>

          {source && (
            <cite
              className={cn(
                "block mt-2 text-sm not-italic",
                themeColors.text
              )}
            >
              — {source}
            </cite>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FeedInterruption Component
 *
 * Content interruption cards that can be inserted between activity items.
 * Used to promote content, encourage engagement, or break up long feeds.
 *
 * Variants:
 * - cta: Call-to-action with customizable theme
 * - related-post: Suggested post with image
 * - newsletter: RSS/email subscription prompt
 * - sponsor: Sponsorship/support call
 * - quote: Inspirational quote highlight
 *
 * @example
 * ```tsx
 * <FeedInterruption
 *   type="cta"
 *   title="Explore the Blog"
 *   description="Discover more articles on security and development"
 *   href="/blog"
 *   theme="cyan"
 * />
 *
 * <FeedInterruption
 *   type="related-post"
 *   title="Building Secure APIs"
 *   summary="A comprehensive guide to API security"
 *   href="/blog/secure-apis"
 *   image={{ src: "/images/api.jpg", alt: "API diagram" }}
 * />
 * ```
 */
export function FeedInterruption(props: FeedInterruptionProps) {
  switch (props.type) {
    case "cta":
      return <CTAInterruption {...props} />;
    case "related-post":
      return <RelatedPostInterruption {...props} />;
    case "newsletter":
      return <NewsletterInterruption {...props} />;
    case "sponsor":
      return <SponsorInterruption {...props} />;
    case "quote":
      return <QuoteInterruption {...props} />;
    default:
      return null;
  }
}

export default FeedInterruption;

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  HOVER_EFFECTS,
  SHADOWS,
  ANIMATION,
  GRADIENTS,
  TYPOGRAPHY,
} from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface MediaCardProps {
  /** Card title */
  title: string;
  /** Card description/summary */
  description?: string;
  /** Link destination */
  href: string;
  /** Image source URL */
  image?: {
    src: string;
    alt: string;
  };
  /** Video source URL (for hover preview) */
  video?: {
    src: string;
    poster?: string;
  };
  /** Card variant */
  variant?: "default" | "featured" | "compact" | "horizontal";
  /** Metadata badges */
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "outline";
  }>;
  /** Reading time or duration */
  duration?: string;
  /** View count */
  views?: number;
  /** Published date */
  date?: string;
  /** Animation delay for staggered reveals */
  animationDelay?: number;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * MediaCard Component
 *
 * A versatile card component with rich media support.
 * Inspired by social media card layouts (Twitter, LinkedIn, Medium).
 *
 * Features:
 * - Image with gradient overlay
 * - Video preview on hover
 * - Multiple layout variants
 * - Staggered animations
 * - Metadata display (badges, duration, views, date)
 *
 * @example
 * ```tsx
 * <MediaCard
 *   title="Building Secure APIs"
 *   description="A comprehensive guide to API security"
 *   href="/blog/secure-apis"
 *   image={{ src: "/images/api.jpg", alt: "API diagram" }}
 *   badges={[{ label: "Security" }, { label: "Tutorial" }]}
 *   duration="8 min read"
 *   variant="featured"
 * />
 * ```
 */
export function MediaCard({
  title,
  description,
  href,
  image,
  video,
  variant = "default",
  badges = [],
  duration,
  views,
  date,
  animationDelay = 0,
  className,
}: MediaCardProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = React.useState(false);

  // Handle video hover preview
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Variant-specific styles
  const variantStyles = {
    default: {
      container: "flex flex-col",
      imageAspect: "aspect-video",
      contentPadding: "p-4",
    },
    featured: {
      container: "flex flex-col",
      imageAspect: "aspect-[16/9]",
      contentPadding: "p-4 md:p-5",
    },
    compact: {
      container: "flex flex-col",
      imageAspect: "aspect-[4/3]",
      contentPadding: "p-3",
    },
    horizontal: {
      container: "flex flex-row",
      imageAspect: "aspect-square w-24 md:w-32 shrink-0",
      contentPadding: "p-3 md:p-4",
    },
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: "easeOut" }}
    >
      <Link href={href} className="block group">
        <Card
          className={cn(
            styles.container,
            HOVER_EFFECTS.card,
            SHADOWS.card.rest,
            "overflow-hidden",
            variant === "featured" && "ring-1 ring-border/50",
            className
          )}
          onMouseEnter={video ? handleMouseEnter : undefined}
          onMouseLeave={video ? handleMouseLeave : undefined}
        >
          {/* Media Section */}
          {(image || video) && (
            <div className={cn("relative overflow-hidden", styles.imageAspect)}>
              {/* Image */}
              {image && (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className={cn(
                    "object-cover",
                    ANIMATION.transition.base,
                    "group-hover:scale-105"
                  )}
                  sizes={
                    variant === "horizontal"
                      ? "128px"
                      : "(max-width: 768px) 100vw, 50vw"
                  }
                />
              )}

              {/* Video overlay (plays on hover) */}
              {video && (
                <video
                  ref={videoRef}
                  src={video.src}
                  poster={video.poster}
                  muted
                  loop
                  playsInline
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover",
                    ANIMATION.transition.base,
                    isHovering ? "opacity-100" : "opacity-0"
                  )}
                />
              )}

              {/* Gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0",
                  variant === "featured"
                    ? "bg-linear-to-t from-background/90 via-background/20 to-transparent"
                    : "bg-linear-to-t from-background/60 to-transparent"
                )}
              />

              {/* Play icon for video */}
              {video && !isHovering && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-foreground ml-0.5" />
                  </div>
                </div>
              )}

              {/* Top badges */}
              {badges.length > 0 && variant === "featured" && (
                <div className="absolute top-3 left-3 flex gap-2">
                  {badges.slice(0, 2).map((badge, i) => (
                    <Badge
                      key={i}
                      variant={badge.variant || "secondary"}
                      className="text-xs backdrop-blur-sm"
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content Section */}
          <CardContent className={cn(styles.contentPadding, "flex flex-col gap-2")}>
            {/* Badges (for non-featured variants) */}
            {badges.length > 0 && variant !== "featured" && (
              <div className="flex gap-2 flex-wrap">
                {badges.slice(0, 2).map((badge, i) => (
                  <Badge
                    key={i}
                    variant={badge.variant || "outline"}
                    className="text-xs"
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h3
              className={cn(
                variant === "featured"
                  ? TYPOGRAPHY.h3.standard
                  : "font-medium leading-tight",
                "line-clamp-2",
                ANIMATION.transition.theme,
                "group-hover:text-primary"
              )}
            >
              {title}
            </h3>

            {/* Description */}
            {description && variant !== "compact" && (
              <p
                className={cn(
                  "text-sm text-muted-foreground line-clamp-2",
                  variant === "horizontal" && "line-clamp-1"
                )}
              >
                {description}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-1">
              {date && <span>{date}</span>}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
              )}
              {views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {views.toLocaleString()}
                </span>
              )}
              {variant !== "compact" && (
                <span
                  className={cn(
                    "ml-auto flex items-center gap-1",
                    ANIMATION.transition.theme,
                    "group-hover:text-primary"
                  )}
                >
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

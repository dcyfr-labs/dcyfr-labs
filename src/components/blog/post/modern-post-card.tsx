"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Eye, TrendingUp, Share2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostBadges } from "@/components/blog";
import { SeriesBadge } from "@/components/blog";
import { BookmarkButton } from "@/components/blog";
import { HighlightText } from "@/components/common";
import type { Post } from "@/data/posts";
import {
  ARCHIVE_CARD_VARIANTS,
  ARCHIVE_ANIMATIONS,
  TOUCH_TARGET,
  TYPOGRAPHY,
  SEMANTIC_COLORS,
  IMAGE_PLACEHOLDER,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { useShare } from "@/hooks/use-share";
import { useShareTracking } from "@/hooks/use-share-tracking";
import { useState, useEffect } from "react";

interface ModernPostCardProps {
  post: Post;
  latestSlug?: string;
  hottestSlug?: string;
  viewCount?: number;
  initialShareCount?: number;
  variant?: "elevated" | "background" | "sideBySide";
  titleLevel?: "h2" | "h3";
  searchQuery?: string;
  showActions?: boolean;
  index?: number;
}

/**
 * Modern Post Card Component
 *
 * Next-generation blog post card with elevated images, social features,
 * and modern animations. Fixes washed-out image issue with prominent
 * image display.
 *
 * Features:
 * - Elevated image on top (default) - images pop from the page
 * - Social actions (share, bookmark) with analytics tracking
 * - View counts and trending indicators
 * - Framer Motion animations with stagger
 * - Multiple layout variants
 * - Hover states with scale and shadow effects
 *
 * @example
 * ```tsx
 * <ModernPostCard
 *   post={post}
 *   variant="elevated"
 *   viewCount={142}
 *   showActions
 * />
 * ```
 */
export function ModernPostCard({
  post,
  latestSlug,
  hottestSlug,
  viewCount,
  initialShareCount = 0,
  variant = "elevated",
  titleLevel = "h2",
  searchQuery,
  showActions = true,
  index = 0,
}: ModernPostCardProps) {
  const TitleTag = titleLevel;
  const cardVariant = ARCHIVE_CARD_VARIANTS[variant];

  // Share functionality
  const { share } = useShare();
  const { trackShare, shareCount: apiShareCount } = useShareTracking(post.id);
  const [shareCount, setShareCount] = useState(initialShareCount);

  // Update share count when API returns
  useEffect(() => {
    if (apiShareCount !== null) {
      setShareCount(apiShareCount);
    }
  }, [apiShareCount]);

  // Handle share with tracking
  const handleShare = async () => {
    try {
      await share({
        title: post.title,
        text: post.summary,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/blog/${post.slug}`,
      });
      // Track the share
      const result = await trackShare();
      if (
        result.success &&
        result.count !== undefined &&
        result.count !== null
      ) {
        setShareCount(result.count);
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const formatViews = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // Elevated variant (default - recommended)
  if (variant === "elevated") {
    const elevatedVariant = ARCHIVE_CARD_VARIANTS.elevated;

    return (
      <motion.article
        variants={ARCHIVE_ANIMATIONS.item}
        whileHover={ARCHIVE_ANIMATIONS.cardHover}
        className={elevatedVariant.container}
      >
        {/* Hero Image Section - Prominent, not washed out */}
        {post.image && post.image.url && !post.image.hideCard && (
          <div className={elevatedVariant.imageWrapper}>
            <Link href={`/blog/${post.slug}`}>
              <Image
                src={post.image.url}
                alt={post.image.alt || post.title}
                fill
                className={elevatedVariant.image}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                placeholder="blur"
                blurDataURL={IMAGE_PLACEHOLDER.blur}
              />
            </Link>

            {/* Subtle gradient only at bottom for badge overlay */}
            <div className={elevatedVariant.overlay} />

            {/* Badges float over image */}
            <div className={elevatedVariant.badgeContainer}>
              <PostBadges
                post={post}
                size="sm"
                isLatestPost={latestSlug === post.slug}
                isHotPost={hottestSlug === post.slug}
                showCategory={true}
              />
              <SeriesBadge post={post} size="sm" />
            </div>

            {/* Quick actions overlay - top right */}
            {showActions && (
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <BookmarkButton
                  slug={post.slug}
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "bg-white/90 dark:bg-black/90 backdrop-blur-md hover:bg-white dark:hover:bg-black",
                    // Mobile-first: 44x44px minimum, scale down on tablet+
                    TOUCH_TARGET.close
                  )}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare();
                  }}
                  className={cn(
                    "bg-white/90 dark:bg-black/90 backdrop-blur-md hover:bg-white dark:hover:bg-black",
                    // Mobile-first: 44x44px minimum, scale down on tablet+
                    TOUCH_TARGET.close
                  )}
                  aria-label="Share post"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content section - clean white space */}
        <Link href={`/blog/${post.slug}`}>
          <div className={elevatedVariant.content}>
            {/* Metadata row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <span aria-hidden="true">•</span>
              <span>{post.readingTime.text}</span>

              {/* View count with icon */}
              {viewCount !== undefined && viewCount > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatViews(viewCount)}
                  </span>
                </>
              )}

              {/* Trending indicator */}
              {hottestSlug === post.slug && (
                <>
                  <span aria-hidden="true">•</span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      SEMANTIC_COLORS.alert.warning.label
                    )}
                  >
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <TitleTag
              className={cn(
                TYPOGRAPHY.h2.standard,
                "font-bold line-clamp-2 group-hover:text-primary transition-colors"
              )}
            >
              <HighlightText text={post.title} searchQuery={searchQuery} />
            </TitleTag>

            {/* Subtitle if available */}
            {post.subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                <HighlightText text={post.subtitle} searchQuery={searchQuery} />
              </p>
            )}

            {/* Summary */}
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              <HighlightText text={post.summary} searchQuery={searchQuery} />
            </p>

            {/* Tags and social stats */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Share count */}
              {shareCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Share2 className="h-3 w-3" />
                  <span>{shareCount}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Background variant - with lighter overlay
  if (variant === "background") {
    return (
      <motion.article
        variants={ARCHIVE_ANIMATIONS.item}
        whileHover={ARCHIVE_ANIMATIONS.cardHover}
        className={cardVariant.container}
      >
        {/* Background image with lighter overlay */}
        {post.image && post.image.url && !post.image.hideCard && (
          <div className={cardVariant.imageWrapper}>
            <Image
              src={post.image.url}
              alt={post.image.alt || post.title}
              fill
              className={cardVariant.image}
              sizes="(max-width: 768px) 100vw, 100vw"
              priority={index === 0}
              placeholder="blur"
              blurDataURL={IMAGE_PLACEHOLDER.blur}
            />
            {/* Lighter overlay - 20-60% instead of 75-95% */}
            <div className={cardVariant.overlay} />
          </div>
        )}

        {/* Content - anchored to bottom with glass effect */}
        <Link href={`/blog/${post.slug}`}>
          <div className={cardVariant.content}>
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              <PostBadges
                post={post}
                isLatestPost={latestSlug === post.slug}
                isHotPost={hottestSlug === post.slug}
                showCategory={true}
              />
              <SeriesBadge post={post} />
            </div>

            {/* Glass card for content */}
            <div className={cardVariant.glassCard}>
              {/* Metadata */}
              <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span>•</span>
                <span>{post.readingTime.text}</span>
                {viewCount !== undefined && viewCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatViews(viewCount)}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <TitleTag
                className={cn(
                  TYPOGRAPHY.h2.mdx,
                  "font-bold mb-2 line-clamp-2 text-white"
                )}
              >
                <HighlightText text={post.title} searchQuery={searchQuery} />
              </TitleTag>

              {/* Summary */}
              <p className="text-sm text-white/80 line-clamp-2">
                <HighlightText text={post.summary} searchQuery={searchQuery} />
              </p>
            </div>
          </div>
        </Link>

        {/* Quick actions */}
        {showActions && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <BookmarkButton
              slug={post.slug}
              size="icon"
              variant="ghost"
              className="bg-white/90 dark:bg-black/90 backdrop-blur-md"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                handleShare();
              }}
              className="bg-white/90 dark:bg-black/90 backdrop-blur-md"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.article>
    );
  }

  // Side-by-side variant
  return (
    <motion.article
      variants={ARCHIVE_ANIMATIONS.item}
      className={cardVariant.container}
    >
      {/* Image on left */}
      {post.image && post.image.url && !post.image.hideCard && (
        <div className={cardVariant.imageWrapper}>
          <Link href={`/blog/${post.slug}`}>
            <Image
              src={post.image.url}
              alt={post.image.alt || post.title}
              fill
              className={cardVariant.image}
              sizes="192px"
              placeholder="blur"
              blurDataURL={IMAGE_PLACEHOLDER.blur}
            />
          </Link>
        </div>
      )}

      {/* Content on right */}
      <Link href={`/blog/${post.slug}`} className="flex-1">
        <div className={cardVariant.content}>
          {/* Badges */}
          <div className="flex gap-2 flex-wrap mb-2">
            <PostBadges
              post={post}
              size="sm"
              isLatestPost={latestSlug === post.slug}
              isHotPost={hottestSlug === post.slug}
              showCategory={true}
            />
            <SeriesBadge post={post} size="sm" />
          </div>

          {/* Title */}
          <TitleTag className={cn(TYPOGRAPHY.h3.mdx, "mb-2 line-clamp-2")}>
            <HighlightText text={post.title} searchQuery={searchQuery} />
          </TitleTag>

          {/* Summary */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-auto">
            <HighlightText text={post.summary} searchQuery={searchQuery} />
          </p>

          {/* Metadata footer */}
          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <span>•</span>
              <span>{post.readingTime.text}</span>
            </div>

            {showActions && (
              <div className="flex gap-1">
                <BookmarkButton
                  slug={post.slug}
                  size="icon"
                  variant="ghost"
                  className={TOUCH_TARGET.close}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare();
                  }}
                  className={TOUCH_TARGET.close}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

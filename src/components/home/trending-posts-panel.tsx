"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/data/posts";
import {
  ANIMATION,
  TYPOGRAPHY,
  HOVER_EFFECTS,
  SPACING,
} from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

interface TrendingPostsPanelProps {
  posts: Post[];
  viewCounts?: Map<string, number>;
  limit?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrendingPostsPanel Component
 *
 * Displays trending blog posts in a clean, social media-style format.
 * Used within the TrendingSection tabs.
 *
 * **Animation approach:** Uses CSS animations (Tailwind animate-in) instead of Framer Motion.
 * Stagger effects are achieved with CSS delay utilities for efficient rendering.
 *
 * Features:
 * - Ranked display (#1, #2, #3)
 * - View counts with trending indicator
 * - Reading time estimate
 * - Primary tag badge
 * - Smooth hover animations
 * - CSS-based stagger animations with delays
 * - Fallback to recent posts if no views
 *
 * @example
 * ```tsx
 * <TrendingPostsPanel
 *   posts={posts}
 *   viewCounts={viewCountsMap}
 *   limit={5}
 * />
 * ```
 */
export function TrendingPostsPanel({
  posts,
  viewCounts,
  limit = 5,
}: TrendingPostsPanelProps) {
  // Sort posts by view count (highest first)
  let sortedPosts = [...posts]
    .map((post) => ({
      post,
      views: viewCounts?.get(post.id) || 0,
    }))
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  // Fallback: if no posts with views, show most recent posts
  if (sortedPosts.length === 0) {
    sortedPosts = [...posts]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, limit)
      .map((post) => ({
        post,
        views: 0,
      }));
  }

  // Empty state
  if (sortedPosts.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center">
        <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className={cn(TYPOGRAPHY.label.standard, "text-muted-foreground")}>
          Trending posts will appear here
        </p>
        <p
          className={cn(TYPOGRAPHY.body.small, "text-muted-foreground/70 mt-1")}
        >
          Check back soon as content gains traction
        </p>
      </Card>
    );
  }

  return (
    <div className={SPACING.compact}>
      {sortedPosts.map(({ post, views }, index) => {
        // Use CSS stagger delays for smooth entrance animations
        const staggerDelay = index * 50; // 50ms increments

        return (
          <div
            key={post.id}
            className="animate-in fade-in slide-in-from-left-2 duration-300"
            style={{ animationDelay: `${staggerDelay}ms` }}
          >
            <Link href={`/blog/${post.slug}`}>
              <Card
                className={cn(
                  "p-4 border cursor-pointer group",
                  ANIMATION.transition.base,
                  HOVER_EFFECTS.cardGlow,
                  "hover:bg-muted/30 hover:border-primary/50 hover:-translate-y-0.5"
                )}
              >
                <div className={SPACING.compact}>
                  {/* Header: Rank + Tag */}
                  <div className="flex items-center justify-between gap-2">
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
                    {post.tags[0] && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          TYPOGRAPHY.label.xs,
                          ANIMATION.transition.theme,
                          "group-hover:bg-primary/20"
                        )}
                      >
                        {post.tags[0]}
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
                    {post.title}
                  </h3>

                  {/* Footer: Views + Reading time */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    {views > 0 && (
                      <div
                        className={cn(
                          "flex items-center gap-1 group-hover:text-foreground",
                          ANIMATION.transition.theme
                        )}
                      >
                        <TrendingUp
                          className={cn(
                            "h-3 w-3 group-hover:scale-110",
                            ANIMATION.transition.movement
                          )}
                        />
                        <span className={ANIMATION.effects.countUp}>
                          {views.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readingTime.text}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        );
      })}

      {/* Footer hint */}
      <div className="text-center pt-2">
        <Link
          href="/blog"
          className={cn(
            TYPOGRAPHY.label.small,
            "text-muted-foreground hover:text-primary",
            ANIMATION.transition.theme
          )}
        >
          View all posts →
        </Link>
      </div>
    </div>
  );
}

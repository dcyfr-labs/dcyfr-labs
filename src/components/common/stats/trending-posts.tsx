"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/data/posts";
import { HOVER_EFFECTS, SHADOWS, ANIMATION } from "@/lib/design-tokens";

interface TrendingPostsProps {
  posts: Post[];
  viewCounts?: Map<string, number>;
  limit?: number;
}

/**
 * Trending Posts Component
 * 
 * Displays popular blog posts with view counts and visual indicators.
 * Uses analytics data when available to highlight trending content.
 * 
 * @example
 * ```tsx
 * <TrendingPosts
 *   posts={posts}
 *   viewCounts={viewMap}
 *   limit={3}
 * />
 * ```
 */
export function TrendingPosts({ posts, viewCounts, limit = 3 }: TrendingPostsProps) {
  // Sort posts by view count (highest first)
  let sortedPosts = [...posts]
    .map(post => ({
      post,
      views: viewCounts?.get(post.id) || 0,
    }))
    .filter(item => item.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  // Fallback: if no posts with views, show most recent posts
  if (sortedPosts.length === 0) {
    sortedPosts = [...posts]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit)
      .map(post => ({
        post,
        views: 0,
      }));
  }

  // Only show placeholder if there are truly no posts at all
  if (sortedPosts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Trending data will appear as posts gain traction
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {sortedPosts.map(({ post, views }, index) => {
        const isTopTrending = index === 0;

        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
          >
            <Card
              className={cn(
                HOVER_EFFECTS.card,
                SHADOWS.card.rest,
                "group relative overflow-hidden h-full",
                isTopTrending && "ring-2 ring-primary/20"
              )}
            >
              {/* Post image (if available and not hidden) */}
              {post.image && !post.image.hideCard && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.image.url}
                    alt={post.image.alt || post.title}
                    fill
                    className={cn(
                      "object-cover",
                      ANIMATION.transition.base,
                      "group-hover:scale-105"
                    )}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
                  {/* Trending ribbon on image */}
                  {isTopTrending && (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-3 -right-8 w-32 text-center bg-primary rotate-45 shadow-sm py-1">
                        <TrendingUp className="h-3 w-3 text-primary-foreground mx-auto" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <CardContent className={cn("p-4 space-y-3", post.image && !post.image.hideCard && "pt-3")}>
              {/* Trending indicator (only if no image) */}
              {isTopTrending && (!post.image || post.image.hideCard) && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-3 -right-8 w-32 text-center bg-primary rotate-45 shadow-sm py-1">
                    <TrendingUp className="h-3 w-3 text-primary-foreground mx-auto" />
                  </div>
                </div>
              )}

              {/* Rank and view badges */}
              <div className="flex items-center justify-between gap-2">
                <Badge 
                  variant={isTopTrending ? "default" : "outline"}
                  className={cn(
                    "shrink-0 text-xs",
                    !isTopTrending && "border-muted bg-muted/50"
                  )}
                >
                  #{index + 1}
                </Badge>
                {views > 0 ? (
                  <Badge 
                    variant="secondary" 
                    className="shrink-0 flex items-center gap-1 text-xs px-2"
                  >
                    <Eye className="h-3 w-3" />
                    {views.toLocaleString()}
                  </Badge>
                ) : (
                  <Badge 
                    variant="secondary" 
                    className="shrink-0 flex items-center gap-1 text-xs px-2"
                  >
                    <Clock className="h-3 w-3" />
                    Recent
                  </Badge>
                )}
              </div>

              {/* Post title */}
              <Link
                href={`/blog/${post.slug}`}
                className={cn("font-medium hover:text-primary line-clamp-2 block leading-tight", ANIMATION.transition.theme)}
              >
                {post.title}
              </Link>

              {/* Post metadata */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readingTime.text}</span>
                </div>
                {post.tags[0] && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {post.tags[0]}
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

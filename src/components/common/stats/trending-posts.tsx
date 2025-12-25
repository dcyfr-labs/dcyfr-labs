"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/data/posts";
import { ANIMATION, TYPOGRAPHY } from "@/lib/design-tokens";

interface TrendingPostsProps {
  posts: Post[];
  viewCounts?: Map<string, number>;
  limit?: number;
}

/**
 * Trending Posts Component
 * 
 * Displays popular blog posts in a simple, social media style format.
 * Clean and minimal design inspired by social platforms.
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
      <Card className="border-dashed p-4 text-center">
        <TrendingUp className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
        <p className={cn(TYPOGRAPHY.label.small, "text-muted-foreground")}>
          Trending data will appear as posts gain traction
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sortedPosts.map(({ post, views }, index) => {
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
          >
            <Link href={`/blog/${post.slug}`}>
              <Card className={cn(
                "p-4 border hover:border-primary/50 cursor-pointer",
                ANIMATION.transition.base,
                "hover:bg-muted/30"
              )}>
                <div className="space-y-2">
                  {/* Header: Rank + Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={TYPOGRAPHY.label.xs}>
                      #{index + 1}
                    </Badge>
                    {post.tags[0] && (
                      <Badge variant="secondary" className={TYPOGRAPHY.label.xs}>
                        {post.tags[0]}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={cn(
                    TYPOGRAPHY.label.standard,
                    "line-clamp-2 leading-snug",
                    ANIMATION.transition.theme
                  )}>
                    {post.title}
                  </h3>

                  {/* Footer: Views + Reading time */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    {views > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{views.toLocaleString()} views</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{post.readingTime.text}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

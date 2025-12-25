"use client";

import { motion } from "framer-motion";
import { ModernPostCard } from "@/components/blog/post/modern-post-card";
import { ARCHIVE_ANIMATIONS, VIEW_MODES } from "@/lib/design-tokens";
import type { Post } from "@/data/posts";

interface ModernBlogGridProps {
  posts: Post[];
  latestSlug?: string;
  hottestSlug?: string;
  viewCounts?: Map<string, number>;
  searchQuery?: string;
  variant?: "elevated" | "background" | "sideBySide";
}

/**
 * Modern Blog Grid Component
 *
 * Animated grid of ModernPostCard components with Framer Motion stagger.
 * Used for A/B testing modern card design vs traditional PostList.
 *
 * @example
 * ```tsx
 * <ModernBlogGrid
 *   posts={posts}
 *   latestSlug={latestSlug}
 *   hottestSlug={hottestSlug}
 *   viewCounts={viewCounts}
 *   variant="elevated"
 * />
 * ```
 */
export function ModernBlogGrid({
  posts,
  latestSlug,
  hottestSlug,
  viewCounts,
  searchQuery,
  variant = "elevated",
}: ModernBlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={ARCHIVE_ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      className={VIEW_MODES.grid.grid}
    >
      {posts.map((post, index) => (
        <ModernPostCard
          key={post.slug}
          post={post}
          latestSlug={latestSlug}
          hottestSlug={hottestSlug}
          viewCount={viewCounts?.get(post.id)}
          variant={variant}
          searchQuery={searchQuery}
          showActions
          index={index}
        />
      ))}
    </motion.div>
  );
}

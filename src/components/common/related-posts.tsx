"use client";

import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/data/posts";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { TYPOGRAPHY, HOVER_EFFECTS } from "@/lib/design-tokens";
import { trackRelatedPostClick } from "@/lib/analytics";
import { ensurePostImage } from "@/lib/default-images";

/**
 * Props for the RelatedPosts component
 * @typedef {Object} RelatedPostsProps
 * @property {Post[]} posts - Array of related blog posts to display
 * @property {string} [currentSlug] - Optional: Current post slug for analytics tracking
 */
type RelatedPostsProps = {
  posts: Post[];
  currentSlug?: string;
};

/**
 * RelatedPosts Component
 *
 * Displays a grid of related blog posts, typically shown at the bottom of a blog post.
 * Used in conjunction with the related posts algorithm that calculates posts sharing tags.
 *
 * Features:
 * - Responsive 2-column grid (1 col mobile, 2 cols tablet+)
 * - Optional thumbnail images (shown if post.image exists)
 * - Post cards with title, summary, tags, and publish date
 * - Reading time estimate display
 * - Interactive hover state with "Read more" indicator and image zoom
 * - Tag limit (shows first 3, "+N more" badge if additional)
 * - Early exit if no related posts (renders null)
 *
 * @component
 * @param {RelatedPostsProps} props - Component props
 * @param {Post[]} props.posts - Array of related posts to display (typically 1-6 items)
 *
 * @returns {React.ReactElement | null} Grid of post cards or null if empty
 *
 * @example
 * // Display 3 related posts
 * const relatedPosts = [
 *   { slug: "post-1", title: "...", tags: ["react", "typescript"], ...},
 *   { slug: "post-2", title: "...", tags: ["react"], ...},
 *   { slug: "post-3", title: "...", tags: ["typescript"], ...},
 * ];
 * <RelatedPosts posts={relatedPosts} />
 *
 * @styling
 * - Uses Card variant bg-card with hover:bg-accent
 * - Primary color highlight on post title and "Read more" link
 * - Serif font for consistency with blog post titles (via TYPOGRAPHY.h2.standard)
 * - Truncated summary at 2 lines (line-clamp-2)
 * - Responsive spacing with gap utilities
 * - Thumbnail: 160px height (h-40), scale hover effect (105%)
 *
 * @accessibility
 * - Links use semantic Next.js Link component
 * - Post dates use time element with dateTime attribute
 * - Decorative bullet (•) has aria-hidden="true"
 * - Arrow icon is not interactive (part of text node)
 * - Hover states visible and announced via CSS transitions
 * - Image alt text falls back to post title if not provided
 *
 * @usage
 * Called from blog post template in src/app/blog/[slug]/page.tsx
 * Related posts are calculated in src/lib/related-posts.ts by matching tags
 */
export function RelatedPosts({ posts, currentSlug }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }
  
  const handleClick = (toSlug: string, position: number) => {
    if (currentSlug) {
      trackRelatedPostClick(currentSlug, toSlug, position);
    }
  };

  return (
    <aside className="mt-12 border-t pt-6">
      <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>Related Posts</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post, index) => {
          const featuredImage = ensurePostImage(post.image, {
            title: post.title,
            tags: post.tags,
          });
          
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              onClick={() => handleClick(post.slug, index)}
              className={`group block rounded-lg border overflow-hidden relative bg-card ${HOVER_EFFECTS.card}`}
            >
              <div className="space-y-2 p-4">
                <h3 className="font-medium leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.summary}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span aria-hidden>•</span>
                  <span>{post.readingTime.text}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-primary pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Read more</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

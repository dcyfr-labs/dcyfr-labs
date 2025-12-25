"use client";

import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/data/posts";
import { SPACING } from "@/lib/design-tokens";

interface PostRelatedProps {
  posts: Post[];
}

/**
 * Related Posts Section
 * 
 * Displays a list of related posts with titles, reading times, and tags.
 * All badges use monochrome outline styling.
 */
export function PostRelated({ posts }: PostRelatedProps) {
  if (posts.length === 0) return null;

  return (
    <div className={`${SPACING.compact} pb-6 border-b`}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm">Related Posts</h2>
      </div>

      <nav aria-label="Related posts" className={SPACING.content}>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <div className="space-y-1.5">
              {/* eslint-disable-next-line no-restricted-syntax */}
              <h3 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime.text}</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs px-1.5 py-0 h-4"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{post.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}

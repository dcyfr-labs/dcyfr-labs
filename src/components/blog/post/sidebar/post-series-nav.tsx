"use client";

import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/data/posts";
import { SPACING } from "@/lib/design-tokens";
import { trackSeriesPostClick } from "@/lib/analytics";

interface PostSeriesNavProps {
  series: {
    name: string;
    order: number;
  };
  seriesPosts: Post[];
  currentSlug?: string;
}

/**
 * Post Series Navigation Section
 *
 * Displays navigation for posts that are part of a series.
 * Includes analytics tracking on post clicks.
 */
export function PostSeriesNav({ series, seriesPosts, currentSlug }: PostSeriesNavProps) {
  if (seriesPosts.length === 0) return null;

  const seriesSlug = series.name.toLowerCase().replace(/\s+/g, "-");

  const handlePostClick = (post: Post) => {
    trackSeriesPostClick(
      seriesSlug,
      series.name,
      post.slug,
      post.title,
      post.series?.order ?? 0
    );
  };

  return (
    <div className={`${SPACING.compact} pb-6 border-b`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm">{series.name}</h2>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Part {series.order} of {seriesPosts.length}
      </p>

      <nav aria-label="Series navigation" className={SPACING.list}>
        {seriesPosts.map((post) => {
          const isCurrent = post.slug === currentSlug;
          const order = post.series?.order ?? 0;

          return (
            <div key={post.slug} className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 shrink-0 min-w-6 h-5 text-xs justify-center px-1"
              >
                {order}
              </Badge>

              {isCurrent ? (
                <div className="flex-1 min-w-0">
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  <span className="text-xs font-medium text-primary block truncate">
                    {post.title}
                  </span>
                </div>
              ) : (
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex-1 min-w-0 group flex items-start gap-1"
                  onClick={() => handlePostClick(post)}
                >
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
                    {post.title}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

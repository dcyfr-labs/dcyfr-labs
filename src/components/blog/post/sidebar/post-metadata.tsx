"use client";

import { Calendar, Clock, Eye, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { PostCategory } from "@/lib/post-categories";
import { POST_CATEGORY_LABEL } from "@/lib/post-categories";
import { SPACING } from "@/lib/design-tokens";

interface PostMetadataProps {
  publishedAt: Date;
  updatedAt?: Date;
  readingTime: string;
  viewCount?: number;
  tags?: string[];
  category?: PostCategory;
  isDraft?: boolean;
  isArchived?: boolean;
  isLatest?: boolean;
  isHot?: boolean;
}

/**
 * Post Metadata Section
 * 
 * Displays date, reading time, view count, status badges, and tags.
 * All badges use monochrome outline styling.
 */
export function PostMetadata({
  publishedAt,
  updatedAt,
  readingTime,
  viewCount,
  tags,
  category,
  isDraft,
  isArchived,
  isLatest,
  isHot,
}: PostMetadataProps) {
  // Determine which date to display
  const hasUpdate = updatedAt && updatedAt.getTime() !== publishedAt.getTime();
  const displayDate = hasUpdate ? updatedAt : publishedAt;
  const dateLabel = hasUpdate ? "Updated" : "Published";
  return (
    <div className={`${SPACING.compact} pb-6 border-b`}>
      <h2 className="font-semibold mb-3 text-sm">Post Details</h2>

      {/* Date - shows updated if different from published */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 shrink-0" />
        <time dateTime={displayDate!.toISOString()}>
          <span className="font-medium">{dateLabel}:</span>{" "}
          {displayDate!.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </div>

      {/* Reading Time */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 shrink-0" />
        <span>{readingTime}</span>
      </div>

      {/* View Count */}
      {typeof viewCount === "number" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4 shrink-0" />
          <span>
            {viewCount.toLocaleString()}{" "}
            {viewCount === 1 ? "view" : "views"}
          </span>
        </div>
      )}

      {/* Status & Category Badges - Monochrome */}
      {(isDraft || isArchived || isLatest || isHot || category) && (
        <div className="flex flex-wrap gap-2">
          {(process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") && isDraft && (
            <Link href="/blog?sortBy=drafts">
              <Badge
                variant="default"
                className="font-semibold text-xs cursor-pointer"
              >
                Draft
              </Badge>
            </Link>
          )}
          {isArchived && (
            <Link href="/blog?sortBy=archived">
              <Badge
                variant="default"
                className="font-semibold text-xs cursor-pointer"
              >
                Archived
              </Badge>
            </Link>
          )}
          {isLatest && !isArchived && !isDraft && (
            <Link href="/blog?dateRange=30d">
              <Badge
                variant="default"
                className="font-semibold text-xs cursor-pointer"
              >
                New
              </Badge>
            </Link>
          )}
          {isHot && !isArchived && !isDraft && (
            <Link href="/blog?sortBy=popular">
              <Badge
                variant="default"
                className="font-semibold text-xs cursor-pointer"
              >
                Hot
              </Badge>
            </Link>
          )}
          {category && (
            <Link href={`/blog?category=${category}`}>
              <Badge
                variant="outline"
                className="font-semibold text-xs cursor-pointer"
              >
                {POST_CATEGORY_LABEL[category]}
              </Badge>
            </Link>
          )}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4 shrink-0" />
            <span className="font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
              >
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-accent transition-colors"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

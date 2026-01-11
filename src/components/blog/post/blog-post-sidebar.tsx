"use client";

import * as React from "react";
import type { TocHeading } from "@/lib/toc";
import type { Post, PostCategory } from "@/data/posts";
import { cn } from "@/lib/utils";
import { SPACING } from "@/lib/design-tokens";
import {
  PostMetadata,
  PostAuthor,
  PostQuickActions,
  PostSeriesNav,
  PostRelated,
  PostTableOfContents,
} from "./sidebar";

interface BlogPostSidebarProps {
  headings: TocHeading[];
  slug?: string;
  authors?: string[]; // Team member IDs for author section
  metadata?: {
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
  };
  postTitle?: string;
  series?: {
    name: string;
    order: number;
  };
  seriesPosts?: Post[];
  relatedPosts?: Post[];
}

/**
 * Blog Post Sidebar Component
 *
 * Left-aligned sidebar for blog post pages containing table of contents
 * and other post-related navigation/metadata.
 *
 * Features:
 * - Post metadata (date, reading time, views, tags)
 * - Post author (name, title, avatar, description)
 * - Quick actions (share, bookmark)
 * - Series navigation (if part of a series)
 * - Related posts suggestions
 * - Table of contents with active heading tracking
 * - Sticky positioning within viewport
 * - Hierarchical heading display (h2/h3)
 * - Smooth scroll navigation
 *
 * Modularized into separate components:
 * - PostMetadata: Date, time, views, status badges, tags
 * - PostAuthor: Author information with avatar and bio
 * - PostQuickActions: Bookmark, share, copy link buttons
 * - PostSeriesNav: Series navigation if applicable
 * - PostRelated: Related posts list
 * - PostTableOfContents: Heading navigation with active tracking
 */
export function BlogPostSidebar({
  headings,
  slug,
  authors = ["dcyfr"], // Default to dcyfr if not provided
  metadata,
  postTitle,
  series,
  seriesPosts,
  relatedPosts,
}: BlogPostSidebarProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden lg:block w-full lg:self-stretch">
      {/* Sidebar content */}
      <div className={cn(SPACING.subsection, "pb-6")}>
        {/* Post Author(s) */}
        <PostAuthor authors={authors} publishedAt={metadata?.publishedAt} />

        {/* Post Metadata */}
        {metadata && (
          <PostMetadata
            publishedAt={metadata.publishedAt}
            updatedAt={metadata.updatedAt}
            readingTime={metadata.readingTime}
            viewCount={metadata.viewCount}
            tags={metadata.tags}
            category={metadata.category}
            isDraft={metadata.isDraft}
            isArchived={metadata.isArchived}
            isLatest={metadata.isLatest}
            isHot={metadata.isHot}
          />
        )}

        {/* Quick Actions */}
        <PostQuickActions
          slug={slug}
          postTitle={postTitle}
          publishedAt={metadata?.publishedAt?.toISOString()}
        />

        {/* Series Navigation */}
        {series && seriesPosts && seriesPosts.length > 0 && (
          <PostSeriesNav
            series={series}
            seriesPosts={seriesPosts}
            currentSlug={slug}
          />
        )}

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <PostRelated posts={relatedPosts} />
        )}
      </div>
    </aside>
  );
}

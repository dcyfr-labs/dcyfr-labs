"use client";

import * as React from "react";
import type { TocHeading } from "@/lib/toc";
import type { Post, PostCategory } from "@/data/posts";
import { cn } from "@/lib/utils";
import { SPACING } from "@/lib/design-tokens";
import {
  PostMetadata,
  PostQuickActions,
  PostSeriesNav,
  PostRelated,
  PostTableOfContents,
} from "./sidebar";

interface BlogPostSidebarProps {
  headings: TocHeading[];
  slug?: string;
  metadata?: {
    publishedAt: Date;
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
 * - PostQuickActions: Bookmark, share, copy link buttons
 * - PostSeriesNav: Series navigation if applicable
 * - PostRelated: Related posts list
 * - PostTableOfContents: Heading navigation with active tracking
 */
export function BlogPostSidebar({ 
  headings, 
  slug, 
  metadata, 
  postTitle, 
  series, 
  seriesPosts, 
  relatedPosts 
}: BlogPostSidebarProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden lg:block w-full lg:self-stretch">
      {/* Non-sticky content at the top that scrolls away */}
      <div className={cn(SPACING.subsection, "pb-6")}>
        {/* Post Metadata */}
        {metadata && (
          <PostMetadata
            publishedAt={metadata.publishedAt}
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
      
      {/* Table of Contents - Sticky positioning */}
      <div className="sticky top-24 bg-background">
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground">
          <PostTableOfContents headings={headings} slug={slug} />
        </div>
      </div>
    </aside>
  );
}

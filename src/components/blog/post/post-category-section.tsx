"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PostList } from "@/components/blog/post/post-list";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import type { Post } from "@/data/posts";
import type { PostCategory } from "@/lib/post-categories";

interface PostCategorySectionProps {
  /** Category value (used as accordion key) */
  category: PostCategory;
  /** Display label for the category */
  label: string;
  /** Posts in this category */
  posts: Post[];
  /** Latest post slug for badge display */
  latestSlug?: string;
  /** Hottest post slug for badge display */
  hottestSlug?: string;
  /** View counts map for posts */
  viewCounts?: Map<string, number>;
  /** Search query for highlighting */
  searchQuery?: string;
}

/**
 * PostCategorySection Component
 *
 * Renders a collapsible accordion section for a blog category.
 * Each category has a header showing the category name and post count,
 * with a list of posts inside that can be expanded/collapsed.
 *
 * @param props - Component props
 * @returns React element
 */
export function PostCategorySection({
  category,
  label,
  posts,
  latestSlug,
  hottestSlug,
  viewCounts,
  searchQuery,
}: PostCategorySectionProps) {
  return (
    <Accordion type="multiple" defaultValue={[category]} className="w-full">
      <AccordionItem value={category}>
        <AccordionTrigger>
          <div className="flex items-center justify-between w-full pr-4">
            <h2 className={TYPOGRAPHY.h2.standard}>{label}</h2>
            <span className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className={SPACING.content}>
            <PostList
              posts={posts}
              latestSlug={latestSlug}
              hottestSlug={hottestSlug}
              titleLevel="h3"
              layout="compact"
              viewCounts={viewCounts}
              searchQuery={searchQuery}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

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
 * Each category has an enhanced header with:
 * - Category name in large typography
 * - Post count badge
 * - Visual separator line
 * - Expandable/collapsible posts in compact layout
 *
 * Features:
 * - All categories expanded by default
 * - Clean visual hierarchy with category headers
 * - Post count clearly visible in a badge
 * - Smooth expand/collapse animations
 * - Responsive design for mobile and desktop
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
  const postCount = posts.length;

  return (
    <Accordion type="multiple" defaultValue={[category]} className="w-full">
      <AccordionItem value={category} className="border-none" style={{ paddingTop: SPACING.section }}>
        <AccordionTrigger className="hover:no-underline py-4 px-0">
          <div className="flex items-center gap-4">
            {/* Category label and count */}
            <div className="flex items-baseline gap-3 flex-1 text-left">
              <h2 className={TYPOGRAPHY.h2.standard}>{label}</h2>
              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap ${TYPOGRAPHY.label.small}`}>
                {postCount} {postCount === 1 ? "post" : "posts"}
              </span>
            </div>
          </div>

          {/* Bottom border for visual separation - gradient effect */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-border via-border to-transparent group-hover:via-primary/20 transition-colors" />
        </AccordionTrigger>

        <AccordionContent className="pt-6 pb-6 px-0">
          <PostList
            posts={posts}
            latestSlug={latestSlug}
            hottestSlug={hottestSlug}
            titleLevel="h3"
            layout="compact"
            viewCounts={viewCounts}
            searchQuery={searchQuery}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

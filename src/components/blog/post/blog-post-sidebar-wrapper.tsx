/**
 * Blog Post Sidebar Wrapper (Server Component)
 *
 * Wraps the BlogPostSidebar with Suspense boundaries for view count.
 * Handles progressive reveal of dynamic data.
 */

import { Suspense } from "react";
import type { TocHeading } from "@/lib/toc";
import type { Post, PostCategory } from "@/data/posts";
import { getPostViews } from "@/lib/views.server";
import { BlogPostSidebar } from "./blog-post-sidebar";

interface BlogPostSidebarWrapperProps {
  headings: TocHeading[];
  slug?: string;
  postId: string;
  authors?: string[];
  metadata: {
    publishedAt: Date;
    updatedAt?: Date;
    readingTime: string;
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

async function SidebarWithViewCount(props: BlogPostSidebarWrapperProps) {
  const viewCount = await getPostViews(props.postId);

  return (
    <BlogPostSidebar
      {...props}
      metadata={{
        ...props.metadata,
        viewCount: viewCount ?? undefined,
      }}
    />
  );
}

function SidebarSkeleton(props: Omit<BlogPostSidebarWrapperProps, "postId">) {
  return (
    <BlogPostSidebar
      {...props}
      metadata={{
        ...props.metadata,
        viewCount: undefined, // No view count during loading
      }}
    />
  );
}

export function BlogPostSidebarWrapper(props: BlogPostSidebarWrapperProps) {
  const { postId, ...sidebarProps } = props;

  return (
    <Suspense fallback={<SidebarSkeleton {...sidebarProps} />}>
      <SidebarWithViewCount {...props} />
    </Suspense>
  );
}

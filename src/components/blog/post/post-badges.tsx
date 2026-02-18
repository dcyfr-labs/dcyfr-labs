import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Post } from "@/data/posts";
import { POST_CATEGORY_LABEL } from "@/lib/post-categories";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";

interface PostBadgesProps {
  post: Post;
  size?: "default" | "sm";
  isLatestPost?: boolean;
  isHotPost?: boolean;
  showCategory?: boolean;
  showFeatured?: boolean;
}

/** Returns 'text-xs' when size is 'sm', otherwise empty string */
function sizeClass(size: "default" | "sm"): string {
  return size === "sm" ? "text-xs" : "";
}

function buildFeaturedBadge(post: Post, size: "default" | "sm", showFeatured: boolean): ReactNode {
  if (!showFeatured || !post.featured) return null;
  return (
    <Badge key="featured" className={cn(sizeClass(size), "pointer-events-none", SEMANTIC_COLORS.status.success)}>
      Featured
    </Badge>
  );
}

function buildDraftBadge(post: Post, size: "default" | "sm"): ReactNode {
  if (process.env.NODE_ENV !== "development" || !post.draft) return null;
  return (
    <Badge key="draft" className={`${sizeClass(size)} pointer-events-none`} variant="outline">
      Draft
    </Badge>
  );
}

function buildArchivedBadge(post: Post, size: "default" | "sm"): ReactNode {
  if (!post.archived) return null;
  return (
    <Badge key="archived" variant="outline" className={`${sizeClass(size)} pointer-events-none bg-muted/70 text-muted-foreground border-border/70`}>
      Archived
    </Badge>
  );
}

function buildNewBadge(post: Post, size: "default" | "sm", isLatestPost: boolean | undefined): ReactNode {
  if (!isLatestPost || post.archived || post.draft) return null;
  return (
    <Badge key="new" className={cn(sizeClass(size), "pointer-events-none", SEMANTIC_COLORS.status.success)}>
      New
    </Badge>
  );
}

function buildHotBadge(post: Post, size: "default" | "sm", isHotPost: boolean | undefined): ReactNode {
  if (!isHotPost || post.archived || post.draft) return null;
  return (
    <Badge key="hot" className={cn(sizeClass(size), "pointer-events-none", SEMANTIC_COLORS.status.error)}>
      Hot
    </Badge>
  );
}

function buildCategoryBadge(post: Post, size: "default" | "sm", showCategory: boolean): ReactNode {
  if (!showCategory || !post.category) return null;
  const categoryLabel = POST_CATEGORY_LABEL[post.category];
  if (categoryLabel) {
    return (
      <Badge key="category" variant="outline" className={`${sizeClass(size)} pointer-events-none`}>
        {categoryLabel}
      </Badge>
    );
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[PostBadges] Category "${post.category}" not found in POST_CATEGORY_LABEL mapping.`,
      `Add it to src/lib/post-categories.ts`,
      `Post: ${post.title || post.id || "unknown"}`
    );
    return (
      <Badge key="category-error" variant="outline" className={`${sizeClass(size)} pointer-events-none bg-destructive/10 text-destructive border-destructive/50`}>
        Invalid Category: {post.category}
      </Badge>
    );
  }
  return null;
}

/**
 * Display status badges for a blog post (Featured, Draft, Archived, Hot, New, etc.)
 * Badges are displayed inline to the right of the title text
 * Note: These badges are NOT links since they're rendered inside clickable cards
 */
export function PostBadges({
  post,
  size = "default",
  isLatestPost,
  isHotPost,
  showCategory = false,
  showFeatured = true,
}: PostBadgesProps) {
  const badges = [
    buildFeaturedBadge(post, size, showFeatured),
    buildDraftBadge(post, size),
    buildArchivedBadge(post, size),
    buildNewBadge(post, size, isLatestPost),
    buildHotBadge(post, size, isHotPost),
    buildCategoryBadge(post, size, showCategory),
  ].filter(Boolean);

  if (badges.length === 0) {
    return null;
  }

  return <>{badges}</>;
}

import { Badge } from "@/components/ui/badge";
import type { Post } from "@/data/posts";
import { POST_CATEGORY_LABEL } from "@/lib/post-categories";

interface PostBadgesProps {
  post: Post;
  size?: "default" | "sm";
  isLatestPost?: boolean;
  isHotPost?: boolean;
  showCategory?: boolean;
}

/**
 * Display status badges for a blog post (Draft, Archived, Hot, New, etc.)
 * Badges are displayed inline to the right of the title text
 * Note: These badges are NOT links since they're rendered inside clickable cards
 */
export function PostBadges({ 
  post, 
  size = "default",
  isLatestPost,
  isHotPost,
  showCategory = false,
}: PostBadgesProps) {
  const badges = [];

  // Draft badge (development only)
  if (process.env.NODE_ENV === "development" && post.draft) {
    badges.push(
      <Badge
        key="draft"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none bg-blue-500/40 text-blue-100 dark:text-blue-200 border border-blue-400/60`}
      >
        Draft
      </Badge>
    );
  }

  // Archived badge - dimmed
  if (post.archived) {
    badges.push(
      <Badge
        key="archived"
        variant="outline"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none bg-muted/70 text-muted-foreground border-border/70`}
      >
        Archived
      </Badge>
    );
  }

  // New badge - for the latest published post (not archived or draft)
  if (isLatestPost && !post.archived && !post.draft) {
    badges.push(
      <Badge
        key="new"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none bg-emerald-500/40 text-emerald-100 dark:text-emerald-200 border border-emerald-400/60`}
      >
        New
      </Badge>
    );
  }

  // Hot badge - for the post with the most views (not draft or archived)
  if (isHotPost && !post.archived && !post.draft) {
    badges.push(
      <Badge
        key="hot"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none bg-orange-500/40 text-orange-100 dark:text-orange-200 border border-orange-400/60`}
      >
        Hot
      </Badge>
    );
  }

  // Category badge
  if (showCategory && post.category) {
    badges.push(
      <Badge
        key="category"
        variant="outline"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none`}
      >
        {POST_CATEGORY_LABEL[post.category]}
      </Badge>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return <>{badges}</>;
}

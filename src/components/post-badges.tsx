import { Badge } from "@/components/ui/badge";
import type { Post, PostCategory } from "@/data/posts";

interface PostBadgesProps {
  post: Post;
  size?: "default" | "sm";
  isLatestPost?: boolean;
  isHotPost?: boolean;
  showCategory?: boolean;
}

const CATEGORY_STYLES: Record<PostCategory, string> = {
  "development": "border-blue-500/70 bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "security": "border-red-500/70 bg-red-500/15 text-red-700 dark:text-red-300",
  "career": "border-green-500/70 bg-green-500/15 text-green-700 dark:text-green-300",
  "ai": "border-purple-500/70 bg-purple-500/15 text-purple-700 dark:text-purple-300",
  "tutorial": "border-amber-500/70 bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

const CATEGORY_LABEL: Record<PostCategory, string> = {
  "development": "Development",
  "security": "Security",
  "career": "Career",
  "ai": "AI",
  "tutorial": "Tutorial",
};

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
        variant="outline"
        className={`border-blue-500/70 bg-blue-500/15 text-blue-700 dark:text-blue-300 backdrop-blur-sm font-semibold ${size === "sm" ? "text-xs" : ""}`}
      >
        Draft
      </Badge>
    );
  }

  // Archived badge
  if (post.archived) {
    badges.push(
      <Badge
        key="archived"
        variant="outline"
        className={`border-amber-500/70 bg-amber-500/15 text-amber-700 dark:text-amber-300 backdrop-blur-sm font-semibold ${size === "sm" ? "text-xs" : ""}`}
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
        variant="outline"
        className={`border-green-500/70 bg-green-500/15 text-green-700 dark:text-green-300 backdrop-blur-sm font-semibold ${size === "sm" ? "text-xs" : ""}`}
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
        variant="outline"
        className={`border-red-500/70 bg-red-500/15 text-red-700 dark:text-red-300 backdrop-blur-sm font-semibold ${size === "sm" ? "text-xs" : ""}`}
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
        className={`${CATEGORY_STYLES[post.category]} backdrop-blur-sm font-semibold ${size === "sm" ? "text-xs" : ""}`}
      >
        {CATEGORY_LABEL[post.category]}
      </Badge>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return <>{badges}</>;
}

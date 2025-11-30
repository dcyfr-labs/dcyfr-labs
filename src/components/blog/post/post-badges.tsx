import { Badge } from "@/components/ui/badge";
import type { Post, PostCategory } from "@/data/posts";

interface PostBadgesProps {
  post: Post;
  size?: "default" | "sm";
  isLatestPost?: boolean;
  isHotPost?: boolean;
  showCategory?: boolean;
}

const CATEGORY_LABEL: Record<PostCategory, string> = {
  "development": "Development",
  "security": "Security",
  "career": "Career",
  "ai": "AI",
  "AI": "AI",
  "tutorial": "Tutorial",
  "Demo": "Demo",
  "Career Development": "Career Development",
  "Web Development": "Web Development",
  "DevSecOps": "DevSecOps",
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
        variant="default"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none`}
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
        variant="default"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none`}
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
        variant="default"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none`}
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
        variant="default"
        className={`${size === "sm" ? "text-xs" : ""} pointer-events-none`}
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
        {CATEGORY_LABEL[post.category]}
      </Badge>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return <>{badges}</>;
}

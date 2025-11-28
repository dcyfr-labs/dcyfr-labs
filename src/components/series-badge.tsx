import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { Post } from "@/data/posts";

interface SeriesBadgeProps {
  post: Post;
  size?: "sm" | "default";
  showOrder?: boolean;
}

/**
 * Series Badge Component
 * 
 * Displays a badge indicating a post is part of a series.
 * Shows series name and optionally the part number.
 * 
 * @param post - The post with series information
 * @param size - Badge size (sm or default)
 * @param showOrder - Whether to show "Part X" in the badge
 */
export function SeriesBadge({ post, size = "default", showOrder = true }: SeriesBadgeProps) {
  if (!post.series) return null;

  const { name, order } = post.series;
  const displayText = showOrder ? `${name} • Part ${order}` : name;

  return (
    <Badge 
      variant="outline" 
      className={`gap-1 ${size === "sm" ? "text-xs" : ""}`}
    >
      <BookOpen className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {displayText}
    </Badge>
  );
}

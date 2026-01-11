/**
 * SeriesHeader - Series metadata display component
 *
 * Displays series title, post count, and total reading time in a clean header format.
 * Used in the series archive page to provide quick context about the series.
 *
 * @example
 * ```tsx
 * <SeriesHeader
 *   name="React Hooks Deep Dive"
 *   postCount={5}
 *   totalMinutes={28}
 * />
 * ```
 */

import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { Clock, BookOpen } from "lucide-react";

interface SeriesHeaderProps {
  /** Series name */
  name: string;
  /** Number of posts in series */
  postCount: number;
  /** Total reading time in minutes for all posts */
  totalMinutes: number;
}

export function SeriesHeader({
  name,
  postCount,
  totalMinutes,
}: SeriesHeaderProps) {
  return (
    <div className={SPACING.section}>
      <h1 className={TYPOGRAPHY.h1.standard}>{name}</h1>
      <p className={TYPOGRAPHY.description}>
        {postCount === 1 ? "1 post" : `${postCount} posts`} • {totalMinutes} min
        read
      </p>

      {/* Stats row */}
      <div
        className={`flex flex-wrap gap-${SPACING.md} mt-${SPACING.md} text-sm text-muted-foreground`}
      >
        <div className={`flex items-center gap-${SPACING.sm}`}>
          <BookOpen className="w-4 h-4" />
          <span>{postCount === 1 ? "1 post" : `${postCount} posts`}</span>
        </div>
        <div className={`flex items-center gap-${SPACING.sm}`}>
          <Clock className="w-4 h-4" />
          <span>
            {totalMinutes} min {totalMinutes === 1 ? "read" : "read"}
          </span>
        </div>
      </div>
    </div>
  );
}

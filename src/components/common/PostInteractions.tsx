/**
 * Post Interactions Component
 *
 * Unified engagement component for blog posts and project pages.
 * Provides like, bookmark, and share functionality with counts.
 * Can be used both in activity feed and on individual post/project pages.
 *
 * @example
 * ```tsx
 * // On a blog post page
 * <PostInteractions
 *   contentId="my-blog-post"
 *   contentType="post"
 *   title="My Blog Post"
 *   description="Great content"
 *   href="/blog/my-blog-post"
 * />
 *
 * // On a project page
 * <PostInteractions
 *   contentId="dcyfr-labs"
 *   contentType="project"
 *   title="DCYFR Labs"
 *   href="/projects/dcyfr-labs"
 * />
 * ```
 */

'use client';

import { useSyncExternalStore } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useActivityReactions } from '@/hooks/use-activity-reactions';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useGlobalEngagementCounts } from '@/hooks/use-global-engagement-counts';
import { ThreadShareButton } from '@/components/activity';
import { ANIMATION, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface PostInteractionsProps {
  /** Content identifier (post slug or project slug) */
  contentId: string;
  /** Content type for activity mapping */
  contentType: 'post' | 'project';
  /** Content title for sharing */
  title: string;
  /** Content description for sharing */
  description?: string;
  /** Content URL for sharing */
  href: string;
  /** Optional CSS class */
  className?: string;
  /** Size variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show counts */
  showCounts?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Render interaction buttons helper */
function renderInteractionButtons({
  activityId,
  contentType,
  liked,
  bookmarked,
  toggleLike,
  toggleBookmark,
  globalLikes,
  globalBookmarks,
  showCounts,
  variant,
  title,
  description,
  href,
  isCompact,
}: {
  activityId: string;
  contentType: 'post' | 'project';
  liked: boolean;
  bookmarked: boolean;
  toggleLike: (id: string, action: string, contentType?: string) => void;
  toggleBookmark: (id: string, context?: { contentType: string }) => void;
  globalLikes: number;
  globalBookmarks: number;
  showCounts: boolean;
  variant: 'default' | 'compact' | 'detailed';
  title: string;
  description: string;
  href: string;
  isCompact: boolean;
}) {
  return (
    <>
      <ActionButton
        icon={Heart}
        label={
          showCounts && globalLikes > 0 ? `${globalLikes}${globalLikes > 1 ? '+' : ''}` : undefined
        }
        active={liked}
        onClick={() => toggleLike(activityId, 'like', contentType)}
        ariaLabel={liked ? 'Unlike' : 'Like'}
        variant={variant}
        activeColor={SEMANTIC_COLORS.activity.action.liked}
      />
      <ActionButton
        icon={Bookmark}
        label={
          showCounts && globalBookmarks > 0
            ? `${globalBookmarks}${globalBookmarks > 1 ? '+' : ''}`
            : undefined
        }
        active={bookmarked}
        onClick={() => toggleBookmark(activityId, { contentType })}
        ariaLabel={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        variant={variant}
        activeColor={SEMANTIC_COLORS.activity.action.bookmarked}
      />
      <ThreadShareButton
        activity={{
          id: activityId,
          title,
          description,
          href,
        }}
        variant="ghost"
        size={isCompact ? 'sm' : 'default'}
      />
    </>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Unified post/project interactions component
 * Uses contentId (slug) directly for consistency with ActivityItem bookmarks
 */
export function PostInteractions({
  contentId,
  contentType,
  title,
  description,
  href,
  className,
  variant = 'default',
  showCounts = true,
}: PostInteractionsProps) {
  // Use contentId directly (slug) for consistency with ActivityItem
  // contentId is already the slug (e.g., "my-post" or "my-project")
  const activityId = contentId;

  const { isLiked, toggleLike, getCount } = useActivityReactions();
  const { isBookmarked, toggle: toggleBookmark, getBookmarkCount } = useBookmarks();

  // Fetch global engagement counts
  const { globalLikes, globalBookmarks } = useGlobalEngagementCounts({
    slug: activityId,
    contentType,
  });

  // Use useSyncExternalStore for proper client-side hydration
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Only show actual values after hydration
  const liked = isHydrated ? isLiked(activityId) : false;
  const bookmarked = isHydrated ? isBookmarked(activityId) : false;
  const likeCount = isHydrated && showCounts ? getCount(activityId) : 0;
  const bookmarkCount = isHydrated && showCounts ? getBookmarkCount(activityId) : 0;

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <div className={cn('flex items-center', isCompact ? 'gap-3' : 'gap-4', className)}>
      {renderInteractionButtons({
        activityId,
        contentType,
        liked,
        bookmarked,
        toggleLike,
        toggleBookmark,
        globalLikes,
        globalBookmarks,
        showCounts,
        variant,
        title,
        description,
        href,
        isCompact,
      })}
    </div>
  );
}

// ============================================================================
// ACTION BUTTON SUB-COMPONENT
// ============================================================================

interface ActionButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  ariaLabel: string;
  variant: 'default' | 'compact' | 'detailed';
  activeColor?: string;
}

const ICON_SIZE_MAP = { compact: 'h-4 w-4', detailed: 'h-6 w-6', default: 'h-5 w-5' } as const;
const TEXT_SIZE_MAP = {
  compact: TYPOGRAPHY.label.xs,
  detailed: TYPOGRAPHY.label.standard,
  default: TYPOGRAPHY.label.small,
} as const;

function ActionButton({
  icon: Icon,
  label,
  active = false,
  onClick,
  ariaLabel,
  variant,
  activeColor = 'text-primary',
}: ActionButtonProps) {
  const iconSize = ICON_SIZE_MAP[variant];
  const textSize = TEXT_SIZE_MAP[variant];

  return (
    <Button
      variant="ghost"
      size={variant === 'compact' ? 'sm' : 'default'}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'group/action h-auto gap-1.5 px-2 py-1',
        ANIMATION.transition.base,
        ANIMATION.activity.like,
        'hover:bg-accent/50'
      )}
      suppressHydrationWarning
    >
      <span
        className={cn(
          iconSize,
          ANIMATION.transition.base,
          active && activeColor,
          active && 'fill-current',
          !active && SEMANTIC_COLORS.activity.action.default,
          active && 'group-hover/action:scale-110'
        )}
      >
        <Icon />
      </span>
      {label && (
        <span
          className={cn(textSize, active ? activeColor : SEMANTIC_COLORS.activity.action.default)}
          suppressHydrationWarning
        >
          {label}
        </span>
      )}
    </Button>
  );
}

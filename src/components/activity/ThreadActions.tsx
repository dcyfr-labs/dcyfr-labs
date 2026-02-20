/**
 * Thread Actions Component
 *
 * Displays inline engagement actions for activity threads:
 * - Like button with count
 * - Bookmark button
 * - Timestamp
 *
 * Threads-inspired minimal UI with hover states.
 *
 * @example
 * ```tsx
 * <ThreadActions
 *   activityId="post-123"
 *   timestamp={new Date()}
 * />
 * ```
 */

'use client';

import { useSyncExternalStore } from 'react';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useActivityReactions } from '@/hooks/use-activity-reactions';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useShare } from '@/hooks/use-share';
import { useGlobalEngagementCounts } from '@/hooks/use-global-engagement-counts';
import { ThreadShareButton } from './ThreadShareButton';
import { ANIMATION, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface ThreadActionsProps {
  /** Activity ID */
  activityId: string;
  /** Activity timestamp */
  timestamp: Date;
  /** Activity data for sharing */
  activity?: {
    title: string;
    description?: string;
    href: string;
  };
  /** Optional CSS class */
  className?: string;
  /** Size variant */
  size?: 'default' | 'compact';
  /** Hide timestamp display */
  hideTimestamp?: boolean;
  /** Show bookmark count */
  showBookmarkCount?: boolean;
  /** Show share count */
  showShareCount?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/** Normalize activity ID to canonical slug form for consistent likes/bookmarks lookup */
function normalizeActivityId(activityId: string, href?: string): string {
  if (href?.startsWith('/blog/')) {
    const extracted = href.replace('/blog/', '');
    console.warn('[ThreadActions] ID normalization:', {
      originalId: activityId,
      href,
      normalizedId: extracted,
      isBlogPost: true,
    });
    return extracted;
  }
  console.warn('[ThreadActions] ID normalization:', {
    originalId: activityId,
    normalizedId: activityId,
    isBlogPost: false,
  });
  return activityId;
}

/** Render action buttons (Like, Bookmark, Share) */
function renderActionButtons({
  normalizedId,
  liked,
  bookmarked,
  toggleLike,
  toggleBookmark,
  globalLikes,
  globalBookmarks,
  shareCount,
  activity,
  activityId,
  size,
}: {
  normalizedId: string;
  liked: boolean;
  bookmarked: boolean;
  toggleLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  globalLikes: number;
  globalBookmarks: number;
  shareCount: number;
  activity?: ThreadActionsProps['activity'];
  activityId: string;
  size: 'default' | 'compact';
}) {
  return (
    <>
      <ActionButton
        icon={Heart}
        label={globalLikes > 0 ? `${globalLikes}${globalLikes > 1 ? '+' : ''}` : undefined}
        globalCount={globalLikes}
        active={liked}
        onClick={() => toggleLike(normalizedId)}
        ariaLabel={liked ? 'Unlike' : 'Like'}
        size={size}
        activeColor={SEMANTIC_COLORS.activity.action.liked}
      />
      <ActionButton
        icon={Bookmark}
        label={
          globalBookmarks > 0 ? `${globalBookmarks}${globalBookmarks > 1 ? '+' : ''}` : undefined
        }
        globalCount={globalBookmarks}
        active={bookmarked}
        onClick={() => toggleBookmark(normalizedId)}
        ariaLabel={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        size={size}
        activeColor={SEMANTIC_COLORS.activity.action.bookmarked}
      />
      {activity && (
        <div className="relative">
          <ThreadShareButton activity={{ id: activityId, ...activity }} variant="ghost" size="sm" />
          {shareCount > 0 && (
            <span
              className={cn(TYPOGRAPHY.label.xs, SEMANTIC_COLORS.activity.action.default, 'ml-1')}
              suppressHydrationWarning
            >
              {shareCount}
            </span>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Thread action buttons (like, bookmark, share) + timestamp
 */
export function ThreadActions({
  activityId,
  timestamp,
  activity,
  className,
  size = 'default',
  hideTimestamp = false,
  showBookmarkCount = false,
  showShareCount = false,
}: ThreadActionsProps) {
  const { isLiked, toggleLike, getCount } = useActivityReactions();
  const { isBookmarked, toggle: toggleBookmark, getBookmarkCount } = useBookmarks();
  const { getShareCount } = useShare();

  // Normalize activity ID for blog posts to match /likes and /bookmarks pages
  const normalizedId = normalizeActivityId(activityId, activity?.href);

  // Fetch global engagement counts (lazy load to reduce initial API waterfall)
  const {
    globalLikes,
    globalBookmarks,
    ref: engagementRef,
  } = useGlobalEngagementCounts({
    slug: normalizedId,
    contentType: 'activity',
    lazy: true, // Only fetch when component is visible
  });

  // Use useSyncExternalStore for proper client-side hydration without ESLint warnings
  const isHydrated = useSyncExternalStore(
    () => () => {}, // subscribe (no-op since we don't need to listen for changes)
    () => true, // getSnapshot (client)
    () => false // getServerSnapshot (server)
  );

  // Only show actual values after hydration
  const liked = isHydrated ? isLiked(normalizedId) : false;
  const bookmarked = isHydrated ? isBookmarked(normalizedId) : false;
  const likeCount = isHydrated ? getCount(normalizedId) : 0;
  const bookmarkCount = isHydrated && showBookmarkCount ? getBookmarkCount(normalizedId) : 0;
  const shareCount = isHydrated && showShareCount ? getShareCount(normalizedId) : 0;

  // Log engagement state after checks
  if (isHydrated) {
    console.warn('[ThreadActions] Engagement state after checks:', {
      normalizedId,
      liked,
      bookmarked,
      likeCount,
      bookmarkCount,
    });
  }

  const isCompact = size === 'compact';

  return (
    <div
      ref={engagementRef}
      className={cn('flex items-center gap-4', isCompact ? 'gap-3' : 'gap-4', className)}
    >
      {renderActionButtons({
        normalizedId,
        liked,
        bookmarked,
        toggleLike,
        toggleBookmark,
        globalLikes,
        globalBookmarks,
        shareCount,
        activity,
        activityId,
        size,
      })}

      {/* Timestamp */}
      {!hideTimestamp && (
        <time
          dateTime={timestamp.toISOString()}
          className={cn(TYPOGRAPHY.metadata, 'text-muted-foreground ml-auto')}
          title={timestamp.toLocaleString()}
        >
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </time>
      )}
    </div>
  );
}

// ============================================================================
// ACTION BUTTON SUB-COMPONENT
// ============================================================================

interface ActionButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
  globalCount?: number;
  active?: boolean;
  onClick?: () => void;
  ariaLabel: string;
  size: 'default' | 'compact';
  activeColor?: string;
}

function ActionButton({
  icon: Icon,
  label,
  globalCount = 0,
  active = false,
  onClick,
  ariaLabel,
  size,
  activeColor = 'text-primary',
}: ActionButtonProps) {
  const iconSize = size === 'compact' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'compact' ? TYPOGRAPHY.label.xs : TYPOGRAPHY.label.small;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'group/action h-auto px-2 py-2 flex justify-center items-center',
        'gap-1.5',
        ANIMATION.transition.base,
        ANIMATION.activity.like,
        'hover:bg-accent/50'
      )}
      suppressHydrationWarning
    >
      <Icon
        className={cn(
          iconSize,
          ANIMATION.transition.base,
          active && activeColor,
          active && 'fill-current',
          !active && SEMANTIC_COLORS.activity.action.default,
          active && 'group-hover/action:scale-110'
        )}
      />
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

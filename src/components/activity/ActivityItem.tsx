"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FolderKanban,
  GitCommit,
  Sparkles,
  Clock,
  Megaphone,
  Trophy,
  ExternalLink,
  TrendingUp,
  Eye,
  MessageSquare,
  Flame,
  Check,
  Pencil,
  Award,
  BarChart3,
  Search,
  Activity,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATION, TOUCH_TARGET, SEMANTIC_COLORS } from "@/lib/design-tokens";
import { useBookmarks } from "@/hooks/use-bookmarks";
import {
  type ActivityItem as ActivityItemType,
  type ActivitySource,
  type ActivityVariant,
  ACTIVITY_SOURCE_COLORS,
  ACTIVITY_SOURCE_LABELS,
  formatActivityDate,
  formatActivityDateFull,
} from "@/lib/activity";

// ============================================================================
// ICONS
// ============================================================================

const SOURCE_ICONS: Record<ActivitySource, typeof FileText> = {
  blog: FileText,
  project: FolderKanban,
  github: GitCommit,
  changelog: Sparkles,
  milestone: Trophy,
  trending: TrendingUp,
  engagement: Flame,
  certification: Award,
  analytics: BarChart3,
  "github-traffic": Activity,
  seo: Search,
};

// ============================================================================
// VERB DISPLAY HELPERS
// ============================================================================

/**
 * Get display information for activity verbs
 * Shows visual distinction between published (new) vs updated (modified)
 * Uses semantic color system for consistent theming
 */
function getVerbDisplay(verb: ActivityItemType["verb"]) {
  const verbConfig: Record<
    ActivityItemType["verb"],
    { icon: typeof Check; label: string; badge: string }
  > = {
    published: {
      icon: Check,
      label: "Published",
      badge: SEMANTIC_COLORS.status.neutral,
    },
    updated: {
      icon: Pencil,
      label: "Updated",
      badge: SEMANTIC_COLORS.status.neutral,
    },
    launched: {
      icon: Megaphone,
      label: "Launched",
      badge: SEMANTIC_COLORS.status.neutral,
    },
    released: {
      icon: Trophy,
      label: "Released",
      badge: SEMANTIC_COLORS.status.neutral,
    },
    committed: {
      icon: GitCommit,
      label: "Committed",
      badge: SEMANTIC_COLORS.status.neutral,
    },
    achieved: {
      icon: Trophy,
      label: "Achieved",
      badge: SEMANTIC_COLORS.status.neutral,
    },
    earned: {
      icon: Award,
      label: "Earned",
      badge: SEMANTIC_COLORS.status.neutral,
    },
    reached: {
      icon: TrendingUp,
      label: "Reached",
      badge: SEMANTIC_COLORS.status.neutral,
    },
  };

  return verbConfig[verb] || verbConfig.updated;
}

// ============================================================================
// PROPS
// ============================================================================

interface ActivityItemProps {
  /** The activity data */
  activity: ActivityItemType;

  /** Display variant */
  variant?: ActivityVariant;

  /** Whether this is the last item (hides timeline connector) */
  isLast?: boolean;

  /** Whether to show the timeline connector line */
  showConnector?: boolean;

  /** CSS class overrides */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Individual activity item in the feed
 *
 * Renders differently based on variant:
 * - compact: Icon + title + time (homepage widget)
 * - standard: Full card with description
 * - timeline: Vertical connected with line
 * - minimal: Text-only list item
 */
export function ActivityItem({
  activity,
  variant = "standard",
  isLast = false,
  showConnector = true,
  className,
}: ActivityItemProps) {
  const Icon = SOURCE_ICONS[activity.source] || FileText;
  const colors = ACTIVITY_SOURCE_COLORS[activity.source] || {
    icon: "",
    text: "",
    bg: "",
  };
  const sourceLabel = ACTIVITY_SOURCE_LABELS[activity.source] || "Activity";
  const { isBookmarked, toggle } = useBookmarks();

  // Extract slug from href for blog posts to match BookmarkButton behavior
  // Blog posts have href like "/blog/owasp-top-10-agentic-ai"
  const getBookmarkId = () => {
    if (activity.source === "blog" && activity.href.startsWith("/blog/")) {
      return activity.href.replace("/blog/", "");
    }
    return activity.id;
  };

  const bookmarkId = getBookmarkId();

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(bookmarkId);
  };

  if (variant === "minimal") {
    return <MinimalItem activity={activity} className={className} />;
  }

  if (variant === "compact") {
    return <CompactItem activity={activity} className={className} />;
  }

  if (variant === "timeline") {
    return (
      <TimelineItem
        activity={activity}
        isLast={isLast}
        showConnector={showConnector}
        className={className}
      />
    );
  }

  // Standard variant
  return (
    <Card
      data-testid="activity-item"
      className={cn(
        "group transition-base",
        ANIMATION.duration.fast,
        "hover:shadow-md hover:border-primary/30",
        className
      )}
    >
      <CardContent className="p-4 relative">
        {/* Bookmark button - Mobile-first touch target sizing */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmarkToggle}
          className={cn(
            "absolute top-3 right-3",
            // Mobile-first: 44x44px minimum, scale down on tablet+
            TOUCH_TARGET.close,
            "opacity-0 group-hover:opacity-100",
            ANIMATION.transition.movement,

            isBookmarked(bookmarkId) &&
              "opacity-100 text-amber-500 hover:text-amber-600"
          )}
          aria-label={
            isBookmarked(bookmarkId) ? "Remove bookmark" : "Add bookmark"
          }
        >
          {isBookmarked(bookmarkId) ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>

        <div className="flex gap-3 pr-10">
          {/* Add right padding for bookmark button */}
          {/* Activity icon */}
          <div
            className={cn(
              "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
              "bg-background border-2 border-border",
              "group-hover:border-primary/50 transition-colors"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                colors?.icon,
                "group-hover:text-primary"
              )}
            />
          </div>

          {/* Activity content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link
                href={activity.href}
                className="font-medium hover:text-primary transition-colors line-clamp-1"
              >
                {activity.title}
              </Link>
              <div className="flex gap-1.5 shrink-0">
                {/* Source badge */}
                <Badge variant="default" className="shrink-0 text-xs">
                  {sourceLabel}
                </Badge>
                {/* Verb badge (published/updated) */}
                {(() => {
                  const verbDisplay = getVerbDisplay(activity.verb);
                  const VerbIcon = verbDisplay.icon;
                  return (
                    <Badge
                      variant="outline"
                      className={`text-xs border flex items-center gap-1 ${verbDisplay.badge}`}
                    >
                      <VerbIcon className="h-3 w-3" />
                      <span className="hidden sm:inline">
                        {verbDisplay.label}
                      </span>
                    </Badge>
                  );
                })()}
              </div>
            </div>

            {activity.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {activity.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <time
                dateTime={activity.timestamp.toISOString()}
                title={formatActivityDateFull(activity.timestamp)}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <Clock className="h-3 w-3" />
                <span>{formatActivityDate(activity.timestamp)}</span>
              </time>

              {/* View count */}
              {activity.meta?.stats?.views !== undefined &&
                activity.meta.stats.views > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {activity.meta.stats.views.toLocaleString()} views
                    </span>
                  </>
                )}

              {/* Comment count */}
              {activity.meta?.stats?.comments !== undefined &&
                activity.meta.stats.comments > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {activity.meta.stats.comments} comments
                    </span>
                  </>
                )}

              {activity.meta?.readingTime && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.meta.readingTime}
                  </span>
                </>
              )}

              {/* Trending badge */}
              {activity.meta?.trending && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs px-1.5 py-0",
                      SEMANTIC_COLORS.accent.orange.badge
                    )}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                </>
              )}

              {/* Milestone badge */}
              {activity.meta?.milestone && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs px-1.5 py-0",
                      SEMANTIC_COLORS.status.warning
                    )}
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    {activity.meta.milestone.toLocaleString()} milestone
                  </Badge>
                </>
              )}

              {/* High engagement badge */}
              {activity.meta?.engagement !== undefined &&
                activity.meta.engagement >= 5 && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs px-1.5 py-0",
                        SEMANTIC_COLORS.status.warning
                      )}
                    >
                      <Flame className="h-3 w-3 mr-1" />
                      {activity.meta.engagement.toFixed(1)}% engaged
                    </Badge>
                  </>
                )}

              {activity.meta?.tags && activity.meta.tags.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex gap-1 flex-wrap">
                    {activity.meta.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// VARIANT: COMPACT
// ============================================================================

function CompactItem({
  activity,
  className,
}: {
  activity: ActivityItemType;
  className?: string;
}) {
  const Icon = SOURCE_ICONS[activity.source] || FileText;
  const colors = ACTIVITY_SOURCE_COLORS[activity.source] || {
    icon: "",
    text: "",
    bg: "",
  };

  return (
    <Link
      href={activity.href}
      data-testid="activity-item"
      className={cn(
        "group flex items-center gap-3 py-2 px-3 rounded-lg",
        "hover:bg-accent/50 transition-colors",
        className
      )}
    >
      <div
        className={cn(
          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
          "bg-background border border-border",
          "group-hover:border-primary/50 transition-colors"
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", colors?.icon)} />
      </div>

      <span className="flex-1 font-medium text-sm truncate group-hover:text-primary transition-colors">
        {activity.title}
      </span>

      <time
        dateTime={activity.timestamp.toISOString()}
        className="text-xs text-muted-foreground shrink-0"
      >
        {formatActivityDate(activity.timestamp)}
      </time>
    </Link>
  );
}

// ============================================================================
// VARIANT: MINIMAL
// ============================================================================

function MinimalItem({
  activity,
  className,
}: {
  activity: ActivityItemType;
  className?: string;
}) {
  return (
    <Link
      href={activity.href}
      data-testid="activity-item"
      className={cn(
        "group flex items-center gap-2 py-1.5",
        "hover:text-primary transition-colors",
        className
      )}
    >
      <span className="text-xs text-muted-foreground shrink-0">
        {formatActivityDate(activity.timestamp)}
      </span>
      <span className="text-sm truncate">{activity.title}</span>
      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}

// ============================================================================
// VARIANT: TIMELINE
// ============================================================================

function TimelineItem({
  activity,
  isLast,
  showConnector,
  className,
}: {
  activity: ActivityItemType;
  isLast: boolean;
  showConnector: boolean;
  className?: string;
}) {
  const Icon = SOURCE_ICONS[activity.source] || FileText;
  const colors = ACTIVITY_SOURCE_COLORS[activity.source] || {
    icon: "",
    text: "",
    bg: "",
  };
  const sourceLabel = ACTIVITY_SOURCE_LABELS[activity.source] || "Activity";
  const { isBookmarked, toggle } = useBookmarks();

  // Extract slug from href for blog posts to match BookmarkButton behavior  // Blog posts have href like "/blog/owasp-top-10-agentic-ai"
  const getBookmarkId = () => {
    if (activity.source === "blog" && activity.href.startsWith("/blog/")) {
      return activity.href.replace("/blog/", "");
    }
    return activity.id;
  };

  const bookmarkId = getBookmarkId();

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(bookmarkId);
  };

  return (
    <div
      className={cn("relative flex gap-4 group", className)}
      data-testid="activity-item"
    >
      {/* Timeline connector line */}
      {showConnector && !isLast && (
        <div
          className="absolute left-4.5 top-10 bottom-0 w-px bg-border"
          aria-hidden="true"
        />
      )}

      {/* Icon node with micro-interactions */}
      <div
        className={cn(
          "relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          "bg-background border-2 border-border",
          // Enhanced hover: border color + subtle scale + shadow
          cn(ANIMATION.transition.base, ANIMATION.duration.fast),
          "group-hover:border-primary/50 group-hover:scale-110 group-hover:shadow-md",
          "group-hover:shadow-primary/10"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            ANIMATION.transition.base,
            colors?.icon,
            // Icon color change on hover
            "group-hover:text-primary group-hover:scale-105"
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0 relative">
        {/* Bookmark button with bounce animation - Mobile-first sizing */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmarkToggle}
          className={cn(
            "absolute top-0 right-0",
            // Mobile-first: 44x44px minimum, scale down on tablet+
            TOUCH_TARGET.close,
            // Fade in/out with scale
            "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
            cn(ANIMATION.transition.base, ANIMATION.duration.fast),
            // Active state: slight bounce
            "active:scale-90",
            // Bookmarked state: always visible with amber color

            isBookmarked(bookmarkId) &&
              "opacity-100 scale-100 text-amber-500 hover:text-amber-600"
          )}
          aria-label={
            isBookmarked(bookmarkId) ? "Remove bookmark" : "Add bookmark"
          }
        >
          {isBookmarked(bookmarkId) ? (
            <BookmarkCheck
              className={cn(
                "h-4 w-4 animate-in zoom-in-50",
                ANIMATION.duration.fast
              )}
            />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-start justify-between gap-2 mb-1 pr-10">
          {/* Add right padding for bookmark button */}
          <Link
            href={activity.href}
            className="font-medium hover:text-primary transition-colors line-clamp-1"
          >
            {activity.title}
          </Link>
          <div className="flex gap-1.5 shrink-0">
            {/* Source badge */}
            <Badge variant="default" className="shrink-0 text-xs">
              {sourceLabel}
            </Badge>
            {/* Verb badge (published/updated) */}
            {(() => {
              const verbDisplay = getVerbDisplay(activity.verb);
              const VerbIcon = verbDisplay.icon;
              return (
                <Badge
                  variant="outline"
                  className={`text-xs border flex items-center gap-1 ${verbDisplay.badge}`}
                  title={verbDisplay.label}
                >
                  <VerbIcon className="h-3 w-3" />
                </Badge>
              );
            })()}
          </div>
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {activity.description}
          </p>
        )}

        <time
          dateTime={activity.timestamp.toISOString()}
          title={formatActivityDateFull(activity.timestamp)}
          className="text-xs text-muted-foreground"
        >
          {formatActivityDate(activity.timestamp)}
        </time>
      </div>
    </div>
  );
}

export default ActivityItem;

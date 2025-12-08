"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATION } from "@/lib/design-tokens";
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
};

// ============================================================================
// VERB DISPLAY HELPERS
// ============================================================================

/**
 * Get display information for activity verbs
 * Shows visual distinction between published (new) vs updated (modified)
 */
function getVerbDisplay(verb: ActivityItemType["verb"]) {
  const verbConfig: Record<
    ActivityItemType["verb"],
    { icon: typeof Check; label: string; badge: string }
  > = {
    published: {
      icon: Check,
      label: "Published",
      badge: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      // Note: Status badge colors use semantic color palette (green for success)
    },
    updated: {
      icon: Pencil,
      label: "Updated",
      badge: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      // Note: Status badge colors use semantic color palette (blue for info)
    },
    launched: {
      icon: Megaphone,
      label: "Launched",
      badge: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      // Note: Status badge colors use semantic color palette (purple for accent)
    },
    released: {
      icon: Trophy,
      label: "Released",
      badge: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      // Note: Status badge colors use semantic color palette (amber for warning)
    },
    committed: {
      icon: GitCommit,
      label: "Committed",
      badge: "bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
      // Note: Status badge colors use semantic color palette (slate for neutral)
    },
    achieved: {
      icon: Trophy,
      label: "Achieved",
      badge: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      // Note: Status badge colors use semantic color palette (yellow for highlight)
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
  const colors = ACTIVITY_SOURCE_COLORS[activity.source] || { icon: "", text: "", bg: "" };
  const sourceLabel = ACTIVITY_SOURCE_LABELS[activity.source] || "Activity";

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
      className={cn(
        "group transition-base",
        ANIMATION.duration.fast,
        "hover:shadow-md hover:border-primary/30",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
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
                    className="text-xs px-1.5 py-0 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
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
                    className="text-xs px-1.5 py-0 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
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
                      className="text-xs px-1.5 py-0 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
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
  const colors = ACTIVITY_SOURCE_COLORS[activity.source] || { icon: "", text: "", bg: "" };

  return (
    <Link
      href={activity.href}
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
  const colors = ACTIVITY_SOURCE_COLORS[activity.source] || { icon: "", text: "", bg: "" };
  const sourceLabel = ACTIVITY_SOURCE_LABELS[activity.source] || "Activity";

  return (
    <div className={cn("relative flex gap-4", className)}>
      {/* Timeline connector line */}
      {showConnector && !isLast && (
        <div
          className="absolute left-[18px] top-10 bottom-0 w-px bg-border"
          aria-hidden="true"
        />
      )}

      {/* Icon node */}
      <div
        className={cn(
          "relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          "bg-background border-2 border-border",
          "group-hover:border-primary/50 transition-colors"
        )}
      >
        <Icon className={cn("h-4 w-4", colors?.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
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

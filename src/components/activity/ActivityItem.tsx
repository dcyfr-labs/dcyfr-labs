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
} from "lucide-react";
import { cn } from "@/lib/utils";
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
};

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
  const Icon = SOURCE_ICONS[activity.source];
  const colors = ACTIVITY_SOURCE_COLORS[activity.source];
  const sourceLabel = ACTIVITY_SOURCE_LABELS[activity.source];

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
        "group transition-all duration-200",
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
                colors.icon,
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
              <Badge variant="default" className="shrink-0 text-xs">
                {sourceLabel}
              </Badge>
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

              {activity.meta?.readingTime && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.meta.readingTime}
                  </span>
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
  const Icon = SOURCE_ICONS[activity.source];
  const colors = ACTIVITY_SOURCE_COLORS[activity.source];

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
        <Icon className={cn("h-3.5 w-3.5", colors.icon)} />
      </div>

      <span className="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors">
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
  const Icon = SOURCE_ICONS[activity.source];
  const colors = ACTIVITY_SOURCE_COLORS[activity.source];
  const sourceLabel = ACTIVITY_SOURCE_LABELS[activity.source];

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
        <Icon className={cn("h-4 w-4", colors.icon)} />
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
          <Badge variant="default" className="shrink-0 text-xs">
            {sourceLabel}
          </Badge>
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

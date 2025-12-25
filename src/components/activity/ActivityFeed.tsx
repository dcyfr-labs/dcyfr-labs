"use client";

import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { ActivityItem } from "./ActivityItem";
import { ActivitySkeleton, ActivitySkeletonGroup } from "./ActivitySkeleton";
import {
  type ActivityItem as ActivityItemType,
  type ActivityVariant,
  type TimeGroup,
  groupActivitiesByTime,
  TIME_GROUP_LABELS,
} from "@/lib/activity";

// ============================================================================
// PROPS
// ============================================================================

interface ActivityFeedProps {
  /** Activity items to display */
  items: ActivityItemType[];

  /** Display variant */
  variant?: ActivityVariant;

  /** Maximum items to show (for truncated views) */
  limit?: number;

  /** Whether to show time group headers */
  showGroups?: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** Link to full activity page (for "View all" button) */
  viewAllHref?: string;

  /** CSS class overrides */
  className?: string;

  /** Empty state message */
  emptyMessage?: string;
}

// ============================================================================
// TIME GROUP ORDER
// ============================================================================

const TIME_GROUP_ORDER: TimeGroup[] = [
  "today",
  "this-week",
  "this-month",
  "older",
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Universal Activity Feed
 *
 * Displays a unified timeline of activities from multiple sources.
 * Inspired by modern social media feeds with time-based grouping.
 *
 * @example
 * ```tsx
 * <ActivityFeed
 *   items={activities}
 *   variant="standard"
 *   limit={5}
 *   showGroups
 *   viewAllHref="/activity"
 * />
 * ```
 */
export function ActivityFeed({
  items,
  variant = "standard",
  limit,
  showGroups = false,
  isLoading = false,
  viewAllHref,
  className,
  emptyMessage = "No recent activity",
}: ActivityFeedProps) {
  // Apply limit
  const displayItems = limit ? items.slice(0, limit) : items;

  // Loading state
  if (isLoading) {
    return <ActivitySkeletonGroup count={limit || 5} />;
  }

  // Empty state
  if (displayItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Group by time if requested
  if (showGroups) {
    return (
      <GroupedFeed
        items={displayItems}
        variant={variant}
        viewAllHref={viewAllHref}
        className={className}
      />
    );
  }

  // Simple list
  return (
    <div className={cn("space-y-3", className)}>
      {variant === "timeline" ? (
        <TimelineFeed items={displayItems} />
      ) : (
        displayItems.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} variant={variant} />
        ))
      )}

      {viewAllHref && (
        <ViewAllLink href={viewAllHref} variant={variant} />
      )}
    </div>
  );
}

// ============================================================================
// GROUPED FEED
// ============================================================================

function GroupedFeed({
  items,
  variant,
  viewAllHref,
  className,
}: {
  items: ActivityItemType[];
  variant: ActivityVariant;
  viewAllHref?: string;
  className?: string;
}) {
  const groups = groupActivitiesByTime(items);

  return (
    <div className={cn("space-y-4", className)}>
      {TIME_GROUP_ORDER.map((group) => {
        const groupItems = groups.get(group);
        if (!groupItems?.length) return null;

        return (
          <div key={group}>
            {/* Use TYPOGRAPHY tokens for heading styles */}
            <h3
              className={cn(
                TYPOGRAPHY.h3.standard,
                "text-muted-foreground mb-3 uppercase tracking-wider"
              )}
            >
              {TIME_GROUP_LABELS[group]}
            </h3>

            <div className="space-y-3">
              {variant === "timeline" ? (
                <div className="relative">
                  {groupItems.map((activity, index) => (
                    <ActivityItem
                      key={`${group}-${activity.id}`}
                      activity={activity}
                      variant={variant}
                      isLast={index === groupItems.length - 1}
                      showConnector
                    />
                  ))}
                </div>
              ) : (
                groupItems.map((activity) => (
                  <ActivityItem
                    key={`${group}-${activity.id}`}
                    activity={activity}
                    variant={variant}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}

      {viewAllHref && (
        <ViewAllLink href={viewAllHref} variant={variant} />
      )}
    </div>
  );
}

// ============================================================================
// TIMELINE FEED
// ============================================================================

function TimelineFeed({ items }: { items: ActivityItemType[] }) {
  return (
    <div className="relative">
      {items.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          variant="timeline"
          isLast={index === items.length - 1}
          showConnector
        />
      ))}
    </div>
  );
}

// ============================================================================
// VIEW ALL LINK
// ============================================================================

function ViewAllLink({
  href,
  variant,
}: {
  href: string;
  variant: ActivityVariant;
}) {
  return (
    <div className={cn("pt-2", variant === "compact" ? "px-3" : "")}>
      <Button variant="ghost" size="sm" asChild className="group">
        <Link href={href}>
          View all activity
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}

export default ActivityFeed;

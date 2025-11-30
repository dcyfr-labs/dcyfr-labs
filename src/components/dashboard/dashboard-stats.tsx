import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Dashboard stats card component for displaying key metrics
 * 
 * Renders a card with an optional icon, label, primary value, and secondary value.
 * Supports hover effects and responsive layouts.
 * 
 * @example
 * ```tsx
 * <DashboardStat
 *   label="Total Posts"
 *   value={42}
 *   icon={FileText}
 * />
 * 
 * <DashboardStat
 *   label="Total Views"
 *   value={15234}
 *   secondaryValue="1,234 in 24h"
 *   icon={Eye}
 * />
 * ```
 */

interface DashboardStatProps {
  /** Stat label/title */
  label: string;
  /** Primary stat value (number or string) */
  value: string | number;
  /** Optional secondary value (e.g., "1,234 in 24h") */
  secondaryValue?: string | number;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Additional CSS classes for card */
  className?: string;
  /** Trend indicator (positive, negative, neutral) */
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
  };
}

export function DashboardStat({
  label,
  value,
  secondaryValue,
  icon: Icon,
  className,
  trend,
}: DashboardStatProps) {
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow p-3", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground/50" />}
        </div>
        <div>
          <p className={TYPOGRAPHY.display.stat}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {secondaryValue && (
            <p className="text-xs text-muted-foreground">
              {typeof secondaryValue === "number"
                ? secondaryValue.toLocaleString()
                : secondaryValue}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.direction === "up" && "text-green-600",
                  trend.direction === "down" && "text-red-600",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}
              >
                {trend.direction === "up" && "+"}
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Grid container for dashboard stats
 * 
 * Renders a responsive grid of stat cards with proper spacing.
 * 
 * @example
 * ```tsx
 * <DashboardStats>
 *   <DashboardStat label="Posts" value={42} icon={FileText} />
 *   <DashboardStat label="Views" value={15234} icon={Eye} />
 * </DashboardStats>
 * ```
 */

interface DashboardStatsProps {
  /** Stat cards to display */
  children: React.ReactNode;
  /** Number of columns on desktop (2 or 4) */
  columns?: 2 | 4;
  /** Additional CSS classes for grid */
  className?: string;
}

export function DashboardStats({ children, columns = 4, className }: DashboardStatsProps) {
  return (
    <div
      className={cn(
        "grid gap-3 grid-cols-2",
        columns === 4 && "md:grid-cols-4",
        columns === 2 && "md:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Featured metric card with larger layout
 * 
 * Used for highlighting top-level metrics like "Top Post" or "Best Performer".
 * 
 * @example
 * ```tsx
 * <DashboardFeaturedStat
 *   title="Top Post (All-time)"
 *   description="Most viewed post overall"
 * >
 *   <p className="font-medium">Building a Developer Blog</p>
 *   <p className={TYPOGRAPHY.display.stat}>15,234 views</p>
 * </DashboardFeaturedStat>
 * ```
 */

interface DashboardFeaturedStatProps {
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes for card */
  className?: string;
}

export function DashboardFeaturedStat({
  title,
  description,
  children,
  className,
}: DashboardFeaturedStatProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-3 border-b border-border">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3">{children}</CardContent>
    </Card>
  );
}

/**
 * Grid container for featured stats
 * 
 * @example
 * ```tsx
 * <DashboardFeaturedStats>
 *   <DashboardFeaturedStat title="Top Post">...</DashboardFeaturedStat>
 *   <DashboardFeaturedStat title="Trending">...</DashboardFeaturedStat>
 * </DashboardFeaturedStats>
 * ```
 */

interface DashboardFeaturedStatsProps {
  /** Featured stat cards to display */
  children: React.ReactNode;
  /** Additional CSS classes for grid */
  className?: string;
}

export function DashboardFeaturedStats({
  children,
  className,
}: DashboardFeaturedStatsProps) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)}>{children}</div>
  );
}

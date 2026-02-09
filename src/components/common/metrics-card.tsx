/**
 * MetricsCard Component
 *
 * Displays key metrics and statistics in a visually prominent card format.
 * Used in blog posts to highlight data points, achievements, and quantitative results.
 *
 * @component
 * @example
 * ```tsx
 * <MetricsCard
 *   value="60%"
 *   label="Time Saved"
 *   description="On feature implementation"
 *   trend="up"
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  /** Primary metric value (e.g., "60%", "12,000+", "99.1%") */
  value: string;
  /** Metric label/title */
  label: string;
  /** Optional description or context */
  description?: string;
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional className */
  className?: string;
}

export function MetricsCard({
  value,
  label,
  description,
  trend,
  icon: Icon,
  className,
}: MetricsCardProps) {
  return (
    <div
      className={cn(
        'not-prose',
        'relative p-6 rounded-lg border border-border bg-card',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Value */}
          <div className={cn(TYPOGRAPHY.h2.standard, 'text-foreground font-bold')}>
            {value}
          </div>

          {/* Label */}
          <div className={cn(TYPOGRAPHY.body, 'text-muted-foreground font-medium')}>
            {label}
          </div>

          {/* Description */}
          {description && (
            <div className={cn(TYPOGRAPHY.caption, 'text-muted-foreground')}>
              {description}
            </div>
          )}
        </div>

        {/* Icon or Trend */}
        <div className="flex-shrink-0">
          {Icon ? (
            <Icon className="h-8 w-8 text-primary" />
          ) : trend === 'up' ? (
            <TrendingUp className="h-6 w-6 text-success" aria-label="Trending up" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-6 w-6 text-destructive" aria-label="Trending down" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

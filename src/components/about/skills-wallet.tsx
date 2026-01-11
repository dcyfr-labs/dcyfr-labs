"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonHeading } from "@/components/ui/skeleton-primitives";
import { Lightbulb, TrendingUp, ExternalLink } from "lucide-react";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { cn, ensureAbsoluteUrl } from "@/lib/utils";
import { useCredlySkills } from "@/hooks/use-credly";
import type { CredlySkill } from "@/types/credly";

interface SkillsWalletProps {
  username?: string;
  limit?: number;
  viewMoreUrl?: string;
  viewMoreText?: string;
  className?: string;
  excludeSkills?: string[];
  /** Loading state - renders skeleton version */
  loading?: boolean;
}

interface SkillWithCount {
  skill: CredlySkill;
  count: number;
  badges: string[]; // Badge names that include this skill
}

/**
 * SkillsWallet Component
 *
 * Aggregates and displays all skills from Credly badges.
 * Shows skill name, number of certifications that include it,
 * and links to Credly's skill pages.
 *
 * **Loading State:**
 * Pass `loading={true}` to render skeleton version that matches the real component structure.
 * This ensures loading states never drift from the actual component layout.
 *
 * @example
 * <SkillsWallet username="dcyfr" />
 *
 * @example
 * // Show loading skeleton
 * <SkillsWallet loading limit={6} />
 */
export function SkillsWallet({
  username = "dcyfr",
  limit,
  viewMoreUrl,
  viewMoreText = "View all skills",
  className,
  excludeSkills = [],
  loading: loadingProp = false,
}: SkillsWalletProps) {
  // Use the cached hook for better performance and automatic skill aggregation
  const { skills, loading: hookLoading, error } = useCredlySkills({ username });

  // Memoize displayed skills to prevent unnecessary re-renders
  const displayedSkills = useMemo(() => {
    const filtered = skills.filter(
      (item) => !excludeSkills.includes(item.skill.name)
    );

    // Debug: Log excluded skills if any
    if (excludeSkills.length > 0 && process.env.NODE_ENV === 'development') {
      const excluded = skills.filter((item) => excludeSkills.includes(item.skill.name));
      if (excluded.length > 0) {
        console.warn('[SkillsWallet] Excluded skills:', excluded.map((s) => s.skill.name));
      }
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }, [skills, limit, excludeSkills]);

  // Combine prop and hook loading states
  const loading = loadingProp || hookLoading;

  // Loading state - skeleton version matching real component structure
  if (loading) {
    return (
      <div className={cn(SPACING.subsection, className)}>
        {/* Header skeleton - matches real component structure */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <SkeletonHeading level="h3" width="w-32" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>

        {/* Skills grid skeleton - matches real component structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit || 6)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              {/* Skill name + count */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>

              {/* Badge count text */}
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="critical" className={className}>
        {error}
      </Alert>
    );
  }

  if (skills.length === 0) {
    return (
      <Alert type="info" className={className}>
        No skills found for this user.
      </Alert>
    );
  }

  return (
    <div className={cn(SPACING.subsection, className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className={TYPOGRAPHY.h3.standard}>Top Skills</h3>
        <Badge variant="secondary">{displayedSkills.length} Total</Badge>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedSkills.map((item) => (
          <Link
            key={item.skill.id}
            href={ensureAbsoluteUrl(
              `https://www.credly.com/skills/${item.skill.vanity_slug}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="p-4 hover:shadow-md transition-base hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                    {item.skill.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.count} {item.count === 1 ? "badge" : "badges"}
                  </p>
                </div>
                {item.count > 1 && (
                  <div className="shrink-0">
                    <Badge variant="outline" className="text-xs gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {item.count}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Tooltip: Show badge names on hover (desktop only) */}
              <div className="hidden lg:block mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.badges.join(", ")}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* View More Link */}
      {viewMoreUrl && limit && skills.length > limit && (
        <div className="mt-8 text-center">
          <Link
            href={viewMoreUrl}
            className={cn(
              "inline-flex items-center gap-2",
              TYPOGRAPHY.label.small,
              "text-primary hover:underline"
            )}
          >
            <span>{viewMoreText}</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

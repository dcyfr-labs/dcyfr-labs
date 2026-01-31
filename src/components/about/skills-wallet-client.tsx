'use client';

/**
 * Skills Wallet Client Component
 *
 * Pure client component that renders skill data received as props.
 * Does NOT fetch data - receives pre-fetched data from server component.
 *
 * This eliminates:
 * - Rate limiting issues (no API calls)
 * - Hydration mismatches (data is consistent)
 * - Loading states (handled by Suspense in server wrapper)
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/common';
import { Lightbulb, TrendingUp, ExternalLink } from 'lucide-react';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { cn, ensureAbsoluteUrl } from '@/lib/utils';
import type { CredlySkill } from '@/types/credly';

// ============================================================================
// TYPES
// ============================================================================

interface SkillWithCount {
  skill: CredlySkill;
  count: number;
  badges: string[];
}

interface SkillsWalletClientProps {
  skills: SkillWithCount[];
  totalCount: number;
  error?: string;
  limit?: number;
  viewMoreUrl?: string;
  viewMoreText?: string;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Client-side skills wallet renderer
 *
 * Receives pre-fetched data from server component.
 * No API calls, no hooks - pure rendering.
 */
export function SkillsWalletClient({
  skills,
  totalCount,
  error,
  limit,
  viewMoreUrl,
  viewMoreText = 'View all skills',
  className,
}: SkillsWalletClientProps) {
  // Memoize displayed skills
  const displayedSkills = useMemo(() => {
    return limit ? skills.slice(0, limit) : skills;
  }, [skills, limit]);

  // Error state
  if (error) {
    return (
      <Alert type="critical" className={className}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (skills.length === 0) {
    return (
      <Alert type="info" className={className}>
        No skills found. Cache may not be populated.
      </Alert>
    );
  }

  return (
    <div className={cn(SPACING.subsection, className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className={TYPOGRAPHY.h3.standard}>Top Skills</h3>
        <Badge variant="secondary">{displayedSkills.length} Skills</Badge>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedSkills.map((item) => (
          <Link
            key={item.skill.id}
            href={ensureAbsoluteUrl(`https://www.credly.com/skills/${item.skill.vanity_slug}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="p-4 hover:shadow-md transition-base hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    TYPOGRAPHY.h3.standard,
                    'group-hover:text-primary transition-colors'
                  )}
                >
                  {item.skill.name}
                </span>

                <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{item.count}x</span>
                </Badge>
              </div>

              {/* Badge count indicator */}
              <p className="text-sm text-muted-foreground mt-2">
                In {item.count} {item.count === 1 ? 'certification' : 'certifications'}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {limit && totalCount > limit && viewMoreUrl && (
        <div className="text-center">
          <Link
            href={viewMoreUrl}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <span>{viewMoreText}</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

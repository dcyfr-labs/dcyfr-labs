/**
 * Server Mini Skills List
 *
 * Server component that fetches Credly skills data directly from Redis
 * and renders a minimalistic skills display. No client-side API calls.
 *
 * @example
 * ```tsx
 * <ServerMiniSkillsList username="dcyfr" />
 * ```
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/common';
import { Lightbulb, ExternalLink } from 'lucide-react';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { cn, ensureAbsoluteUrl } from '@/lib/utils';
import { getCredlySkills } from '@/lib/credly-data';
import type { AggregatedSkill } from '@/lib/credly-data';

interface ServerMiniSkillsListProps {
  username?: string;
  className?: string;
}

// Loading skeleton
function MiniSkillsListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <Lightbulb className="h-4 w-4 animate-pulse" />
      <span className={TYPOGRAPHY.label.small}>Loading skills...</span>
    </div>
  );
}

// Inner component that does the actual data fetching
async function ServerMiniSkillsListInner({
  username = 'dcyfr',
  className,
}: ServerMiniSkillsListProps) {
  const { skills, error } = await getCredlySkills(username);

  console.log('[ServerMiniSkillsList] 📦 Data fetched:', {
    username,
    skillCount: skills.length,
    hasError: !!error,
  });

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
        No skills found.
      </Alert>
    );
  }

  // Group skills by frequency
  const coreSkills = skills.filter((s) => s.count >= 3);
  const proficientSkills = skills.filter((s) => s.count === 2);
  const familiarSkills = skills.filter((s) => s.count === 1);

  return (
    <div className={cn(SPACING.subsection, className)}>
      {/* Header with count */}
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className={TYPOGRAPHY.h3.standard}>Skills</h3>
        <Badge variant="secondary">{skills.length} Total</Badge>
      </div>

      {/* Skills grouped by frequency */}
      <div className={SPACING.subsection}>
        {/* High Frequency Skills (3+ certifications) */}
        {coreSkills.length > 0 && (
          <div>
            <h4 className={cn(TYPOGRAPHY.label.small, 'text-muted-foreground mb-3')}>
              Core Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {coreSkills.map((item: AggregatedSkill) => (
                <Link
                  key={item.skill.id}
                  href={ensureAbsoluteUrl(
                    `https://www.credly.com/skills/${item.skill.vanity_slug}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.count} certifications`}
                >
                  <Badge
                    variant="default"
                    className="hover:bg-primary/80 transition-colors cursor-pointer"
                  >
                    {item.skill.name}
                    <span className="ml-1.5 text-xs opacity-70">×{item.count}</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Medium Frequency Skills (2 certifications) */}
        {proficientSkills.length > 0 && (
          <div>
            <h4 className={cn(TYPOGRAPHY.label.small, 'text-muted-foreground mb-3')}>Proficient</h4>
            <div className="flex flex-wrap gap-2">
              {proficientSkills.map((item: AggregatedSkill) => (
                <Link
                  key={item.skill.id}
                  href={ensureAbsoluteUrl(
                    `https://www.credly.com/skills/${item.skill.vanity_slug}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.count} certifications`}
                >
                  <Badge
                    variant="secondary"
                    className="hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    {item.skill.name}
                    <span className="ml-1.5 text-xs opacity-70">×{item.count}</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Low Frequency Skills (1 certification) */}
        {familiarSkills.length > 0 && (
          <div>
            <h4 className={cn(TYPOGRAPHY.label.small, 'text-muted-foreground mb-3')}>Familiar</h4>
            <div className="flex flex-wrap gap-2">
              {familiarSkills.map((item: AggregatedSkill) => (
                <Link
                  key={item.skill.id}
                  href={ensureAbsoluteUrl(
                    `https://www.credly.com/skills/${item.skill.vanity_slug}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    variant="outline"
                    className="hover:bg-accent transition-colors cursor-pointer"
                  >
                    {item.skill.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View all skills link */}
      <div className="mt-6 pt-4 border-t">
        <Link
          href={ensureAbsoluteUrl(`https://www.credly.com/users/${username}/badges`)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-2',
            TYPOGRAPHY.label.small,
            'text-primary hover:underline'
          )}
        >
          <span>Verify on Credly</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export function ServerMiniSkillsList(props: ServerMiniSkillsListProps) {
  return (
    <Suspense fallback={<MiniSkillsListSkeleton className={props.className} />}>
      <ServerMiniSkillsListInner {...props} />
    </Suspense>
  );
}

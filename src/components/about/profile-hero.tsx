import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
} from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { Section, ProfileAvatar } from '@/components/common';

interface ProfileHeroProps {
  userProfile: string;
  name: string;
  title: string;
  subtitle?: string;
  summary: string;
  badges: Array<{
    icon: ReactNode;
    label: string;
  }>;
}

/**
 * ProfileHero Component
 *
 * Shared hero section for profile pages (Drew, DCYFR).
 * Displays avatar, name, title, summary, and capability badges.
 * Uses prose max-width for optimal readability.
 */
export function ProfileHero({
  userProfile,
  name,
  title,
  subtitle,
  summary,
  badges,
}: ProfileHeroProps) {
  return (
    <section id={`${userProfile}-hero`} className="pt-28 md:pt-32 lg:pt-36 pb-8 md:pb-12">
      <div className={cn(`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING}`)}>
        <div
          className={cn(
            'flex flex-col md:flex-row items-center md:items-start gap-4',
            SPACING.content
          )}
        >
          {/* Avatar */}
          <div className="shrink-0 *:mt-0">
            <ProfileAvatar userProfile={userProfile} size="lg" />
          </div>

          {/* Content */}
          <div className={cn('flex-1', SPACING.content)}>
            <div>
              <h2 className={cn(TYPOGRAPHY.h1.hero, 'font-serif')}>{name}</h2>
              <p className="">{title}</p>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <p className={TYPOGRAPHY.description}>{summary}</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {badge.icon}
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

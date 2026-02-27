import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HOVER_EFFECTS, IMAGE_PLACEHOLDER } from '@/lib/design-tokens';
import { Sparkles } from 'lucide-react';
import type { TeamMember } from '@/types/team';

/**
 * TeamMemberCard Component
 *
 * Unified component for displaying team member profiles across the site.
 * Supports two layout variants:
 * - "detailed": Full profile with avatar, badges, description, and strengths/capabilities
 *   Used on /about page (meet-the-team section)
 * - "compact": Smaller card with avatar, role, and short contribution text
 *   Used on /sponsors page, with link to detailed profile
 *
 * Future Extension:
 * - Add "bio" layout for dedicated team member bio pages (/team/drew, /team/dcyfr)
 * - Add slug/profileUrl to TeamMember type for routing
 *
 * @example
 * ```tsx
 * // Detailed layout (about page)
 * <TeamMemberCard member={teamMember} layout="detailed" />
 *
 * // Compact layout with link (sponsors page)
 * <TeamMemberCard
 *   member={teamMember}
 *   layout="compact"
 *   contribution="Brief contribution text"
 *   linkTo="/about#meet-the-team"
 * />
 * ```
 */

export type TeamMemberCardLayout = 'detailed' | 'compact';

interface TeamMemberCardProps {
  /** Team member data from @/data/team */
  member: TeamMember;
  /** Layout variant */
  layout?: TeamMemberCardLayout;
  /** Short contribution text for compact layout */
  contribution?: string;
  /** Link destination for compact cards (e.g., "/about#meet-the-team") */
  linkTo?: string;
  /** Avatar image URL override (default: /images/avatar.jpg for humans) */
  avatarUrl?: string;
  /** Additional className for the card */
  className?: string;
}

/**
 * Avatar rendering based on member type
 */
function MemberAvatar({
  member,
  size,
  avatarUrl,
}: {
  member: TeamMember;
  size: 'sm' | 'md';
  avatarUrl?: string;
}) {
  const isAI = member.avatarType === 'icon';
  const sizeClasses = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  const iconSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const sparkleSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (isAI) {
    return (
      <div className="relative shrink-0">
        <div
          className={`${sizeClasses} rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-border group-hover:ring-primary/50 transition-theme`}
        >
          {member.avatarIcon && <member.avatarIcon className={`${iconSize} text-primary`} />}
        </div>
        <div className="absolute -bottom-1 -right-1">
          <Sparkles className={`${sparkleSize} text-primary`} />
        </div>
      </div>
    );
  }

  const imageSrc = avatarUrl || member.avatarImagePath || '/images/avatar.jpg';

  return (
    <div
      className={`relative ${sizeClasses} rounded-full overflow-hidden shrink-0 ring-2 ring-border group-hover:ring-primary/50 transition-theme`}
    >
      <Image
        src={imageSrc}
        alt={`${member.name}'s avatar`}
        fill
        className="object-cover"
        sizes={size === 'sm' ? '48px' : '64px'}
        placeholder="blur"
        blurDataURL={IMAGE_PLACEHOLDER.blur}
      />
    </div>
  );
}

/**
 * Detailed layout - used on /about page
 * Shows full profile with badges, description, strengths/capabilities
 */
function DetailedLayout({
  member,
  avatarUrl,
  linkTo,
  className,
}: {
  member: TeamMember;
  avatarUrl?: string;
  linkTo?: string;
  className?: string;
}) {
  const isAI = member.avatarType === 'icon';

  const cardContent = (
    <Card
      className={`p-5 space-y-4 ${isAI ? 'border-primary/20' : ''} ${linkTo ? HOVER_EFFECTS.card : HOVER_EFFECTS.cardSubtle} ${className || ''}`}
    >
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-row items-center gap-4">
          <MemberAvatar member={member} size="sm" avatarUrl={avatarUrl} />
          <div className="flex-1">
            <h3 className="font-medium text-lg">{member.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{member.title}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{member.description}</p>
      </div>
    </Card>
  );

  if (linkTo) {
    const isExternal = linkTo.startsWith('http');
    return (
      <Link
        href={linkTo}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

/**
 * Compact layout - used on /sponsors page
 * Smaller card with avatar, role, and contribution text
 * Can link to detailed profile
 */
function CompactLayout({
  member,
  contribution,
  linkTo,
  avatarUrl,
  className,
}: {
  member: TeamMember;
  contribution?: string;
  linkTo?: string;
  avatarUrl?: string;
  className?: string;
}) {
  const cardContent = (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-row items-center gap-4">
        <MemberAvatar member={member} size="sm" avatarUrl={avatarUrl} />
        <div className="flex-1">
          <h3 className="font-medium text-lg">{member.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{member.title}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{member.description}</p>
    </div>
  );

  const cardClassName = `group bg-card border border-border rounded-lg p-4 ${HOVER_EFFECTS.cardSubtle} ${className || ''}`;

  if (linkTo) {
    const isExternal = linkTo.startsWith('http');
    return (
      <Link
        href={linkTo}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={cardClassName}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className={cardClassName}>{cardContent}</div>;
}

/**
 * Main TeamMemberCard component
 */
export function TeamMemberCard({
  member,
  layout = 'detailed',
  contribution,
  linkTo,
  avatarUrl,
  className,
}: TeamMemberCardProps) {
  if (layout === 'compact') {
    return (
      <CompactLayout
        member={member}
        contribution={contribution}
        linkTo={linkTo}
        avatarUrl={avatarUrl}
        className={className}
      />
    );
  }

  return (
    <DetailedLayout member={member} avatarUrl={avatarUrl} linkTo={linkTo} className={className} />
  );
}

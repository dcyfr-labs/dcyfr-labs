'use client';

/**
 * Badge Wallet Client Component
 *
 * Pure client component that renders badge data received as props.
 * Does NOT fetch data - receives pre-fetched data from server component.
 *
 * This eliminates:
 * - Rate limiting issues (no API calls)
 * - Hydration mismatches (data is consistent)
 * - Loading states (handled by Suspense in server wrapper)
 */

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/common';
import { Award, ExternalLink, Clock } from 'lucide-react';
import { SPACING, TYPOGRAPHY, HOVER_EFFECTS, ANIMATION, BORDERS } from '@/lib/design-tokens';
import { cn, ensureAbsoluteUrl } from '@/lib/utils';
import type { CredlyBadge } from '@/types/credly';

// ============================================================================
// TYPES
// ============================================================================

interface BadgeWalletClientProps {
  badges: CredlyBadge[];
  totalCount: number;
  error?: string;
  showLatestOnly?: boolean;
  limit?: number;
  viewMoreUrl?: string;
  viewMoreText?: string;
  className?: string;
}

interface BadgeCardProps {
  badge: CredlyBadge;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Individual badge card
 */
function BadgeCard({ badge }: BadgeCardProps) {
  const issuedDate = new Date(badge.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  // Extract issuer name from entities array (find primary entity)
  const issuerName =
    badge.issuer?.entities?.find((e) => e.primary)?.entity?.name ||
    badge.issuer?.entities?.[0]?.entity?.name ||
    'Unknown Issuer';

  // Construct public URL from badge ID
  const publicUrl = `https://www.credly.com/badges/${badge.id}`;
  const safeUrl = ensureAbsoluteUrl(publicUrl);

  return (
    <Link href={safeUrl} target="_blank" rel="noopener noreferrer" className="block group">
      <Card className={cn('p-4 h-full', HOVER_EFFECTS.card)}>
        <div className="flex flex-col items-center text-center gap-4">
          {/* Badge Image */}
          <div className={cn('relative w-36 h-36 shrink-0 bg-muted/30 p-3', BORDERS.card)}>
            <Image
              src={badge.image_url}
              alt={badge.badge_template?.name || 'Badge'}
              fill
              sizes="(max-width: 768px) 144px, 144px"
              quality={95}
              priority={false}
              className="object-contain"
            />
          </div>

          {/* Badge Info */}
          <div className="flex-1 space-y-2">
            <h3
              className={cn(TYPOGRAPHY.h3.standard, 'group-hover:text-primary transition-colors')}
            >
              {badge.badge_template?.name || 'Unknown Badge'}
            </h3>

            <p className={cn(TYPOGRAPHY.label.small, 'text-muted-foreground')}>
              Issued by {issuerName}
            </p>

            <div className="flex items-center gap-1.5 justify-center text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className={TYPOGRAPHY.label.xs}>Issued {issuedDate}</span>
            </div>
          </div>

          {/* View Badge Link */}
          <div
            className={cn(
              'flex items-center gap-1.5',
              TYPOGRAPHY.label.small,
              'text-primary group-hover:gap-2',
              ANIMATION.transition.movement
            )}
          >
            <span>View Badge</span>
            <ExternalLink className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Client-side badge wallet renderer
 *
 * Receives pre-fetched data from server component.
 * No API calls, no hooks - pure rendering.
 */
export function BadgeWalletClient({
  badges,
  totalCount,
  error,
  showLatestOnly = false,
  limit,
  viewMoreUrl,
  viewMoreText = 'View all certifications',
  className,
}: BadgeWalletClientProps) {
  // Memoize displayed badges to prevent unnecessary re-renders
  const displayedBadges = useMemo(() => {
    if (showLatestOnly && limit) {
      return badges.slice(0, limit);
    }
    return badges;
  }, [badges, showLatestOnly, limit]);

  // Error state
  if (error) {
    return (
      <Alert type="critical" className={className}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (badges.length === 0) {
    return (
      <Alert type="info" className={className}>
        No badges found. Cache may not be populated.
      </Alert>
    );
  }

  return (
    <div className={cn(SPACING.subsection, className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <h3 className={TYPOGRAPHY.h3.standard}>{showLatestOnly ? 'Latest Badges' : 'Badges'}</h3>
        {totalCount > 0 && <Badge variant="secondary">{totalCount} Total</Badge>}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>

      {/* View All Link */}
      {showLatestOnly && totalCount > (limit || 0) && viewMoreUrl && (
        <div className="text-center">
          <Link
            href={viewMoreUrl}
            className={cn('inline-flex items-center gap-2 text-primary', HOVER_EFFECTS.link)}
          >
            <span>{viewMoreText.replace('{count}', String(totalCount))}</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

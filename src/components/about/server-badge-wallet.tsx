/**
 * Server Badge Wallet Component
 *
 * Server-side wrapper that fetches Credly badge data from Redis
 * and passes it to the client-side BadgeWallet component.
 *
 * Benefits:
 * - No rate limiting (direct Redis access)
 * - Faster initial render (data fetched during SSR)
 * - No client-side API calls
 * - Shared cache between dev and preview
 *
 * @example
 * // In a server component (page.tsx)
 * <ServerBadgeWallet username="dcyfr" limit={3} showLatestOnly />
 */

import { Suspense } from 'react';
import { getCredlyBadges } from '@/lib/credly-data';
import { BadgeWalletClient } from './badge-wallet-client';
import { BadgeWalletSkeleton } from './badge-wallet-skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface ServerBadgeWalletProps {
  username?: string;
  limit?: number;
  showLatestOnly?: boolean;
  viewMoreUrl?: string;
  viewMoreText?: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Server-side badge wallet that fetches data from Redis
 */
async function ServerBadgeWalletInner({
  username = 'dcyfr',
  limit,
  showLatestOnly = false,
  viewMoreUrl,
  viewMoreText = 'View all certifications',
  className,
}: ServerBadgeWalletProps) {
  // Fetch data server-side from Redis
  const data = await getCredlyBadges(username, limit);

  // Log for debugging
  console.log('[ServerBadgeWallet] 📦 Data fetched:', {
    username,
    limit,
    badgeCount: data.badges.length,
    totalCount: data.totalCount,
    source: data.source,
    hasError: !!data.error,
  });

  // Pass data to client component
  return (
    <BadgeWalletClient
      badges={data.badges}
      totalCount={data.totalCount}
      error={data.error}
      showLatestOnly={showLatestOnly}
      limit={limit}
      viewMoreUrl={viewMoreUrl}
      viewMoreText={viewMoreText}
      className={className}
    />
  );
}

/**
 * Server Badge Wallet with Suspense boundary
 *
 * Use this component in server pages for automatic loading states
 */
export function ServerBadgeWallet(props: ServerBadgeWalletProps) {
  return (
    <Suspense fallback={<BadgeWalletSkeleton count={props.limit || 6} />}>
      <ServerBadgeWalletInner {...props} />
    </Suspense>
  );
}

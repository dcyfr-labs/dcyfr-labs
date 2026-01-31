/**
 * Server Skills Wallet Component
 *
 * Server-side wrapper that fetches Credly skills data from Redis
 * and passes it to the client-side SkillsWalletClient component.
 *
 * Benefits:
 * - No rate limiting (direct Redis access)
 * - Faster initial render (data fetched during SSR)
 * - No client-side API calls
 * - Shared cache between dev and preview
 *
 * @example
 * // In a server component (page.tsx)
 * <ServerSkillsWallet username="dcyfr" limit={9} />
 */

import { Suspense } from 'react';
import { getCredlySkills } from '@/lib/credly-data';
import { SkillsWalletClient } from './skills-wallet-client';
import { SkillsWalletSkeleton } from './skills-wallet-skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface ServerSkillsWalletProps {
  username?: string;
  limit?: number;
  viewMoreUrl?: string;
  viewMoreText?: string;
  className?: string;
  excludeSkills?: string[];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Server-side skills wallet that fetches data from Redis
 */
async function ServerSkillsWalletInner({
  username = 'dcyfr',
  limit,
  viewMoreUrl,
  viewMoreText = 'View all skills',
  className,
  excludeSkills = [],
}: ServerSkillsWalletProps) {
  // Fetch data server-side from Redis
  const data = await getCredlySkills(username, excludeSkills);

  // Log for debugging
  console.log('[ServerSkillsWallet] 📦 Data fetched:', {
    username,
    limit,
    skillCount: data.skills.length,
    source: data.source,
    hasError: !!data.error,
    excludedCount: excludeSkills.length,
  });

  // Pass data to client component
  return (
    <SkillsWalletClient
      skills={data.skills}
      totalCount={data.totalCount}
      error={data.error}
      limit={limit}
      viewMoreUrl={viewMoreUrl}
      viewMoreText={viewMoreText}
      className={className}
    />
  );
}

/**
 * Server Skills Wallet with Suspense boundary
 *
 * Use this component in server pages for automatic loading states
 */
export function ServerSkillsWallet(props: ServerSkillsWalletProps) {
  return (
    <Suspense fallback={<SkillsWalletSkeleton categoryCount={Math.min(props.limit || 6, 4)} />}>
      <ServerSkillsWalletInner {...props} />
    </Suspense>
  );
}

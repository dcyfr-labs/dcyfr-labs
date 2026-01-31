/**
 * Server Resume Stats
 *
 * Server component wrapper that fetches badge count from Redis
 * and passes it to the client-side ResumeStats component.
 *
 * This eliminates client-side API calls and rate limiting issues.
 *
 * @example
 * ```tsx
 * <ServerResumeStats />
 * ```
 */

import { Suspense } from 'react';
import { ResumeStats } from './resume-stats';
import { getCredlyBadges } from '@/lib/credly-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { BORDERS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

// Simple skeleton for the stats grid
function ResumeStatsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label="Loading career metrics"
    >
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className={cn('p-4', BORDERS.card)}>
          <div className="space-y-3">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Inner component that does the actual data fetching
async function ServerResumeStatsInner() {
  const { totalCount } = await getCredlyBadges('dcyfr');

  console.log('[ServerResumeStats] 📦 Data fetched:', {
    totalBadges: totalCount,
  });

  return <ResumeStats totalBadges={totalCount} />;
}

// Main export with Suspense wrapper
export function ServerResumeStats() {
  return (
    <Suspense fallback={<ResumeStatsSkeleton />}>
      <ServerResumeStatsInner />
    </Suspense>
  );
}

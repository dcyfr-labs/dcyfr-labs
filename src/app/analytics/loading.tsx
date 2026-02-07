import { PageLayout } from '@/components/layouts';
import { SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function AnalyticsLoading() {
  return (
    <PageLayout>
      <div className={cn('mx-auto', CONTAINER_WIDTHS.standard)}>
        <div className={cn('space-y-6', `mt-${SPACING.content}`)}>
          {/* Header skeleton */}
          <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded-md" />

          {/* Stats grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>

          {/* Table skeleton */}
          <div className="border rounded-lg p-6 space-y-3">
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

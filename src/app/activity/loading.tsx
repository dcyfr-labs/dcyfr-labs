import { PageLayout } from '@/components/layouts';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function ActivityLoading() {
  return (
    <PageLayout>
      <div className={cn('mx-auto', CONTAINER_WIDTHS.standard)}>
        <div className={cn('space-y-4', `mt-${SPACING.content}`)}>
          {/* Header skeleton */}
          <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-80 bg-muted animate-pulse rounded-md" />

          {/* Filter bar skeleton */}
          <div className="flex gap-2 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-20 bg-muted animate-pulse rounded-full" />
            ))}
          </div>

          {/* Activity feed skeleton */}
          <div className={cn('space-y-4', `mt-${SPACING.content}`)}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg">
                <div className="h-10 w-10 bg-muted animate-pulse rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

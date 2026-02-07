import { PageLayout } from '@/components/layouts';
import { SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function BookmarksLoading() {
  return (
    <PageLayout>
      <div className={cn('mx-auto', CONTAINER_WIDTHS.standard)}>
        <div className={cn('space-y-4', `mt-${SPACING.content}`)}>
          {/* Header skeleton */}
          <div className="h-10 w-44 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded-md" />

          {/* Bookmarks grid skeleton */}
          <div
            className={cn(
              'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
              `mt-${SPACING.content}`
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

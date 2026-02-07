import { PageLayout } from '@/components/layouts';
import { SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function WorkLoading() {
  return (
    <PageLayout>
      <div className={cn('mx-auto', CONTAINER_WIDTHS.standard)}>
        <div className={cn('space-y-4', `mt-${SPACING.content}`)}>
          {/* Header skeleton */}
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-56 bg-muted animate-pulse rounded-md" />

          {/* Filter skeleton */}
          <div className="flex gap-2 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-20 bg-muted animate-pulse rounded-full" />
            ))}
          </div>

          {/* Projects grid skeleton */}
          <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', `mt-${SPACING.content}`)}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted animate-pulse rounded" />
                  <div className="flex gap-2 mt-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-5 w-14 bg-muted animate-pulse rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

import { PageLayout } from '@/components/layouts';
import { SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function SponsorsLoading() {
  return (
    <PageLayout>
      <div className={cn('mx-auto', CONTAINER_WIDTHS.standard)}>
        <div className={cn('space-y-6', `mt-${SPACING.content}`)}>
          {/* Header skeleton */}
          <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
          <div className="h-5 w-72 bg-muted animate-pulse rounded-md" />

          {/* Sponsor tiers skeleton */}
          {Array.from({ length: 3 }).map((_, tier) => (
            <div key={tier} className="space-y-4">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 bg-muted animate-pulse rounded-full shrink-0" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

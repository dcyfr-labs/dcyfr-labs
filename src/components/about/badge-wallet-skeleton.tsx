/**
 * Badge Wallet Skeleton
 *
 * Loading skeleton for Credly badge wallet display.
 * Matches the structure of BadgeWallet component on resume page.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonHeading } from "@/components/ui/skeleton-primitives";
import { SPACING } from "@/lib/design-tokens";

export interface BadgeWalletSkeletonProps {
  /** Number of badge placeholders to show */
  count?: number;
  /** Additional classes */
  className?: string;
}

/**
 * Skeleton for BadgeWallet component
 * Shows grid of badge placeholders
 */
export function BadgeWalletSkeleton({
  count = 6,
  className,
}: BadgeWalletSkeletonProps) {
  return (
    <div className={className}>
      {/* Header - matches real component icon + heading + badge layout */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-md" />
        <SkeletonHeading level="h3" width="w-32" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-4 rounded-lg border"
            style={{
              animationDelay: `${i * 50}ms`, // Stagger effect
            }}
          >
            {/* Badge image */}
            <Skeleton className="h-24 w-24 rounded-full mb-3" />

            {/* Badge name */}
            <Skeleton className="h-5 w-full mb-1" />

            {/* Issuer */}
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>

    </div>
  );
}

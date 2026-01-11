/**
 * Skills Wallet Skeleton
 *
 * Loading skeleton for skills display on resume page.
 * Matches the structure of SkillsWallet component.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonHeading } from "@/components/ui/skeleton-primitives";
import { SPACING } from "@/lib/design-tokens";

export interface SkillsWalletSkeletonProps {
  /** Number of skill categories to show */
  categoryCount?: number;
  /** Skills per category */
  skillsPerCategory?: number;
  /** Additional classes */
  className?: string;
}

/**
 * Skeleton for SkillsWallet component
 * Shows categorized skill placeholders
 */
export function SkillsWalletSkeleton({
  categoryCount = 4,
  skillsPerCategory = 6,
  className,
}: SkillsWalletSkeletonProps) {
  return (
    <div className={className}>
      {/* Header - matches real component icon + heading + badge layout */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-md" />
        <SkeletonHeading level="h3" width="w-32" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>

      {/* Skills grid - matches real component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(skillsPerCategory)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            {/* Skill name + count */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>

            {/* Badge count text */}
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

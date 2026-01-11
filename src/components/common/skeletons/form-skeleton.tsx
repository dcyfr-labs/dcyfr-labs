/**
 * Form Skeleton
 *
 * Generic loading skeleton for form components.
 * Used for contact forms, search forms, and other input-heavy interfaces.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { SPACING } from "@/lib/design-tokens";

export interface FormSkeletonProps {
  /** Number of form fields to show */
  fieldCount?: number;
  /** Show submit button skeleton */
  showButton?: boolean;
  /** Additional classes */
  className?: string;
}

/**
 * Skeleton for form components
 * Displays field labels and input placeholders
 */
export function FormSkeleton({
  fieldCount = 3,
  showButton = true,
  className,
}: FormSkeletonProps) {
  return (
    <div className={className}>
      <div className={SPACING.content}>
        {[...Array(fieldCount)].map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Label */}
            <Skeleton className="h-4 w-24" />

            {/* Input field */}
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}

        {/* Submit button */}
        {showButton && <Skeleton className="h-10 w-32 rounded-md" />}
      </div>
    </div>
  );
}

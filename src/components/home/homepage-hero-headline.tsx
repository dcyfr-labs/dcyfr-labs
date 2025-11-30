/**
 * Homepage Hero Headline Component
 * 
 * Secondary headline displaying professional title/specialty.
 * Provides clarity on profession at first glance.
 * 
 * @component
 * @example
 * ```tsx
 * <HomepageHeroHeadline />
 * ```
 */

import { TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface HomepageHeroHeadlineProps {
  /** Optional custom headline text */
  text?: string;
  /** Additional CSS classes */
  className?: string;
}

export function HomepageHeroHeadline({
  text = "Cyber Architecture & Design",
  className,
}: HomepageHeroHeadlineProps) {
  return (
    <p
      className={cn(
        "font-medium text-muted-foreground",
        TYPOGRAPHY.h3.standard,
        className
      )}
    >
      {text}
    </p>
  );
}

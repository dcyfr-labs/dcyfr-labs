import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Props for the SectionHeader component
 */
interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional link href for the action button */
  actionHref?: string;
  /** Optional action button label (defaults to "View all") */
  actionLabel?: string;
  /** HTML heading level (defaults to h2) */
  level?: "h1" | "h2" | "h3";
}

/**
 * SectionHeader Component
 *
 * Reusable section header with title and optional action button.
 * Used across the site for consistent section styling on archive and list pages.
 *
 * Features:
 * - Flexible heading level (h1, h2, h3)
 * - Optional action button with customizable label
 * - Consistent border-bottom styling
 * - Responsive spacing
 * - Follows design token typography patterns
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Latest articles"
 *   actionHref="/blog"
 *   actionLabel="View all"
 * />
 * ```
 */
export function SectionHeader({
  title,
  actionHref,
  actionLabel = "View all",
  level = "h2",
}: SectionHeaderProps) {
  const HeadingTag = level;
  const headingClass =
    level === "h2" ? TYPOGRAPHY.h2.standard : TYPOGRAPHY.h1.standard;

  return (
    <div className="flex items-center justify-between mb-8">
      <HeadingTag className={headingClass}>{title}</HeadingTag>
      {actionHref && (
        <Button variant="ghost" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

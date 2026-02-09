/**
 * CodeComparison Component
 *
 * Displays side-by-side code comparison with before/after states.
 * Used in blog posts to illustrate code improvements and refactorings.
 *
 * @component
 * @example
 * ```tsx
 * <CodeComparison
 *   before="const x = 1;"
 *   after="const x: number = 1;"
 *   beforeLabel="Before"
 *   afterLabel="After"
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

interface CodeComparisonProps {
  /** Code snippet before the change */
  before: string;
  /** Code snippet after the change */
  after: string;
  /** Optional label for the before section (default: "Before") */
  beforeLabel?: string;
  /** Optional label for the after section (default: "After")  */
  afterLabel?: string;
  /** Optional language for syntax highlighting (default: "typescript") */
  language?: string;
  /** Optional className */
  className?: string;
}

export function CodeComparison({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  language = 'typescript',
  className,
}: CodeComparisonProps) {
  return (
    <div className={cn('not-prose', SPACING.content, 'mb-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border border-border">
            <span className={cn(TYPOGRAPHY.caption, 'text-muted-foreground font-medium')}>
              {beforeLabel}
            </span>
          </div>
          <div className="relative">
            <pre className="!mt-0 rounded-t-none overflow-x-auto">
              <code className={`language-${language}`}>{before}</code>
            </pre>
          </div>
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border border-border">
            <span className={cn(TYPOGRAPHY.caption, 'text-muted-foreground font-medium')}>
              {afterLabel}
            </span>
          </div>
          <div className="relative">
            <pre className="!mt-0 rounded-t-none overflow-x-auto">
              <code className={`language-${language}`}>{after}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

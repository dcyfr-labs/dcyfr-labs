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
  before: React.ReactNode;
  /** Code snippet after the change */
  after: React.ReactNode;
  /** Optional label for the before section (default: "Before") */
  beforeLabel?: string;
  /** Optional label for the after section (default: "After")  */
  afterLabel?: string;
  /** Optional language for syntax highlighting (default: "typescript") */
  language?: string;
  /** Optional className */
  className?: string;
}

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((item) => extractText(item)).join('');
  }

  if (React.isValidElement(node)) {
    return extractText(node.props.children as React.ReactNode);
  }

  return String(node);
}

export function CodeComparison({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  language = 'typescript',
  className,
}: Readonly<CodeComparisonProps>) {
  const beforeCode = extractText(before);
  const afterCode = extractText(after);

  return (
    <div className={cn('not-prose', SPACING.content, 'mb-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Before */}
        <div className={SPACING.compact}>
          <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border border-border">
            <span className={cn(TYPOGRAPHY.metadata, 'text-muted-foreground font-medium')}>
              {beforeLabel}
            </span>
          </div>
          <div className="relative">
            <pre className="mt-0! rounded-t-none overflow-x-auto">
              <code
                className={`language-${language} block text-sm leading-relaxed text-foreground`}
              >
                {beforeCode}
              </code>
            </pre>
          </div>
        </div>

        {/* After */}
        <div className={SPACING.compact}>
          <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border border-border">
            <span className={cn(TYPOGRAPHY.metadata, 'text-muted-foreground font-medium')}>
              {afterLabel}
            </span>
          </div>
          <div className="relative">
            <pre className="mt-0! rounded-t-none overflow-x-auto">
              <code
                className={`language-${language} block text-sm leading-relaxed text-foreground`}
              >
                {afterCode}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

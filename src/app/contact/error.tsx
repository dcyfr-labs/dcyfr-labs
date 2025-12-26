'use client';

import { Button } from '@/components/ui/button';
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={cn('mx-auto', CONTAINER_WIDTHS.narrow, CONTAINER_PADDING)}>
        <div className={cn('text-center', SPACING.section)}>
          <h1 className={TYPOGRAPHY.h1.standard}>Failed to load contact page</h1>

          <div className={SPACING.content}>
            <p className="text-muted-foreground">
              {error.message || 'An unexpected error occurred while loading the contact page.'}
            </p>

            {error.digest && (
              <p className="text-xs text-muted-foreground/70 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

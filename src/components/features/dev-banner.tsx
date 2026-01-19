'use client';
/**
 * DevBanner
 *
 * Displays a dismissible development banner with fade and slide animations when
 * running in development. The dismissed state is preserved only for the
 * duration of the browser session (sessionStorage).
 *
 * Fixed positioning above the sticky header to prevent layout issues and
 * ensure proper layering with the sticky navigation.
 */
import { useState, useLayoutEffect } from 'react';
import { Alert } from '@/components/common';
import { CONTAINER_WIDTHS, CONTAINER_PADDING, ANIMATION } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'dev-banner-dismissed';

export function DevBanner() {
  const persistAcrossSessions = process.env.NEXT_PUBLIC_DEV_BANNER_PERSIST === 'true';

  // Initialize to true for server-rendered and initial client hydration to
  // avoid hydration mismatches. The real value is read on mount (useEffect)
  // and the state adjusted accordingly.
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleClose = () => {
    setIsAnimating(true);
    // Wait for slide-up animation to complete
    setTimeout(() => {
      try {
        const storage = persistAcrossSessions ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEY, 'true');
        // Dispatch storage event for same-window listeners
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: 'true',
            storageArea: storage,
          })
        );
      } catch (err) {
        // ignore
      }
      setIsOpen(false);
      setIsAnimating(false);
    }, 300); // Match animation duration
  };

  // Read the storage on mount and update `isOpen` to reflect the user's
  // persisted dismissal preference. We do this in an effect to avoid
  // hydration mismatch with the server-rendered visible banner.
  useLayoutEffect(() => {
    try {
      const storage = persistAcrossSessions ? localStorage : sessionStorage;
      const dismissed = storage.getItem(STORAGE_KEY) === 'true';
      // It's safe to synchronously set the state here on mount to reflect the
      // persisted dismissal preference. This avoids a flash of content during
      // hydration and ensures client state reflects persisted storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (dismissed && isOpen) setIsOpen(false);
    } catch (err) {
      // ignore storage access errors and keep banner visible
    }
  }, [persistAcrossSessions, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Dev Banner"
      className={cn(
        'fixed top-0 left-0 right-0 w-full z-50 bg-background border-b transition-all',
        ANIMATION.duration.normal,
        isAnimating
          ? 'opacity-0 -translate-y-full pointer-events-none'
          : 'opacity-100 translate-y-0'
      )}
    >
      <div className={cn('mx-auto', CONTAINER_WIDTHS.content, CONTAINER_PADDING, 'py-3')}>
        <Alert
          type="notice"
          dismissible
          onDismiss={handleClose}
          dismissLabel="Close Dev Banner"
          dismissTestId="dev-banner-close"
          className="my-0"
        >
          <strong>DEV MODE</strong>: This is a live preview and some features may be experimental or
          incomplete.
        </Alert>
      </div>
    </div>
  );
}

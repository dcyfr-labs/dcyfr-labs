"use client"
/**
 * DevBanner
 *
 * Displays a dismissible development banner across the top of the site when
 * running in development. The dismissed state is preserved only for the
 * duration of the browser session (sessionStorage).
 */
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { X } from "lucide-react";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SEMANTIC_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dev-banner-dismissed";

export function DevBanner() {
  const persistAcrossSessions = process.env.NEXT_PUBLIC_DEV_BANNER_PERSIST === 'true';

  // Initialize to true for server-rendered and initial client hydration to
  // avoid hydration mismatches. The real value is read on mount (useEffect)
  // and the state adjusted accordingly.
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleClose = () => {
    try {
      const storage = persistAcrossSessions ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY, "true");
    } catch (err) {
      // ignore
    }
    setIsOpen(false);
  };
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Attach a native click event handler as a fallback for environments
  // where synthetic React events may not fire as expected (e.g., some E2E runners)
  // Use a callback ref to ensure the handler is attached/unattached as the
  // button mounts/unmounts during the component's lifecycle.
  const setCloseButtonRef = (el: HTMLButtonElement | null) => {
    if (closeButtonRef.current) {
      closeButtonRef.current.removeEventListener('click', handleClose);
    }
    closeButtonRef.current = el;
    if (el) {
      el.addEventListener('click', handleClose);
    }
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

  return (
    <div
      role="region"
      aria-label="Dev Banner"
      aria-hidden={!isOpen}
      className={cn("mx-auto", CONTAINER_WIDTHS.content, CONTAINER_PADDING, "pt-4", !isOpen && "hidden")}
    >
      <div className={cn("rounded-lg p-3 flex items-center justify-between", SEMANTIC_COLORS.alert.info.border, SEMANTIC_COLORS.alert.info.container)}>
        <div className="flex items-center gap-3">
          <strong className={cn("text-sm", SEMANTIC_COLORS.alert.info.text)}>Development Mode</strong>
          <span className={cn("text-sm", SEMANTIC_COLORS.alert.info.text)}>
            This site is running in development. Some features may be incomplete or not work as expected.
          </span>
        </div>

        <button
          type="button"
          aria-label="Close Dev Banner"
          className={cn("p-2 rounded-md hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1", SEMANTIC_COLORS.alert.info.icon)}
          data-testid="dev-banner-close"
          onClick={handleClose}
          onPointerDown={handleClose}
          ref={setCloseButtonRef}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

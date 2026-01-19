'use client';

import { useState } from 'react';
import { List, ChevronUp, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HOVER_EFFECTS, BORDERS, SHADOWS } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

/**
 * FAB Menu Component
 *
 * A consolidated floating action button menu that expands on hover to reveal
 * multiple action buttons. Designed for mobile blog post pages to save screen
 * space while providing quick access to TOC and scroll-to-top functionality.
 *
 * **Positioning Strategy:**
 * - Position: bottom-[76px] = 64px (BottomNav) + 8px (WCAG spacing) + 4px (margin)
 * - Safe Area: Adds pb-[env(safe-area-inset-bottom,0px)] for iOS home indicators
 * - Touch Target: 56×56px exceeds Apple HIG (44px) and Material Design (48px)
 * - Clearance: Never overlaps BottomNav when visible
 *
 * **Animation approach:** Uses CSS animations (Tailwind animate-in) instead of Framer Motion.
 * Simple fade-in/slide-up effects that CSS handles efficiently without JavaScript overhead.
 * The main button rotation uses CSS transforms with transition for smooth rotation.
 *
 * @component
 * @example
 * ```tsx
 * <FABMenu
 *   onTOCClick={() => setTocOpen(true)}
 *   onScrollTop={() => window.scrollTo({ top: 0 })}
 *   showTOC={true}
 *   showScrollTop={isScrolled}
 * />
 * ```
 */

interface FABMenuProps {
  /** Callback when Table of Contents button is clicked */
  onTOCClick: () => void;
  /** Callback when Back to Top button is clicked */
  onScrollTop: () => void;
  /** Whether to show the TOC button */
  showTOC: boolean;
  /** Whether to show the scroll to top button */
  showScrollTop: boolean;
}

export function FABMenu({ onTOCClick, onScrollTop, showTOC, showScrollTop }: FABMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Keyboard handler for button activation
  const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  // Don't render if neither button should be shown
  if (!showTOC && !showScrollTop) {
    return null;
  }

  // If only one button, show it directly without menu
  if (showTOC && !showScrollTop) {
    return (
      <div
        className={cn(
          'md:hidden fixed bottom-[76px] right-4 sm:right-6 z-40 pb-[env(safe-area-inset-bottom,0px)]',
          !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <Button
          size="icon"
          onClick={onTOCClick}
          onKeyDown={(e) => handleKeyDown(e, onTOCClick)}
          className={cn(
            `h-14 w-14 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`,
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Open table of contents"
          tabIndex={0}
        >
          <List className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  if (!showTOC && showScrollTop) {
    return (
      <div
        className={cn(
          'md:hidden fixed bottom-[76px] right-4 sm:right-6 z-40 pb-[env(safe-area-inset-bottom,0px)]',
          !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <Button
          size="icon"
          onClick={onScrollTop}
          onKeyDown={(e) => handleKeyDown(e, onScrollTop)}
          className={cn(
            `h-14 w-14 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`,
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Back to top"
          tabIndex={0}
        >
          <ChevronUp className="h-7 w-7" strokeWidth={2.5} />
        </Button>
      </div>
    );
  }

  // Both buttons available - show expandable menu
  return (
    <div
      className="md:hidden fixed bottom-[76px] right-4 sm:right-6 z-40 pb-[env(safe-area-inset-bottom,0px)]"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col items-end gap-3">
        {isExpanded && (
          <>
            {/* TOC Button */}
            <div
              className={cn(
                !prefersReducedMotion &&
                  'animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200 delay-75'
              )}
            >
              <Button
                size="icon"
                onClick={onTOCClick}
                onKeyDown={(e) => handleKeyDown(e, onTOCClick)}
                className={cn(
                  `h-12 w-12 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`,
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
                aria-label="Open table of contents"
                tabIndex={0}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            {/* Scroll to Top Button */}
            <div
              className={cn(
                !prefersReducedMotion &&
                  'animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200'
              )}
            >
              <Button
                size="icon"
                onClick={onScrollTop}
                onKeyDown={(e) => handleKeyDown(e, onScrollTop)}
                className={cn(
                  `h-12 w-12 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`,
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
                aria-label="Back to top"
                tabIndex={0}
              >
                <ChevronUp className="h-6 w-6" strokeWidth={2.5} />
              </Button>
            </div>
          </>
        )}

        {/* Main Menu Button - Always visible */}
        <div
          className={cn(
            'transition-transform',
            !prefersReducedMotion && 'duration-200',
            isExpanded ? 'rotate-90' : 'rotate-0'
          )}
        >
          <Button
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            onKeyDown={(e) => handleKeyDown(e, () => setIsExpanded(!isExpanded))}
            className={cn(
              `h-14 w-14 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            aria-expanded={isExpanded}
            tabIndex={0}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

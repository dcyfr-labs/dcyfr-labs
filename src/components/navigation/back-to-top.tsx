'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HOVER_EFFECTS, BORDERS, SHADOWS, Z_INDEX } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

/**
 * BackToTop Component - Floating Action Button
 *
 * Scroll-to-top button that appears after scrolling down on pages.
 * Note: Blog post pages use BlogFABMenu instead for a consolidated FAB experience.
 *
 * **Positioning Strategy:**
 * - Position: bottom-[76px] = 64px (BottomNav) + 8px (WCAG spacing) + 4px (margin)
 * - Safe Area: Adds pb-[env(safe-area-inset-bottom,0px)] for iOS home indicators
 * - Touch Target: 56×56px exceeds Apple HIG (44px) and Material Design (48px)
 * - Clearance: Never overlaps BottomNav when visible (meets WCAG 2.5.8 AAA)
 *
 * **Animation approach:** Uses CSS animations (Tailwind animate-in) instead of Framer Motion.
 * Simple fade-in/scale effect that CSS handles efficiently without JavaScript overhead.
 *
 * Visibility:
 * - NOT shown on individual blog post pages (/blog/[slug]) - BlogFABMenu handles this
 * - Can be shown on other pages if needed (currently disabled)
 * - Appears after 400px scroll threshold
 *
 * Design System:
 * - Size: 56px (h-14 w-14) - Standard FAB size
 * - Position: bottom-[76px] on mobile (clears BottomNav + spacing), hidden on desktop
 * - Z-index: 40 (below modals, above content)
 * - Animation: CSS fade-in + zoom-in (animate-in utilities)
 * - Scroll threshold: 400px
 * - Touch target: Meets 44px minimum (56px exceeds), 8px spacing from BottomNav
 * - Safe areas: Respects iOS notches, home indicators, Android gesture bars
 *
 * @component
 * @returns {React.ReactElement} Floating action button or null
 */
export function BackToTop() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Skip on individual blog post pages (BlogFABMenu handles this)
  const isOnBlogPost = pathname?.startsWith('/blog/') && pathname !== '/blog';

  useEffect(() => {
    if (isOnBlogPost) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Early return for feature toggle
      setShow(false);
      return;
    }

    const handleScroll = () => {
      // Show after scrolling 400px (about 1.5 viewports)
      setShow(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOnBlogPost]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard handler for button activation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  // Don't render on blog post pages
  if (isOnBlogPost) {
    return null;
  }

  return show ? (
    <div
      className={cn(
        `md:hidden fixed bottom-[76px] right-4 sm:right-6 ${Z_INDEX.header} pb-[env(safe-area-inset-bottom,0px)]`,
        !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-200'
      )}
    >
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          `h-14 w-14 ${BORDERS.circle} ${SHADOWS.lg} ${HOVER_EFFECTS.button}`,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        aria-label="Scroll to top"
        tabIndex={0}
      >
        <ChevronUp className="h-7 w-7" strokeWidth={2.5} />
      </Button>
    </div>
  ) : null;
}

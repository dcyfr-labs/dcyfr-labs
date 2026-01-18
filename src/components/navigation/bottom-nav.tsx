'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAVIGATION, isNavItemActive, getAriaCurrent } from '@/lib/navigation';
import { ANIMATION, NAVIGATION_HEIGHT } from '@/lib/design-tokens';

/**
 * Bottom navigation bar for mobile devices
 *
 * Features:
 * - Fixed at bottom of viewport on mobile only (< md breakpoint)
 * - 5 primary destinations: Activity, Bookmarks, Likes, Blog, Work
 * - 64px height (matches NAVIGATION_HEIGHT for site header)
 * - Shows when scrolling down, hides when scrolling up (except at top)
 * - Active state highlighting
 * - Icon + label layout
 * - Backdrop blur effect
 * - Semantic HTML and ARIA labels
 * - Smooth slide-up/down transitions
 *
 * @example
 * ```tsx
 * // Add to layout.tsx
 * <BottomNav />
 * ```
 */
export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100; // Minimum scroll distance to trigger hide/show

      // Always show when at the top of the page
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Show when scrolling down, hide when scrolling up
      if (currentScrollY > lastScrollY) {
        // Scrolling down - show nav
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - hide nav
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 z-40 md:hidden border-t backdrop-blur supports-backdrop-filter:bg-background/95 bg-background',
        'transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0 bottom-0' : 'translate-y-full bottom-0'
      )}
      aria-label="Bottom navigation"
      aria-hidden={!isVisible}
    >
      <div className={cn('grid grid-cols-5', NAVIGATION_HEIGHT, 'max-w-screen-md', 'mx-auto')}>
        {NAVIGATION.bottom.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                ANIMATION.transition.base,
                'hover:bg-accent/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              prefetch={item.prefetch ?? false}
              aria-current={getAriaCurrent(item.href, pathname, item.exactMatch)}
              aria-label={item.description || item.label}
            >
              {Icon && (
                <Icon className={cn('h-4 w-4', isActive && 'stroke-[2.5]')} aria-hidden="true" />
              )}
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

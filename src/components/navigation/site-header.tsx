'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/features';
import { MobileNav } from '@/components/navigation';
import { SearchButton } from '@/components/search';
import { DevToolsDropdown, ThemeAwareLogo } from '@/components/common';
import { cn } from '@/lib/utils';
import { CONTAINER_WIDTHS, ANIMATION, TOUCH_TARGET, NAVIGATION_HEIGHT } from '@/lib/design-tokens';
import { NAVIGATION, BLOG_NAV, WORK_NAV, isNavItemActive, getAriaCurrent } from '@/lib/navigation';
import { useDropdown } from '@/hooks/use-dropdown';
import { useLogoClick } from '@/hooks/use-navigation';

/**
 * Site Header Component
 *
 * Main navigation header with responsive design and accessibility
 *
 * Features:
 * - Desktop: Horizontal nav with dropdowns for Blog and Work
 * - Mobile: Hamburger menu
 * - Sticky positioning with backdrop blur
 * - Hides when scrolling down, shows when scrolling up (maximizes content visibility)
 * - Always visible at top of page
 * - Keyboard navigation support
 * - SEO-optimized structure
 */
export function SiteHeader() {
  const pathname = usePathname();
  const blogDropdown = useDropdown();
  const workDropdown = useDropdown();
  const handleLogoClick = useLogoClick();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100; // Minimum scroll distance to trigger hide/show

      // Always show when at the top of the page
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  /* eslint-disable react-hooks/refs -- dropdown.ref/isOpen/toggle are hook return values, not ref.current access */
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 site-header',
        'backdrop-blur supports-backdrop-filter:bg-background/95 border-b',
        'transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
      aria-hidden={!isVisible}
    >
      <div
        className={cn(
          'mx-auto',
          CONTAINER_WIDTHS.dashboard,
          'px-4 md:px-8',
          NAVIGATION_HEIGHT,
          'flex items-center gap-2 lg:relative'
        )}
      >
        {/* Logo - always visible */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className={cn('touch-target', 'shrink-0', '-ml-2', 'flex', 'items-center', 'lg:mr-auto')}
          aria-label="DCYFR Labs Home"
        >
          <ThemeAwareLogo
            width={28}
            height={28}
            className="w-[clamp(1.75rem,2vw+1rem,1.75rem)] h-[clamp(1.75rem,2vw+1rem,1.75rem)] rounded-full"
          />
        </Link>

        {/* Desktop Navigation - hidden on mobile, visible md and up */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center justify-center gap-1 sm:gap-3 md:gap-4 text-[clamp(0.875rem,1vw+0.75rem,1rem)] h-full lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2"
        >
          {/* Direct links (About, Sponsors, Contact) */}
          {NAVIGATION.header
            .filter((item) => !['Blog', 'Work'].includes(item.label))
            .filter((item) => item.href !== '/') // Exclude home (handled by logo)
            .map((item) => {
              const isActive = isNavItemActive(item, pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-center h-full px-1.5 sm:px-2 hover:underline underline-offset-4 will-change-auto touch-target',
                    ANIMATION.transition.base,
                    isActive && 'text-primary font-medium'
                  )}
                  aria-current={getAriaCurrent(item.href, pathname, item.exactMatch)}
                  aria-label={item.description}
                  prefetch={item.prefetch}
                >
                  {item.label}
                </Link>
              );
            })}

          {/* Blog dropdown */}
          <div ref={blogDropdown.ref} className="relative">
            <button
              {...blogDropdown.triggerProps}
              className={cn(
                'flex items-center justify-center h-full gap-1 px-1.5 sm:px-2 hover:underline underline-offset-4 will-change-auto touch-target',
                ANIMATION.transition.base,
                pathname.startsWith('/blog') && 'text-primary font-medium'
              )}
              aria-label="Blog menu"
              aria-expanded={blogDropdown.isOpen}
              aria-haspopup="menu"
            >
              Blog
              <ChevronDown
                className={cn(
                  'w-[clamp(0.875rem,1vw+0.75rem,1rem)] h-[clamp(0.875rem,1vw+0.75rem,1rem)]',
                  ANIMATION.transition.fast,
                  blogDropdown.isOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </button>
            {blogDropdown.isOpen && (
              <div
                {...blogDropdown.contentProps}
                className="absolute top-full left-0 mt-2 w-52 rounded-lg border bg-card p-1.5 shadow-xl z-50"
                role="menu"
              >
                {BLOG_NAV.map((item, index) => {
                  const isActive = isNavItemActive(item, pathname);

                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-3 py-2.5 text-[clamp(0.875rem,1vw+0.75rem,1rem)] rounded-md',
                          ANIMATION.transition.base,
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isActive && 'bg-accent/50 font-medium'
                        )}
                        onClick={blogDropdown.close}
                        role="menuitem"
                        aria-label={item.description}
                        prefetch={false}
                      >
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </Link>

                      {/* Separator before blog categories */}
                      {index === 1 && <div className="my-1.5 border-t" role="separator" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Work dropdown */}
          <div ref={workDropdown.ref} className="relative">
            <button
              {...workDropdown.triggerProps}
              className={cn(
                'flex items-center justify-center h-full gap-1 px-1.5 sm:px-2 hover:underline underline-offset-4 will-change-auto touch-target',
                ANIMATION.transition.base,
                pathname.startsWith('/work') && 'text-primary font-medium'
              )}
              aria-label="Our Work menu"
              aria-expanded={workDropdown.isOpen}
              aria-haspopup="menu"
            >
              Work
              <ChevronDown
                className={cn(
                  'w-[clamp(0.875rem,1vw+0.75rem,1rem)] h-[clamp(0.875rem,1vw+0.75rem,1rem)]',
                  ANIMATION.transition.fast,
                  workDropdown.isOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </button>
            {workDropdown.isOpen && (
              <div
                {...workDropdown.contentProps}
                className="absolute top-full left-0 mt-2 w-52 rounded-lg border bg-card p-1.5 shadow-xl z-50"
                role="menu"
              >
                {WORK_NAV.map((item, index) => {
                  const isActive = isNavItemActive(item, pathname);

                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-3 py-2.5 text-[clamp(0.875rem,1vw+0.75rem,1rem)] rounded-md',
                          ANIMATION.transition.base,
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isActive && 'bg-accent/50 font-medium'
                        )}
                        onClick={workDropdown.close}
                        role="menuitem"
                        aria-label={item.description}
                        prefetch={false}
                      >
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </Link>

                      {/* Separator before categories  */}
                      {index === WORK_NAV.length - 4 && (
                        <div className="my-1.5 border-t" role="separator" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Icon Links - visible md and up */}
        <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
          <SearchButton variant="default" />
          <ThemeToggle />
          {process.env.NODE_ENV === 'development' && <DevToolsDropdown />}
        </div>

        {/* Mobile Navigation - visible on mobile, hidden md and up */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <SearchButton variant="default" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
  /* eslint-enable react-hooks/refs */
}

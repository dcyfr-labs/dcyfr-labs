"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { SiteLogo } from "@/components/common/site-logo";
import { MobileNav } from "@/components/navigation/mobile-nav";
import DevToolsDropdown from "@/components/common/dev-tools-dropdown";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS, ANIMATION } from "@/lib/design-tokens";
import { NAVIGATION, BLOG_NAV, WORK_NAV, isNavItemActive, getAriaCurrent } from "@/lib/navigation";
import { useDropdown } from "@/hooks/use-dropdown";
import { useLogoClick } from "@/hooks/use-navigation";

/**
 * Site Header Component
 * 
 * Main navigation header with responsive design and accessibility
 * 
 * Features:
 * - Desktop: Horizontal nav with dropdowns for Blog and Work
 * - Mobile: Hamburger menu
 * - Sticky positioning with backdrop blur
 * - Keyboard navigation support
 * - SEO-optimized structure
 */
export function SiteHeader() {
  const pathname = usePathname();
  const blogDropdown = useDropdown();
  const workDropdown = useDropdown();
  const handleLogoClick = useLogoClick();

  /* eslint-disable react-hooks/refs -- dropdown.ref/isOpen/toggle are hook return values, not ref.current access */
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-backdrop-filter:bg-background/60 border-b site-header">
      <div className={cn("mx-auto", CONTAINER_WIDTHS.dashboard, "px-4", "sm:px-8", "md:px-8", "h-14", "md:h-16", "flex", "items-center", "justify-between", "gap-2")}>
        {/* Logo - always visible */}
        <Link href="/" onClick={handleLogoClick} className={cn("touch-target", "shrink-0")} aria-label="DCYFR Labs home">
          <SiteLogo size="md" collapseOnMobile />
        </Link>

        {/* Desktop Navigation - hidden on mobile, visible md and up */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 sm:gap-3 md:gap-4 text-sm">
          {/* Direct links (About, Sponsors, Contact) */}
          {NAVIGATION.header
            .filter((item) => !["Blog", "Our Work"].includes(item.label))
            .filter((item) => item.href !== "/") // Exclude home (handled by logo)
            .map((item) => {
              const isActive = isNavItemActive(item, pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2",
                    ANIMATION.transition.base,
                    isActive && "text-primary font-medium"
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
                "flex items-center gap-1 hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2",
                ANIMATION.transition.base,
                pathname.startsWith("/blog") && "text-primary font-medium"
              )}
              aria-label="Blog menu"
              aria-expanded={blogDropdown.isOpen}
              aria-haspopup="menu"
            >
              Blog
              <ChevronDown className={cn("h-3 w-3", ANIMATION.transition.fast, blogDropdown.isOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {blogDropdown.isOpen && (
              <div
                {...blogDropdown.contentProps}
                className="absolute top-full left-0 mt-2 w-52 rounded-lg border bg-card p-1.5 shadow-xl z-50"
                role="menu"
              >
                {BLOG_NAV.map((item) => {
                  const isActive = isNavItemActive(item, pathname);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block px-3 py-2.5 text-sm rounded-md",
                        ANIMATION.transition.base,
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive && "bg-accent/50 font-medium"
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Our Work dropdown */}
          <div ref={workDropdown.ref} className="relative">
            <button
              {...workDropdown.triggerProps}
              className={cn(
                "flex items-center gap-1 hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2",
                ANIMATION.transition.base,
                pathname.startsWith("/work") && "text-primary font-medium"
              )}
              aria-label="Our Work menu"
              aria-expanded={workDropdown.isOpen}
              aria-haspopup="menu"
            >
              Our Work
              <ChevronDown className={cn("h-3 w-3", ANIMATION.transition.fast, workDropdown.isOpen && "rotate-180")} aria-hidden="true" />
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
                      {/* Separator before Services */}
                      {index === WORK_NAV.length - 1 && (
                        <div className="my-1.5 border-t" role="separator" />
                      )}
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-3 py-2.5 text-sm rounded-md",
                          ANIMATION.transition.base,
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive && "bg-accent/50 font-medium"
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ThemeToggle />
          {process.env.NODE_ENV === "development" && <DevToolsDropdown />}
        </nav>

        {/* Mobile Navigation - visible on mobile, hidden md and up */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
  /* eslint-enable react-hooks/refs */
}

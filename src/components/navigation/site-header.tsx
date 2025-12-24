"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { SiteLogo } from "@/components/common/site-logo";
import { MobileNav } from "@/components/navigation/mobile-nav";
import DevToolsDropdown from "@/components/common/dev-tools-dropdown";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { NAVIGATION } from "@/lib/navigation-config";
import { useDropdown } from "@/hooks/use-dropdown";
import { useLogoClick } from "@/hooks/use-navigation";

export function SiteHeader() {
  const blogDropdown = useDropdown();
  const workDropdown = useDropdown();
  const handleLogoClick = useLogoClick();

  /* eslint-disable react-hooks/refs -- dropdown.ref/isOpen/toggle are hook return values, not ref.current access */
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-backdrop-filter:bg-background/60 border-b site-header">
      <div className={cn("mx-auto", CONTAINER_WIDTHS.dashboard, "px-4", "sm:px-8", "md:px-8", "h-14", "md:h-16", "flex", "items-center", "justify-between", "gap-2")}>
        {/* Logo - always visible */}
        <Link href="/" onClick={handleLogoClick} className={cn("touch-target", "shrink-0")}>
          <SiteLogo size="md" collapseOnMobile />
        </Link>

        {/* Desktop Navigation - hidden on mobile, visible md and up */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 sm:gap-3 md:gap-4 text-sm">
          <Link
            href="/about"
            className="hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
            prefetch={false}
          >
            About
          </Link>
          {/* Blog dropdown */}
          <div ref={blogDropdown.ref} className="relative">
            <button
              {...blogDropdown.triggerProps}
              className="flex items-center gap-1 hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
            >
              Blog
              <ChevronDown className={cn("h-3 w-3 transition-transform", blogDropdown.isOpen && "rotate-180")} />
            </button>
            {blogDropdown.isOpen && (
              <div {...blogDropdown.contentProps} className="absolute top-full left-0 mt-2 w-40 rounded-md border bg-card p-1 shadow-lg z-50">
                {NAVIGATION.blog.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-sm hover:bg-muted rounded"
                    onClick={blogDropdown.close}
                    prefetch={false}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {/* Our Work dropdown */}
          <div ref={workDropdown.ref} className="relative">
            <button
              {...workDropdown.triggerProps}
              className="flex items-center gap-1 hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
            >
              Work
              <ChevronDown className={cn("h-3 w-3 transition-transform", workDropdown.isOpen && "rotate-180")} />
            </button>
            {workDropdown.isOpen && (
              <div {...workDropdown.contentProps} className="absolute top-full left-0 mt-2 w-40 rounded-md border bg-card p-1 shadow-lg z-50">
                {NAVIGATION.work.map((item, index) => (
                  <div key={item.href}>
                    {index === 1 && <div className="my-1 border-t" />}
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm hover:bg-muted rounded"
                      onClick={workDropdown.close}
                      prefetch={false}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
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

"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { SiteLogo } from "@/components/common/site-logo";
import { MobileNav } from "@/components/navigation/mobile-nav";
import DevToolsDropdown from "@/components/common/dev-tools-dropdown";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

const workCategories = [
  { href: "/work?category=community", label: "Community" },
  { href: "/work?category=nonprofit", label: "Nonprofit" },
  { href: "/work?category=startup", label: "Startup" },
];

export function SiteHeader() {
  const [workOpen, setWorkOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWorkOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle logo click - scroll to top if already on homepage
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

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
          <Link 
            href="/blog" 
            className="hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
            prefetch={false}
          >
            Blog
          </Link>
          {/* Our Work dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setWorkOpen((prev) => !prev)}
              className="flex items-center gap-1 hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
              aria-haspopup="menu"
              aria-expanded={workOpen}
            >
              Our Work
              <ChevronDown className={cn("h-3 w-3 transition-transform", workOpen && "rotate-180")} />
            </button>
            {workOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 rounded-md border bg-card p-1 shadow-lg z-50">
                <Link
                  href="/work"
                  className="block px-3 py-2 text-sm hover:bg-muted rounded"
                  onClick={() => setWorkOpen(false)}
                  prefetch={false}
                >
                  All Projects
                </Link>
                <div className="my-1 border-t" />
                {workCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="block px-3 py-2 text-sm hover:bg-muted rounded"
                    onClick={() => setWorkOpen(false)}
                    prefetch={false}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link 
            href="/sponsors" 
            className="hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
            prefetch={false}
          >
            Sponsors
          </Link>
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
}

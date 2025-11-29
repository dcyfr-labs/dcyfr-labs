import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteLogo } from "@/components/common/site-logo";
import { MobileNav } from "@/components/mobile-nav";
import DevToolsDropdown from "@/components/dev-tools-dropdown";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-backdrop-filter:bg-background/60 border-b site-header">
      <div className={cn("mx-auto", CONTAINER_WIDTHS.archive, "px-4", "sm:px-6", "md:px-8", "h-14", "md:h-16", "flex", "items-center", "justify-between", "gap-2")}>
        {/* Logo - always visible */}
        <Link href="/" className={cn("touch-target", "shrink-0")}>
          <SiteLogo size="md" collapseOnMobile />
        </Link>

        {/* Desktop Navigation - hidden on mobile, visible md and up */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 sm:gap-3 md:gap-6 text-sm">
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
          <Link 
            href="/portfolio" 
            className="hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
            prefetch={false}
          >
            Portfolio
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

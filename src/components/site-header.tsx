import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import DevToolsDropdown from "@/components/dev-tools-dropdown";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-backdrop-filter:bg-background/60 border-b site-header">
      <div className={cn("mx-auto", CONTAINER_WIDTHS.dashboard, "px-4", "sm:px-6", "md:px-8", "h-14", "md:h-16", "flex", "items-center", "justify-between", "gap-2")}>
        {/* Logo - always visible */}
        <Link href="/" className={cn("flex", "items-center", "gap-2", "text-base", "sm:text-xl", "md:text-2xl", "font-semibold", "tracking-tight", "touch-target", "shrink-0")}>
          <span className="sr-only">Drew&apos;s Lab</span>
          <Logo width={24} height={24} className="w-4 h-4 md:w-6 md:h-6" />
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
            href="/projects" 
            className="hover:underline underline-offset-4 will-change-auto touch-target px-1.5 sm:px-2"
            prefetch={false}
          >
            Projects
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

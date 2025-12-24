"use client";

import Link from "next/link";
import { BookOpen, Briefcase, Activity, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS, ANIMATION } from "@/lib/design-tokens";

/**
 * Quick link item configuration
 */
interface QuickLinkItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

/**
 * Quick links for homepage navigation
 */
const QUICK_LINKS: QuickLinkItem[] = [
  { href: "/blog", label: "Blog", icon: BookOpen, description: "Read articles" },
  { href: "/work", label: "Projects", icon: Briefcase, description: "View work" },
  { href: "/activity", label: "Activity", icon: Activity, description: "See updates" },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark, description: "Curated links" },
  { href: "/about", label: "About", icon: User, description: "Learn more" },
];

/**
 * QuickLinksRibbon - Horizontal scrollable navigation pills
 *
 * Provides quick access to main content areas from the homepage hero.
 * Features:
 * - Horizontal scroll on mobile with touch support
 * - Keyboard navigable
 * - Icons for visual recognition
 * - Design token compliant
 */
export function QuickLinksRibbon({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Quick navigation"
      className={cn(
        "w-full overflow-x-auto scrollbar-hide",
        "-webkit-overflow-scrolling-touch",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-2 md:gap-3",
          "py-2",
          CONTAINER_WIDTHS.standard,
          "mx-auto"
        )}
      >
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 md:gap-2",
              "px-3 py-2 md:px-4 md:py-2.5",
              "rounded-full",
              "bg-muted/50 hover:bg-muted",
              "text-muted-foreground hover:text-foreground",
              "text-sm font-medium",
              "whitespace-nowrap",
              ANIMATION.transition.theme,
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "min-h-11" // Touch target (44px)
            )}
            title={link.description}
          >
            <link.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

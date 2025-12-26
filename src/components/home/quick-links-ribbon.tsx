"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CONTAINER_WIDTHS, ANIMATION, TYPOGRAPHY } from "@/lib/design-tokens";
import { NAVIGATION } from "@/lib/navigation";

/**
 * QuickLinksRibbon - Horizontal scrollable navigation pills
 *
 * Provides quick access to secondary content areas from the homepage hero.
 * Shows only Activity and Bookmarks from the "Discover" section.
 * Uses centralized navigation configuration for consistency.
 * 
 * Features:
 * - Horizontal scroll on mobile with touch support
 * - Keyboard navigable
 * - Icons for visual recognition
 * - Design token compliant
 * - Proper touch targets (44px min)
 */
export function QuickLinksRibbon({ className }: { className?: string }) {
  // Get "Discover" section items (Activity, Bookmarks)
  const discoverSection = NAVIGATION.mobile.find((section) => section.id === "discover");
  const links = discoverSection?.items || [];

  return (
    <nav
      aria-label="Quick navigation to discover content"
      className={cn(
        "w-full overflow-x-auto scrollbar-hide",
        "-webkit-overflow-scrolling-touch",
        "flex justify-center",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 md:gap-3",
          "py-1 md:py-2",
          "px-4 md:px-8",
          "flex-nowrap"
        )}
      >
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 md:gap-2",
                "px-3 py-2 md:px-4 md:py-2.5",
                "rounded-full",
                "bg-muted/50 hover:bg-muted",
                "text-muted-foreground hover:text-foreground",
                TYPOGRAPHY.label.small,
                "whitespace-nowrap",
                ANIMATION.transition.base,
                "hover:scale-105 active:scale-95",
                "hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "min-h-11" // Touch target (44px)
              )}
              title={link.description}
              prefetch={link.prefetch ?? false}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


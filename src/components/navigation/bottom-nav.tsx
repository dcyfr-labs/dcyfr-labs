"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "@/lib/navigation-config";
import { useNavigation } from "@/hooks/use-navigation";

/**
 * Bottom navigation bar for mobile devices
 * 
 * Features:
 * - Fixed at bottom of viewport on mobile only (< md breakpoint)
 * - 3 primary destinations: Home, Blog, Portfolio
 * - Compact 48px height (optimized for mobile content space)
 * - Active state highlighting
 * - Icon + label layout
 * - Backdrop blur effect
 * - Contact and additional navigation available in hamburger menu
 * 
 * @example
 * ```tsx
 * // Add to layout.tsx
 * <BottomNav />
 * ```
 */
export function BottomNav() {
  const { isNavItemActive, getAriaCurrent } = useNavigation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t backdrop-blur supports-[backdrop-filter]:bg-background/95 bg-background"
      aria-label="Bottom navigation"
    >
      <div className={cn("grid grid-cols-3 h-12", "max-w-lg", "mx-auto")}>
        {NAVIGATION.bottom.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                "hover:bg-accent/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              prefetch={false}
              aria-current={getAriaCurrent(item.href, item.exactMatch)}
            >
              {Icon && (
                <Icon
                  className={cn("h-4 w-4", isActive && "stroke-[2.5]")}
                  aria-hidden="true"
                />
              )}
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

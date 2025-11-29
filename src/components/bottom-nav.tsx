"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, FolderGit2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom navigation bar for mobile devices
 * 
 * Features:
 * - Fixed at bottom of viewport on mobile only (< md breakpoint)
 * - 4 primary destinations: Home, Blog, Projects, Contact
 * - Large touch targets (56px height)
 * - Active state highlighting
 * - Icon + label layout
 * - Backdrop blur effect
 * 
 * @example
 * ```tsx
 * // Add to layout.tsx
 * <BottomNav />
 * ```
 */
export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/blog",
      label: "Blog",
      icon: FileText,
      isActive: pathname.startsWith("/blog"),
    },
    {
      href: "/portfolio",
      label: "Portfolio",
      icon: FolderGit2,
      isActive: pathname.startsWith("/portfolio"),
    },
    {
      href: "/contact",
      label: "Contact",
      icon: Mail,
      isActive: pathname.startsWith("/contact"),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t backdrop-blur supports-[backdrop-filter]:bg-background/95 bg-background"
      aria-label="Bottom navigation"
    >
      <div className={cn("grid grid-cols-4 h-16", "max-w-lg", "mx-auto")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                "hover:bg-accent/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                item.isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              prefetch={false}
              aria-current={item.isActive ? "page" : undefined}
            >
              <Icon
                className={cn("h-5 w-5", item.isActive && "stroke-[2.5]")}
                aria-hidden="true"
              />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

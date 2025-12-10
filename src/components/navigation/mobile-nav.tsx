"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation component with hamburger menu
 * 
 * Features:
 * - Sheet drawer with large touch targets (56px height)
 * - Auto-closes on navigation
 * - Shows active page indicator
 * - Includes theme toggle
 * 
 * @example
 * ```tsx
 * <MobileNav />
 * ```
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close sheet when navigating
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/blog/series", label: "Series" },
    { href: "/about", label: "About Us" },
    { href: "/work", label: "Our Work" },
    { href: "/contact", label: "Contact Us" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/feeds", label: "Feeds" },
  ];

  // Render button immediately but defer Sheet portal rendering until mounted
  // This avoids Radix ID mismatches while keeping the trigger interactive
  return (
    <Sheet open={mounted && open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="touch-target"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      {mounted && (
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-4">
          <SheetHeader>
            <SheetTitle className="text-left">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 mt-6" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const isWork = item.href === "/work";

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      // eslint-disable-next-line no-restricted-syntax
                      "flex items-center h-14 px-4 rounded-md text-base font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    prefetch={false}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="border-t py-8 flex items-center justify-between text-center w-full mx-auto">
            <ThemeToggle />
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}

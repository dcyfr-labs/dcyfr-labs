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
import { NAVIGATION, isNavItemActive, getAriaCurrent } from "@/lib/navigation";
import { TYPOGRAPHY, SPACING, ANIMATION } from "@/lib/design-tokens";

/**
 * Mobile navigation component with hamburger menu
 * 
 * Features:
 * - Sheet drawer with large touch targets (56px height)
 * - Sectioned navigation for better organization
 * - Auto-closes on navigation
 * - Shows active page indicator
 * - Includes theme toggle
 * - Full accessibility support
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

  // Render button immediately but defer Sheet portal rendering until mounted
  // This avoids Radix ID mismatches while keeping the trigger interactive
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="touch-target"
        aria-label="Open navigation menu"
        onClick={() => {}} // No-op until mounted
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Navigation</SheetTitle>
        </SheetHeader>

        {/* Sectioned Navigation */}
        <div className={cn("mt-6", SPACING.subsection)}>
          {NAVIGATION.mobile.map((section) => (
            <section key={section.id} className="mb-8 last:mb-0">
              {/* Section Heading */}
              <h3 className={cn(TYPOGRAPHY.label.small, "text-muted-foreground uppercase tracking-wide px-4 mb-2")}>
                {section.label}
              </h3>

              {/* Section Items */}
              <nav aria-label={section.description || section.label} className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = isNavItemActive(item, pathname);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 h-14 px-4 rounded-lg text-base",
                        ANIMATION.transition.base,
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive && "bg-accent text-accent-foreground font-medium"
                      )}
                      aria-current={getAriaCurrent(item.href, pathname, item.exactMatch)}
                      aria-label={item.description}
                      prefetch={item.prefetch ?? false}
                    >
                      {Icon && (
                        <Icon
                          className={cn("h-5 w-5 shrink-0", isActive && "stroke-[2.5]")}
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.label}</div>
                        {item.description && (
                          <div className={cn(TYPOGRAPHY.metadata, "text-muted-foreground truncate")}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </section>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="border-t py-4 flex items-center justify-between w-full mx-auto">
          <span className={TYPOGRAPHY.label.small}>Theme</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}

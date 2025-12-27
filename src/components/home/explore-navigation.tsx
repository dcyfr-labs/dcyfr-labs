/**
 * Explore Navigation Component
 * 
 * Unified navigation for the Explore section combining primary actions
 * and discover links in a responsive, consolidated layout.
 * 
 * This replaces the separate HomepageHeroActions and QuickLinksRibbon
 * components to avoid duplicate navigation patterns.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, ANIMATION, SPACING } from "@/lib/design-tokens";
import { PRIMARY_NAV_LINKS, SECONDARY_NAV_LINKS } from "@/lib/nav-links";
import { NAVIGATION } from "@/lib/navigation";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";

interface ExploreNavigationProps {
  /** Optional CSS class for container */
  className?: string;
}

/**
 * Primary action buttons (larger, more prominent)
 */
function PrimaryActions() {
  const handleLinkClick = (href: string) => {
    trackEvent({
      name: "external_link_clicked",
      properties: {
        url: href,
        source: `homepage_explore_${href.replace("/", "") || "home"}`,
      },
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto">
      {PRIMARY_NAV_LINKS.map((link) => {
        const buttonVariant =
          link.variant === "primary"
            ? "cta"
            : link.variant === "secondary"
              ? "cta-outline"
              : "secondary";

        return (
          <Button
            key={link.href}
            variant={buttonVariant}
            asChild
            size="sm"
            className={cn(
              "gap-2 sm:gap-3 text-sm sm:text-base",
              ANIMATION.transition.base,
              "hover:scale-105 active:scale-95",
              "group relative overflow-hidden"
            )}
          >
            <Link
              href={link.href}
              onClick={() => handleLinkClick(link.href)}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
              <ArrowRight
                className={cn(
                  "h-4 w-4 group-hover:translate-x-1",
                  ANIMATION.transition.movement
                )}
              />
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Secondary discover links (compact pills)
 */
function DiscoverLinks() {
  const discoverSection = NAVIGATION.mobile.find(
    (section) => section.id === "discover"
  );
  const links = discoverSection?.items || [];

  return (
    <nav
      aria-label="Discover content areas"
      className={cn(
        "w-full overflow-x-auto scrollbar-hide",
        "-webkit-overflow-scrolling-touch",
        "flex justify-center"
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
              {Icon && (
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Unified explore navigation component
 *
 * Combines primary actions and discover links in a cohesive layout:
 * - Large prominent buttons for main destinations
 * - Compact pills for secondary discovery options
 *
 * @example
 * ```tsx
 * <ExploreNavigation />
 * ```
 */
export function ExploreNavigation({ className }: ExploreNavigationProps) {
  return (
    <div className={cn("flex flex-col w-full", SPACING.subsection, className)}>
      {/* Primary Action Buttons */}
      <PrimaryActions />

      {/* Secondary Discover Links */}
      <DiscoverLinks />
    </div>
  );
}

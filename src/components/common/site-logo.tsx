import React from "react";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";

/**
 * SiteLogo Component - DCYFR Labs Brand Logo
 *
 * Displays the site name "DCYFR Labs" in serif font followed by
 * the sparkle/star SVG logo. This is the primary brand mark used across
 * the site (header, footer, hero sections).
 *
 * @example
 * ```tsx
 * // Default usage (header size)
 * <SiteLogo />
 *
 * // Small size (footer)
 * <SiteLogo size="sm" />
 *
 * // Large size (hero)
 * <SiteLogo size="lg" />
 *
 * // With custom className
 * <SiteLogo className="text-muted-foreground" />
 * ```
 */

type SiteLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SiteLogoProps {
  /** Size variant for the logo */
  size?: SiteLogoSize;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Whether to show the text (defaults to true) */
  showText?: boolean;
  /** Whether to show the star icon (defaults to true) */
  showIcon?: boolean;
  /** Additional classes for the icon */
  iconClassName?: string;
  /** Hide text on mobile (shows only icon on small screens) */
  collapseOnMobile?: boolean;
}

const sizeConfig: Record<SiteLogoSize, { text: string; icon: string; gap: string }> = {
  xs: { text: "text-xs", icon: "w-2.5 h-2.5", gap: "gap-1.5" },
  sm: { text: "text-sm", icon: "w-3 h-3", gap: "gap-2" },
  md: { text: "text-base sm:text-xl md:text-2xl", icon: "w-5 h-5", gap: "gap-2 sm:gap-2.5 md:gap-3" },
  lg: { text: "text-xl sm:text-2xl md:text-3xl", icon: "w-5 h-5", gap: "gap-2.5 sm:gap-3 md:gap-3.5" },
  xl: { text: "text-2xl sm:text-3xl md:text-4xl", icon: "w-6 h-6", gap: "gap-3 sm:gap-3.5 md:gap-4" },
};

export const SiteLogo: React.FC<SiteLogoProps> = ({
  size = "md",
  className,
  showText = true,
  showIcon = true,
  iconClassName,
  collapseOnMobile = false,
}) => {
  const config = sizeConfig[size];

  return (
    <span className={cn("inline-flex items-center", config.gap, className)}>
      {showText && (
        <span
          className={cn(
            config.text,
            "font-serif font-semibold leading-none",
            collapseOnMobile ? "hidden sm:inline" : ""
          )}
        >
          DCYFR Labs
        </span>
      )}
      {showIcon && (
        <Logo className={cn(config.icon, iconClassName)} aria-hidden="true" />
      )}
    </span>
  );
};

export default SiteLogo;

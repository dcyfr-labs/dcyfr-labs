import React from "react";
import { Logo } from "@/components/common/logo";
import { LOGO_CONFIG } from "@/lib/logo-config";
import { cn } from "@/lib/utils";

/**
 * SiteLogo Component - DCYFR Labs Brand Logo
 *
 * Displays "DCYFR Labs" text + sparkle icon. Uses unified size tokens from logo-config.
 *
 * @example
 * ```tsx
 * <SiteLogo />                    // md (header)
 * <SiteLogo size="sm" />          // sm (footer)
 * <SiteLogo size="lg" />          // lg (hero)
 * <SiteLogo collapseOnMobile />   // icon-only on mobile
 * ```
 */

type SiteLogoSize = "sm" | "md" | "lg";

interface SiteLogoProps {
  /** Size variant: sm (footer), md (header), lg (hero) */
  size?: SiteLogoSize;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS classes for the icon */
  iconClassName?: string;
  /** Show text (default: true) */
  showText?: boolean;
  /** Show star icon (default: true) */
  showIcon?: boolean;
  /** Hide text on mobile */
  collapseOnMobile?: boolean;
}

const sizeConfig: Record<SiteLogoSize, { text: string; icon: number; gap: string }> = {
  sm: { text: "text-sm", icon: LOGO_CONFIG.sizes.small, gap: "gap-2" },
  md: { text: "text-xl md:text-2xl", icon: LOGO_CONFIG.sizes.medium, gap: "gap-2.5" },
  lg: { text: "text-3xl md:text-4xl", icon: LOGO_CONFIG.sizes.large, gap: "gap-3" },
};

export const SiteLogo: React.FC<SiteLogoProps> = ({
  size = "md",
  className,
  iconClassName,
  showText = true,
  showIcon = true,
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
            collapseOnMobile && "hidden sm:inline"
          )}
        >
          DCYFR Labs
        </span>
      )}
      {showIcon && (
        <Logo width={config.icon} height={config.icon} aria-hidden="true" className={iconClassName} />
      )}
    </span>
  );
};

export default SiteLogo;

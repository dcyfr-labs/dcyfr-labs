import React from "react";
import { Logo } from "@/components/common";
import { cn } from "@/lib/utils";

/**
 * ThemeAwareLogo Component - DCYFR Labs Logo
 *
 * Displays the DCYFR Labs logo with automatic theme-aware styling.
 * Uses currentColor to automatically match text color in light/dark modes.
 *
 * Features:
 * - Automatic theme adaptation via currentColor
 * - Smooth transitions between themes
 * - SVG-based for optimal performance
 * - Inherits text color from parent context
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * // Default usage (40x40) - matches foreground color
 * <ThemeAwareLogo />
 *
 * // Custom size
 * <ThemeAwareLogo width={48} height={48} />
 *
 * // With custom color via text utility
 * <ThemeAwareLogo className="text-primary" />
 * ```
 */

interface ThemeAwareLogoProps {
  /** Width in pixels or CSS units (default: 40) */
  width?: string | number;
  /** Height in pixels or CSS units (default: 40) */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
}

export const ThemeAwareLogo: React.FC<ThemeAwareLogoProps> = ({
  width = 40,
  height = 40,
  className,
}) => {
  return (
    <Logo
      width={width}
      height={height}
      fill="currentColor"
      className={cn("transition-theme duration-200 text-foreground", className)}
    />
  );
};

export default ThemeAwareLogo;

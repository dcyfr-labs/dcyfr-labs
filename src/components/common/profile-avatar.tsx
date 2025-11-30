"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";

/**
 * ProfileAvatar Component
 * 
 * Unified, reusable avatar component for displaying profile images across the site.
 * Supports multiple size presets, animations, and graceful fallback to icon.
 * 
 * Features:
 * - Responsive sizing with Tailwind breakpoints
 * - Hover scale & glow effects on desktop
 * - Smooth load animation
 * - Gradient backdrop option
 * - Ring border and shadow styling
 * 
 * Used on:
 * - Homepage hero section (with animations)
 * - About page (team, spotlight cards, profile)
 * - Any other profile/avatar display needs
 * 
 * @component
 * @example
 * ```tsx
 * // Default usage
 * <ProfileAvatar />
 * 
 * // With homepage animations
 * <ProfileAvatar size="xl" priority animated backdrop />
 * 
 * // Custom size
 * <ProfileAvatar size="lg" />
 * ```
 * 
 * @remarks
 * - Default image location: `/public/images/avatar.jpg`
 * - Supports responsive sizing with Tailwind breakpoints
 * - Automatically shows fallback icon if image fails to load
 * - Uses Next.js Image optimization for performance
 * - Circular display with ring border and shadow
 */

export type AvatarSize = "sm" | "md" | "lg" | "xl";

type ProfileAvatarProps = {
  /** Image source URL (default: /images/avatar.jpg) */
  src?: string;
  /** Alt text for accessibility (default: "Profile photo") */
  alt?: string;
  /** Predefined size variant */
  size?: AvatarSize;
  /** Custom CSS class to apply to container */
  className?: string;
  /** Whether to use priority loading for LCP optimization */
  priority?: boolean;
  /** Enable hover animations and scale effects */
  animated?: boolean;
  /** Show subtle gradient backdrop behind avatar */
  backdrop?: boolean;
};

const sizeConfig: Record<AvatarSize, { container: string; sizes: string }> = {
  sm: {
    container: "w-16 h-16",
    sizes: "(max-width: 768px) 64px, 64px",
  },
  md: {
    container: "w-24 h-24 md:w-28 md:h-28",
    sizes: "(max-width: 768px) 96px, 112px",
  },
  lg: {
    container: "w-32 h-32 md:w-40 md:h-40",
    sizes: "(max-width: 768px) 128px, 160px",
  },
  xl: {
    container: "w-40 h-40 sm:w-48 sm:h-48",
    sizes: "(max-width: 640px) 160px, (max-width: 768px) 192px, 256px",
  },
};

export function ProfileAvatar({
  src = "/images/avatar.jpg",
  alt = "Profile photo",
  size = "md",
  className,
  priority = false,
  animated = false,
  backdrop = false,
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const sizeClass = sizeConfig[size];

  return (
    <div
      className={`
        relative flex-shrink-0 rounded-full overflow-hidden
        ${sizeClass.container}
        ${animated ? "hover:scale-110 transition-transform duration-300 ease-out" : ""}
        ${animated ? "will-change-transform" : ""}
        ${isLoaded ? "animate-fade-in" : "opacity-0"}
        ${className || ""}
      `}
    >
      {/* Gradient backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 -z-10 blur-2xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Glow effect for animated state */}
      {animated && (
        <div
          className="absolute inset-0 -z-10 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent)",
          }}
        />
      )}

      {!imageError && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizeClass.sizes}
          className="object-cover ring-2 ring-border shadow-lg"
          onError={() => setImageError(true)}
          onLoadingComplete={() => setIsLoaded(true)}
          priority={priority}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted ring-2 ring-border shadow-lg">
          <User
            className="w-1/2 h-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

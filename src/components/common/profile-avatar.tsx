"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";
import { IMAGE_PLACEHOLDER, ANIMATION } from "@/lib/design-tokens";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { teamMembers } from "@/data/team";

/**
 * ProfileAvatar Component
 * 
 * Unified, reusable avatar component for displaying profile images across the site.
 * Supports multiple size presets, animations, graceful fallback to icon, and team member lookup.
 * 
 * Features:
 * - Responsive sizing with Tailwind breakpoints
 * - Hover scale & glow effects on desktop
 * - Smooth load animation
 * - Gradient backdrop option
 * - Ring border and shadow styling
 * - Team member image lookup by name (e.g., "drew", "dcyfr")
 * - Custom image URL support
 * 
 * Used on:
 * - Homepage hero section (with animations)
 * - About page (team, spotlight cards, profile)
 * - Any other profile/avatar display needs
 * 
 * @component
 * @example
 * ```tsx
 * // Default usage (Drew's avatar)
 * <ProfileAvatar />
 * 
 * // With team member lookup
 * <ProfileAvatar userProfile="drew" size="lg" />
 * <ProfileAvatar userProfile="dcyfr" size="md" />
 * 
 * // With custom URL
 * <ProfileAvatar src="https://example.com/avatar.jpg" size="md" />
 * 
 * // With homepage animations
 * <ProfileAvatar userProfile="drew" size="xl" priority animated backdrop />
 * ```
 * 
 * @remarks
 * - Default image location: `/public/images/avatar.jpg` or Drew's avatar if available
 * - Supports responsive sizing with Tailwind breakpoints
 * - Automatically shows fallback icon if image fails to load
 * - Uses Next.js Image optimization for performance
 * - Circular display with ring border and shadow
 * - Team member IDs: "drew", "dcyfr"
 */

export type AvatarSize = "sm" | "md" | "lg" | "xl";

type ProfileAvatarProps = {
  /** Image source URL (can be custom URL or auto-detected from userProfile) */
  src?: string;
  /** Team member identifier to auto-load avatar (e.g., "drew", "dcyfr") */
  userProfile?: string;
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
  src,
  userProfile,
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

  // Resolve image URL: explicit src > team member lookup > default
  const resolveImageUrl = (): string => {
    // If custom src is provided, use it
    if (src) {
      return src;
    }

    // If userProfile is provided, look up team member
    if (userProfile) {
      const member = teamMembers.find(
        (m) => m.id === userProfile || m.name.toLowerCase() === userProfile.toLowerCase()
      );
      if (member?.avatarImagePath) {
        return member.avatarImagePath;
      }
    }

    // Default to Drew's avatar or fallback
    const defaultMember = teamMembers.find((m) => m.id === "drew");
    return defaultMember?.avatarImagePath || "/images/avatar.jpg";
  };

  const resolveAltText = (): string => {
    if (alt !== "Profile photo") {
      return alt;
    }

    if (userProfile) {
      const member = teamMembers.find(
        (m) => m.id === userProfile || m.name.toLowerCase() === userProfile.toLowerCase()
      );
      if (member) {
        return `${member.name}'s avatar`;
      }
    }

    return alt;
  };

  const finalSrc = resolveImageUrl();
  const finalAlt = resolveAltText();

  return (
    <div
      className={`
        relative shrink-0 rounded-full overflow-hidden
        ${sizeClass.container}
        ${animated ? `hover:scale-110 transition-transform ${ANIMATION.duration.normal} ease-out` : ""}
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
          className={cn(
            "absolute inset-0 -z-10 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity",
            ANIMATION.duration.normal
          )}
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent)",
          }}
        />
      )}

      {!imageError && finalSrc ? (
        <Image
          src={finalSrc}
          alt={finalAlt}
          fill
          sizes={sizeClass.sizes}
          className="object-cover ring-2 ring-border shadow-lg"
          onError={() => setImageError(true)}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
          placeholder="blur"
          blurDataURL={IMAGE_PLACEHOLDER.blur}
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

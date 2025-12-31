"use client";

import Image from "next/image";
import React, { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/common";
import { cn } from "@/lib/utils";
import { IMAGE_PLACEHOLDER, ANIMATION } from "@/lib/design-tokens";

/**
 * FlippableAvatar Component
 *
 * A coin-flip style avatar that shows Drew on one side and DCYFR on the other.
 * Clicking flips between the two sides with a 3D coin-flip animation.
 *
 * **Why this uses CSS transforms (not Framer Motion):**
 * This component requires true 3D transforms with `preserve-3d` and `rotateY(180deg)`
 * to create the coin-flip effect. While CSS can handle this, it uses CSS-in-JS for
 * dynamic state management (flipped/not flipped). This is a legitimate use of CSS 3D
 * transforms, not a case requiring Framer Motion.
 *
 * Features:
 * - 3D coin flip animation on click (rotateY 0deg ↔ 180deg)
 * - Uses transform-style: preserve-3d for true 3D rendering
 * - Alternates between Drew and DCYFR avatars
 * - Subtle wobble effect for realism
 * - Smooth easing for natural feel (CSS transitions)
 * - Maintains circular shape during flip
 *
 * @component
 */

export type AvatarSize = "sm" | "md" | "lg" | "xl";

interface FlippableAvatarProps {
  /** Predefined size variant */
  size?: AvatarSize;
  /** Custom CSS class */
  className?: string;
  /** Use priority loading for LCP */
  priority?: boolean;
  /** Enable hover effects */
  animated?: boolean;
  /** Show gradient backdrop */
  backdrop?: boolean;
}

const sizeConfig: Record<AvatarSize, { container: string; sizes: string }> = {
  sm: {
    container: "w-16 h-16",
    sizes: "64px",
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
    sizes: "(max-width: 640px) 160px, 192px",
  },
};

export function FlippableAvatar({
  size = "lg",
  className,
  priority = false,
  animated = false,
  backdrop = false,
}: FlippableAvatarProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [drewLoaded, setDrewLoaded] = useState(false);
  const [dcyfrLoaded, setDcyfrLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const sizeClass = sizeConfig[size];
  const isLoaded = drewLoaded || dcyfrLoaded;

  // Wait until mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    // Mark DCYFR logo as loaded immediately since it's an SVG
    setDcyfrLoaded(true);
  }, []);

  // Determine logo fill color based on theme
  const logoFillColor =
    mounted && resolvedTheme === "dark" ? "#f9fafb" : "#111827";

  // Mark as initialized after first load to prevent both avatars showing
  React.useEffect(() => {
    if (isLoaded && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoaded, isInitialized]);

  const handleFlip = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped((prev) => !prev);
    // Reset animating state after animation completes
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  return (
    <div
      className={cn(
        "relative cursor-pointer select-none",
        sizeClass.container,
        className
      )}
      onClick={handleFlip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleFlip();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Avatar showing ${isFlipped ? "DCYFR" : "Drew"}. Click to flip.`}
      style={{ perspective: "1000px" }}
    >
      {/* Gradient backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 -z-10 blur-2xl pointer-events-none scale-150"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Coin container with 3D transform */}
      <div
        className={cn(
          "relative w-full h-full transition-transform ease-out",
          animated && !isAnimating && "hover:scale-105 *:transition-transform",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Front face - DCYFR */}
        <div
          className={cn(
            "absolute inset-0 rounded-full overflow-hidden ring-2 ring-border shadow-lg transition-opacity flex items-center justify-center",
            ANIMATION.duration.normal,
            !isInitialized && "opacity-0",
            isInitialized && !isFlipped && "opacity-100",
            isInitialized && isFlipped && "opacity-0",
            // Add background for logo visibility
            resolvedTheme === "dark" ? "bg-gray-900" : "bg-gray-100"
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Logo
            width="60%"
            height="60%"
            fill={logoFillColor}
            className={`transition-colors ${ANIMATION.duration.fast}`}
          />
        </div>

        {/* Back face - Drew */}
        <div
          className={cn(
            "absolute inset-0 rounded-full overflow-hidden ring-2 ring-border shadow-lg transition-opacity",
            ANIMATION.duration.normal,
            !isInitialized && "opacity-0",
            isInitialized && isFlipped && "opacity-100",
            isInitialized && !isFlipped && "opacity-0"
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Image
            src="/images/avatar.jpg"
            alt="Drew's avatar"
            fill
            sizes={sizeClass.sizes}
            className="object-cover"
            onLoad={() => setDrewLoaded(true)}
            priority={priority}
            placeholder="blur"
            blurDataURL={IMAGE_PLACEHOLDER.blur}
          />
        </div>
      </div>

      {/* Subtle hint indicator */}
      <div
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 whitespace-nowrap transition-opacity",
          ANIMATION.duration.normal,
          isAnimating ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <span className="sr-only">Click to flip</span>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * FlippableAvatar Component
 * 
 * A coin-flip style avatar that shows Drew on one side and DCYFR on the other.
 * Clicking flips between the two sides with a subtle, lifelike animation.
 * 
 * Features:
 * - 3D coin flip animation on click
 * - Alternates between Drew and DCYFR avatars
 * - Subtle wobble effect for realism
 * - Smooth easing for natural feel
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
  
  const sizeClass = sizeConfig[size];
  const isLoaded = drewLoaded || dcyfrLoaded;

  const handleFlip = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(prev => !prev);
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
          "relative w-full h-full transition-transform duration-700 ease-out",
          animated && !isAnimating && "hover:scale-105",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped 
            ? "rotateY(180deg)" 
            : "rotateY(0deg)",
          transition: "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Front face - Drew */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden ring-2 ring-border shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
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
          />
        </div>

        {/* Back face - DCYFR */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden ring-2 ring-border shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Image
            src="/images/dcyfr-avatar.svg"
            alt="DCYFR's avatar"
            fill
            sizes={sizeClass.sizes}
            className="object-cover"
            onLoad={() => setDcyfrLoaded(true)}
            priority={false}
          />
        </div>
      </div>

      {/* Subtle hint indicator */}
      <div 
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 whitespace-nowrap transition-opacity duration-300",
          isAnimating ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <span className="sr-only">Click to flip</span>
      </div>
    </div>
  );
}

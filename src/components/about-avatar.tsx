"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";

/**
 * About Avatar Component
 * 
 * Displays a professional avatar/profile image with fallback support.
 * Features responsive sizing and theme-aware styling.
 * 
 * @component
 * @example
 * ```tsx
 * <AboutAvatar />
 * ```
 * 
 * @remarks
 * Place profile image at `/public/images/profile.jpg` or update src prop
 * Currently defaults to `/images/avatar.jpg`
 */

type AboutAvatarProps = {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24 md:w-28 md:h-28",
  lg: "w-32 h-32 md:w-40 md:h-40",
};

export function AboutAvatar({ 
  src = "/images/avatar.jpg", 
  alt = "Profile photo",
  size = "md"
}: AboutAvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
      {!imageError && src ? (
        <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-border shadow-lg">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 96px, 112px"
            className="object-cover"
            onError={() => setImageError(true)}
            priority
          />
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center ring-2 ring-border shadow-lg">
          <User className="w-1/2 h-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  HOVER_EFFECTS,
  IMAGE_PLACEHOLDER,
  ANIMATION,
} from "@/lib/design-tokens";

export interface Photo {
  url: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

interface PhotoCardProps {
  /** Photo data */
  photo: Photo;
  /** Index of the photo in the grid */
  index: number;
  /** Layout mode affects aspect ratio handling */
  layout: "masonry" | "uniform";
  /** Callback when photo is clicked (for lightbox) */
  onClick?: (index: number) => void;
  /** Priority loading for above-the-fold images */
  priority?: boolean;
}

/**
 * PhotoCard Component
 *
 * Individual photo card for the gallery grid.
 * Supports both masonry (natural aspect ratio) and uniform (square) layouts.
 *
 * Features:
 * - Responsive image sizing
 * - Hover effects with lift animation
 * - Optional caption overlay
 * - Click handler for lightbox integration
 *
 * @example
 * ```tsx
 * <PhotoCard
 *   photo={photo}
 *   index={0}
 *   layout="masonry"
 *   onClick={handleClick}
 * />
 * ```
 */
export function PhotoCard({
  photo,
  index,
  layout,
  onClick,
  priority = false,
}: PhotoCardProps) {
  const handleClick = () => {
    onClick?.(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(index);
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(
        "group relative overflow-hidden rounded-lg bg-muted/30 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        HOVER_EFFECTS.card
      )}
      aria-label={onClick ? `View ${photo.alt}` : undefined}
    >
      {/* Image */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          layout === "uniform" ? "aspect-square" : ""
        )}
        style={
          layout === "masonry"
            ? {
                aspectRatio: `${photo.width} / ${photo.height}`,
              }
            : undefined
        }
      >
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover transition-transform",
            ANIMATION.duration.normal,
            "group-hover:scale-105"
          )}
          priority={priority}
          placeholder="blur"
          blurDataURL={IMAGE_PLACEHOLDER.blur}
        />
      </div>

      {/* Caption overlay (shown on hover) */}
      {photo.caption && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent",
            "px-3 py-2 translate-y-full transition-transform",
            ANIMATION.duration.normal,
            "group-hover:translate-y-0"
          )}
        >
          <p className="text-sm text-white line-clamp-2">{photo.caption}</p>
        </div>
      )}
    </div>
  );
}

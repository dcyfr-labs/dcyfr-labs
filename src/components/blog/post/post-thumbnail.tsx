import Image from "next/image";
import { cn } from "@/lib/utils";
import { ANIMATION, IMAGE_PLACEHOLDER } from "@/lib/design-tokens";
import type { PostImage } from "@/data/posts";

/**
 * Props for the PostThumbnail component
 */
interface PostThumbnailProps {
  image: PostImage;
  /** Fallback alt text when image.alt is not provided */
  alt?: string;
  /** Size variant for different layouts */
  size?: "sm" | "md" | "lg";
  /** CSS class overrides */
  className?: string;
  /** Priority loading for above-fold images */
  priority?: boolean;
}

/**
 * PostThumbnail Component
 *
 * Displays optimized featured images for blog posts in list views.
 * Uses Next.js Image component for automatic optimization, lazy loading, and responsive sizing.
 *
 * Features:
 * - Multiple size variants (sm, md, lg) for different layouts
 * - Automatic WebP/AVIF conversion
 * - Lazy loading by default, priority option for hero images
 * - Blur-up placeholder effect
 * - Responsive sizing with proper aspect ratios
 * - Graceful handling of external and local images
 *
 * @component
 * @param {PostThumbnailProps} props - Component props
 * @param {PostImage} props.image - Featured image data from post frontmatter
 * @param {"sm" | "md" | "lg"} [props.size="md"] - Size variant
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.priority=false] - Load image with priority (disable lazy load)
 *
 * @returns {React.ReactElement} Optimized image element
 *
 * @example
 * // Small thumbnail in compact list
 * <PostThumbnail image={post.image} size="sm" />
 *
 * @example
 * // Large hero image with priority loading
 * <PostThumbnail image={post.image} size="lg" priority />
 *
 * @example
 * // Medium image with custom classes
 * <PostThumbnail 
 *   image={post.image} 
 *   size="md"
 *   className="rounded-xl shadow-lg"
 * />
 *
 * @styling
 * Size variants:
 * - sm: 200x150px (compact list view)
 * - md: 400x300px (standard grid/magazine)
 * - lg: 800x600px (hero/featured)
 * All images maintain aspect ratio and cover container
 *
 * @performance
 * - Automatic format optimization (WebP/AVIF)
 * - Lazy loading by default
 * - Responsive srcset generation
 * - Blur placeholder for progressive loading
 *
 * @accessibility
 * - Alt text from image.alt (required in schema)
 * - Decorative role when appropriate
 * - Proper image dimensions for layout stability
 */
export function PostThumbnail({ 
  image, 
  alt,
  size = "md", 
  className,
  priority = false 
}: PostThumbnailProps) {
  // Default size configurations (can be overridden by className prop)
  const sizeClasses = {
    sm: "w-32 h-24",
    md: "w-[400px] h-[300px]",
    lg: "w-[800px] h-[600px]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/30 dark:bg-muted/20",
        // Only apply default size if no custom sizing in className
        !className?.match(/\b(w-|h-|min-w-|min-h-|max-w-|max-h-)/) && sizeClasses[size],
        className
      )}
    >
      <Image
        src={image.url}
        alt={image.alt || alt || "Blog post image"}
        fill
        className={cn(
          "object-cover transition-transform hover:scale-105 bg-muted/50 dark:bg-muted/30",
          ANIMATION.duration.normal
        )}
        priority={priority}
        sizes={`(max-width: 640px) 80px, (max-width: 768px) 128px, 200px`}
        placeholder="blur"
        blurDataURL={IMAGE_PLACEHOLDER.blur}
      />
    </div>
  );
}

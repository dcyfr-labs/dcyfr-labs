import Image from "next/image";
import type { PostImage } from "@/data/posts";
import { IMAGE_PLACEHOLDER } from "@/lib/design-tokens";
import { BlogPostHeroOverlay } from "@/components/common";

/**
 * PostHeroImage Component
 * 
 * Full-width hero image for blog posts with gradient overlays and responsive sizing.
 * Displays featured images at the top of blog post detail pages with optional captions.
 * 
 * Features:
 * - Full-width (breaks out of prose container)
 * - Responsive aspect ratios (16:9 on mobile, 21:9 on desktop)
 * - Gradient overlays for better text contrast (top and bottom)
 * - next/image optimization (lazy loading, blur placeholder, responsive sizes)
 * - Optional caption and credit display below image
 * - Semantic HTML with figure/figcaption
 * - Dark mode optimized overlays
 * 
 * @param props.image - Post image object with url, alt, dimensions, caption, credit
 * @param props.title - Post title for fallback alt text
 * @param props.priority - Load image with priority (for above-fold hero images)
 * 
 * @example
 * ```tsx
 * <PostHeroImage
 *   image={{
 *     url: "/blog/images/my-post/hero.jpg",
 *     alt: "Beautiful landscape",
 *     width: 1920,
 *     height: 1080,
 *     caption: "Photo taken at sunrise",
 *     credit: "John Doe"
 *   }}
 *   title="My Blog Post"
 *   priority={true}
 * />
 * ```
 */
interface PostHeroImageProps {
  image: PostImage;
  title: string;
  priority?: boolean;
}

export function PostHeroImage({ image, title, priority = true }: PostHeroImageProps) {
  const alt = image.alt || `Hero image for ${title}`;
  const hasCaption = image.caption || image.credit;
  
  return (
    <figure className="not-prose -mx-4 sm:-mx-6 md:-mx-8 mb-8 md:mb-12">
      {/* Image Container with Overlays */}
      <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden bg-muted">
        {/* Hero Image */}
        <Image
          src={image.url}
          alt={alt}
          fill
          priority={priority}
          quality={90}
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL={IMAGE_PLACEHOLDER.blur}
        />
      </div>
      
      {/* Caption and Credit */}
      {hasCaption && (
        <figcaption className="px-4 sm:px-8 md:px-8 pt-3 text-sm text-muted-foreground">
          {image.caption && (
            <p className="mb-1">{image.caption}</p>
          )}
          {image.credit && (
            <p className="text-xs">
              Photo by {image.credit}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

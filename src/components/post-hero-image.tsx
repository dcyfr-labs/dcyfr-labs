import Image from "next/image";
import type { PostImage } from "@/data/posts";

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
      {/* Image Container with Gradient Overlays */}
      <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden bg-muted">
        {/* Top gradient overlay for better header contrast */}
        <div 
          className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/80 via-background/40 to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
        
        {/* Bottom gradient overlay for caption/content */}
        <div 
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/60 to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
        
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
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4="
        />
      </div>
      
      {/* Caption and Credit */}
      {hasCaption && (
        <figcaption className="px-4 sm:px-6 md:px-8 pt-3 text-sm text-muted-foreground">
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

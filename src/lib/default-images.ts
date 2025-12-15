import type { PostImage } from "@/data/posts";

/**
 * Default Blog Image
 * 
 * Pre-designed fallback image for blog posts without custom featured images.
 */
export const DEFAULT_IMAGE = {
  url: "/blog/images/default/hero.svg",
  alt: "Default blog post featured image with gradient background",
} as const;

/**
 * Get the default image for a blog post
 * 
 * Returns the standard hero.svg default image for all posts without custom images.
 * 
 * @param options - Post metadata (currently unused, kept for API compatibility)
 * @returns PostImage object with default image data
 * 
 * @example
 * const defaultImg = getDefaultBlogImage({ 
 *   title: "My Post",
 *   tags: ["react", "typescript"]
 * });
 */
export function getDefaultBlogImage(options?: {
  title?: string;
  tags?: string[];
}): PostImage {
  return DEFAULT_IMAGE;
}

/**
 * Get dynamic default image URL from API endpoint
 * 
 * Uses the OG image generation API to create a custom default image
 * with the post title overlaid on a styled background.
 * 
 * @param title - Post title to display on image
 * @returns PostImage object with API URL
 * 
 * @example
 * const dynamicImg = getDynamicDefaultImage(
 *   "Getting Started with Next.js"
 * );
 */
export function getDynamicDefaultImage(
  title: string
): PostImage {
  const params = new URLSearchParams({
    title,
    style: "gradient",
  });

  return {
    url: `/api/default-blog-image?${params.toString()}`,
    alt: `${title} - Blog post featured image`,
  };
}

/**
 * Ensure a post has a featured image, using default if needed
 * 
 * @param image - Optional image from post frontmatter
 * @param fallbackOptions - Options for selecting default image
 * @returns PostImage object (custom or default)
 * 
 * @example
 * const featuredImage = ensurePostImage(post.image, {
 *   title: post.title,
 *   tags: post.tags
 * });
 */
export function ensurePostImage(
  image: PostImage | undefined,
  fallbackOptions?: Parameters<typeof getDefaultBlogImage>[0]
): PostImage {
  if (!image) return getDefaultBlogImage(fallbackOptions);

  // If no caption is provided and the alt is already present, return the
  // original image object to preserve referential identity (avoids surprising
  // object replacement in callers). If a caption exists and differs from the
  // current alt (or alt is missing), return a new object with alt set to the
  // caption. This ensures caption takes precedence for accessibility.
  const desiredAlt = image.caption ?? image.alt;
  if (!image.caption || image.alt === desiredAlt) {
    return image;
  }

  return {
    ...image,
    alt: desiredAlt,
  };
}

/**
 * Unsplash API Integration
 * 
 * Provides utilities for searching and downloading royalty-free images from Unsplash.
 * Requires UNSPLASH_ACCESS_KEY environment variable.
 * 
 * Usage:
 *   import { searchImages, downloadImage } from '@/lib/unsplash';
 *   
 *   const results = await searchImages('developer coding', { perPage: 10 });
 *   const imagePath = await downloadImage(results[0], 'my-post-slug');
 */

import { writeFileSync, mkdirSync } from 'fs';
import { writeFile as writeFileAsync, rename as renameAsync } from 'fs/promises';
import { join } from 'path';

const UNSPLASH_API_BASE = 'https://api.unsplash.com';

/**
 * Validates a slug parameter to prevent path traversal attacks
 */
function validateSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid slug: must be a non-empty string');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    throw new Error(
      'Invalid slug: must contain only alphanumeric characters, hyphens, and underscores'
    );
  }

  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    throw new Error('Invalid slug: path traversal sequences detected');
  }

  if (slug.length > 100) {
    throw new Error('Invalid slug: maximum length is 100 characters');
  }

  return slug;
}

/**
 * Validates that a URL is from the trusted Unsplash CDN
 */
function validateUnsplashUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL: must be a non-empty string');
  }

  if (!url.startsWith('https://images.unsplash.com/')) {
    throw new Error(
      'Invalid URL: must be from Unsplash CDN (https://images.unsplash.com/)'
    );
  }

  return url;
}
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    html: string;
    download: string;
    download_location: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  description: string | null;
  alt_description: string | null;
  width: number;
  height: number;
}

export interface SearchOptions {
  page?: number;
  perPage?: number;
  orderBy?: 'relevant' | 'latest';
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
}

/**
 * Search for images on Unsplash
 * 
 * @param query - Search query (e.g., "developer coding", "cybersecurity")
 * @param options - Search options
 * @returns Array of image results
 * 
 * @example
 * const images = await searchImages('react development', {
 *   perPage: 10,
 *   orientation: 'landscape'
 * });
 */
export async function searchImages(
  query: string,
  options: SearchOptions = {}
): Promise<UnsplashImage[]> {
  if (!ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY environment variable is not set');
  }

  const {
    page = 1,
    perPage = 10,
    orderBy = 'relevant',
    orientation = 'landscape',
    color,
  } = options;

  const params = new URLSearchParams({
    query,
    page: page.toString(),
    per_page: perPage.toString(),
    order_by: orderBy,
    orientation,
  });

  if (color) {
    params.append('color', color);
  }

  const url = `${UNSPLASH_API_BASE}/search/photos?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results as UnsplashImage[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search Unsplash: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Download an image from Unsplash and save to public directory
 * 
 * IMPORTANT: Call triggerDownload() after using this function to comply with
 * Unsplash API guidelines (triggers download tracking).
 * 
 * @param image - Unsplash image object
 * @param slug - Post slug for file naming
 * @param size - Image size variant ('raw', 'full', 'regular', 'small')
 * @returns Path to saved image
 * 
 * @example
 * const imagePath = await downloadImage(image, 'my-post', 'regular');
 * await triggerDownload(image); // Required for API compliance
 */
export async function downloadImage(
  image: UnsplashImage,
  slug: string,
  size: keyof UnsplashImage['urls'] = 'regular'
): Promise<string> {
  // Validate inputs to prevent path traversal and SSRF attacks
  const validatedSlug = validateSlug(slug);
  const imageUrl = validateUnsplashUrl(image.urls[size]);
  
  const outputDir = join(process.cwd(), 'public', 'blog', 'images', validatedSlug);
  const extension = 'jpg'; // Unsplash typically serves JPEGs
  const filename = `hero.${extension}`;
  const outputPath = join(outputDir, filename);

  // Create directory atomically (fixes TOCTOU race condition)
  mkdirSync(outputDir, { recursive: true });

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    // lgtm [js/http-to-file-access] - Security controls in place:
    // 1. URL validated via validateUnsplashUrl() against allowlist
    // 2. Path validated via validateSlug() to prevent directory traversal
    // 3. Source is trusted Unsplash API, not user-controlled endpoint
    // Use atomic write: write to a temp file and rename to avoid race conditions
    const tmpPath = `${outputPath}.tmp`;
    await writeFileAsync(tmpPath, Buffer.from(buffer));
    await renameAsync(tmpPath, outputPath);

    return `/blog/images/${validatedSlug}/${filename}`;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to download image: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Trigger download tracking on Unsplash (required by API guidelines)
 * 
 * Must be called whenever an image is downloaded or used on your site.
 * 
 * @param image - Unsplash image object
 * 
 * @example
 * await downloadImage(image, 'my-post');
 * await triggerDownload(image); // Always call this after download
 */
export async function triggerDownload(image: UnsplashImage): Promise<void> {
  if (!ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY environment variable is not set');
  }

  try {
    const response = await fetch(image.links.download_location, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn(`Failed to trigger Unsplash download tracking: ${response.status}`);
    }
  } catch (error) {
    console.warn('Failed to trigger Unsplash download tracking:', error);
  }
}

/**
 * Format attribution text for Unsplash images (required by API guidelines)
 * 
 * @param image - Unsplash image object
 * @returns Formatted attribution string
 * 
 * @example
 * const credit = getAttribution(image);
 * // Returns: "Photo by John Doe on Unsplash"
 */
export function getAttribution(image: UnsplashImage): string {
  return `Photo by ${image.user.name} on Unsplash`;
}

/**
 * Get attribution link for Unsplash images (required by API guidelines)
 * 
 * @param image - Unsplash image object
 * @returns URL to photographer's Unsplash profile
 * 
 * @example
 * const link = getAttributionLink(image);
 * // Use in frontmatter: credit: "Photo by <a href='{link}'>John Doe</a> on Unsplash"
 */
export function getAttributionLink(image: UnsplashImage): string {
  return `${image.user.links.html}?utm_source=dcyfr-labs&utm_medium=referral`;
}

/**
 * Generate frontmatter for a post using an Unsplash image
 * 
 * @param image - Unsplash image object
 * @param imagePath - Path to downloaded image
 * @returns Frontmatter object for image field
 * 
 * @example
 * const frontmatter = generateFrontmatter(image, '/blog/images/my-post/hero.jpg');
 * // Add to post frontmatter:
 * // image:
 * //   url: "/blog/images/my-post/hero.jpg"
 * //   alt: "Developer working on code"
 * //   width: 1920
 * //   height: 1080
 * //   credit: "Photo by John Doe on Unsplash"
 */
export function generateFrontmatter(
  image: UnsplashImage,
  imagePath: string
): {
  url: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
} {
  return {
    url: imagePath,
    alt: image.alt_description || image.description || 'Blog post hero image',
    width: image.width,
    height: image.height,
    credit: getAttribution(image),
  };
}

/**
 * Search and download in one step
 * 
 * @param query - Search query
 * @param slug - Post slug
 * @param options - Search options
 * @returns Object with image path and frontmatter
 * 
 * @example
 * const { imagePath, frontmatter } = await searchAndDownload(
 *   'cybersecurity hacker',
 *   'my-security-post'
 * );
 * 
 * console.log('Add to frontmatter:');
 * console.log(JSON.stringify(frontmatter, null, 2));
 */
export async function searchAndDownload(
  query: string,
  slug: string,
  options: SearchOptions = {}
): Promise<{
  imagePath: string;
  frontmatter: ReturnType<typeof generateFrontmatter>;
  image: UnsplashImage;
}> {
  const images = await searchImages(query, { ...options, perPage: 1 });

  if (images.length === 0) {
    throw new Error(`No images found for query: ${query}`);
  }

  const image = images[0];
  const imagePath = await downloadImage(image, slug);
  await triggerDownload(image);

  const frontmatter = generateFrontmatter(image, imagePath);

  return {
    imagePath,
    frontmatter,
    image,
  };
}

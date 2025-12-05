/**
 * Metadata Generation Library
 * 
 * Centralized, type-safe helpers for generating Next.js Metadata objects.
 * Consolidates patterns from archive.ts, article.ts, and site-config.ts.
 * 
 * @example
 * ```tsx
 * // Standard page
 * export const metadata = createPageMetadata({
 *   title: 'About',
 *   description: 'Learn more about us',
 *   path: '/about',
 * });
 * 
 * // Archive page
 * export const metadata = createArchivePageMetadata({
 *   title: 'Blog',
 *   description: 'All blog posts',
 *   path: '/blog',
 *   itemCount: posts.length,
 * });
 * 
 * // Article page
 * export const metadata = createArticlePageMetadata({
 *   title: post.title,
 *   description: post.summary,
 *   path: `/blog/${post.slug}`,
 *   publishedAt: post.publishedAt,
 *   author: 'Drew',
 *   tags: post.tags,
 *   image: post.image?.url,
 * });
 * ```
 */

import type { Metadata } from 'next';
import { SITE_URL, SITE_TITLE_PLAIN, getOgImageUrl, getTwitterImageUrl } from './site-config';

/**
 * Base metadata options shared across all page types
 */
export interface BaseMetadataOptions {
  /** Page title (will be templated with site title) */
  title: string;
  
  /** Page description */
  description: string;
  
  /** Page path (relative to site root, e.g., '/blog' or '/blog/post-slug') */
  path: string;
  
  /** Keywords/tags for SEO */
  keywords?: string[];
  
  /** Custom OG image URL (if not using dynamic generator) */
  customImage?: string;
  
  /** Custom image dimensions (if using custom image) */
  imageWidth?: number;
  imageHeight?: number;
  
  /** Custom image alt text */
  imageAlt?: string;
}

/**
 * Create metadata for a standard page (homepage, about, contact, etc.)
 * 
 * @example
 * ```tsx
 * export const metadata = createPageMetadata({
 *   title: 'About',
 *   description: 'Learn about Drew, a cyber architect...',
 *   path: '/about',
 * });
 * ```
 */
export function createPageMetadata(options: BaseMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords,
    customImage,
    imageWidth = 1200,
    imageHeight = 630,
    imageAlt,
  } = options;

  const fullUrl = `${SITE_URL}${path}`;
  const ogImageUrl = customImage || getOgImageUrl(title, description);
  const twitterImageUrl = customImage || getTwitterImageUrl(title, description);
  const imageType = customImage ? 'image/jpeg' : 'image/png';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${title} — ${SITE_TITLE_PLAIN}`,
      description,
      url: fullUrl,
      siteName: SITE_TITLE_PLAIN,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: imageWidth,
          height: imageHeight,
          type: imageType,
          alt: imageAlt || `${title} — ${SITE_TITLE_PLAIN}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_TITLE_PLAIN}`,
      description,
      images: [twitterImageUrl],
    },
  };
}

/**
 * Options for archive/collection pages
 */
export interface ArchiveMetadataOptions extends BaseMetadataOptions {
  /** Number of items in the archive */
  itemCount?: number;
  
  /** Active tag filter (appends to title) */
  activeTag?: string;
  
  /** Active search query (appends to title) */
  activeSearch?: string;
}

/**
 * Create metadata for archive/collection pages (blog list, projects, etc.)
 * 
 * Automatically adjusts title and description based on active filters.
 * 
 * @example
 * ```tsx
 * export const metadata = createArchivePageMetadata({
 *   title: 'Blog',
 *   description: 'Articles on web development and security',
 *   path: '/blog',
 *   itemCount: 42,
 *   activeTag: searchParams.tag,
 * });
 * ```
 */
export function createArchivePageMetadata(options: ArchiveMetadataOptions): Metadata {
  const {
    title,
    description,
    itemCount,
    activeTag,
    activeSearch,
    ...baseOptions
  } = options;

  // Build dynamic title based on filters
  let finalTitle = title;
  if (activeTag) {
    finalTitle = `${title} - ${activeTag}`;
  } else if (activeSearch) {
    finalTitle = `${title} - Search: ${activeSearch}`;
  }

  // Build dynamic description with item count
  let finalDescription = description;
  if (itemCount !== undefined) {
    const itemText = itemCount === 1 ? 'item' : 'items';
    finalDescription = `${description} (${itemCount} ${itemText})`;
  }
  if (activeTag) {
    finalDescription = `${description} — Filtered by "${activeTag}"`;
  }

  return createPageMetadata({
    ...baseOptions,
    title: finalTitle,
    description: finalDescription,
  });
}

/**
 * Options for individual article/item pages
 */
export interface ArticleMetadataOptions extends BaseMetadataOptions {
  /** Published date */
  publishedAt?: Date;
  
  /** Last modified date */
  modifiedAt?: Date;
  
  /** Author name(s) */
  author?: string | string[];
  
  /** Article type (default: 'article') */
  type?: 'article' | 'website';
  
  /** Hero/featured image URL (full path, not relative) */
  image?: string;
  
  /** Hero image dimensions */
  imageWidth?: number;
  imageHeight?: number;
  
  /** Hero image alt text */
  imageAlt?: string;
}

/**
 * Create metadata for individual article/item pages (blog posts, projects, etc.)
 * 
 * Includes article-specific Open Graph metadata and supports hero images.
 * 
 * @example
 * ```tsx
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const post = await getPost(params.slug);
 *   
 *   return createArticlePageMetadata({
 *     title: post.title,
 *     description: post.summary,
 *     path: `/blog/${post.slug}`,
 *     publishedAt: post.publishedAt,
 *     author: 'Drew',
 *     tags: post.tags,
 *     image: post.image?.url ? `${SITE_URL}${post.image.url}` : undefined,
 *     imageWidth: post.image?.width,
 *     imageHeight: post.image?.height,
 *     imageAlt: post.image?.alt,
 *   });
 * }
 * ```
 */
export function createArticlePageMetadata(options: ArticleMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    publishedAt,
    modifiedAt,
    author,
    type = 'article',
    image,
    imageWidth = 1200,
    imageHeight = 630,
    imageAlt,
    keywords,
  } = options;

  const fullUrl = `${SITE_URL}${path}`;
  const hasCustomImage = !!image;
  
  // Use custom image or fall back to dynamic generator
  const ogImageUrl = hasCustomImage ? image : getOgImageUrl(title, description);
  const twitterImageUrl = hasCustomImage ? image : getTwitterImageUrl(title, description);
  const imageType = hasCustomImage ? 'image/jpeg' : 'image/png';

  // Normalize authors
  const authorNames = Array.isArray(author) ? author : author ? [author] : undefined;
  const authorObjects = authorNames?.map(name => ({ name }));

  return {
    title,
    description,
    keywords,
    authors: authorObjects,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${title} — ${SITE_TITLE_PLAIN}`,
      description,
      url: fullUrl,
      siteName: SITE_TITLE_PLAIN,
      type,
      publishedTime: publishedAt?.toISOString(),
      modifiedTime: modifiedAt?.toISOString() || publishedAt?.toISOString(),
      authors: authorNames,
      tags: keywords,
      images: [
        {
          url: ogImageUrl,
          width: imageWidth,
          height: imageHeight,
          type: imageType,
          alt: imageAlt || `${title} — ${SITE_TITLE_PLAIN}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_TITLE_PLAIN}`,
      description,
      images: [twitterImageUrl],
    },
  };
}

/**
 * Breadcrumb item for structured data
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate breadcrumb structured data (JSON-LD)
 * 
 * @example
 * ```tsx
 * const breadcrumbs = createBreadcrumbSchema([
 *   { name: 'Home', url: 'https://www.dcyfr.ai' },
 *   { name: 'Blog', url: 'https://www.dcyfr.ai/blog' },
 *   { name: post.title, url: `https://www.dcyfr.ai/blog/${post.slug}` },
 * ]);
 * 
 * // In JSX:
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
 * />
 * ```
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Options for article structured data
 */
export interface ArticleSchemaOptions {
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  modifiedAt?: Date;
  author: string;
  image?: string;
  tags?: string[];
}

/**
 * Generate Article structured data (JSON-LD) for SEO
 * 
 * @example
 * ```tsx
 * const schema = createArticleSchema({
 *   title: post.title,
 *   description: post.summary,
 *   url: `${SITE_URL}/blog/${post.slug}`,
 *   publishedAt: post.publishedAt,
 *   author: 'Drew',
 *   image: post.image?.url ? `${SITE_URL}${post.image.url}` : undefined,
 *   tags: post.tags,
 * });
 * 
 * // In JSX:
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
 * />
 * ```
 */
export function createArticleSchema(options: ArticleSchemaOptions) {
  const {
    title,
    description,
    url,
    publishedAt,
    modifiedAt,
    author,
    image,
    tags,
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished: publishedAt.toISOString(),
    dateModified: modifiedAt?.toISOString() || publishedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: author,
    },
    image: image || undefined,
    keywords: tags?.join(', '),
  };
}

/**
 * Options for collection/archive structured data
 */
export interface CollectionSchemaOptions {
  name: string;
  description: string;
  url: string;
  items: {
    name: string;
    description?: string;
    url: string;
    datePublished?: Date;
    author?: string;
  }[];
}

/**
 * Generate CollectionPage structured data (JSON-LD) for archive pages
 * 
 * @example
 * ```tsx
 * const schema = createCollectionSchema({
 *   name: 'Blog Posts',
 *   description: 'All blog posts about web development',
 *   url: `${SITE_URL}/blog`,
 *   items: posts.map(post => ({
 *     name: post.title,
 *     description: post.summary,
 *     url: `${SITE_URL}/blog/${post.slug}`,
 *     datePublished: post.publishedAt,
 *     author: 'Drew',
 *   })),
 * });
 * ```
 */
export function createCollectionSchema(options: CollectionSchemaOptions) {
  const { name, description, url, items } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: item.name,
          description: item.description,
          url: item.url,
          datePublished: item.datePublished?.toISOString(),
          author: item.author ? { '@type': 'Person', name: item.author } : undefined,
        },
      })),
    },
  };
}

/**
 * Helper to get JSON-LD script props with CSP nonce
 * 
 * IMPORTANT: Always pass the nonce even if it's an empty string.
 * The spread operator with `...(nonce && { nonce })` will exclude the nonce attribute
 * if nonce is falsy (including empty string ""), which causes CSP violations.
 * 
 * @example
 * ```tsx
 * const nonce = (await headers()).get("x-nonce") || "";
 * const schema = createArticleSchema({ ... });
 * 
 * return (
 *   <script {...getJsonLdScriptProps(schema, nonce)} />
 * );
 * ```
 */
export function getJsonLdScriptProps(schema: object, nonce?: string) {
  const props: Record<string, unknown> = {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
    suppressHydrationWarning: true,
  };

  // Always include nonce if it was provided (even if empty string)
  // The key insight: An empty nonce="" is better than no nonce attribute for CSP compliance
  if (nonce !== undefined) {
    props.nonce = nonce;
  }

  return props as React.ScriptHTMLAttributes<HTMLScriptElement>;
}

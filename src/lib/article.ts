/**
 * Article Pattern Library
 * 
 * Generic utilities for individual item pages with metadata, navigation, and related content.
 * Used by: /blog/[slug], /portfolio/[slug], and future individual pages.
 * 
 * @example
 * ```tsx
 * const config: ArticleConfig<Post> = {
 *   item: post,
 *   allItems: posts,
 *   relatedFields: ['tags'],
 *   idField: 'slug',
 * };
 * 
 * const data = getArticleData(config);
 * ```
 */

import type { Metadata } from 'next';

/**
 * Configuration for an article page
 */
export interface ArticleConfig<T> {
  /** Current item to display */
  item: T;
  
  /** All items (for navigation and related content) */
  allItems: T[];
  
  /** Fields to use for finding related items (e.g., ['tags', 'category']) */
  relatedFields: (keyof T)[];
  
  /** Unique identifier field (e.g., 'slug' or 'id') */
  idField: keyof T;
  
  /** Date field for sorting (optional) */
  dateField?: keyof T;
  
  /** Maximum number of related items to return */
  maxRelated?: number;
}

/**
 * Article data result with navigation and related content
 */
export interface ArticleData<T> {
  /** Current item */
  item: T;
  
  /** Previous item (null if none) */
  prevItem: T | null;
  
  /** Next item (null if none) */
  nextItem: T | null;
  
  /** Related items */
  relatedItems: T[];
  
  /** Whether navigation is available */
  hasNavigation: boolean;
}

/**
 * Get complete article data with navigation and related content
 * 
 * @example
 * ```tsx
 * const data = getArticleData({
 *   item: currentPost,
 *   allItems: allPosts,
 *   relatedFields: ['tags'],
 *   idField: 'slug',
 *   dateField: 'publishedAt',
 * });
 * ```
 */
export function getArticleData<T>(config: ArticleConfig<T>): ArticleData<T> {
  const {
    item,
    allItems,
    relatedFields,
    idField,
    dateField,
    maxRelated = 3,
  } = config;

  // Get navigation (prev/next)
  const { prevItem, nextItem } = getNavigation(item, allItems, idField, dateField);

  // Get related items
  const relatedItems = getRelatedItems(item, allItems, {
    relatedFields,
    idField,
    maxResults: maxRelated,
  });

  return {
    item,
    prevItem,
    nextItem,
    relatedItems,
    hasNavigation: !!(prevItem || nextItem),
  };
}

/**
 * Get previous and next items for navigation
 */
export function getNavigation<T>(
  currentItem: T,
  allItems: T[],
  idField: keyof T,
  dateField?: keyof T
): { prevItem: T | null; nextItem: T | null } {
  // Sort items by date if dateField is provided
  let sortedItems = allItems;
  if (dateField) {
    sortedItems = [...allItems].sort((a, b) => {
      const aDate = a[dateField];
      const bDate = b[dateField];
      
      if (aDate instanceof Date && bDate instanceof Date) {
        return bDate.getTime() - aDate.getTime(); // Newest first
      }
      return 0;
    });
  }

  // Find current item index
  const currentId = currentItem[idField];
  const currentIndex = sortedItems.findIndex(item => item[idField] === currentId);

  if (currentIndex === -1) {
    return { prevItem: null, nextItem: null };
  }

  // Get prev/next (in chronological order: prev = newer, next = older)
  const prevItem = currentIndex > 0 ? sortedItems[currentIndex - 1] : null;
  const nextItem = currentIndex < sortedItems.length - 1 ? sortedItems[currentIndex + 1] : null;

  return { prevItem, nextItem };
}

/**
 * Options for finding related items
 */
export interface RelatedItemsOptions<T> {
  /** Fields to match for finding related items */
  relatedFields: (keyof T)[];
  
  /** Unique identifier field to exclude current item */
  idField: keyof T;
  
  /** Maximum number of results */
  maxResults?: number;
  
  /** Minimum score threshold (0-1) */
  minScore?: number;
}

/**
 * Item with calculated relevance score
 */
interface ScoredItem<T> {
  item: T;
  score: number;
}

/**
 * Find related items based on shared field values (e.g., tags, categories)
 * 
 * @example
 * ```tsx
 * const related = getRelatedItems(currentPost, allPosts, {
 *   relatedFields: ['tags', 'category'],
 *   idField: 'slug',
 *   maxResults: 3,
 * });
 * ```
 */
export function getRelatedItems<T>(
  currentItem: T,
  allItems: T[],
  options: RelatedItemsOptions<T>
): T[] {
  const {
    relatedFields,
    idField,
    maxResults = 3,
    minScore = 0,
  } = options;

  const currentId = currentItem[idField];

  // Calculate relevance scores
  const scoredItems: ScoredItem<T>[] = allItems
    .filter(item => item[idField] !== currentId) // Exclude current item
    .map(item => ({
      item,
      score: calculateRelevanceScore(currentItem, item, relatedFields),
    }))
    .filter(scored => scored.score > minScore); // Filter by minimum score

  // Sort by score (highest first) and take top N
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.slice(0, maxResults).map(scored => scored.item);
}

/**
 * Calculate relevance score between two items based on shared field values
 * 
 * Score is calculated as: (number of shared values) / (total unique values)
 * Returns a value between 0 (no relation) and 1 (identical)
 */
function calculateRelevanceScore<T>(
  itemA: T,
  itemB: T,
  fields: (keyof T)[]
): number {
  let totalShared = 0;
  let totalUnique = 0;

  fields.forEach(field => {
    const valueA = itemA[field];
    const valueB = itemB[field];

    // Handle array fields (e.g., tags)
    if (Array.isArray(valueA) && Array.isArray(valueB)) {
      const setA = new Set(valueA);
      const setB = new Set(valueB);
      
      // Count shared values
      const shared = Array.from(setA).filter(val => setB.has(val)).length;
      totalShared += shared;
      
      // Count total unique values
      const union = new Set([...setA, ...setB]);
      totalUnique += union.size;
    }
    // Handle string/primitive fields
    else if (valueA === valueB && valueA !== undefined && valueA !== null) {
      totalShared += 1;
      totalUnique += 1;
    }
    // Different values
    else if (valueA !== undefined && valueB !== undefined) {
      totalUnique += 2;
    }
  });

  // Avoid division by zero
  if (totalUnique === 0) return 0;

  return totalShared / totalUnique;
}

/**
 * Create metadata for an article page
 * 
 * @example
 * ```tsx
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const post = await getPost(params.slug);
 *   
 *   return createArticleMetadata({
 *     title: post.title,
 *     description: post.description,
 *     path: `/blog/${post.slug}`,
 *     publishedAt: post.publishedAt,
 *     author: 'Drew',
 *     tags: post.tags,
 *     image: post.image?.url,
 *   });
 * }
 * ```
 */
export interface ArticleMetadataOptions {
  /** Article title */
  title: string;
  
  /** Article description */
  description: string;
  
  /** Article path (for canonical URL) */
  path: string;
  
  /** Published date */
  publishedAt?: Date;
  
  /** Last modified date */
  modifiedAt?: Date;
  
  /** Author name */
  author?: string;
  
  /** Tags/keywords */
  tags?: string[];
  
  /** Featured image URL */
  image?: string;
  
  /** Article type (default: 'article') */
  type?: 'article' | 'website';
}

export function createArticleMetadata(options: ArticleMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    publishedAt,
    modifiedAt,
    author,
    tags,
    image,
    type = 'article',
  } = options;

  // Build structured data
  const metadata: Metadata = {
    title,
    description,
    keywords: tags,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title,
      description,
      type,
      url: path,
      publishedTime: publishedAt?.toISOString(),
      modifiedTime: modifiedAt?.toISOString(),
      authors: author ? [author] : undefined,
      tags,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };

  return metadata;
}

/**
 * Generate breadcrumb structured data for article pages
 * 
 * @example
 * ```tsx
 * const breadcrumbs = createArticleBreadcrumbs([
 *   { name: 'Home', url: '/' },
 *   { name: 'Blog', url: '/blog' },
 *   { name: post.title, url: `/blog/${post.slug}` },
 * ]);
 * ```
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createArticleBreadcrumbs(items: BreadcrumbItem[]) {
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
 * Generate article structured data for SEO
 * 
 * @example
 * ```tsx
 * const schema = createArticleSchema({
 *   title: post.title,
 *   description: post.description,
 *   url: `https://cyberdrew.dev/blog/${post.slug}`,
 *   publishedAt: post.publishedAt,
 *   author: 'Drew',
 *   image: post.image?.url,
 * });
 * ```
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

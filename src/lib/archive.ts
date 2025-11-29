/**
 * Archive Pattern Library
 * 
 * Generic utilities for list/grid pages with filtering, sorting, and pagination.
 * Used by: /blog, /portfolio, and future archive pages.
 * 
 * @example
 * ```tsx
 * const config: ArchiveConfig<Post> = {
 *   items: posts,
 *   searchFields: ['title', 'description'],
 *   tagField: 'tags',
 *   dateField: 'publishedAt',
 * };
 * 
 * const data = getArchiveData(config, searchParams);
 * ```
 */

import type { Metadata } from 'next';

/**
 * Configuration for an archive page
 */
export interface ArchiveConfig<T> {
  /** All items to display */
  items: T[];
  
  /** Fields to search within (e.g., ['title', 'description']) */
  searchFields: (keyof T)[];
  
  /** Field containing tags (optional) */
  tagField?: keyof T;
  
  /** Field containing date for sorting (optional) */
  dateField?: keyof T;
  
  /** Items per page (default: 10) */
  itemsPerPage?: number;
  
  /** Default sort field */
  defaultSortField?: keyof T;
  
  /** Default sort direction */
  defaultSortDirection?: 'asc' | 'desc';
}

/**
 * Filter options extracted from URL search params
 */
export interface ArchiveFilters {
  search?: string;
  tag?: string;
  page?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Archive data result with filtered, sorted, and paginated items
 */
export interface ArchiveData<T> {
  /** Filtered and paginated items for current page */
  items: T[];
  
  /** All filtered items (before pagination) */
  allFilteredItems: T[];
  
  /** Total number of items after filtering */
  totalItems: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Current page number */
  currentPage: number;
  
  /** Items per page */
  itemsPerPage: number;
  
  /** All available tags */
  availableTags: string[];
  
  /** Active filters */
  filters: ArchiveFilters;
  
  /** Whether filters are active */
  hasActiveFilters: boolean;
}

/**
 * Get complete archive data with filtering, sorting, and pagination
 * 
 * @example
 * ```tsx
 * const data = getArchiveData(
 *   { items: posts, searchFields: ['title', 'description'], tagField: 'tags' },
 *   { search: 'nextjs', page: '2' }
 * );
 * ```
 */
export function getArchiveData<T>(
  config: ArchiveConfig<T>,
  searchParams: Record<string, string | string[] | undefined>
): ArchiveData<T> {
  const {
    items,
    searchFields,
    tagField,
    dateField,
    itemsPerPage = 10,
    defaultSortField = dateField,
    defaultSortDirection = 'desc',
  } = config;

  // Extract filters from search params
  const filters: ArchiveFilters = {
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    tag: typeof searchParams.tag === 'string' ? searchParams.tag : undefined,
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1,
    sortBy: typeof searchParams.sortBy === 'string' ? searchParams.sortBy : undefined,
    sortDirection: searchParams.sortDirection === 'asc' || searchParams.sortDirection === 'desc' 
      ? searchParams.sortDirection 
      : defaultSortDirection,
  };

  // Filter items
  let filteredItems = filterItems(items, {
    searchQuery: filters.search,
    searchFields,
    tag: filters.tag,
    tagField,
  });

  // Sort items
  const sortField = (filters.sortBy || defaultSortField) as keyof T;
  if (sortField) {
    filteredItems = sortItems(filteredItems, sortField, filters.sortDirection || 'desc');
  }

  // Get all available tags
  const availableTags = tagField ? extractTags(items, tagField) : [];

  // Paginate items
  const paginatedResult = paginateItems(filteredItems, filters.page || 1, itemsPerPage);

  // Check if any filters are active
  const hasActiveFilters = !!(filters.search || filters.tag);

  return {
    items: paginatedResult.items,
    allFilteredItems: filteredItems,
    totalItems: filteredItems.length,
    totalPages: paginatedResult.totalPages,
    currentPage: paginatedResult.currentPage,
    itemsPerPage,
    availableTags,
    filters,
    hasActiveFilters,
  };
}

/**
 * Filter options for items
 */
export interface FilterOptions<T> {
  /** Search query to match against searchFields */
  searchQuery?: string;
  
  /** Fields to search within */
  searchFields: (keyof T)[];
  
  /** Tag to filter by */
  tag?: string;
  
  /** Field containing tags */
  tagField?: keyof T;
}

/**
 * Filter items by search query and/or tag
 * 
 * @example
 * ```tsx
 * const filtered = filterItems(posts, {
 *   searchQuery: 'nextjs',
 *   searchFields: ['title', 'description'],
 *   tag: 'react',
 *   tagField: 'tags',
 * });
 * ```
 */
export function filterItems<T>(
  items: T[],
  options: FilterOptions<T>
): T[] {
  const { searchQuery, searchFields, tag, tagField } = options;
  
  return items.filter(item => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      });
      
      if (!matchesSearch) return false;
    }
    
    // Filter by tag
    if (tag && tagField) {
      const itemTags = item[tagField];
      if (Array.isArray(itemTags)) {
        if (!itemTags.includes(tag)) return false;
      } else if (itemTags !== tag) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort items by a field
 */
export function sortItems<T>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return direction === 'asc' 
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }
    
    // Handle strings
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  /** Items for current page */
  items: T[];
  
  /** Current page number (1-indexed) */
  currentPage: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Whether there's a previous page */
  hasPrevPage: boolean;
  
  /** Whether there's a next page */
  hasNextPage: boolean;
  
  /** Previous page number (null if none) */
  prevPage: number | null;
  
  /** Next page number (null if none) */
  nextPage: number | null;
}

/**
 * Paginate items
 * 
 * @example
 * ```tsx
 * const paginated = paginateItems(posts, 2, 10);
 * // Returns page 2 with 10 items per page
 * ```
 */
export function paginateItems<T>(
  items: T[],
  page: number,
  itemsPerPage: number
): PaginationResult<T> {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedItems = items.slice(startIndex, endIndex);
  
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  
  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    prevPage: hasPrevPage ? currentPage - 1 : null,
    nextPage: hasNextPage ? currentPage + 1 : null,
  };
}

/**
 * Extract all unique tags from items
 */
export function extractTags<T>(
  items: T[],
  tagField: keyof T
): string[] {
  const tagSet = new Set<string>();
  
  items.forEach(item => {
    const tags = item[tagField];
    if (Array.isArray(tags)) {
      tags.forEach(tag => {
        if (typeof tag === 'string') {
          tagSet.add(tag);
        }
      });
    } else if (typeof tags === 'string') {
      tagSet.add(tags);
    }
  });
  
  return Array.from(tagSet).sort();
}

/**
 * Create metadata for an archive page
 * 
 * @example
 * ```tsx
 * export async function generateMetadata(): Promise<Metadata> {
 *   return createArchiveMetadata({
 *     title: 'Blog Posts',
 *     description: 'All my blog posts about web development',
 *     path: '/blog',
 *   });
 * }
 * ```
 */
export interface ArchiveMetadataOptions {
  /** Page title */
  title: string;
  
  /** Page description */
  description: string;
  
  /** Path (for canonical URL) */
  path: string;
  
  /** Number of items (for structured data) */
  itemCount?: number;
  
  /** Active tag (appends to title/description) */
  activeTag?: string;
  
  /** Active search (appends to title/description) */
  activeSearch?: string;
}

export function createArchiveMetadata(options: ArchiveMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    itemCount,
    activeTag,
    activeSearch,
  } = options;
  
  // Build dynamic title
  let finalTitle = title;
  if (activeTag) {
    finalTitle = `${title} - ${activeTag}`;
  } else if (activeSearch) {
    finalTitle = `${title} - Search: ${activeSearch}`;
  }
  
  // Build dynamic description
  let finalDescription = description;
  if (itemCount !== undefined) {
    finalDescription = `${description} (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`;
  }
  
  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: 'website',
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
    },
  };
}

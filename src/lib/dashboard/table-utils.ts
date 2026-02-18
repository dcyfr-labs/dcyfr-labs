/**
 * Table utilities for dashboard components
 * 
 * Provides reusable functions for sorting, filtering, and manipulating table data.
 * Used by dashboard tables to implement common data operations.
 * 
 * Note: This file uses generic any types intentionally for maximum flexibility.
 * 
 * @module dashboard/table-utils
 */

 

/**
 * Generic sort direction type
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort configuration for a table
 */
export interface SortConfig<T> {
  /** Field to sort by */
  field: keyof T;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Sort an array of objects by a specified field and direction
 * 
 * @param data - Array to sort
 * @param field - Field to sort by
 * @param direction - Sort direction (asc or desc)
 * @returns Sorted array
 * 
 * @example
 * ```tsx
 * const sortedPosts = sortData(posts, 'views', 'desc');
 * ```
 */
/** Compare two values of the same type, return negative/zero/positive */
function compareValues(aVal: unknown, bVal: unknown): number {
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    return aVal.localeCompare(bVal);
  }
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return aVal - bVal;
  }
  if (
    Object.prototype.toString.call(aVal) === '[object Date]' &&
    Object.prototype.toString.call(bVal) === '[object Date]'
  ) {
    return (aVal as Date).getTime() - (bVal as Date).getTime();
  }
  return String(aVal).localeCompare(String(bVal));
}

export function sortData<T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  direction: SortDirection
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? -1 : 1;
    if (bVal == null) return direction === 'asc' ? 1 : -1;

    const comparison = compareValues(aVal, bVal);
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter data by a search query across multiple fields
 * 
 * @param data - Array to filter
 * @param query - Search query string
 * @param fields - Fields to search in
 * @returns Filtered array
 * 
 * @example
 * ```tsx
 * const filtered = filterBySearch(posts, 'nextjs', ['title', 'summary', 'tags']);
 * ```
 */
export function filterBySearch<T extends Record<string, any>>(
  data: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query || query.trim() === "") return data;

  const lowerQuery = query.toLowerCase().trim();

  return data.filter((item) => {
    return fields.some((field) => {
      const value = item[field];

      if (value == null) return false;

      // Handle arrays (e.g., tags)
      if (Array.isArray(value)) {
        return value.some((v: any) =>
          String(v).toLowerCase().includes(lowerQuery)
        );
      }

      // Handle strings and numbers
      return String(value).toLowerCase().includes(lowerQuery);
    });
  });
}

/**
 * Filter data by selected tags
 * 
 * @param data - Array to filter
 * @param selectedTags - Array of selected tag strings
 * @param tagField - Field name containing tags array
 * @returns Filtered array
 * 
 * @example
 * ```tsx
 * const filtered = filterByTags(posts, ['react', 'typescript'], 'tags');
 * ```
 */
export function filterByTags<T extends Record<string, any>>(
  data: T[],
  selectedTags: string[],
  tagField: keyof T
): T[] {
  if (!selectedTags || selectedTags.length === 0) return data;

  return data.filter((item) => {
    const itemTags = item[tagField];
    if (!Array.isArray(itemTags)) return false;

    // Item must have ALL selected tags (AND logic)
    return selectedTags.every((tag) =>
      itemTags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
    );
  });
}

/**
 * Filter data by boolean flags
 * 
 * @param data - Array to filter
 * @param filters - Object with field names and boolean values
 * @returns Filtered array
 * 
 * @example
 * ```tsx
 * const filtered = filterByFlags(posts, { draft: false, archived: false });
 * ```
 */
export function filterByFlags<T extends Record<string, any>>(
  data: T[],
  filters: Partial<Record<keyof T, boolean>>
): T[] {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, shouldHide]) => {
      if (!shouldHide) return true;
      // Hide items where the flag is true
      return !item[key as keyof T];
    });
  });
}

/**
 * Paginate data array
 * 
 * @param data - Array to paginate
 * @param page - Current page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated slice of array
 * 
 * @example
 * ```tsx
 * const page1 = paginate(posts, 1, 10); // First 10 items
 * const page2 = paginate(posts, 2, 10); // Items 11-20
 * ```
 */
export function paginate<T>(data: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

/**
 * Calculate total number of pages
 * 
 * @param totalItems - Total number of items
 * @param pageSize - Items per page
 * @returns Total page count
 * 
 * @example
 * ```tsx
 * const totalPages = getTotalPages(posts.length, 10);
 * ```
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Get all unique values for a field across an array
 * 
 * Useful for generating filter options (e.g., all unique tags).
 * 
 * @param data - Array to extract values from
 * @param field - Field to extract values from
 * @returns Array of unique values, sorted alphabetically
 * 
 * @example
 * ```tsx
 * const allTags = getUniqueValues(posts, 'tags'); // Flattens arrays
 * const allAuthors = getUniqueValues(posts, 'author');
 * ```
 */
export function getUniqueValues<T extends Record<string, any>>(
  data: T[],
  field: keyof T
): string[] {
  const values = new Set<string>();

  data.forEach((item) => {
    const value = item[field];

    if (value == null) return;

    // Handle arrays (e.g., tags)
    if (Array.isArray(value)) {
      value.forEach((v: any) => {
        if (v != null) values.add(String(v));
      });
    } else {
      values.add(String(value));
    }
  });

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

/**
 * Toggle sort direction
 * 
 * @param currentDirection - Current sort direction
 * @returns Opposite direction
 * 
 * @example
 * ```tsx
 * const newDirection = toggleSortDirection(sortDirection);
 * ```
 */
export function toggleSortDirection(currentDirection: SortDirection): SortDirection {
  return currentDirection === "asc" ? "desc" : "asc";
}

/**
 * Check if a field is currently being sorted
 * 
 * @param field - Field to check
 * @param sortConfig - Current sort configuration
 * @returns True if the field is the active sort field
 * 
 * @example
 * ```tsx
 * const isActive = isSortActive('views', { field: 'views', direction: 'desc' });
 * ```
 */
export function isSortActive<T>(
  field: keyof T,
  sortConfig: SortConfig<T> | null
): boolean {
  return sortConfig?.field === field;
}

/**
 * Calculate engagement rate for a post
 * Engagement rate = (shares + comments) / views × 100
 * 
 * @param views - Total views
 * @param shares - Total shares
 * @param comments - Total comments
 * @returns Engagement rate as percentage (0-100+)
 */
export function calculateEngagementRate(
  views: number,
  shares: number,
  comments: number
): number {
  if (views === 0) return 0;
  return ((shares + comments) / views) * 100;
}

/**
 * Get engagement tier based on rate
 * 
 * @param rate - Engagement rate percentage
 * @returns Tier label
 */
export function getEngagementTier(rate: number): "high" | "medium" | "low" {
  if (rate >= 5) return "high"; // 5%+ is excellent
  if (rate >= 2) return "medium"; // 2-5% is good
  return "low"; // <2% needs improvement
}

/**
 * Calculate comprehensive engagement score
 * Weighted formula: views (40%) + completion (30%) + shares (20%) + comments (10%)
 * 
 * @param views - Total views
 * @param shares - Total shares
 * @param comments - Total comments
 * @param averageViews - Site average views for normalization
 * @param completionRate - Reading completion rate (0-100)
 * @returns Engagement score (0-100)
 */
export function calculateEngagementScore(
  views: number,
  shares: number,
  comments: number,
  averageViews: number,
  completionRate: number = 0
): number {
  // Normalize views (0-100 scale based on average)
  const viewsScore = averageViews > 0 ? Math.min((views / averageViews) * 50, 100) : 0;
  
  // Completion rate is already 0-100
  const completionScore = completionRate;
  
  // Normalize shares (assume 10+ shares = 100 points)
  const sharesScore = Math.min((shares / 10) * 100, 100);
  
  // Normalize comments (assume 5+ comments = 100 points)
  const commentsScore = Math.min((comments / 5) * 100, 100);
  
  // Weighted average
  const score = (
    viewsScore * 0.4 +
    completionScore * 0.3 +
    sharesScore * 0.2 +
    commentsScore * 0.1
  );
  
  return Math.round(score);
}

/**
 * Get performance tier badge based on percentile ranking
 * 
 * @param value - Metric value
 * @param allValues - All values to compare against
 * @returns Performance tier
 */
export function getPerformanceTier(
  value: number,
  allValues: number[]
): "top" | "above-average" | "below-average" | "needs-attention" {
  if (allValues.length === 0) return "below-average";
  
  const sorted = [...allValues].sort((a, b) => b - a);
  const percentile = (sorted.indexOf(value) / sorted.length) * 100;
  
  if (percentile <= 10) return "top"; // Top 10%
  if (percentile <= 50) return "above-average"; // Above median
  if (percentile <= 85) return "below-average"; // Below median but not critical
  return "needs-attention"; // Bottom 15%
}

/**
 * Calculate benchmark comparison (e.g., "2x average", "15% below avg")
 * 
 * @param value - Current value
 * @param average - Average value to compare against
 * @returns Formatted benchmark string
 */
export function getBenchmark(value: number, average: number): string {
  if (average === 0) return "No baseline";
  
  const ratio = value / average;
  
  if (ratio >= 2) return `${Math.round(ratio)}x avg`;
  if (ratio >= 1.1) return `+${Math.round((ratio - 1) * 100)}% avg`;
  if (ratio >= 0.9) return "~avg";
  return `${Math.round((1 - ratio) * 100)}% below`;
}

/**
 * Get trend direction indicator
 * 
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Trend direction
 */
export function getTrendDirection(
  current: number,
  previous: number
): "up" | "down" | "neutral" {
  if (previous === 0) return "neutral";
  const change = ((current - previous) / previous) * 100;
  if (change > 5) return "up";
  if (change < -5) return "down";
  return "neutral";
}

/**
 * Format large numbers with K/M suffixes
 * 
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Filter data by publication date cohort
 * 
 * @param data - Array to filter
 * @param cohort - Publication cohort period
 * @param dateField - Field name containing date
 * @returns Filtered array
 */
export function filterByPublicationCohort<T extends Record<string, any>>(
  data: T[],
  cohort: string,
  dateField: keyof T
): T[] {
  if (cohort === "all") return data;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  
  switch (cohort) {
    case "last-7-days":
      startDate = new Date(startOfToday);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "last-30-days":
      startDate = new Date(startOfToday);
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "last-90-days":
      startDate = new Date(startOfToday);
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "this-quarter":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    case "last-quarter":
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lastQuarterMonth = lastQuarter < 0 ? 9 : lastQuarter * 3;
      startDate = new Date(lastQuarterYear, lastQuarterMonth, 1);
      const endDate = new Date(lastQuarterYear, lastQuarterMonth + 3, 0);
      return data.filter((item) => {
        const itemDate = new Date(item[dateField] as string);
        return itemDate >= startDate && itemDate <= endDate;
      });
    case "this-year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "last-year":
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      const yearEndDate = new Date(now.getFullYear() - 1, 11, 31);
      return data.filter((item) => {
        const itemDate = new Date(item[dateField] as string);
        return itemDate >= startDate && itemDate <= yearEndDate;
      });
    default:
      return data;
  }
  
  return data.filter((item) => {
    const itemDate = new Date(item[dateField] as string);
    return itemDate >= startDate;
  });
}

/**
 * Filter data by performance tier
 * 
 * @param data - Array to filter
 * @param tier - Performance tier to filter by
 * @param valueField - Field to use for performance calculation
 * @returns Filtered array
 */
export function filterByPerformanceTier<T extends Record<string, any>>(
  data: T[],
  tier: string,
  valueField: keyof T
): T[] {
  if (tier === "all") return data;
  
  const allValues = data.map(item => item[valueField] as number);
  
  return data.filter((item) => {
    const itemTier = getPerformanceTier(item[valueField] as number, allValues);
    return itemTier === tier;
  });
}

/**
 * Filter data by tags with AND/OR logic
 * 
 * @param data - Array to filter
 * @param selectedTags - Array of selected tag strings
 * @param tagField - Field name containing tags array
 * @param mode - Filter mode (AND requires all tags, OR requires any tag)
 * @returns Filtered array
 */
export function filterByTagsWithMode<T extends Record<string, any>>(
  data: T[],
  selectedTags: string[],
  tagField: keyof T,
  mode: "AND" | "OR" = "AND"
): T[] {
  if (!selectedTags || selectedTags.length === 0) return data;

  return data.filter((item) => {
    const itemTags = item[tagField];
    if (!Array.isArray(itemTags)) return false;

    if (mode === "OR") {
      // Item must have AT LEAST ONE selected tag
      return selectedTags.some((tag) =>
        itemTags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
      );
    } else {
      // Item must have ALL selected tags (existing AND behavior)
      return selectedTags.every((tag) =>
        itemTags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
      );
    }
  });
}

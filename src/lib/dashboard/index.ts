/**
 * Dashboard Utilities - Barrel Export
 *
 * Table utilities and export functions for the analytics dashboard.
 */

// Table utilities
export {
  sortData,
  filterBySearch,
  filterByTags,
  filterByFlags,
  paginate,
  getTotalPages,
  getUniqueValues,
  toggleSortDirection,
  isSortActive,
  calculateEngagementRate,
  getEngagementTier,
  calculateEngagementScore,
  getPerformanceTier,
  getBenchmark,
  getTrendDirection,
  formatCompactNumber,
  filterByPublicationCohort,
  filterByPerformanceTier,
  filterByTagsWithMode,
  type SortDirection,
  type SortConfig,
} from "./table-utils";

// Export utilities
export {
  convertToCSV,
  convertToJSON,
  downloadFile,
  exportToCSV,
  exportToJSON,
  generateTimestampedFilename,
  getMimeType,
  exportData,
  type ExportFormat,
} from "./export-utils";

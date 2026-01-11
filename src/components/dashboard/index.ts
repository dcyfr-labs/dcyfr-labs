/**
 * Dashboard Components Index
 * 
 * Reusable components for building admin/developer dashboards with consistent
 * layouts, stats displays, and data management.
 * 
 * @module components/dashboard
 */

export { DashboardLayout } from "./dashboard-layout";
export {
  DashboardStat,
  DashboardStats,
  DashboardFeaturedStat,
  DashboardFeaturedStats,
} from "./dashboard-stats";

// Re-export utility functions
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
  type SortDirection,
  type SortConfig,
} from "@/lib/dashboard";

export {
  exportToCSV,
  exportToJSON,
  exportData,
  generateTimestampedFilename,
  type ExportFormat,
} from "@/lib/dashboard";

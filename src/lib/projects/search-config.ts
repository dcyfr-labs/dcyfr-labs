/**
 * Projects Search Configuration
 * 
 * Search configuration for projects using the unified search system
 */

import type { SearchConfig } from "@/lib/search";
import type { Project } from "@/data/projects";

/**
 * Search configuration for projects
 * 
 * Searchable fields with relevance weights:
 * - title: 3x weight (highest priority)
 * - description: 2x weight
 * - tags: 1.5x weight
 * - category: 1x weight (base priority)
 */
export const PROJECT_SEARCH_CONFIG: SearchConfig<Project> = {
  fields: [
    { name: "title", weight: 3 },
    { name: "description", weight: 2 },
    { name: "tags", weight: 1.5 },
    { name: "category", weight: 1 },
  ],
  idField: "slug",
  fuzzyThreshold: 0.2,
  maxHistoryItems: 10,
  historyStorageKey: "project-search-history",
};

/**
 * Get field value for search indexing
 * Handles nested fields and arrays
 */
export function getProjectSearchFieldValue(project: Project, field: string): string {
  const value = project[field as keyof Project];
  
  if (Array.isArray(value)) {
    return value.join(" ");
  }
  
  return String(value || "");
}

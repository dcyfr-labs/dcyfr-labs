/**
 * Project Search Client Component
 * 
 * Client-side search integration for projects using unified search system
 */

"use client";

import { useMemo } from "react";
import type { Project } from "@/data/projects";
import { createSearchIndex, searchItems } from "@/lib/search";
import { PROJECT_SEARCH_CONFIG } from "@/lib/projects/search-config";
import { SearchInput } from "@/components/common";

interface ProjectSearchProps {
  /** All projects */
  projects: Project[];
  /** Current search query */
  searchQuery: string;
  /** Callback when search changes */
  onSearchChange: (query: string) => void;
  /** Number of filtered results */
  resultCount: number;
}

/**
 * Project search component with unified search system
 * 
 * Features:
 * - Full-text search with fuzzy matching
 * - Advanced query syntax (tag:, category:, -, "exact")
 * - Search history
 * - Keyboard shortcuts (Cmd/Ctrl + K)
 * 
 * @example
 * <ProjectSearchClient
 *   projects={projects}
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   resultCount={filteredProjects.length}
 * />
 */
export function ProjectSearchClient({
  projects,
  searchQuery,
  onSearchChange,
  resultCount,
}: ProjectSearchProps) {
  return (
    <SearchInput
      value={searchQuery}
      onChange={onSearchChange}
      placeholder="Search projects... (try: tag:nextjs, category:opensource, &quot;exact phrase&quot;)"
      historyStorageKey={PROJECT_SEARCH_CONFIG.historyStorageKey}
      resultCount={resultCount}
      keyboardShortcut={true}
      showHints={true}
    />
  );
}

/**
 * Hook to use project search
 * Returns filtered projects based on search query
 */
export function useProjectSearch(projects: Project[], searchQuery: string) {
  const searchIndex = useMemo(() => {
    return createSearchIndex(projects, PROJECT_SEARCH_CONFIG);
  }, [projects]);

  const searchResults = useMemo(() => {
    if (!searchQuery?.trim()) {
      return projects;
    }

    const results = searchItems(projects, searchIndex, searchQuery, PROJECT_SEARCH_CONFIG);
    return results.map(r => r.item);
  }, [projects, searchIndex, searchQuery]);

  return searchResults;
}

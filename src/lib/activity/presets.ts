/**
 * Activity Filter Presets
 *
 * Manage saved filter combinations for quick access.
 * Presets are stored in localStorage and can be exported/imported.
 */

import type { ActivitySource } from "./types";

// ============================================================================
// TYPES
// ============================================================================

export type TimeRangeFilter = "today" | "week" | "month" | "year" | "all";

export interface ActivityFilterPreset {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Filter configuration */
  filters: {
    sources: ActivitySource[];
    timeRange: TimeRangeFilter;
  };

  /** Whether this is a built-in preset (cannot be deleted) */
  isDefault?: boolean;

  /** Creation timestamp */
  createdAt: number;

  /** Last used timestamp */
  lastUsedAt?: number;
}

export interface PresetCollection {
  version: number;
  presets: ActivityFilterPreset[];
  lastModified: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "dcyfr-activity-presets";
const STORAGE_VERSION = 1;

/**
 * Default presets available to all users
 */
export const DEFAULT_PRESETS: ActivityFilterPreset[] = [
  {
    id: "bookmarks",
    name: "Bookmarked Items",
    filters: {
      sources: [],
      timeRange: "all",
    },
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: "code-projects",
    name: "Code Projects",
    filters: {
      sources: ["blog", "project", "github"],
      timeRange: "all",
    },
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: "trending-month",
    name: "Trending This Month",
    filters: {
      sources: ["trending"],
      timeRange: "month",
    },
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: "recent-blog",
    name: "Recent Blog Posts",
    filters: {
      sources: ["blog"],
      timeRange: "week",
    },
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: "achievements",
    name: "All Achievements",
    filters: {
      sources: [],
      timeRange: "all",
    },
    isDefault: true,
    createdAt: Date.now(),
  },
];

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load presets from localStorage
 */
export function loadPresets(): ActivityFilterPreset[] {
  if (!isStorageAvailable()) {
    return DEFAULT_PRESETS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PRESETS;
    }

    const data: PresetCollection = JSON.parse(stored);

    // Validate version
    if (data.version !== STORAGE_VERSION) {
      console.warn("Preset version mismatch, using defaults");
      return DEFAULT_PRESETS;
    }

    // Merge with defaults (in case new defaults were added)
    const userPresets = data.presets.filter((p) => !p.isDefault);
    return [...DEFAULT_PRESETS, ...userPresets];
  } catch (error) {
    console.error("Failed to load presets:", error);
    return DEFAULT_PRESETS;
  }
}

/**
 * Save presets to localStorage
 */
export function savePresets(presets: ActivityFilterPreset[]): boolean {
  if (!isStorageAvailable()) {
    console.warn("localStorage not available");
    return false;
  }

  try {
    // Only save user presets (not defaults)
    const userPresets = presets.filter((p) => !p.isDefault);

    const data: PresetCollection = {
      version: STORAGE_VERSION,
      presets: userPresets,
      lastModified: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save presets:", error);
    return false;
  }
}

// ============================================================================
// PRESET OPERATIONS
// ============================================================================

/**
 * Create a new preset from current filters
 */
export function createPreset(
  name: string,
  sources: ActivitySource[],
  timeRange: TimeRangeFilter
): ActivityFilterPreset {
  return {
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    filters: {
      sources,
      timeRange,
    },
    createdAt: Date.now(),
  };
}

/**
 * Update an existing preset
 */
export function updatePreset(
  presets: ActivityFilterPreset[],
  id: string,
  updates: Partial<Omit<ActivityFilterPreset, "id" | "isDefault" | "createdAt">>
): ActivityFilterPreset[] {
  return presets.map((preset) =>
    preset.id === id && !preset.isDefault
      ? { ...preset, ...updates }
      : preset
  );
}

/**
 * Delete a preset (cannot delete defaults)
 */
export function deletePreset(
  presets: ActivityFilterPreset[],
  id: string
): ActivityFilterPreset[] {
  return presets.filter((p) => p.id !== id || p.isDefault);
}

/**
 * Mark preset as recently used
 */
export function markPresetUsed(
  presets: ActivityFilterPreset[],
  id: string
): ActivityFilterPreset[] {
  return presets.map((preset) =>
    preset.id === id ? { ...preset, lastUsedAt: Date.now() } : preset
  );
}

/**
 * Reorder presets (does not affect defaults)
 */
export function reorderPresets(
  presets: ActivityFilterPreset[],
  fromIndex: number,
  toIndex: number
): ActivityFilterPreset[] {
  const defaults = presets.filter((p) => p.isDefault);
  const userPresets = presets.filter((p) => !p.isDefault);

  const [moved] = userPresets.splice(fromIndex, 1);
  userPresets.splice(toIndex, 0, moved);

  return [...defaults, ...userPresets];
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

/**
 * Export presets as JSON string
 */
export function exportPresets(presets: ActivityFilterPreset[]): string {
  const userPresets = presets.filter((p) => !p.isDefault);
  return JSON.stringify(
    {
      version: STORAGE_VERSION,
      presets: userPresets,
      exportedAt: Date.now(),
    },
    null,
    2
  );
}

/**
 * Import presets from JSON string
 */
export function importPresets(
  json: string,
  existingPresets: ActivityFilterPreset[]
): { success: boolean; presets?: ActivityFilterPreset[]; error?: string } {
  try {
    const data = JSON.parse(json);

    // Validate structure
    if (!data.version || !Array.isArray(data.presets)) {
      return { success: false, error: "Invalid preset format" };
    }

    // Validate version
    if (data.version !== STORAGE_VERSION) {
      return { success: false, error: "Incompatible preset version" };
    }

    // Merge with existing (avoid duplicates by name)
    const existingNames = new Set(existingPresets.map((p) => p.name));
    const newPresets = data.presets.filter(
      (p: ActivityFilterPreset) => !existingNames.has(p.name)
    );

    // Remove default flag from imported presets
    const importedPresets = newPresets.map((p: ActivityFilterPreset) => ({
      ...p,
      isDefault: false,
    }));

    return {
      success: true,
      presets: [...existingPresets, ...importedPresets],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Import failed",
    };
  }
}

/**
 * Download presets as JSON file
 */
export function downloadPresetsAsFile(presets: ActivityFilterPreset[]): void {
  const json = exportPresets(presets);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `activity-presets-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

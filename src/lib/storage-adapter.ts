/**
 * Storage Adapter Pattern
 *
 * Abstraction layer for activity engagement storage (likes, bookmarks).
 * Prepares for OAuth migration by decoupling storage logic from UI components.
 *
 * Current: localStorage (client-side only)
 * Future: API backend (persisted with user authentication)
 *
 * Migration path:
 * 1. Phase 4 (now): Create adapter interface
 * 2. OAuth integration: Implement ServerStorageAdapter
 * 3. User session: Switch adapter based on auth state
 * 4. Data migration: Sync localStorage → server on first auth
 *
 * @module lib/storage-adapter
 */

// ============================================================================
// STORAGE ADAPTER INTERFACE
// ============================================================================

/**
 * Generic storage adapter for persisting user engagement data
 */
export interface StorageAdapter<T = any> {
  /** Get item by key */
  get(key: string): Promise<T | null>;
  /** Set item with value */
  set(key: string, value: T): Promise<void>;
  /** Remove item by key */
  remove(key: string): Promise<void>;
  /** Check if item exists */
  has(key: string): Promise<boolean>;
  /** Clear all items (use with caution) */
  clear(): Promise<void>;
  /** Get all keys */
  keys(): Promise<string[]>;
}

// ============================================================================
// LOCALSTORAGE ADAPTER (CURRENT IMPLEMENTATION)
// ============================================================================

/**
 * LocalStorage adapter for client-side persistence
 * Used for guest/unauthenticated users
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = "dcyfr:") {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(this.getFullKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to get ${key}:`, error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.getFullKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to set ${key}:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to remove ${key}:`, error);
    }
  }

  async has(key: string): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      return localStorage.getItem(this.getFullKey(key)) !== null;
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to check ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      // Only clear items with our prefix
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("[LocalStorageAdapter] Failed to clear:", error);
    }
  }

  async keys(): Promise<string[]> {
    if (typeof window === "undefined") return [];

    try {
      const allKeys = Object.keys(localStorage);
      return allKeys
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.replace(this.prefix, ""));
    } catch (error) {
      console.error("[LocalStorageAdapter] Failed to get keys:", error);
      return [];
    }
  }
}

// ============================================================================
// API STORAGE ADAPTER (FUTURE IMPLEMENTATION)
// ============================================================================

/**
 * API storage adapter for server-backed persistence
 * Used for authenticated users with OAuth
 *
 * TODO: Implement when OAuth is ready
 *
 * Features:
 * - Server-side persistence
 * - Cross-device sync
 * - Real-time updates via WebSockets/SSE
 * - Conflict resolution (last-write-wins)
 *
 * Endpoints:
 * - GET /api/user/engagement/:key
 * - POST /api/user/engagement/:key
 * - DELETE /api/user/engagement/:key
 */
export class ApiStorageAdapter implements StorageAdapter {
  private apiBaseUrl: string;
  private authToken?: string;

  constructor(apiBaseUrl: string = "/api/user/engagement", authToken?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const response = await this.fetchWithAuth(`${this.apiBaseUrl}/${key}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error(`[ApiStorageAdapter] Failed to get ${key}:`, error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      const response = await this.fetchWithAuth(`${this.apiBaseUrl}/${key}`, {
        method: "POST",
        body: JSON.stringify({ value }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`[ApiStorageAdapter] Failed to set ${key}:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const response = await this.fetchWithAuth(`${this.apiBaseUrl}/${key}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`[ApiStorageAdapter] Failed to remove ${key}:`, error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`${this.apiBaseUrl}/${key}`, {
        method: "HEAD",
      });
      return response.ok;
    } catch (error) {
      console.error(`[ApiStorageAdapter] Failed to check ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const response = await this.fetchWithAuth(this.apiBaseUrl, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("[ApiStorageAdapter] Failed to clear:", error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const response = await this.fetchWithAuth(this.apiBaseUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.keys || [];
    } catch (error) {
      console.error("[ApiStorageAdapter] Failed to get keys:", error);
      return [];
    }
  }
}

// ============================================================================
// ADAPTER FACTORY
// ============================================================================

/**
 * Create storage adapter based on user authentication state
 *
 * Current: Always returns LocalStorageAdapter
 * Future: Returns ApiStorageAdapter for authenticated users
 *
 * @param isAuthenticated - Whether user is logged in (OAuth)
 * @param authToken - Optional auth token for API requests
 * @returns Storage adapter instance
 */
export function createStorageAdapter(
  isAuthenticated: boolean = false,
  authToken?: string
): StorageAdapter {
  // TODO: Switch to ApiStorageAdapter when OAuth is implemented
  if (isAuthenticated && authToken) {
    // For now, still use localStorage (API not implemented)
    // return new ApiStorageAdapter("/api/user/engagement", authToken);
    console.log("[StorageAdapter] OAuth not yet implemented, using localStorage");
    return new LocalStorageAdapter();
  }

  return new LocalStorageAdapter();
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Migrate data from localStorage to API backend
 * Called on first OAuth login to preserve guest data
 *
 * @param adapter - Target API storage adapter
 * @returns Number of items migrated
 */
export async function migrateLocalStorageToApi(adapter: StorageAdapter): Promise<number> {
  const localAdapter = new LocalStorageAdapter();
  const keys = await localAdapter.keys();

  let migratedCount = 0;

  for (const key of keys) {
    try {
      const value = await localAdapter.get(key);
      if (value !== null) {
        await adapter.set(key, value);
        migratedCount++;
      }
    } catch (error) {
      console.error(`[Migration] Failed to migrate ${key}:`, error);
    }
  }

  console.log(`[Migration] Migrated ${migratedCount} items to API storage`);
  return migratedCount;
}

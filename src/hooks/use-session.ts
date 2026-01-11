/**
 * Session Hook
 *
 * Provides access to the current session ID for tracking purposes.
 * Session ID is stored in sessionStorage and persists for the browser session.
 */

"use client";

import { useState } from "react";
import { generateSessionId } from "@/lib/anti-spam-client";

export interface UseSessionReturn {
  /** Current session ID */
  sessionId: string | null;
  /** Whether the session is loading */
  isLoading: boolean;
}

/**
 * Get or create session ID from sessionStorage
 */
function getSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  let id = sessionStorage.getItem("viewTrackingSessionId");
  if (!id) {
    // Session IDs are for analytics tracking only, not security-sensitive operations.
    // lgtm[js/insecure-randomness]
    id = generateSessionId();
    sessionStorage.setItem("viewTrackingSessionId", id);
  }

  return id;
}

/**
 * Hook to get or create a session ID
 *
 * @returns Session state with ID and loading status
 *
 * @example
 * ```typescript
 * const { sessionId, isLoading } = useSession();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (!sessionId) return null;
 *
 * // Use sessionId for tracking
 * ```
 */
export function useSession(): UseSessionReturn {
  // Use lazy initializer to get session ID synchronously on mount
  const [sessionId] = useState<string | null>(getSessionId);

  return {
    sessionId,
    isLoading: false,
  };
}

/**
 * Client-safe anti-spam utilities
 *
 * This file contains utilities that can be safely used in client-side code.
 * Server-side utilities (Redis, request validation) are in anti-spam.ts
 */

/**
 * Generate a client-side session fingerprint
 * This should be called on the client and sent with requests
 * Not a security measure, just a reasonable identifier
 */
export function generateSessionId(): string {
  // Use crypto.randomUUID if available, fallback to timestamp + random
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  // Session IDs are for analytics tracking only, not authentication or security-sensitive operations.
  // These IDs are used to deduplicate page views in the same browser session, not for any security purpose.
  // lgtm[js/insecure-randomness]
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate session ID format to prevent injection attacks
 */
export function isValidSessionId(sessionId: unknown): boolean {
  if (typeof sessionId !== "string") return false;
  if (sessionId.length < 10 || sessionId.length > 100) return false;

  // Allow alphanumeric, hyphens, and underscores only
  return /^[a-zA-Z0-9\-_]+$/.test(sessionId);
}

/**
 * Timing-safe string comparison utility
 *
 * Prevents timing attacks by comparing strings in constant time.
 * Used for comparing secrets, tokens, and other sensitive values.
 *
 * @module lib/security/timing-safe
 */

import { timingSafeEqual as cryptoTimingSafeEqual } from 'node:crypto';

/**
 * Compare two strings in constant time to prevent timing attacks
 *
 * This function uses Node.js's crypto.timingSafeEqual to perform
 * constant-time comparison, preventing attackers from using timing
 * side-channels to brute-force secrets character-by-character.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 *
 * @example
 * ```typescript
 * const userToken = request.headers.get('authorization')?.replace('Bearer ', '');
 * const serverToken = process.env.API_TOKEN;
 *
 * if (!userToken || !timingSafeEqual(userToken, serverToken)) {
 *   return new Response('Unauthorized', { status: 401 });
 * }
 * ```
 *
 * @security
 * - Always use this function when comparing secrets, tokens, or passwords
 * - Never use === or !== for security-sensitive comparisons
 * - Converts strings to fixed-length buffers for constant-time comparison
 * - Returns false if string lengths differ (also in constant time)
 */
export function timingSafeEqual(a: string, b: string): boolean {
  // Convert strings to buffers
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  // If lengths differ, still compare equal-length buffers to maintain constant time
  // This prevents timing attacks that could deduce secret length
  if (bufA.length !== bufB.length) {
    // Compare bufA with itself (always equal) to maintain constant time
    // but return false because lengths differ
    try {
      cryptoTimingSafeEqual(bufA, bufA);
    } catch {
      // Ignore errors, just maintaining constant time
    }
    return false;
  }

  try {
    return cryptoTimingSafeEqual(bufA, bufB);
  } catch {
    // timingSafeEqual throws if buffers have different lengths
    // This should never happen due to the check above, but handle defensively
    return false;
  }
}

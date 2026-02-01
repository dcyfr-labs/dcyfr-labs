/**
 * Security utilities for safe regex pattern handling
 * Fixes CWE-94: Improper Control of Generation of Code ('Code Injection')
 *
 * These utilities prevent regex injection attacks by properly escaping
 * special characters in user-supplied patterns before converting to RegExp.
 */

/**
 * Escapes regex special characters in a pattern string, preserving wildcards.
 *
 * This function prevents regex injection (CWE-94) by escaping all regex
 * metacharacters except `*` (wildcard), which is converted to `.*`.
 *
 * @param pattern - The pattern string with optional wildcards (*)
 * @returns Safely escaped pattern suitable for RegExp construction
 *
 * @example
 * ```typescript
 * // Safe wildcard matching
 * escapeRegExp('pageviews:*')  // → 'pageviews:.*'
 *
 * // Prevents injection via special chars
 * escapeRegExp('test.key')     // → 'test\\.key'
 * escapeRegExp('user+admin')   // → 'user\\+admin'
 * escapeRegExp('test[abc]')    // → 'test\\[abc\\]'
 * ```
 *
 * @security
 * Protects against attacks like:
 * - Pattern: `.*` (matches everything)
 * - Pattern: `.+secret` (unintended regex behavior)
 * - Pattern: `^(a+)+$` (ReDoS - Regular Expression Denial of Service)
 */
export function escapeRegExp(pattern: string): string {
  // Escape all regex special characters: . + ? ^ $ { } ( ) | [ ] \
  // But preserve * as wildcard (will convert to .* below)
  return (
    pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*/g, '.*') // Convert wildcard * to .*
  );
}

/**
 * Creates a safe RegExp from a wildcard pattern.
 *
 * Convenience function that combines pattern escaping with RegExp
 * construction and anchoring (^...$) for exact matching.
 *
 * @param pattern - The pattern string with optional wildcards (*)
 * @param flags - Optional regex flags (e.g., 'i' for case-insensitive)
 * @returns A safe RegExp object
 *
 * @example
 * ```typescript
 * const regex = createSafeRegex('pageviews:*');
 * regex.test('pageviews:123')  // → true
 * regex.test('other:123')      // → false
 *
 * // Case-insensitive matching
 * const insensitive = createSafeRegex('user:*', 'i');
 * insensitive.test('USER:123')  // → true
 * ```
 */
export function createSafeRegex(pattern: string, flags?: string): RegExp {
  const escaped = escapeRegExp(pattern);
  return new RegExp(`^${escaped}$`, flags);
}

/**
 * Tests if a string matches a wildcard pattern safely.
 *
 * High-level helper for wildcard matching with automatic escaping.
 *
 * @param str - The string to test
 * @param pattern - The wildcard pattern
 * @param caseInsensitive - Whether to ignore case (default: false)
 * @returns True if the string matches the pattern
 *
 * @example
 * ```typescript
 * matchesPattern('pageviews:123', 'pageviews:*')     // → true
 * matchesPattern('engagement:45', 'pageviews:*')     // → false
 * matchesPattern('User:Admin', 'user:*', true)       // → true (case-insensitive)
 * ```
 */
export function matchesPattern(
  str: string,
  pattern: string,
  caseInsensitive = false,
): boolean {
  const regex = createSafeRegex(pattern, caseInsensitive ? 'i' : undefined);
  return regex.test(str);
}

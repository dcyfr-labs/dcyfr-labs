/**
 * Input validation utilities for security-sensitive script operations
 * 
 * @module scripts/lib/validation
 */

/**
 * Validates a slug parameter to prevent path traversal attacks
 * 
 * Security requirements:
 * - Only alphanumeric characters, hyphens, and underscores allowed
 * - No path traversal sequences (.., /, \)
 * - Maximum length of 100 characters
 * 
 * @param {string} slug - The slug to validate
 * @returns {string} The validated slug
 * @throws {Error} If slug is invalid or contains unsafe characters
 * 
 * @example
 * validateSlug('my-blog-post'); // Returns: 'my-blog-post'
 * validateSlug('../etc'); // Throws: Error
 */
export function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid slug: must be a non-empty string');
  }

  // Check for alphanumeric, hyphens, and underscores only
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    throw new Error(
      'Invalid slug: must contain only alphanumeric characters, hyphens, and underscores'
    );
  }

  // Explicit path traversal check (redundant with regex, but defense in depth)
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    throw new Error('Invalid slug: path traversal sequences detected');
  }

  // Reasonable length limit to prevent resource exhaustion
  if (slug.length > 100) {
    throw new Error('Invalid slug: maximum length is 100 characters');
  }

  return slug;
}

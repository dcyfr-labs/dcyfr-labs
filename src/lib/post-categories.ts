/**
 * Post Category Types and Labels
 *
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for post categories.
 * This file is safe to import in both client and server components.
 *
 * WHY THIS FILE EXISTS:
 * - Previously, category labels were duplicated in multiple files
 * - Categories in MDX frontmatter didn't match the hardcoded labels
 * - This caused missing category badges on blog lists and post pages
 *
 * WHEN ADDING NEW CATEGORIES:
 * 1. Add to PostCategory type below
 * 2. Add to POST_CATEGORY_LABEL mapping
 * 3. Use the new category in your MDX frontmatter
 *
 * DO NOT:
 * - Create duplicate CATEGORY_LABEL maps in other files
 * - Import from @/data/posts in client components (use this file instead)
 *
 * @see src/__tests__/components/post-badges.test.tsx for regression tests
 */

/**
 * SINGLE SOURCE OF TRUTH - Define all categories here once
 * Type and labels are auto-generated below
 */
const CATEGORIES = [
  // Current standard (capitalized)
  { id: 'AI', label: 'AI' },
  { id: 'Architecture', label: 'Architecture' },
  { id: 'Career', label: 'Career' },
  { id: 'Demo', label: 'Demo' },
  { id: 'Design', label: 'Design' },
  { id: 'DevSecOps', label: 'DevSecOps' },
  { id: 'Web', label: 'Web Development' },
  // Legacy lowercase (backwards compatibility)
  { id: 'development', label: 'Development' },
  { id: 'security', label: 'Security' },
  { id: 'career', label: 'Career' },
  { id: 'ai', label: 'AI' },
  { id: 'tutorial', label: 'Tutorial' },
] as const;

// Auto-generate type from CATEGORIES - no duplication needed
export type PostCategory = (typeof CATEGORIES)[number]['id'];

/**
 * Auto-generated labels from CATEGORIES - always in sync
 * This is the single source of truth - import from here, don't duplicate!
 */
export const POST_CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((cat) => [cat.id, cat.label])
) as Record<PostCategory, string>;

// Export for test generation (allows dynamic test updates)
export { CATEGORIES };

/**
 * Build a lowercase -> canonical ID mapping to support case-insensitive
 * normalization of category values coming from MDX frontmatter or legacy
 * data sources. When duplicates exist (e.g., "AI" and "ai"), prefer the
 * ID that contains uppercase characters (readability/display).
 */
const CANONICAL_BY_LOWER: Record<string, PostCategory> = (() => {
  const map: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const key = cat.id.toLowerCase();
    const existing = map[key];
    if (!existing) {
      map[key] = cat.id;
    } else {
      // Prefer the ID that has uppercase letters (e.g., "AI" over "ai")
      const preferCurrent = /[A-Z]/.test(cat.id) && !/[A-Z]/.test(existing);
      if (preferCurrent) map[key] = cat.id;
    }
  }
  return map as Record<string, PostCategory>;
})();

/**
 * Normalize a category string to a canonical PostCategory ID (case-insensitive).
 * Returns undefined when the category cannot be normalized.
 */
export function normalizeCategory(category?: string): PostCategory | undefined {
  if (!category) return undefined;
  const trimmed = category.trim();
  // First, try case-insensitive canonical mapping (prefer readable/capitalized IDs)
  const byLower = CANONICAL_BY_LOWER[trimmed.toLowerCase()];
  if (byLower) return byLower;
  // Fallback: direct match (exact ID)
  if (trimmed in POST_CATEGORY_LABEL) return trimmed as PostCategory;
  return undefined;
}

/**
 * Validate if a category exists in the mapping (case-insensitive)
 * Returns true if valid, false otherwise
 */
export function isValidCategory(category: string): category is PostCategory {
  return !!normalizeCategory(category);
}

/**
 * Get category label with fallback
 * Returns the label if found, otherwise returns the category itself or a default
 */
export function getCategoryLabel(
  category: string | undefined,
  fallback: string = 'Uncategorized'
): string {
  if (!category) return fallback;
  const normalized = normalizeCategory(category);
  if (!normalized) return fallback;
  return POST_CATEGORY_LABEL[normalized as PostCategory] || fallback;
}

/**
 * Get all valid category IDs
 * Useful for validation and autocomplete
 */
export function getValidCategories(): readonly PostCategory[] {
  return CATEGORIES.map((cat) => cat.id);
}

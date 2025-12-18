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
  { id: "AI", label: "AI" },
  { id: "Architecture", label: "Architecture" },
  { id: "Career", label: "Career" },
  { id: "Demo", label: "Demo" },
  { id: "DevSecOps", label: "DevSecOps" },
  { id: "Web", label: "Web Development" },
  // Legacy lowercase (backwards compatibility)
  { id: "development", label: "Development" },
  { id: "security", label: "Security" },
  { id: "career", label: "Career" },
  { id: "ai", label: "AI" },
  { id: "tutorial", label: "Tutorial" },
] as const;

// Auto-generate type from CATEGORIES - no duplication needed
export type PostCategory = typeof CATEGORIES[number]["id"];

/**
 * Auto-generated labels from CATEGORIES - always in sync
 * This is the single source of truth - import from here, don't duplicate!
 */
export const POST_CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map(cat => [cat.id, cat.label])
) as Record<PostCategory, string>;

// Export for test generation (allows dynamic test updates)
export { CATEGORIES };

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

// All valid post categories - keep in sync with frontmatter values
export type PostCategory = 
  | "development" | "security" | "career" | "ai" | "tutorial" // lowercase legacy
  | "AI" | "Career" | "Demo" | "DevSecOps" | "Web"; // capitalized (current standard)

/**
 * Human-readable labels for post categories.
 * This is the single source of truth - import from here, don't duplicate!
 */
export const POST_CATEGORY_LABEL: Record<PostCategory, string> = {
  // Lowercase legacy categories
  "development": "Development",
  "security": "Security", 
  "career": "Career",
  "ai": "AI",
  "tutorial": "Tutorial",
  // Capitalized categories (current standard)
  "AI": "AI",
  "Career": "Career",
  "Demo": "Demo",
  "DevSecOps": "DevSecOps",
  "Web": "Web Development",
};

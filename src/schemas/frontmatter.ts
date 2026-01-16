/**
 * Frontmatter Schema Validation
 *
 * Zod schemas for validating blog post frontmatter.
 * Used during build-time validation to ensure all posts conform to the expected schema.
 *
 * @see docs/blog/frontmatter-schema.md for complete documentation
 */

import { z } from "zod";

/**
 * Post Image Schema
 */
export const PostImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  caption: z.string().optional(),
  credit: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "Perplexity Labs" || !val.includes("AI Generated"),
      {
        message: 'Image credit should be "Perplexity Labs" (not "AI Generated")',
      }
    ),
  position: z.enum(["top", "left", "right", "background"]).optional(),
  hideHero: z.boolean().optional(),
  hideCard: z.boolean().optional(),
});

/**
 * Post Source Schema (for citations/references)
 */
export const PostSourceSchema = z.object({
  label: z.string().min(1, "Source label is required"),
  href: z.string().url("Source href must be a valid URL"),
});

/**
 * Post Series Schema
 */
export const PostSeriesSchema = z.object({
  name: z.string().min(1, "Series name is required"),
  order: z.number().int().positive("Series order must be a positive integer"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  previousSlugs: z.array(z.string()).optional(),
});

/**
 * Valid Post Categories
 * @see src/lib/post-categories.ts for source of truth
 */
export const PostCategorySchema = z.enum([
  "AI",
  "Architecture",
  "Career",
  "Demo",
  "Design",
  "DevSecOps",
  "Web",
  "development",
  "security",
  "career",
  "ai",
  "tutorial",
]);

/**
 * Post Frontmatter Schema
 *
 * This is the core schema for blog post frontmatter validation.
 * All required fields must be present in every post.
 */
export const PostFrontmatterSchema = z.object({
  // Stable identifier (required)
  id: z
    .string()
    .min(1, "Post ID is required")
    .regex(
      /^post-\d{8}-[a-f0-9]{8}$/,
      'Post ID must match format: post-YYYYMMDD-XXXXXXXX (e.g., "post-20260114-b4f5e2c2")'
    ),

  // Core metadata (required)
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),

  subtitle: z
    .string()
    .max(300, "Subtitle must be 300 characters or less")
    .optional(),

  summary: z
    .string()
    .min(50, "Summary must be at least 50 characters")
    .max(500, "Summary must be 500 characters or less"),

  // Authors (defaults to ["dcyfr"] if not specified)
  authors: z.array(z.string()).min(1, "At least one author is required").optional(),

  // Dates (required publishedAt, optional updatedAt)
  publishedAt: z.string().datetime("publishedAt must be a valid ISO 8601 datetime"),

  updatedAt: z.string().datetime("updatedAt must be a valid ISO 8601 datetime").optional(),

  // Category (optional but recommended)
  category: PostCategorySchema.optional(),

  // Tags (required, at least 1)
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),

  // Flags (all optional)
  featured: z.boolean().optional(),
  archived: z.boolean().optional(),
  draft: z.boolean().optional(),

  // Redirects (optional)
  previousSlugs: z.array(z.string()).optional(),
  previousIds: z.array(z.string()).optional(),

  // Image (optional but recommended for SEO)
  image: PostImageSchema.optional(),

  // Series (optional)
  series: PostSeriesSchema.optional(),

  // Sources/Citations (optional)
  sources: z.array(PostSourceSchema).optional(),

  // Deprecated field (backward compatibility)
  authorId: z.string().optional(),
});

/**
 * Type inference from Zod schema
 */
export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;
export type PostImage = z.infer<typeof PostImageSchema>;
export type PostSource = z.infer<typeof PostSourceSchema>;
export type PostSeries = z.infer<typeof PostSeriesSchema>;
export type PostCategory = z.infer<typeof PostCategorySchema>;

/**
 * Validate frontmatter and return typed result
 *
 * @param data - Raw frontmatter data from gray-matter
 * @param filepath - Path to the MDX file (for error reporting)
 * @returns Validated and typed frontmatter
 * @throws ZodError if validation fails
 */
export function validateFrontmatter(
  data: unknown,
  filepath: string
): PostFrontmatter {
  try {
    return PostFrontmatterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues
        .map((err: z.ZodIssue) => `  - ${err.path.join(".")}: ${err.message}`)
        .join("\n");

      throw new Error(
        `Frontmatter validation failed for ${filepath}:\n${formattedErrors}`
      );
    }
    throw error;
  }
}

/**
 * Safe validation that returns success/error result instead of throwing
 *
 * @param data - Raw frontmatter data from gray-matter
 * @returns { success: true, data: PostFrontmatter } | { success: false, error: ZodError }
 */
export function safeParseFrontmatter(data: unknown) {
  return PostFrontmatterSchema.safeParse(data);
}

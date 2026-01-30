import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import crypto from "crypto";
import type { Post } from "@/data/posts";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");
// Private drafts folder - git-ignored, only visible in development
const PRIVATE_CONTENT_DIR = path.join(
  process.cwd(),
  "src/content/blog/private"
);
const WORDS_PER_MINUTE = 225;

/**
 * Supported blog post structures:
 * 1. Flat file: src/content/blog/my-post.mdx
 * 2. Folder with index: src/content/blog/my-post/index.mdx (allows co-located assets)
 *
 * Private drafts (git-ignored, dev-only):
 * 3. Private flat file: src/content/blog/.private/my-draft.mdx
 * 4. Private folder: src/content/blog/.private/my-draft/index.mdx
 *
 * Folder structure enables co-locating images, videos, and other assets:
 * src/content/blog/my-post/
 * ├── index.mdx
 * ├── hero.png
 * ├── diagram.svg
 * └── demo.mp4
 */

/**
 * Generate a stable, deterministic post ID from publishedAt date and slug
 * Format: "post-{YYYYMMDD}-{hash}"
 * This ensures the ID never changes even if the slug changes
 *
 * @param publishedAt ISO date string (e.g., "2025-10-05")
 * @param slug Blog post slug (used as additional entropy)
 * @returns Stable post ID (e.g., "post-20251005-abc123")
 * @internal Exported for testing purposes only
 */
export function generatePostId(
  publishedAt: string | undefined,
  slug: string
): string {
  // Guard against missing publishedAt
  if (!publishedAt) {
    throw new Error(
      `Post "${slug}" is missing required frontmatter field: publishedAt. ` +
        `Please add 'publishedAt: "YYYY-MM-DDTHH:MM:SSZ"' to the post's frontmatter.`
    );
  }

  // Create deterministic hash from published date and slug
  const input = `${publishedAt}:${slug}`;
  const hash = crypto
    .createHash("sha256")
    .update(input)
    .digest("hex")
    .substring(0, 8); // Take first 8 chars of hex hash

  // Format: post-YYYYMMDD-{hash}
  // Extract just the date part (YYYY-MM-DD) from ISO datetime strings
  const datePart = publishedAt.split("T")[0]; // "2025-12-03T12:00:00Z" → "2025-12-03"
  const date = datePart.replace(/-/g, ""); // "2025-12-03" → "20251203"
  return `post-${date}-${hash}`;
}

/**
 * Check if a post is scheduled for future publication
 * @param publishedAt ISO date string
 * @returns true if the publishedAt date is in the future
 * @internal Exported for testing purposes only
 */
export function isScheduledPost(publishedAt: string): boolean {
  return new Date(publishedAt) > new Date();
}

/**
 * Check if a post should be visible based on draft status and scheduled date
 * @param post The post to check
 * @param isProduction Whether we're in production environment
 * @returns true if the post should be visible
 * @internal Exported for testing purposes only
 */
export function isPostVisible(
  post: Pick<Post, "draft" | "publishedAt">,
  isProduction: boolean = process.env.NODE_ENV === "production"
): boolean {
  if (!isProduction) return true;
  if (post.draft) return false;
  if (isScheduledPost(post.publishedAt)) return false;
  return true;
}

/**
 * Calculate reading time for blog post content
 * @internal Exported for testing purposes only
 */
export function calculateReadingTime(body: string): Post["readingTime"] {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return {
    words,
    minutes,
    text: `${minutes} min read`,
  };
}

/**
 * Check if a post has a co-located hero image
 * Looks for hero.svg, hero.jpg, hero.jpeg, hero.png, hero.webp in the post's directory
 * @param slug - The post slug
 * @param title - The post title (for alt text)
 * @param isPrivate - Whether the post is in the private folder
 * @returns Image object if found, undefined otherwise
 */
function getColocatedHeroImage(
  slug: string,
  title: string,
  isPrivate: boolean = false
): Post["image"] | undefined {
  const baseDir = isPrivate ? PRIVATE_CONTENT_DIR : CONTENT_DIR;
  const postDir = path.join(baseDir, slug);

  // Only check if the post uses folder structure (not flat file)
  if (!fs.existsSync(postDir) || !fs.statSync(postDir).isDirectory()) {
    return undefined;
  }

  // Check for hero images in order of preference
  const heroExtensions = [".svg", ".jpg", ".jpeg", ".png", ".webp"];

  for (const ext of heroExtensions) {
    const heroPath = path.join(postDir, `hero${ext}`);
    if (fs.existsSync(heroPath)) {
      return {
        url: `/blog/${slug}/assets/hero${ext}`,
        alt: `Hero image for ${title}`,
      };
    }
  }

  return undefined;
}

/**
 * Scan a content directory for blog posts
 * @param contentDir - The directory to scan
 * @param isPrivate - Whether this is the private (git-ignored) folder
 * @returns Array of posts found in the directory
 */
function scanContentDirectory(
  contentDir: string,
  isPrivate: boolean = false
): Post[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const entries = fs.readdirSync(contentDir, { withFileTypes: true });
  const posts: Post[] = [];

  for (const entry of entries) {
    // Skip the 'private' subdirectory when scanning main content dir
    // (it's scanned separately)
    if (entry.name === "private" && !isPrivate) {
      continue;
    }

    let slug: string;
    let filePath: string;

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      // Flat file: my-post.mdx
      slug = entry.name.replace(/\.mdx$/, "");
      filePath = path.join(contentDir, entry.name);
    } else if (entry.isDirectory()) {
      // Folder with index: my-post/index.mdx
      const indexPath = path.join(contentDir, entry.name, "index.mdx");
      if (fs.existsSync(indexPath)) {
        slug = entry.name;
        filePath = indexPath;
      } else {
        continue; // Skip directories without index.mdx
      }
    } else {
      continue; // Skip non-MDX files and other entries
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents, {
      engines: {
        yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
      },
    });

    const publishedAt = data.publishedAt as string;

    // Use explicit ID from frontmatter, or auto-generate deterministically
    const id =
      (data.id as string | undefined) || generatePostId(publishedAt, slug);

    // Check for co-located hero image if not specified in frontmatter
    const image =
      (data.image as Post["image"] | undefined) ||
      getColocatedHeroImage(slug, data.title as string, isPrivate);

    // Posts in private folder are implicitly drafts (hidden in production)
    const isDraft = isPrivate || (data.draft as boolean | undefined);

    posts.push({
      id,
      slug,
      title: data.title as string,
      subtitle: data.subtitle as string | undefined,
      summary: data.summary as string,
      publishedAt,
      updatedAt: data.updatedAt as string | undefined,
      category: data.category as Post["category"] | undefined,
      tags: (data.tags as string[]) || [],
      featured: data.featured as boolean | undefined,
      archived: data.archived as boolean | undefined,
      draft: isDraft,
      body: content,
      previousSlugs: (data.previousSlugs as string[]) || undefined,
      previousIds: (data.previousIds as string[]) || undefined,
      image,
      series: data.series as Post["series"] | undefined,
      authors: (data.authors as string[] | undefined) || [
        (data.author as string | undefined) || "dcyfr",
      ],
      authorId: (data.author as string | undefined) || "dcyfr", // deprecated, kept for backward compatibility
      readingTime: calculateReadingTime(content),
    } satisfies Post);
  }

  return posts;
}

export function getAllPosts(): Post[] {
  // Scan main content directory
  const publicPosts = scanContentDirectory(CONTENT_DIR, false);

  // Scan private drafts directory (only in development)
  const privatePosts =
    process.env.NODE_ENV !== "production"
      ? scanContentDirectory(PRIVATE_CONTENT_DIR, true)
      : [];

  const allPosts = [...publicPosts, ...privatePosts];

  // Filter out draft and scheduled (future-dated) posts in production
  const filteredPosts = allPosts.filter((post) => isPostVisible(post));

  // Sort by publishedAt date, newest first
  return filteredPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  // Try public content first
  let filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  let isPrivate = false;

  // Then try folder with index in public: my-post/index.mdx
  if (!fs.existsSync(filePath)) {
    filePath = path.join(CONTENT_DIR, slug, "index.mdx");
  }

  // Then try private drafts folder (only in development)
  if (!fs.existsSync(filePath) && process.env.NODE_ENV !== "production") {
    filePath = path.join(PRIVATE_CONTENT_DIR, `${slug}.mdx`);
    isPrivate = true;

    if (!fs.existsSync(filePath)) {
      filePath = path.join(PRIVATE_CONTENT_DIR, slug, "index.mdx");
    }
  }

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents, {
    engines: {
      yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
    },
  });

  const publishedAt = data.publishedAt as string;
  const id =
    (data.id as string | undefined) || generatePostId(publishedAt, slug);

  // Check for co-located hero image if not specified in frontmatter
  const image =
    (data.image as Post["image"] | undefined) ||
    getColocatedHeroImage(slug, data.title as string, isPrivate);

  // Posts in private folder are implicitly drafts (hidden in production)
  const isDraft = isPrivate || (data.draft as boolean | undefined);

  const post: Post = {
    id,
    slug,
    title: data.title as string,
    subtitle: data.subtitle as string | undefined,
    summary: data.summary as string,
    publishedAt,
    updatedAt: data.updatedAt as string | undefined,
    category: data.category as Post["category"] | undefined,
    tags: (data.tags as string[]) || [],
    featured: data.featured as boolean | undefined,
    archived: data.archived as boolean | undefined,
    draft: isDraft,
    body: content,
    previousSlugs: (data.previousSlugs as string[]) || undefined,
    previousIds: (data.previousIds as string[]) || undefined,
    image,
    series: data.series as Post["series"] | undefined,
    authors: (data.authors as string[] | undefined) || [
      (data.author as string | undefined) || "dcyfr",
    ],
    authorId: (data.author as string | undefined) || "dcyfr", // deprecated, kept for backward compatibility
    readingTime: calculateReadingTime(content),
  };

  // Don't return draft or scheduled (future-dated) posts in production
  if (!isPostVisible(post)) {
    return undefined;
  }

  return post;
}

/**
 * Build a map of old slugs to new/active slugs for redirect resolution.
 * Used to handle slug changes while maintaining backward compatibility.
 *
 * @param allPosts - Array of all posts from getAllPosts()
 * @returns Map where key is old slug and value is current/active slug
 * @example
 * const redirectMap = buildRedirectMap(posts);
 * redirectMap.get('old-slug-name') // returns 'new-slug-name'
 */
export function buildRedirectMap(allPosts: Post[]): Map<string, string> {
  const redirectMap = new Map<string, string>();

  for (const post of allPosts) {
    if (post.previousSlugs && post.previousSlugs.length > 0) {
      for (const oldSlug of post.previousSlugs) {
        redirectMap.set(oldSlug, post.slug);
      }
    }
  }

  return redirectMap;
}

/**
 * Get the canonical slug for any given slug, handling redirects.
 * If the slug is an old slug, returns the current slug.
 * Otherwise returns the input slug as-is.
 *
 * @param slug - The slug to look up (could be old or current)
 * @param allPosts - Array of all posts
 * @returns The canonical/current slug, or the input slug if not found in redirects
 * @example
 * const canonical = getCanonicalSlug('old-url', posts);
 * // returns 'new-url' if 'old-url' was a previous slug for a post
 */
export function getCanonicalSlug(slug: string, allPosts: Post[]): string {
  const redirectMap = buildRedirectMap(allPosts);
  return redirectMap.get(slug) ?? slug;
}

/**
 * Get a post by any of its slugs (current or previous) or by its post ID.
 * Returns null if the slug doesn't exist or if it's a draft in production.
 *
 * @param slug - The slug to look up (can be old slug, current slug, or post ID)
 * @param allPosts - Array of all posts
 * @returns The post object and whether it required a redirect, or null if not found
 * @example
 * const result = getPostByAnySlug('old-slug', posts);
 * if (result) {
 *   const { post, needsRedirect, canonicalSlug } = result;
 *   if (needsRedirect) redirect(`/blog/${canonicalSlug}`);
 * }
 */
export function getPostByAnySlug(
  slug: string,
  allPosts: Post[]
): { post: Post; needsRedirect: boolean; canonicalSlug: string } | null {
  // First try direct match on current slug
  const post = allPosts.find((p) => p.slug === slug);
  if (post) {
    return { post, needsRedirect: false, canonicalSlug: post.slug };
  }

  // Then check if it's a post ID (redirect to slug)
  const postById = allPosts.find((p) => p.id === slug);
  if (postById) {
    return {
      post: postById,
      needsRedirect: true,
      canonicalSlug: postById.slug,
    };
  }

  // Then check previousSlugs for matches
  for (const p of allPosts) {
    if (p.previousSlugs?.includes(slug)) {
      return { post: p, needsRedirect: true, canonicalSlug: p.slug };
    }
  }

  // Finally check previousIds (for analytics migration)
  for (const p of allPosts) {
    if (p.previousIds?.includes(slug)) {
      return { post: p, needsRedirect: true, canonicalSlug: p.slug };
    }
  }

  return null;
}

/**
 * Calculate active filter count from blog filter parameters
 *
 * Used for displaying filter badges and counts in UI components
 * (MobileFilterBar, FloatingFilterFab, etc.)
 *
 * @param filters Filter parameters
 * @returns Number of active filters
 */
export function calculateActiveFilterCount(filters: {
  query?: string;
  selectedCategory?: string;
  selectedTags?: string[];
  readingTime?: string;
  sortBy?: string;
  dateRange?: string;
}): number {
  const {
    query = "",
    selectedCategory = "",
    selectedTags = [],
    readingTime = "",
    sortBy = "newest",
    dateRange = "all",
  } = filters;

  return [
    query ? 1 : 0,
    selectedCategory ? 1 : 0,
    selectedTags.length,
    readingTime ? 1 : 0,
    sortBy !== "newest" ? 1 : 0,
    dateRange !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
}

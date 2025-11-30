import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import crypto from "crypto";
import type { Post } from "@/data/posts";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");
const WORDS_PER_MINUTE = 225;

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
export function generatePostId(publishedAt: string, slug: string): string {
  // Create deterministic hash from published date and slug
  const input = `${publishedAt}:${slug}`;
  const hash = crypto
    .createHash("sha256")
    .update(input)
    .digest("hex")
    .substring(0, 8); // Take first 8 chars of hex hash

  // Format: post-YYYYMMDD-{hash}
  const date = publishedAt.replace(/-/g, ""); // 2025-10-05 → 20251005
  return `post-${date}-${hash}`;
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

export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(CONTENT_DIR, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents, {
      engines: {
        yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
      },
    });

    const publishedAt = data.publishedAt as string;
    
    // Use explicit ID from frontmatter, or auto-generate deterministically
    const id = (data.id as string | undefined) || generatePostId(publishedAt, slug);

    return {
      id,
      slug,
      title: data.title as string,
      summary: data.summary as string,
      publishedAt,
      updatedAt: data.updatedAt as string | undefined,
      category: data.category as Post["category"] | undefined,
      tags: (data.tags as string[]) || [],
      featured: data.featured as boolean | undefined,
      archived: data.archived as boolean | undefined,
      draft: data.draft as boolean | undefined,
      body: content,
      previousSlugs: (data.previousSlugs as string[]) || undefined,
      image: data.image as Post["image"] | undefined,
      series: data.series as Post["series"] | undefined,
      readingTime: calculateReadingTime(content),
    } satisfies Post;
  });

  // Filter out draft posts in production
  const filteredPosts = posts.filter((post) => {
    if (process.env.NODE_ENV === "production" && post.draft) {
      return false;
    }
    return true;
  });

  // Sort by publishedAt date, newest first
  return filteredPosts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);

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
  const id = (data.id as string | undefined) || generatePostId(publishedAt, slug);

  const post: Post = {
    id,
    slug,
    title: data.title as string,
    summary: data.summary as string,
    publishedAt,
    updatedAt: data.updatedAt as string | undefined,
    category: data.category as Post["category"] | undefined,
    tags: (data.tags as string[]) || [],
    featured: data.featured as boolean | undefined,
    archived: data.archived as boolean | undefined,
    draft: data.draft as boolean | undefined,
    body: content,
    previousSlugs: (data.previousSlugs as string[]) || undefined,
    image: data.image as Post["image"] | undefined,
    series: data.series as Post["series"] | undefined,
    readingTime: calculateReadingTime(content),
  };

  // Don't return draft posts in production
  if (process.env.NODE_ENV === "production" && post.draft) {
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
 * Get a post by any of its slugs (current or previous).
 * Returns null if the slug doesn't exist or if it's a draft in production.
 *
 * @param slug - The slug to look up (can be old or current)
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
  // First try direct match
  const post = allPosts.find((p) => p.slug === slug);
  if (post) {
    return { post, needsRedirect: false, canonicalSlug: post.slug };
  }

  // Then check previousSlugs for matches
  for (const p of allPosts) {
    if (p.previousSlugs?.includes(slug)) {
      return { post: p, needsRedirect: true, canonicalSlug: p.slug };
    }
  }

  return null;
}

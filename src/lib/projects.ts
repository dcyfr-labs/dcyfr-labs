import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import crypto from "crypto";
import type { Project } from "@/data/projects";

const CONTENT_DIR = path.join(process.cwd(), "src/content/projects");
const WORDS_PER_MINUTE = 225;

/**
 * Supported project structures:
 * 1. Flat file: src/content/projects/my-project.mdx
 * 2. Folder with index: src/content/projects/my-project/index.mdx (allows co-located assets)
 *
 * Folder structure enables co-locating images, videos, and other assets:
 * src/content/projects/my-project/
 * ├── index.mdx
 * ├── hero.webp
 * ├── diagram.svg
 * └── assets/
 *     └── screenshot.png
 */

/**
 * Generate a stable, deterministic project ID from slug and optional publishedAt date
 * Format: "project-{slug}-{hash}"
 * Unlike posts (which use date-based IDs), projects use slug as primary identifier
 * since projects are less time-sensitive
 *
 * @param slug Project slug
 * @param publishedAt Optional ISO date string (e.g., "2025-01-01")
 * @returns Stable project ID (e.g., "project-dcyfr-labs-abc123")
 * @internal Exported for testing purposes only
 */
export function generateProjectId(slug: string, publishedAt?: string): string {
  // Create deterministic hash from slug and optional published date
  const input = publishedAt ? `${publishedAt}:${slug}` : slug;
  const hash = crypto
    .createHash("sha256")
    .update(input)
    .digest("hex")
    .substring(0, 8); // Take first 8 chars of hex hash

  return `project-${slug}-${hash}`;
}

/**
 * Calculate reading time for project content
 * @internal Exported for testing purposes only
 */
export function calculateReadingTime(body: string): {
  words: number;
  minutes: number;
  text: string;
} {
  const words = body
    .replace(/```[\s\S]*?```/g, " ") // Ignore code blocks
    .replace(/<[^>]*>/g, " ") // Ignore HTML tags
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
 * Check if a project has a co-located hero image
 * Looks for hero.svg, hero.jpg, hero.jpeg, hero.png, hero.webp in the project's directory
 * @param slug - The project slug
 * @param title - The project title (for alt text)
 * @returns Image object if found, undefined otherwise
 */
function getColocatedHeroImage(
  slug: string,
  title: string
): Project["image"] | undefined {
  const projectDir = path.join(CONTENT_DIR, slug);

  // Only check if the project uses folder structure (not flat file)
  if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
    return undefined;
  }

  // Check for hero images in order of preference
  const heroExtensions = [".svg", ".jpg", ".jpeg", ".png", ".webp"];

  for (const ext of heroExtensions) {
    const heroPath = path.join(projectDir, `hero${ext}`);
    if (fs.existsSync(heroPath)) {
      return {
        url: `/work/${slug}/assets/hero${ext}`,
        alt: `Hero image for ${title}`,
      };
    }
  }

  return undefined;
}

/**
 * Scan the content directory for projects
 * @param contentDir - The directory to scan
 * @returns Array of projects found in the directory
 */
function scanContentDirectory(contentDir: string): Project[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const entries = fs.readdirSync(contentDir, { withFileTypes: true });
  const projects: Project[] = [];

  for (const entry of entries) {
    let slug: string;
    let filePath: string;

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      // Flat file: my-project.mdx
      slug = entry.name.replace(/\.mdx$/, "");
      filePath = path.join(contentDir, entry.name);
    } else if (entry.isDirectory()) {
      // Folder with index: my-project/index.mdx
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

    const publishedAt = data.publishedAt as string | undefined;

    // Use explicit ID from frontmatter, or auto-generate deterministically
    const id =
      (data.id as string | undefined) || generateProjectId(slug, publishedAt);

    // Check for co-located hero image if not specified in frontmatter
    const image =
      (data.image as Project["image"] | undefined) ||
      getColocatedHeroImage(slug, data.title as string);

    projects.push({
      id,
      slug,
      title: data.title as string,
      description: data.description as string,
      timeline: data.timeline as string | undefined,
      status: data.status as Project["status"],
      category: data.category as Project["category"] | undefined,
      tech: (data.tech as string[]) || [],
      tags: (data.tags as string[]) || [],
      links: (data.links as Project["links"]) || [],
      featured: data.featured as boolean | undefined,
      hidden: data.hidden as boolean | undefined,
      image,
      body: content,
      previousSlugs: (data.previousSlugs as string[]) || undefined,
      readingTime: content ? calculateReadingTime(content) : undefined,
      publishedAt: publishedAt || new Date().toISOString().split("T")[0], // Default to today's date
    } satisfies Project);
  }

  return projects;
}

/**
 * Get all projects from filesystem
 * @returns Array of all visible projects, sorted by publishedAt (newest first)
 */
export function getAllProjects(): Project[] {
  const allProjects = scanContentDirectory(CONTENT_DIR);

  // Filter hidden projects in production
  const visibleProjects =
    process.env.NODE_ENV === "production"
      ? allProjects.filter((p) => !p.hidden)
      : allProjects;

  // Sort by publishedAt (newest first), with fallback to title
  return visibleProjects.sort((a, b) => {
    const dateA = new Date(a.publishedAt || 0).getTime();
    const dateB = new Date(b.publishedAt || 0).getTime();
    return dateB - dateA || a.title.localeCompare(b.title);
  });
}

/**
 * Get project by slug
 * @param slug - The project slug
 * @returns The project object, or undefined if not found
 */
export function getProjectBySlug(slug: string): Project | undefined {
  // Try flat file first
  let filePath = path.join(CONTENT_DIR, `${slug}.mdx`);

  // Then try folder with index
  if (!fs.existsSync(filePath)) {
    filePath = path.join(CONTENT_DIR, slug, "index.mdx");
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

  const publishedAt = data.publishedAt as string | undefined;
  const id =
    (data.id as string | undefined) || generateProjectId(slug, publishedAt);

  // Check for co-located hero image if not specified in frontmatter
  const image =
    (data.image as Project["image"] | undefined) ||
    getColocatedHeroImage(slug, data.title as string);

  const project: Project = {
    id,
    slug,
    title: data.title as string,
    description: data.description as string,
    timeline: data.timeline as string | undefined,
    status: data.status as Project["status"],
    category: data.category as Project["category"] | undefined,
    tech: (data.tech as string[]) || [],
    tags: (data.tags as string[]) || [],
    links: (data.links as Project["links"]) || [],
    featured: data.featured as boolean | undefined,
    hidden: data.hidden as boolean | undefined,
    image,
    body: content,
    previousSlugs: (data.previousSlugs as string[]) || undefined,
    readingTime: content ? calculateReadingTime(content) : undefined,
    publishedAt: publishedAt || new Date().toISOString().split("T")[0],
  };

  // Don't return hidden projects in production
  if (process.env.NODE_ENV === "production" && project.hidden) {
    return undefined;
  }

  return project;
}

/**
 * Build a map of old slugs to new/active slugs for redirect resolution.
 * Used to handle slug changes while maintaining backward compatibility.
 *
 * @param allProjects - Array of all projects from getAllProjects()
 * @returns Map where key is old slug and value is current/active slug
 * @example
 * const redirectMap = buildRedirectMap(projects);
 * redirectMap.get('old-slug-name') // returns 'new-slug-name'
 */
export function buildRedirectMap(allProjects: Project[]): Map<string, string> {
  const redirectMap = new Map<string, string>();

  for (const project of allProjects) {
    if (project.previousSlugs && project.previousSlugs.length > 0) {
      for (const oldSlug of project.previousSlugs) {
        redirectMap.set(oldSlug, project.slug);
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
 * @param allProjects - Array of all projects
 * @returns The canonical/current slug, or the input slug if not found in redirects
 * @example
 * const canonical = getCanonicalSlug('old-url', projects);
 * // returns 'new-url' if 'old-url' was a previous slug for a project
 */
export function getCanonicalSlug(slug: string, allProjects: Project[]): string {
  const redirectMap = buildRedirectMap(allProjects);
  return redirectMap.get(slug) ?? slug;
}

/**
 * Get a project by any of its slugs (current or previous).
 * Returns null if the slug doesn't exist or if it's hidden in production.
 *
 * @param slug - The slug to look up (can be old or current)
 * @param allProjects - Array of all projects
 * @returns The project object and whether it required a redirect, or null if not found
 * @example
 * const result = getProjectByAnySlug('old-slug', projects);
 * if (result) {
 *   const { project, needsRedirect, canonicalSlug } = result;
 *   if (needsRedirect) redirect(`/work/${canonicalSlug}`);
 * }
 */
export function getProjectByAnySlug(
  slug: string,
  allProjects: Project[]
): { project: Project; needsRedirect: boolean; canonicalSlug: string } | null {
  // First try direct match
  const project = allProjects.find((p) => p.slug === slug);
  if (project) {
    return { project, needsRedirect: false, canonicalSlug: project.slug };
  }

  // Then check previousSlugs for matches
  for (const p of allProjects) {
    if (p.previousSlugs?.includes(slug)) {
      return { project: p, needsRedirect: true, canonicalSlug: p.slug };
    }
  }

  return null;
}

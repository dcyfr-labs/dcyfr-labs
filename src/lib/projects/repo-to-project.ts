/**
 * Transform a GitHub repository + parsed README metadata into a Project.
 */

import crypto from 'crypto';
import type { GitHubRepo } from '@/lib/github/types';
import type { ParsedReadmeMetadata } from '@/lib/markdown/types';
import type { Project, ProjectLink } from '@/data/projects';
import { REPO_DEFAULTS } from '@/config/repos-config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a repo name to a URL-safe slug.
 * e.g. "dcyfr-ai-cli" → "dcyfr-ai-cli"
 */
function repoNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Resolve slug collision by appending a short hash of the repository full name.
 * Only called when the base slug is already taken by a static project.
 */
export function resolveSlugCollision(slug: string, usedSlugs: Set<string>): string {
  if (!usedSlugs.has(slug)) return slug;
  const suffix = crypto.createHash('sha256').update(slug).digest('hex').substring(0, 6);
  return `${slug}-${suffix}`;
}

/**
 * Calculate reading time from a markdown body string.
 */
function calcReadingTime(body: string): Project['readingTime'] {
  const WORDS_PER_MINUTE = 225;
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { words, minutes, text: `${minutes} min read` };
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

/**
 * Transform a GitHub repository + README metadata into a `Project` object.
 *
 * Priority order for each field:
 *  1. README frontmatter
 *  2. GitHub API fields (topics, description, …)
 *  3. Hard-coded/computed defaults
 *
 * @param repo       - The raw GitHub API repository object
 * @param metadata   - Result of `parseReadmeMetadata(readme)`
 * @param usedSlugs  - Set of slugs already in use (for collision detection)
 */
export function repoToProject(
  repo: GitHubRepo,
  metadata: ParsedReadmeMetadata,
  usedSlugs: Set<string> = new Set()
): Project {
  const { frontmatter, bodyWithoutFrontmatter, firstParagraph, extractedHighlights } = metadata;

  // --- Slug ---
  const baseSlug = repoNameToSlug(repo.name);
  const slug = resolveSlugCollision(baseSlug, usedSlugs);

  // --- ID ---
  const id = `project-${slug}-${crypto
    .createHash('sha256')
    .update(`github:${repo.full_name}`)
    .digest('hex')
    .substring(0, 8)}`;

  // --- Title ---
  const title = frontmatter.title ?? repo.name;

  // --- Description ---
  const repoDesc = (repo.description ?? '').trim();
  const description =
    frontmatter.description ?? (repoDesc.length > 0 ? repoDesc : firstParagraph) ?? title;

  // --- Status ---
  const status = frontmatter.status ?? (repo.archived ? 'archived' : REPO_DEFAULTS.status);

  // --- Category ---
  const category = frontmatter.category ?? REPO_DEFAULTS.category;

  // --- Tech stack (frontmatter > GitHub language + topics) ---
  let tech: string[] | undefined;
  if (frontmatter.tech && frontmatter.tech.length > 0) {
    tech = frontmatter.tech;
  } else {
    const inferred: string[] = [];
    if (repo.language) inferred.push(repo.language);
    // Capitalise topics and add as tech (limit to 8 to keep it tidy)
    // Well-known acronyms that should remain fully uppercase
    const ACRONYMS = new Set([
      'ai',
      'cli',
      'api',
      'sdk',
      'ui',
      'ux',
      'ci',
      'cd',
      'iot',
      'llm',
      'rag',
      'mcp',
      'dcyfr',
    ]);
    repo.topics.slice(0, 8).forEach((t) => {
      const label = t
        .replace(/-/g, ' ')
        .split(' ')
        .map((word) =>
          ACRONYMS.has(word.toLowerCase())
            ? word.toUpperCase()
            : word.replace(/^\w/, (c) => c.toUpperCase())
        )
        .join(' ');
      inferred.push(label);
    });
    if (inferred.length > 0) tech = [...new Set(inferred)];
  }

  // --- Tags ---
  const tags: string[] | undefined =
    frontmatter.tags && frontmatter.tags.length > 0
      ? frontmatter.tags
      : repo.topics.length > 0
        ? repo.topics
        : undefined;

  // --- Highlights ---
  const highlights: string[] | undefined =
    frontmatter.highlights && frontmatter.highlights.length > 0
      ? frontmatter.highlights
      : extractedHighlights && extractedHighlights.length > 0
        ? extractedHighlights
        : undefined;

  // --- Links ---
  const links: ProjectLink[] = [{ label: 'GitHub', href: repo.html_url, type: 'github' }];
  if (frontmatter.demo) links.push({ label: 'Demo', href: frontmatter.demo, type: 'demo' });
  else if (repo.homepage) links.push({ label: 'Website', href: repo.homepage, type: 'demo' });
  if (frontmatter.docs) links.push({ label: 'Docs', href: frontmatter.docs, type: 'docs' });

  // --- Timeline ---
  const timeline = frontmatter.timeline ?? new Date(repo.created_at).getFullYear().toString();

  // --- Published date ---
  const publishedAt = repo.created_at.substring(0, 10); // "YYYY-MM-DD"

  // --- Body ---
  const body = bodyWithoutFrontmatter.trim();

  // --- Reading time ---
  const readingTime = calcReadingTime(body);

  return {
    id,
    slug,
    title,
    description,
    timeline,
    status,
    category,
    tech,
    tags,
    links,
    featured: frontmatter.featured ?? false,
    hidden: false,
    highlights,
    body,
    readingTime,
    publishedAt,
  };
}

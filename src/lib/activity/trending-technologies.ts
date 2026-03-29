/**
 * Trending Technologies
 *
 * Aggregates technology mentions across blog posts (tags) and projects (tech stacks)
 * to produce a ranked list of trending technologies. Each technology gets a composite
 * score based on frequency of mentions, with blog post tags and project tech stacks
 * weighted to reflect recency and relevance.
 *
 * Scoring formula:
 *   score = (blogMentions * blogWeight) + (projectMentions * projectWeight)
 *
 * Default weights: blogWeight=1, projectWeight=2
 * (Projects count more because they represent active usage)
 */

import type { Post } from '@/data/posts';
import type { Project } from '@/data/projects';

// ============================================================================
// TYPES
// ============================================================================

export interface TrendingTechnology {
  /** Technology name (normalized) */
  name: string;
  /** Number of blog posts mentioning this tech */
  blogMentions: number;
  /** Number of projects using this tech */
  projectMentions: number;
  /** Total weighted score */
  score: number;
  /** Source breakdown: which posts/projects reference this tech */
  sources: {
    posts: string[]; // post slugs
    projects: string[]; // project slugs
  };
}

export interface TrendingTechnologiesOptions {
  /** Maximum number of technologies to return */
  limit?: number;
  /** Weight multiplier for blog post mentions (default: 1) */
  blogWeight?: number;
  /** Weight multiplier for project mentions (default: 2) */
  projectWeight?: number;
  /** Minimum total score to include (default: 1) */
  minScore?: number;
}

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Canonical tech name mapping for deduplication.
 * Maps various spellings/casings to a single canonical name.
 */
const TECH_ALIASES: Record<string, string> = {
  // JavaScript ecosystem
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  node: 'Node.js',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  next: 'Next.js',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  vue: 'Vue.js',
  'vue.js': 'Vue.js',
  vuejs: 'Vue.js',

  // CSS/Styling
  tailwind: 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  css: 'CSS',
  html: 'HTML',

  // Backend/Infra
  php: 'PHP',
  mysql: 'MySQL',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
  docker: 'Docker',

  // Platforms
  vercel: 'Vercel',
  aws: 'AWS',
  github: 'GitHub',
  ghost: 'Ghost',
  wordpress: 'WordPress',

  // Security
  owasp: 'OWASP',
  cybersecurity: 'Cybersecurity',
  security: 'Security',

  // AI/ML
  ai: 'AI',
  'artificial intelligence': 'AI',
  'machine learning': 'Machine Learning',
  ml: 'Machine Learning',
  llm: 'LLM',
};

/**
 * Normalize a technology name to its canonical form.
 * If no alias is found, returns the original name with first-letter capitalization.
 */
export function normalizeTechName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (TECH_ALIASES[lower]) {
    return TECH_ALIASES[lower];
  }
  // Preserve original casing if no alias match
  return name.trim();
}

// ============================================================================
// AGGREGATION
// ============================================================================

/**
 * Calculate trending technologies from blog posts and projects.
 *
 * Aggregates tech mentions from:
 * - Blog post tags (each tag is treated as a technology mention)
 * - Project tech stacks (the `tech` array on each project)
 *
 * @param posts - Array of blog posts
 * @param projects - Array of projects
 * @param options - Configuration options
 * @returns Sorted array of trending technologies
 */
export function calculateTrendingTechnologies(
  posts: Post[],
  projects: Project[],
  options: TrendingTechnologiesOptions = {}
): TrendingTechnology[] {
  const { limit = 12, blogWeight = 1, projectWeight = 2, minScore = 1 } = options;

  // Accumulator: tech name -> { blogMentions, projectMentions, sources }
  const techMap = new Map<
    string,
    {
      blogMentions: number;
      projectMentions: number;
      postSlugs: Set<string>;
      projectSlugs: Set<string>;
    }
  >();

  const getOrCreate = (name: string) => {
    const canonical = normalizeTechName(name);
    if (!techMap.has(canonical)) {
      techMap.set(canonical, {
        blogMentions: 0,
        projectMentions: 0,
        postSlugs: new Set(),
        projectSlugs: new Set(),
      });
    }
    return { canonical, entry: techMap.get(canonical)! };
  };

  // Aggregate from blog posts
  const activePosts = posts.filter((p) => !p.archived && !p.draft);
  for (const post of activePosts) {
    for (const tag of post.tags) {
      const { entry } = getOrCreate(tag);
      entry.blogMentions++;
      entry.postSlugs.add(post.slug);
    }
  }

  // Aggregate from projects
  for (const project of projects) {
    if (project.tech) {
      for (const tech of project.tech) {
        const { entry } = getOrCreate(tech);
        entry.projectMentions++;
        entry.projectSlugs.add(project.slug);
      }
    }
  }

  // Calculate scores and build result array
  const results: TrendingTechnology[] = [];
  for (const [name, data] of techMap) {
    const score = data.blogMentions * blogWeight + data.projectMentions * projectWeight;

    if (score >= minScore) {
      results.push({
        name,
        blogMentions: data.blogMentions,
        projectMentions: data.projectMentions,
        score,
        sources: {
          posts: Array.from(data.postSlugs),
          projects: Array.from(data.projectSlugs),
        },
      });
    }
  }

  // Sort by score descending, tie-break by name alphabetically
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return results.slice(0, limit);
}

import { SITE_TITLE } from '@/lib/site-config';

export type ProjectLink = {
  label: string;
  href: string;
  type?: 'demo' | 'github' | 'article' | 'docs';
};

export type ProjectStatus = 'active' | 'in-progress' | 'archived';

export type ProjectImage = {
  url: string; // local path or external URL
  alt: string; // required for accessibility
  width?: number; // optional, for optimization
  height?: number; // optional, for aspect ratio
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'; // background position
  hideHero?: boolean; // hide image in hero section on detail pages
  caption?: string; // optional caption for featured images
  credit?: string; // optional credit/attribution
};

export type ProjectCategory = 'community' | 'nonprofit' | 'code' | 'photography' | 'startup';

/**
 * Code Project Content
 * Additional content for code/development projects.
 * Supports demos, code examples, and references.
 */
export type CodeProjectContent = {
  /** Interactive code demo */
  codeDemo?: {
    /** Programming language for syntax highlighting */
    language: string;
    /** Sample input (shown in Input panel) */
    input?: string;
    /** Expected output (shown in Output panel) */
    output?: string;
    /** Code snippet (shown with syntax highlighting) */
    code?: string;
    /** Embed URL for CodeSandbox, StackBlitz, etc. */
    embedUrl?: string;
  };
  /** Reference links to docs, articles, related projects */
  references?: { label: string; href: string }[];
  /** Multiple code blocks with titles */
  codeblocks?: {
    title: string;
    language: string;
    code: string;
  }[];
};

/**
 * Gallery Project Content
 * Additional content for photography/gallery projects.
 * Supports photo grids with lightbox viewing.
 */
export type GalleryProjectContent = {
  /** Array of photos for the gallery */
  photos: {
    /** Image URL (local path or external) */
    url: string;
    /** Alt text for accessibility */
    alt: string;
    /** Image width in pixels */
    width: number;
    /** Image height in pixels */
    height: number;
    /** Optional caption */
    caption?: string;
  }[];
  /** Number of grid columns (default: 3) */
  columns?: 2 | 3 | 4;
};

export type Project = {
  id: string; // deterministically generated or specified in frontmatter
  slug: string;
  title: string;
  description: string;
  timeline?: string;
  status: ProjectStatus;
  category?: ProjectCategory; // primary category for filtering
  tech?: string[];
  tags?: string[];
  links: ProjectLink[];
  featured?: boolean; // false
  hidden?: boolean; // false
  highlights?: string[];
  image?: ProjectImage; // optional featured image
  body: string; // MDX/markdown content
  previousSlugs?: string[]; // for handling slug changes
  readingTime?: { words: number; minutes: number; text: string };
  publishedAt: string; // ISO date string

  // Category-specific content (only one should be present based on category)
  /** Code project content - for category: "code" */
  codeContent?: CodeProjectContent;
  /** Gallery project content - for category: "photography" */
  galleryContent?: GalleryProjectContent;
};

const projectDrafts: Project[] = [
  {
    id: 'project-x64-8ab9c3d2',
    slug: 'x64',
    title: 'X64: Indie Cyber Publication',
    description:
      'An independent online publication focused on cybersecurity topics, trends, and research, providing in-depth articles and analysis for professionals and enthusiasts.',
    timeline: '2024 → Present',
    status: 'active',
    category: 'startup',
    tech: ['Ghost', 'JavaScript', 'CSS', 'HTML'],
    tags: ['Cybersecurity', 'Publication'],
    links: [{ label: 'Website', href: `https://x64.onl`, type: 'demo' }],
    highlights: [
      'Launched an independent online publication dedicated to cybersecurity topics, trends, and research.',
      'Curated and published in-depth articles and analysis for cybersecurity professionals and enthusiasts.',
      'Built a community of readers and contributors passionate about cybersecurity awareness and education.',
    ],
    featured: false,
    body: '',
    publishedAt: '2024-01-01',
  },
  {
    id: 'project-isn-7c5f6e4a',
    slug: 'isn',
    title: 'Information Security Network, Inc.',
    description:
      'A local nonprofit dedicated to promoting public security awareness through community outreach and education.',
    timeline: '2019 → 2021',
    status: 'archived',
    category: 'nonprofit',
    tech: ['WordPress', 'PHP', 'MySQL', 'HTML', 'CSS'],
    tags: ['Cybersecurity', 'Awareness'],
    links: [],
    highlights: [
      "Developed and maintained the organization's website to enhance online presence and outreach.",
      'Created educational content and resources to promote cybersecurity awareness within the community.',
      'Organized events and workshops to engage the public and foster a culture of security awareness.',
    ],
    featured: false,
    body: '',
    publishedAt: '2021-01-01',
  },
];

export const projects = Object.freeze(projectDrafts);

export const visibleProjects = Object.freeze(projects.filter((project) => !project.hidden));

export const featuredProjects = Object.freeze(
  visibleProjects.filter((project) => project.featured)
);

export const activeProjects = Object.freeze(
  visibleProjects.filter((project) => project.status === 'active')
);

// ---------------------------------------------------------------------------
// Automated repository showcase (server-side, async)
// ---------------------------------------------------------------------------

/**
 * Fetch projects from the configured GitHub organisation and transform them
 * into the standard `Project` shape.
 *
 * Returns an empty array when:
 *  - `ENABLE_AUTOMATED_REPOS` is set to "false"
 *  - No repos opt-in via `workShowcase: true` frontmatter
 *  - Any error occurs (graceful degradation — static projects still render)
 */
export async function getAutomatedProjects(): Promise<Project[]> {
  const enabled = process.env['ENABLE_AUTOMATED_REPOS'];
  if (enabled === 'false') return [];

  try {
    const { fetchOrgRepos } = await import('@/lib/github/fetch-repos');
    const { fetchRepoReadme } = await import('@/lib/github/fetch-readme');
    const { parseReadmeMetadata } = await import('@/lib/markdown/parse-readme-metadata');
    const { isShowcaseRepo } = await import('@/lib/markdown/parse-frontmatter');
    const { repoToProject } = await import('@/lib/projects/repo-to-project');
    const { REPO_EXCLUDE_LIST, REPO_INCLUDE_LIST } = await import('@/config/repos-config');

    const repos = await fetchOrgRepos();

    // Pre-filter repos before any README fetching to minimise HTTP round-trips
    const candidateRepos = repos.filter((repo) => {
      if (REPO_EXCLUDE_LIST.includes(repo.name)) return false;
      if ((repo.fork || repo.private) && !REPO_INCLUDE_LIST.includes(repo.name)) return false;
      return true;
    });

    // Fetch READMEs in parallel (capped at 5 concurrent requests to avoid rate
    // limits while still being dramatically faster than sequential fetching).
    const CONCURRENCY = 5;
    const results: Array<{ repo: (typeof candidateRepos)[0]; readme: string }> = [];

    for (let i = 0; i < candidateRepos.length; i += CONCURRENCY) {
      const batch = candidateRepos.slice(i, i + CONCURRENCY);
      const batchReadmes = await Promise.all(batch.map((repo) => fetchRepoReadme(repo.full_name)));
      for (let j = 0; j < batch.length; j++) {
        results.push({ repo: batch[j]!, readme: batchReadmes[j]! });
      }
    }

    // The slug set from static projects is used for collision detection
    const usedSlugs = new Set(visibleProjects.map((p) => p.slug));

    const automated: Project[] = [];

    for (const { repo, readme } of results) {
      const metadata = parseReadmeMetadata(readme);

      // Only include repos that opt-in OR are in the explicit include list
      const optsIn = isShowcaseRepo(metadata.frontmatter);
      if (!optsIn && !REPO_INCLUDE_LIST.includes(repo.name)) continue;

      const project = repoToProject(repo, metadata, usedSlugs);
      usedSlugs.add(project.slug);
      automated.push(project);
    }

    return automated;
  } catch {
    // Graceful degradation: return empty so the page still renders with static projects
    return [];
  }
}

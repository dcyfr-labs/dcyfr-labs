/**
 * Site Changelog Data
 *
 * Manual entries for significant site updates, features, and milestones.
 * These appear in the activity feed alongside blog posts and projects.
 */

export type ChangelogType = 'feature' | 'improvement' | 'fix' | 'milestone';

export interface ChangelogEntry {
  /** Unique identifier */
  id: string;
  /** Entry type for styling */
  type: ChangelogType;
  /** Short title */
  title: string;
  /** Optional longer description */
  description?: string;
  /** ISO date string */
  date: string;
  /** Optional link to related page/commit */
  href?: string;
  /** Whether to show in activity feed */
  visible?: boolean;
}

/**
 * Changelog entries - add new entries at the top
 */
export const changelog: ChangelogEntry[] = [
  {
    id: 'dcyfr-ai-plugin-marketplace',
    type: 'feature',
    title: 'Plugin Marketplace — Security Dashboard',
    description:
      'Plugin marketplace with trust scoring, audit tracking, TLP classification, and sandbox isolation now live.',
    date: '2026-02-28',
    href: '/plugins',
    visible: true,
  },
  {
    id: 'open-source-page',
    type: 'feature',
    title: 'Open Source Packages Page',
    description:
      'New /open-source page showcasing all published npm packages in the @dcyfr/ai ecosystem.',
    date: '2026-03-01',
    href: '/open-source',
    visible: true,
  },
  {
    id: 'dcyfr-ai-framework-page',
    type: 'feature',
    title: '@dcyfr/ai Framework Page',
    description:
      'New /ai landing page covering the full framework — plugin architecture, multi-provider support, delegation, CLI, RAG, and code-gen.',
    date: '2026-03-01',
    href: '/ai',
    visible: true,
  },
  {
    id: 'dcyfr-ai-v2-delegation',
    type: 'milestone',
    title: '@dcyfr/ai v2.0 — Delegation Framework',
    description:
      'Delegation framework with reputation engine, SLA contracts, TLP clearance enforcement, and 8 security scenario mitigations shipped to npm.',
    date: '2026-02-01',
    href: '/ai',
    visible: true,
  },
  {
    id: 'activity-feed-launch',
    type: 'feature',
    title: 'Launched Universal Activity Timeline',
    description:
      'New social media-inspired activity feed with filtering, time grouping, and multiple display variants.',
    date: '2025-11-29',
    href: '/activity',
    visible: true,
  },
  {
    id: 'blog-launch',
    type: 'milestone',
    title: 'Blog Section Launched',
    description:
      'Technical blog with MDX support, syntax highlighting, and reading time estimates.',
    date: '2025-09-15',
    href: '/blog',
    visible: true,
  },
  {
    id: 'portfolio-launch',
    type: 'milestone',
    title: 'Portfolio Launch',
    description: 'DCYFR Labs portfolio goes live.',
    date: '2025-08-01',
    href: '/',
    visible: true,
  },
];

export const visibleChangelog = changelog.filter((entry) => entry.visible !== false);

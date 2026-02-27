/**
 * Automated Repository Showcase — Configuration
 *
 * Controls which GitHub repositories are surfaced in the /work page,
 * how long data is cached, and how repos map to project categories.
 *
 * Environment toggles:
 *   ENABLE_AUTOMATED_REPOS  (default: "true") — master switch
 *   GITHUB_TOKEN            — optional PAT for higher rate limits
 */

import type { ProjectCategory, ProjectStatus } from '@/data/projects';

// ---------------------------------------------------------------------------
// GitHub organisation / user to query
// ---------------------------------------------------------------------------

export const GITHUB_ORG = 'dcyfr';

// ---------------------------------------------------------------------------
// Repositories explicitly included even if they lack workShowcase frontmatter
// ---------------------------------------------------------------------------

export const REPO_INCLUDE_LIST: string[] = [
  'dcyfr-ai',
  'dcyfr-ai-agents',
  'dcyfr-ai-chatbot',
  'dcyfr-ai-cli',
  'dcyfr-ai-nodejs',
  'dcyfr-ai-notebooks',
  'dcyfr-ai-rag',
  'dcyfr-ai-react',
  'dcyfr-ai-sandbox',
  'dcyfr-ai-web',
];

// ---------------------------------------------------------------------------
// Repositories always excluded from showcase
// ---------------------------------------------------------------------------

export const REPO_EXCLUDE_LIST: string[] = [
  'dcyfr-labs', // this website itself
  '.github', // org-level defaults repo
  'dcyfr-workspace', // monorepo workspace (internal)
];

// ---------------------------------------------------------------------------
// Default values used when a repository has no README frontmatter
// ---------------------------------------------------------------------------

export const REPO_DEFAULTS = {
  /** Default project category */
  category: 'code' as ProjectCategory,
  /** Default status when not declared in frontmatter */
  status: 'active' as ProjectStatus,
  /** How many README lines to scan for metadata heuristics */
  maxHeuristicsLines: 50,
} as const;

// ---------------------------------------------------------------------------
// Cache settings
// ---------------------------------------------------------------------------

export const CACHE_CONFIG = {
  /** Directory relative to process.cwd() (dcyfr-labs root) */
  cacheDir: '.cache/github-repos',
  /** Cache TTL in milliseconds — 4 hours */
  ttlMs: 4 * 60 * 60 * 1000,
} as const;

// ---------------------------------------------------------------------------
// API settings
// ---------------------------------------------------------------------------

export const GITHUB_API_CONFIG = {
  baseUrl: 'https://api.github.com',
  /** Request timeout in milliseconds */
  timeoutMs: 10_000,
  /** Maximum repos to fetch per org (GitHub max: 100) */
  perPage: 100,
} as const;

// ---------------------------------------------------------------------------
// Environment variable names (single source of truth)
// ---------------------------------------------------------------------------

export const ENV_VARS = {
  token: 'GITHUB_TOKEN',
  enabled: 'ENABLE_AUTOMATED_REPOS',
} as const;

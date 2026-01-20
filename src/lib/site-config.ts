// Centralized site configuration used across the app.
// Keep values here for easy updates across environments and build-time usage.

export const DOMAIN_DEV = 'localhost:3000';
export const DOMAIN_PREVIEW = 'www.dcyfr.dev';
export const DOMAIN_PRODUCTION = 'www.dcyfr.ai';
export const DOMAIN_PRODUCTION_ALT = 'dcyfr.vercel.app';

export const AUTHOR_NAME = 'Drew (dcyfr)';
export const AUTHOR_EMAIL = 'drew@dcyfr.ai';

// For display in UI (with sparkle character)
export const SITE_TITLE = 'DCYFR Labs';
export const SITE_TITLE_PLAIN = 'DCYFR Labs'; // For meta tags (without special characters)
export const SITE_SUBTITLE = 'Cyber Architecture & Design';
export const SITE_DESCRIPTION =
  'Professional portfolio and blog of DCYFR Labs, exploring cyber architecture, coding, security, and tech trends.';

/**
 * Feature Flags
 * Enable/disable features centrally without code changes
 */
export const FEATURES = {
  enableComments: true,
  enableViews: true,
  enableAnalytics: true,
  enableShareButtons: true,
  enableRelatedPosts: true,
  enableGitHubHeatmap: true,
  enableReadingProgress: true,
  enableTableOfContents: true,
  enableDarkMode: true,
  enableDevTools: process.env.NODE_ENV === 'development',
  enableRSS: true,
  enableSearchParams: true, // URL-based search/filters
  enablePrintStyles: true,
} as const;

/**
 * Content & Display Configuration
 * Settings for content display, reading metrics, and UI elements
 */
export const CONTENT_CONFIG = {
  // Post display
  postsPerPage: 10,
  relatedPostsCount: 3,
  recentPostsCount: 5,

  // Reading metrics
  wordsPerMinute: 200, // for reading time calculation

  // Badges & indicators
  newPostDays: 30, // "New" badge threshold
  hotPostViewsThreshold: 350, // "Hot" badge threshold

  // TOC configuration
  tocMinHeadings: 3, // minimum headings to show TOC
  tocMaxDepth: 2, // H1-H2 only

  // Excerpt/summary
  excerptLength: 160, // characters for truncated summaries

  // Code blocks
  codeTheme: {
    light: 'github-light',
    dark: 'github-dark',
  },
} as const;

/**
 * External Service Configuration
 * Settings for third-party integrations and services
 */
export const SERVICES = {
  github: {
    username: 'dcyfr',
    enabled: true,
    cacheMinutes: 5,
  },

  redis: {
    enabled: !!process.env.REDIS_URL,
    viewKeyPrefix: 'views:post:',
    historyKeyPrefix: 'views:history:post:',
    analyticsKeyPrefix: 'analytics:',
  },

  giscus: {
    enabled: !!(
      process.env.NEXT_PUBLIC_GISCUS_REPO &&
      process.env.NEXT_PUBLIC_GISCUS_REPO_ID &&
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY &&
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID
    ),
    repo: process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}` | undefined,
    repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
    category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
    categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
    mapping: 'pathname' as const,
    reactionsEnabled: true,
    emitMetadata: false,
  },

  resend: {
    enabled: !!process.env.RESEND_API_KEY,
    fromName: 'Drew',
  },

  inngest: {
    enabled: !!(process.env.INNGEST_EVENT_KEY && process.env.INNGEST_SIGNING_KEY),
  },

  vercel: {
    analyticsEnabled: true,
    speedInsightsEnabled: true,
  },

  perplexity: {
    enabled: !!process.env.PERPLEXITY_API_KEY,
    apiUrl: 'https://api.perplexity.ai',
    defaultModel: 'llama-3.1-sonar-large-128k-online' as const,
    cacheMinutes: 5,
    rateLimit: {
      requestsPerMinute: 5,
    },
  },
} as const;

// Choose the active domain/URL based on environment variables.
// Priority for SITE_URL:
// 1. NEXT_PUBLIC_SITE_URL (explicit full URL override)
// 2. NEXT_PUBLIC_SITE_DOMAIN (explicit domain override)
// 3. Vercel preview: DOMAIN_PREVIEW
// 4. NODE_ENV === 'development' => DOMAIN_DEV
// 5. default: DOMAIN_PRODUCTION
const envSiteUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL;
const envSiteDomain = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_DOMAIN;
const vercelEnv = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VERCEL_ENV;
const nodeEnv = typeof process !== 'undefined' && process.env?.NODE_ENV;

export const SITE_DOMAIN = ((): string => {
  if (envSiteDomain) return envSiteDomain;
  if (vercelEnv === 'preview') return DOMAIN_PREVIEW;
  if (nodeEnv === 'development') return DOMAIN_DEV;
  return DOMAIN_PRODUCTION;
})();

export const SITE_URL = ((): string => {
  if (envSiteUrl) return envSiteUrl;
  return `https://${SITE_DOMAIN}`;
})();

export const getOgImageUrl = (title?: string, description?: string): string => {
  const url = new URL('/opengraph-image', SITE_URL);
  if (title) url.searchParams.set('title', title);
  if (description) url.searchParams.set('description', description);
  return url.toString();
};

// Explicit FROM_EMAIL constant to avoid split/join logic in other modules.
// Uses Resend's verified domain (onboarding@resend.dev for testing, or domain-specific for production)
// Can be overridden with NEXT_PUBLIC_FROM_EMAIL at build/runtime if needed.
export const FROM_EMAIL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FROM_EMAIL) ||
  (typeof process !== 'undefined' && process.env?.RESEND_FROM_EMAIL) ||
  'onboarding@resend.dev'; // Default Resend testing email

const siteConfig = {
  DOMAIN_DEV,
  DOMAIN_PREVIEW,
  DOMAIN_PRODUCTION,
  SITE_DOMAIN,
  SITE_URL,
  AUTHOR_NAME,
  AUTHOR_EMAIL,
  FROM_EMAIL,
  SITE_TITLE,
  SITE_SUBTITLE,
  SITE_DESCRIPTION,
  features: FEATURES,
  content: CONTENT_CONFIG,
  services: SERVICES,
  getOgImageUrl,
};

export default siteConfig;

// Export type for type-safe access
export type SiteConfig = typeof siteConfig;

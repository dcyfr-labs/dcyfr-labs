/**
 * Feed Generation Library
 *
 * Unified library for generating RSS 2.0 and Atom 1.0 feeds from blog posts and projects.
 * Supports featured images, full HTML content, and proper metadata.
 *
 * @module lib/feeds
 */

import { Post } from '@/data/posts';
import { Project } from '@/data/projects';
import { ChangelogEntry } from '@/data/changelog';
import {
  SITE_URL,
  AUTHOR_NAME,
  AUTHOR_EMAIL,
  SITE_TITLE,
  SITE_DESCRIPTION,
} from '@/lib/site-config';
import { transformMDXForRSS } from '@/lib/rss';

// ============================================================================
// Types
// ============================================================================

export type FeedItem = {
  id: string; // unique identifier (URL)
  title: string;
  description: string;
  content?: string; // full HTML content
  link: string; // item URL
  published: Date;
  updated?: Date;
  categories?: string[]; // tags
  author?: {
    name: string;
    email: string;
  };
  image?: {
    url: string; // full URL
    type: string; // MIME type
    length?: number; // size in bytes (optional)
  };
};

export type FeedConfig = {
  title: string;
  description: string;
  link: string; // main site/section URL
  feedUrl: string; // URL of the feed itself
  language?: string;
  copyright?: string;
  generator?: string;
  author?: {
    name: string;
    email: string;
  };
};

export type FeedFormat = 'rss' | 'atom' | 'json';

// ============================================================================
// JSON Feed Types (JSON Feed 1.1 spec)
// ============================================================================

export type JsonFeed = {
  version: string; // "https://jsonfeed.org/version/1.1"
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  user_comment?: string;
  icon?: string;
  favicon?: string;
  authors?: Array<{
    name?: string;
    url?: string;
    avatar?: string;
  }>;
  language?: string;
  expired?: boolean;
  hubs?: Array<{
    type: string;
    url: string;
  }>;
  items: Array<{
    id: string;
    url?: string;
    external_url?: string;
    title?: string;
    content_html?: string;
    content_text?: string;
    summary?: string;
    image?: string;
    banner_image?: string;
    date_published?: string; // ISO 8601
    date_modified?: string; // ISO 8601
    authors?: Array<{
      name?: string;
      url?: string;
      avatar?: string;
    }>;
    tags?: string[];
    language?: string;
    attachments?: Array<{
      url: string;
      mime_type: string;
      title?: string;
      size_in_bytes?: number;
      duration_in_seconds?: number;
    }>;
  }>;
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Ensure URL is absolute
 */
function absoluteUrl(path: string, base: string = SITE_URL): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Infer MIME type from image URL
 */
function inferImageMimeType(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  return mimeTypes[ext || ''] || 'image/jpeg';
}

// ============================================================================
// Converters: Post/Project → FeedItem
// ============================================================================

/**
 * Convert a blog post to a feed item
 */
export async function postToFeedItem(post: Post): Promise<FeedItem> {
  const htmlContent = await transformMDXForRSS(post.body);

  return {
    id: absoluteUrl(`/blog/${post.slug}`),
    title: post.title,
    description: post.summary,
    content: htmlContent,
    link: absoluteUrl(`/blog/${post.slug}`),
    published: new Date(post.publishedAt),
    updated: post.updatedAt ? new Date(post.updatedAt) : undefined,
    categories: post.tags,
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
    image: post.image?.url
      ? {
          url: absoluteUrl(post.image.url),
          type: inferImageMimeType(post.image.url),
        }
      : undefined,
  };
}

/**
 * Convert a project to a feed item
 * @param project - The project to convert
 * @param basePath - Base path for project URLs (default: '/work')
 */
export function projectToFeedItem(project: Project, basePath: string = '/work'): FeedItem {
  // Build HTML description from project data
  const techList = project.tech?.length
    ? `<p><strong>Technologies:</strong> ${project.tech.join(', ')}</p>`
    : '';

  const linksList = project.links?.length
    ? `<p><strong>Links:</strong></p><ul>${project.links
        .map((link) => `<li><a href="${escapeXml(link.href)}">${escapeXml(link.label)}</a></li>`)
        .join('')}</ul>`
    : '';

  const highlightsList = project.highlights?.length
    ? `<ul>${project.highlights.map((h) => `<li>${escapeXml(h)}</li>`).join('')}</ul>`
    : '';

  const htmlContent = `${escapeXml(project.description)}${techList}${highlightsList}${linksList}`;

  // Use timeline to infer a published date (fallback to current year)
  const timelineMatch = project.timeline?.match(/(\d{4})/);
  const year = timelineMatch ? parseInt(timelineMatch[1], 10) : new Date().getFullYear();
  const published = new Date(year, 0, 1);

  return {
    id: absoluteUrl(`${basePath}/${project.slug}`),
    title: project.title,
    description: project.description,
    content: htmlContent,
    link: absoluteUrl(`${basePath}/${project.slug}`),
    published,
    categories: project.tags || [],
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
    image: project.image?.url
      ? {
          url: absoluteUrl(project.image.url),
          type: inferImageMimeType(project.image.url),
        }
      : undefined,
  };
}

/**
 * Convert a changelog entry to a feed item
 */
export function changelogToFeedItem(entry: ChangelogEntry): FeedItem {
  const htmlContent = entry.description ? `<p>${escapeXml(entry.description)}</p>` : '';

  const typeLabel = entry.type.charAt(0).toUpperCase() + entry.type.slice(1);

  return {
    id: absoluteUrl(`/activity#${entry.id}`),
    title: `[${typeLabel}] ${entry.title}`,
    description: entry.description || entry.title,
    content: htmlContent,
    link: entry.href ? absoluteUrl(entry.href) : absoluteUrl('/activity'),
    published: new Date(entry.date),
    categories: [entry.type, 'changelog'],
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };
}

// ============================================================================
// Feed Generators
// ============================================================================

/**
 * Generate RSS 2.0 feed XML
 */
export function generateRssFeed(items: FeedItem[], config: FeedConfig): string {
  const lastBuildDate = items[0]?.updated || items[0]?.published || new Date();

  const itemsXml = items
    .map((item) => {
      const categories = item.categories
        ?.map((cat) => `      <category>${escapeXml(cat)}</category>`)
        .join('\n');

      // Standard RSS enclosure for image
      const enclosure = item.image
        ? `      <enclosure url="${escapeXml(item.image.url)}" type="${escapeXml(item.image.type)}" ${item.image.length ? `length="${item.image.length}" ` : ''}/>`
        : '';

      // Media RSS tags for better reader support (podcasts, rich media)
      const mediaContent = item.image
        ? `      <media:content url="${escapeXml(item.image.url)}" type="${escapeXml(item.image.type)}" medium="image" />`
        : '';

      const author = item.author
        ? `      <author>${escapeXml(item.author.email)} (${escapeXml(item.author.name)})</author>`
        : '';

      const content = item.content
        ? `      <content:encoded><![CDATA[${item.content}]]></content:encoded>`
        : '';

      return `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.id)}</guid>
      <pubDate>${item.published.toUTCString()}</pubDate>
${author}
      <description><![CDATA[${item.description}]]></description>
${content}
${categories || ''}
${enclosure}
${mediaContent}
    </item>`;
    })
    .join('\n');

  // Feed icon/logo for RSS readers
  const imageXml = `    <image>
      <url>${escapeXml(`${SITE_URL}/icons/icon-512x512.png`)}</url>
      <title>${escapeXml(config.title)}</title>
      <link>${escapeXml(config.link)}</link>
      <width>144</width>
      <height>144</height>
    </image>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.link)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>${config.language || 'en-us'}</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(config.feedUrl)}" rel="self" type="application/rss+xml" />
    <generator>${config.generator || 'Next.js'}</generator>
${
  config.author
    ? `    <managingEditor>${escapeXml(config.author.email)} (${escapeXml(config.author.name)})</managingEditor>
    <webMaster>${escapeXml(config.author.email)} (${escapeXml(config.author.name)})</webMaster>`
    : ''
}
    <ttl>60</ttl>
${imageXml}
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Generate Atom 1.0 feed XML
 */
export function generateAtomFeed(items: FeedItem[], config: FeedConfig): string {
  const updated = items[0]?.updated || items[0]?.published || new Date();

  const itemsXml = items
    .map((item) => {
      const categories = item.categories
        ?.map((cat) => `    <category term="${escapeXml(cat)}" label="${escapeXml(cat)}" />`)
        .join('\n');

      // Standard Atom enclosure link for image
      const imageLink = item.image
        ? `    <link rel="enclosure" type="${escapeXml(item.image.type)}" href="${escapeXml(item.image.url)}" ${item.image.length ? `length="${item.image.length}"` : ''} />`
        : '';

      // Alternative representation as media:content for better reader support
      const mediaContent = item.image
        ? `    <media:content url="${escapeXml(item.image.url)}" type="${escapeXml(item.image.type)}" medium="image" xmlns:media="http://search.yahoo.com/mrss/" />`
        : '';

      const author = item.author
        ? `    <author>
      <name>${escapeXml(item.author.name)}</name>
      <email>${escapeXml(item.author.email)}</email>
    </author>`
        : '';

      const content = item.content
        ? `    <content type="html"><![CDATA[${item.content}]]></content>`
        : '';

      return `  <entry>
    <title type="text">${escapeXml(item.title)}</title>
    <link href="${escapeXml(item.link)}" rel="alternate" type="text/html" />
${imageLink}
${mediaContent}
    <id>${escapeXml(item.id)}</id>
    <published>${item.published.toISOString()}</published>
    <updated>${(item.updated || item.published).toISOString()}</updated>
${author}
    <summary type="html"><![CDATA[${item.description}]]></summary>
${content}
${categories || ''}
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <subtitle>${escapeXml(config.description)}</subtitle>
  <link href="${escapeXml(config.feedUrl)}" rel="self" type="application/atom+xml" />
  <link href="${escapeXml(config.link)}" rel="alternate" type="text/html" />
  <updated>${updated.toISOString()}</updated>
  <id>${escapeXml(config.link)}</id>
  <logo>${escapeXml(`${SITE_URL}/icons/icon-512x512.png`)}</logo>
  <icon>${escapeXml(`${SITE_URL}/favicon.ico`)}</icon>
${
  config.author
    ? `  <author>
    <name>${escapeXml(config.author.name)}</name>
    <email>${escapeXml(config.author.email)}</email>
  </author>`
    : ''
}
  <generator uri="https://nextjs.org/">${config.generator || 'Next.js'}</generator>
  <rights>© ${new Date().getFullYear()} ${escapeXml(config.author?.name || 'DCYFR Labs')}. All rights reserved.</rights>
${itemsXml}
</feed>`;
}

/**
 * Generate JSON Feed 1.1
 */
export function generateJsonFeed(items: FeedItem[], config: FeedConfig): string {
  const feed: JsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: config.title,
    home_page_url: config.link,
    feed_url: config.feedUrl,
    description: config.description,
    icon: `${SITE_URL}/icons/icon-512x512.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    language: config.language || 'en-us',
    authors: config.author
      ? [
          {
            name: config.author.name,
            url: SITE_URL,
          },
        ]
      : undefined,
    items: items.map((item) => ({
      id: item.id,
      url: item.link,
      title: item.title,
      content_html: item.content,
      summary: item.description,
      image: item.image?.url,
      date_published: item.published.toISOString(),
      date_modified: item.updated?.toISOString(),
      authors: item.author
        ? [
            {
              name: item.author.name,
              url: SITE_URL,
            },
          ]
        : undefined,
      tags: item.categories,
      attachments: item.image
        ? [
            {
              url: item.image.url,
              mime_type: item.image.type,
              size_in_bytes: item.image.length,
            },
          ]
        : undefined,
    })),
  };

  return JSON.stringify(feed, null, 2);
}

// ============================================================================
// High-Level Feed Builders
// ============================================================================

/**
 * Build a feed from blog posts only
 */
export async function buildBlogFeed(
  posts: readonly Post[],
  format: FeedFormat = 'atom',
  limit: number = 20
): Promise<string> {
  const sortedPosts = [...posts]
    .filter((p) => !p.draft) // exclude drafts
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit);

  const items = await Promise.all(sortedPosts.map(postToFeedItem));

  const config: FeedConfig = {
    title: `${SITE_TITLE} - Blog`,
    description: 'Articles and notes on web development, security, and TypeScript.',
    link: `${SITE_URL}/blog`,
    feedUrl: `${SITE_URL}/blog/feed${format === 'json' ? '.json' : ''}`,
    language: 'en-us',
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };

  if (format === 'json') return generateJsonFeed(items, config);
  return format === 'rss' ? generateRssFeed(items, config) : generateAtomFeed(items, config);
}

/**
 * Build a feed from projects only
 * @param basePath - Base path for project URLs (default: '/work')
 */
export async function buildProjectsFeed(
  projects: readonly Project[],
  format: FeedFormat = 'atom',
  limit: number = 20,
  basePath: string = '/work'
): Promise<string> {
  const sortedProjects = [...projects]
    .filter((p) => !p.hidden) // exclude hidden
    .slice(0, limit);

  const items = sortedProjects.map((p) => projectToFeedItem(p, basePath));

  const config: FeedConfig = {
    title: `${SITE_TITLE} - Our Work`,
    description: 'Our projects, open-source contributions, and creative works.',
    link: `${SITE_URL}${basePath}`,
    feedUrl: `${SITE_URL}${basePath}/feed${format === 'json' ? '.json' : ''}`,
    language: 'en-us',
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };

  if (format === 'json') return generateJsonFeed(items, config);
  return format === 'rss' ? generateRssFeed(items, config) : generateAtomFeed(items, config);
}

/**
 * Build a combined feed from both posts and projects
 */
export async function buildCombinedFeed(
  posts: readonly Post[],
  projects: readonly Project[],
  format: FeedFormat = 'atom',
  limit: number = 20
): Promise<string> {
  // Convert posts and projects to feed items
  const postItems = await Promise.all(posts.filter((p) => !p.draft).map(postToFeedItem));

  const projectItems = projects.filter((p) => !p.hidden).map((p) => projectToFeedItem(p));

  // Combine and sort by published date
  const allItems = [...postItems, ...projectItems]
    .sort((a, b) => b.published.getTime() - a.published.getTime())
    .slice(0, limit);

  const config: FeedConfig = {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    link: SITE_URL,
    feedUrl: `${SITE_URL}/feed${format === 'json' ? '.json' : ''}`,
    language: 'en-us',
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };

  if (format === 'json') return generateJsonFeed(allItems, config);
  return format === 'rss' ? generateRssFeed(allItems, config) : generateAtomFeed(allItems, config);
}

/**
 * Build an activity feed from posts, projects, and changelog
 */
export async function buildActivityFeed(
  posts: readonly Post[],
  projects: readonly Project[],
  changelog: readonly ChangelogEntry[],
  format: FeedFormat = 'atom',
  limit: number = 50
): Promise<string> {
  // Convert all content to feed items
  const postItems = await Promise.all(posts.filter((p) => !p.draft).map(postToFeedItem));

  const projectItems = projects.filter((p) => !p.hidden).map((p) => projectToFeedItem(p));

  const changelogItems = changelog.filter((e) => e.visible !== false).map(changelogToFeedItem);

  // Combine and sort by published date
  const allItems = [...postItems, ...projectItems, ...changelogItems]
    .sort((a, b) => b.published.getTime() - a.published.getTime())
    .slice(0, limit);

  const config: FeedConfig = {
    title: `${SITE_TITLE} — Activity`,
    description: 'Complete timeline of blog posts, projects, and site updates.',
    link: `${SITE_URL}/activity`,
    feedUrl: `${SITE_URL}/activity/feed${format === 'json' ? '.json' : ''}`,
    language: 'en-us',
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };

  if (format === 'json') return generateJsonFeed(allItems, config);
  return format === 'rss' ? generateRssFeed(allItems, config) : generateAtomFeed(allItems, config);
}

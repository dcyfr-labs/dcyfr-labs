/**
 * Feed Generation Library
 * 
 * Unified library for generating RSS 2.0 and Atom 1.0 feeds from blog posts and projects.
 * Supports featured images, full HTML content, and proper metadata.
 * 
 * @module lib/feeds
 */

import { Post } from "@/data/posts";
import { Project } from "@/data/projects";
import { SITE_URL, AUTHOR_NAME, AUTHOR_EMAIL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site-config";
import { mdxToHtml } from "@/lib/mdx-to-html";

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

export type FeedFormat = "rss" | "atom";

// ============================================================================
// Utilities
// ============================================================================

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Ensure URL is absolute
 */
function absoluteUrl(path: string, base: string = SITE_URL): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Infer MIME type from image URL
 */
function inferImageMimeType(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext || ""] || "image/jpeg";
}

// ============================================================================
// Converters: Post/Project → FeedItem
// ============================================================================

/**
 * Convert a blog post to a feed item
 */
export async function postToFeedItem(post: Post): Promise<FeedItem> {
  const htmlContent = await mdxToHtml(post.body);
  
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
 */
export function projectToFeedItem(project: Project): FeedItem {
  // Build HTML description from project data
  const techList = project.tech?.length
    ? `<p><strong>Technologies:</strong> ${project.tech.join(", ")}</p>`
    : "";
  
  const linksList = project.links?.length
    ? `<p><strong>Links:</strong></p><ul>${project.links
        .map((link) => `<li><a href="${escapeXml(link.href)}">${escapeXml(link.label)}</a></li>`)
        .join("")}</ul>`
    : "";
  
  const highlightsList = project.highlights?.length
    ? `<ul>${project.highlights.map((h) => `<li>${escapeXml(h)}</li>`).join("")}</ul>`
    : "";
  
  const htmlContent = `${escapeXml(project.description)}${techList}${highlightsList}${linksList}`;
  
  // Use timeline to infer a published date (fallback to current year)
  const timelineMatch = project.timeline?.match(/(\d{4})/);
  const year = timelineMatch ? parseInt(timelineMatch[1], 10) : new Date().getFullYear();
  const published = new Date(year, 0, 1);
  
  return {
    id: absoluteUrl(`/portfolio/${project.slug}`),
    title: project.title,
    description: project.description,
    content: htmlContent,
    link: absoluteUrl(`/portfolio/${project.slug}`),
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
        .join("\n");
      
      // Standard RSS enclosure for image
      const enclosure = item.image
        ? `      <enclosure url="${escapeXml(item.image.url)}" type="${escapeXml(item.image.type)}" ${item.image.length ? `length="${item.image.length}" ` : ""}/>`
        : "";
      
      // Media RSS tags for better reader support (podcasts, rich media)
      const mediaContent = item.image
        ? `      <media:content url="${escapeXml(item.image.url)}" type="${escapeXml(item.image.type)}" medium="image" />`
        : "";
      
      const author = item.author
        ? `      <author>${escapeXml(item.author.email)} (${escapeXml(item.author.name)})</author>`
        : "";
      
      const content = item.content
        ? `      <content:encoded><![CDATA[${item.content}]]></content:encoded>`
        : "";
      
      return `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.id)}</guid>
      <pubDate>${item.published.toUTCString()}</pubDate>
${author}
      <description><![CDATA[${item.description}]]></description>
${content}
${categories || ""}
${enclosure}
${mediaContent}
    </item>`;
    })
    .join("\n");
  
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
    <language>${config.language || "en-us"}</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(config.feedUrl)}" rel="self" type="application/rss+xml" />
    <generator>${config.generator || "Next.js"}</generator>
${config.author ? `    <managingEditor>${escapeXml(config.author.email)} (${escapeXml(config.author.name)})</managingEditor>
    <webMaster>${escapeXml(config.author.email)} (${escapeXml(config.author.name)})</webMaster>` : ""}
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
        .join("\n");
      
      // Standard Atom enclosure link for image
      const imageLink = item.image
        ? `    <link rel="enclosure" type="${escapeXml(item.image.type)}" href="${escapeXml(item.image.url)}" ${item.image.length ? `length="${item.image.length}"` : ""} />`
        : "";
      
      // Alternative representation as media:content for better reader support
      const mediaContent = item.image
        ? `    <media:content url="${escapeXml(item.image.url)}" type="${escapeXml(item.image.type)}" medium="image" xmlns:media="http://search.yahoo.com/mrss/" />`
        : "";
      
      const author = item.author
        ? `    <author>
      <name>${escapeXml(item.author.name)}</name>
      <email>${escapeXml(item.author.email)}</email>
    </author>`
        : "";
      
      const content = item.content
        ? `    <content type="html"><![CDATA[${item.content}]]></content>`
        : "";
      
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
${categories || ""}
  </entry>`;
    })
    .join("\n");
  
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
${config.author ? `  <author>
    <name>${escapeXml(config.author.name)}</name>
    <email>${escapeXml(config.author.email)}</email>
  </author>` : ""}
  <generator uri="https://nextjs.org/">${config.generator || "Next.js"}</generator>
  <rights>© ${new Date().getFullYear()} ${escapeXml(config.author?.name || "Drew")}. All rights reserved.</rights>
${itemsXml}
</feed>`;
}

// ============================================================================
// High-Level Feed Builders
// ============================================================================

/**
 * Build a feed from blog posts only
 */
export async function buildBlogFeed(
  posts: readonly Post[],
  format: FeedFormat = "rss",
  limit: number = 20
): Promise<string> {
  const sortedPosts = [...posts]
    .filter((p) => !p.draft) // exclude drafts
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit);
  
  const items = await Promise.all(sortedPosts.map(postToFeedItem));
  
  const config: FeedConfig = {
    title: `${SITE_TITLE} - Blog`,
    description: "Articles and notes on web development, security, and TypeScript.",
    link: `${SITE_URL}/blog`,
    feedUrl: `${SITE_URL}/blog/feed`,
    language: "en-us",
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };
  
  return format === "rss" ? generateRssFeed(items, config) : generateAtomFeed(items, config);
}

/**
 * Build a feed from projects only
 */
export async function buildProjectsFeed(
  projects: readonly Project[],
  format: FeedFormat = "rss",
  limit: number = 20
): Promise<string> {
  const sortedProjects = [...projects]
    .filter((p) => !p.hidden) // exclude hidden
    .slice(0, limit);
  
  const items = sortedProjects.map(projectToFeedItem);
  
  const config: FeedConfig = {
    title: `${SITE_TITLE} - Portfolio`,
    description: "Portfolio projects and proof of concept works.",
    link: `${SITE_URL}/portfolio`,
    feedUrl: `${SITE_URL}/portfolio/feed`,
    language: "en-us",
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };
  
  return format === "rss" ? generateRssFeed(items, config) : generateAtomFeed(items, config);
}

/**
 * Build a combined feed from both posts and projects
 */
export async function buildCombinedFeed(
  posts: readonly Post[],
  projects: readonly Project[],
  format: FeedFormat = "rss",
  limit: number = 20
): Promise<string> {
  // Convert posts and projects to feed items
  const postItems = await Promise.all(
    posts
      .filter((p) => !p.draft)
      .map(postToFeedItem)
  );
  
  const projectItems = projects
    .filter((p) => !p.hidden)
    .map(projectToFeedItem);
  
  // Combine and sort by published date
  const allItems = [...postItems, ...projectItems]
    .sort((a, b) => b.published.getTime() - a.published.getTime())
    .slice(0, limit);
  
  const config: FeedConfig = {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    link: SITE_URL,
    feedUrl: `${SITE_URL}/feed`,
    language: "en-us",
    author: {
      name: AUTHOR_NAME,
      email: AUTHOR_EMAIL,
    },
  };
  
  return format === "rss" ? generateRssFeed(allItems, config) : generateAtomFeed(allItems, config);
}

import type { MetadataRoute } from "next";
import { posts, allSeries } from "@/data/posts";
import { visibleProjects } from "@/data/projects";
import { teamMembers } from "@/data/team";
import { SITE_URL } from "@/lib/site-config";

/**
 * Sitemap Generator
 * 
 * Generates comprehensive sitemap.xml for all public pages.
 * Excludes: dev pages, private pages, API routes, route groups (embed)
 * 
 * Page categories:
 * - Static pages: About, Contact, Services, etc.
 * - Dynamic pages: Blog posts, Work projects, Team profiles
 * - Index pages: Blog, Work, Activity, etc.
 * - Series pages: Blog series index + individual series
 * - Feed endpoints: RSS/Atom/JSON feeds
 */

// Define static page configurations
const pageConfig = {
  "/": { changeFrequency: "weekly" as const, priority: 1.0 },
  "/about": { changeFrequency: "yearly" as const, priority: 0.5 },
  "/about/drew": { changeFrequency: "monthly" as const, priority: 0.5 },
  "/about/dcyfr": { changeFrequency: "monthly" as const, priority: 0.5 },
  "/about/drew/resume": { changeFrequency: "monthly" as const, priority: 0.4 },
  "/blog": { changeFrequency: "weekly" as const, priority: 0.8 },
  "/blog/series": { changeFrequency: "monthly" as const, priority: 0.7 },
  "/work": { changeFrequency: "monthly" as const, priority: 0.7 },
  "/services": { changeFrequency: "monthly" as const, priority: 0.7 },
  "/contact": { changeFrequency: "yearly" as const, priority: 0.6 },
  "/privacy": { changeFrequency: "yearly" as const, priority: 0.4 },
  "/terms": { changeFrequency: "yearly" as const, priority: 0.4 },
  "/acceptable-use": { changeFrequency: "yearly" as const, priority: 0.3 },
  "/security": { changeFrequency: "yearly" as const, priority: 0.4 },
  "/accessibility": { changeFrequency: "yearly" as const, priority: 0.4 },
  "/legal": { changeFrequency: "yearly" as const, priority: 0.3 },
  "/licenses": { changeFrequency: "yearly" as const, priority: 0.3 },
  "/analytics": { changeFrequency: "yearly" as const, priority: 0.3 },
  "/activity": { changeFrequency: "hourly" as const, priority: 0.7 },
  "/bookmarks": { changeFrequency: "daily" as const, priority: 0.6 },
  "/likes": { changeFrequency: "daily" as const, priority: 0.6 },
  "/invites": { changeFrequency: "monthly" as const, priority: 0.5 },
  "/sponsors": { changeFrequency: "monthly" as const, priority: 0.5 },
  "/sponsors/thank-you": { changeFrequency: "yearly" as const, priority: 0.3 },
  "/feeds": { changeFrequency: "monthly" as const, priority: 0.8 },
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();
  
  // Static pages from pageConfig
  const pageEntries = Object.keys(pageConfig).map((page) => {
    const config = pageConfig[page as keyof typeof pageConfig];
    
    return {
      url: `${base}${page === "/" ? "" : page}`,
      lastModified: now,
      ...config,
    };
  });
  
  // Team member profile pages (/about/drew, /about/dcyfr)
  // Note: Already included in pageConfig, but keeping for dynamic generation
  // in case team members are added in the future
  const teamEntries = teamMembers
    .filter((member) => !pageConfig[`/about/${member.slug}` as keyof typeof pageConfig])
    .map((member) => ({
      url: `${base}/about/${member.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  
  // Blog posts
  const blogPostEntries = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  
  // Work/portfolio project pages
  const projectEntries = visibleProjects.map((project) => ({
    url: `${base}/work/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Blog series pages (/blog/series/[slug])
  const seriesEntries = allSeries.map((series) => ({
    url: `${base}/blog/series/${series.slug}`,
    lastModified: new Date(series.latestPost.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Feed endpoints (RSS/Atom/JSON)
  // Each section has 3 feed types: RSS 2.0 (/feed, /rss.xml), Atom 1.0 (/atom.xml), JSON Feed 1.1 (/feed.json)
  const feedEntries = [
    // Main site feeds
    {
      url: `${base}/feed`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${base}/rss.xml`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${base}/atom.xml`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${base}/feed.json`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    // Activity feeds
    {
      url: `${base}/activity/feed`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/activity/rss.xml`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/activity/feed.json`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    },
    // Blog feeds
    {
      url: `${base}/blog/feed`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${base}/blog/rss.xml`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${base}/blog/feed.json`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    // Work/Projects feeds
    {
      url: `${base}/work/feed`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
    {
      url: `${base}/work/rss.xml`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
    {
      url: `${base}/work/feed.json`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
  ];
  
  return [
    ...pageEntries,
    ...teamEntries,
    ...blogPostEntries,
    ...projectEntries,
    ...seriesEntries,
    ...feedEntries,
  ];
}

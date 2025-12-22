import type { MetadataRoute } from "next";
import { posts, allSeries } from "@/data/posts";
import { visibleProjects } from "@/data/projects";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { SITE_URL } from "@/lib/site-config";

// Define static page configurations
const pageConfig = {
  "/": { changeFrequency: "weekly" as const, priority: 1.0 },
  "/about": { changeFrequency: "yearly" as const, priority: 0.5 },
  "/about/drew/resume": { changeFrequency: "monthly" as const, priority: 0.4 },
  "/blog": { changeFrequency: "weekly" as const, priority: 0.8 },
  "/work": { changeFrequency: "monthly" as const, priority: 0.7 },
  "/resume": { changeFrequency: "monthly" as const, priority: 0.7 },
  "/contact": { changeFrequency: "yearly" as const, priority: 0.6 },
} as const;

function getStaticPages(): string[] {
  const appDir = join(process.cwd(), "src/app");
  const pages: string[] = [];

  function scanDirectory(dir: string, route: string = ""): void {
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip certain directories
          if (item.startsWith(".") || item === "api" || item.startsWith("[")) {
            continue;
          }
          
          // Check if this directory has a page.tsx
          const pagePath = join(fullPath, "page.tsx");
          try {
            statSync(pagePath);
            // This directory has a page
            const routePath = route + "/" + item;
            pages.push(routePath);
          } catch {
            // No page.tsx in this directory
          }
          
          // Recursively scan subdirectories
          scanDirectory(fullPath, route + "/" + item);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  // Add home page
  pages.push("/");
  
  // Scan for other pages
  scanDirectory(appDir);
  
  return pages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();
  
  // Get all static pages dynamically
  const staticPages = getStaticPages();
  
  // Generate sitemap entries for static pages
  const pageEntries = staticPages.map((page) => {
    const config = pageConfig[page as keyof typeof pageConfig] || {
      changeFrequency: "monthly" as const,
      priority: 0.5,
    };
    
    return {
      url: `${base}${page === "/" ? "" : page}`,
      lastModified: now,
      ...config,
    };
  });
  
  // Generate sitemap entries for blog posts
  const blogPostEntries = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  
  // Generate sitemap entries for project detail pages
  const projectEntries = visibleProjects.map((project) => ({
    url: `${base}/portfolio/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Generate sitemap entries for series pages
  const seriesEntries = allSeries.map((series) => ({
    url: `${base}/blog/series/${series.slug}`,
    lastModified: new Date(series.latestPost.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Generate sitemap entries for feed URLs
  const feedEntries = [
    {
      url: `${base}/activity/feed`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/blog/feed`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${base}/work/feed`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
    {
      url: `${base}/feeds`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];
  
  return [...pageEntries, ...blogPostEntries, ...projectEntries, ...seriesEntries, ...feedEntries];
}

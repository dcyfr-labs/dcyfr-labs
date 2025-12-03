import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL;
  return {
    rules: [
      // Default rule for all crawlers
      { 
        userAgent: "*", 
        allow: "/",
        disallow: ["/api/", "/private/"],
      },
      // Google Search - Allow full indexing
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/private/"],
      },
      // Bing Search - Allow full indexing
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/private/"],
      },
      // AI Crawlers - Allow with specific rules
      {
        userAgent: ["GPTBot", "ChatGPT-User"],
        allow: ["/", "/blog/", "/work/", "/about/"],
        disallow: ["/api/", "/contact/"],
      },
      {
        userAgent: ["anthropic-ai", "Claude-Web"],
        allow: ["/", "/blog/", "/work/", "/about/"],
        disallow: ["/api/", "/contact/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/work/", "/about/"],
        disallow: ["/api/", "/contact/"],
      },
      {
        userAgent: ["CCBot", "cohere-ai"],
        allow: ["/", "/blog/", "/work/", "/about/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/"],
      },
      // Meta AI
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: ["/api/", "/contact/"],
      },
    ],
    sitemap: `${base}/sitemap`,
    host: base,
  };
}

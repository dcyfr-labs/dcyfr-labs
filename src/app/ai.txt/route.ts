import { NextResponse } from "next/server";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";

// AI.txt specification for AI crawlers and LLMs
// Similar to robots.txt but specifically for AI training and usage
export function GET() {
  const body = [
    "# ai.txt - AI Access Control Policy",
  `# ${SITE_URL}/ai.txt`,
    "",
    "# Global rules for AI crawlers and training data collection",
    "User-agent: *",
    "Allow: /",
    "",
    "# Specific rules for different AI services",
    "# OpenAI (ChatGPT, GPT models)",
    "User-agent: GPTBot",
    "Allow: /blog/",
    "Allow: /portfolio/",
    "Allow: /about/",
    "Disallow: /api/",
    "",
    "# Anthropic (Claude)",
    "User-agent: anthropic-ai",
    "User-agent: Claude-Web",
    "Allow: /blog/",
    "Allow: /portfolio/",
    "Allow: /about/",
    "Disallow: /api/",
    "",
    "# Google Extended (for AI training)",
    "User-agent: Google-Extended",
    "Allow: /blog/",
    "Allow: /portfolio/",
    "Allow: /about/",
    "Disallow: /api/",
    "",
    "# Common Crawl (used for AI training datasets)",
    "User-agent: CCBot",
    "Allow: /blog/",
    "Allow: /portfolio/",
    "Allow: /about/",
    "",
    "# Perplexity AI",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "# Usage Policy",
    "# Training-Data: allow-with-attribution",
    "# Commercial-Use: allow",
    "# Attribution-Required: yes",
  `# Attribution-Text: ${AUTHOR_NAME} - ${SITE_URL}`,
    "",
    "# Preferred citation format:",
  `# ${AUTHOR_NAME}. (Year). [Content Title]. Retrieved from ${SITE_URL}`,
    "",
    "# Data Mining Policy",
    "# Research-Use: allow",
    "# Educational-Use: allow",
    "# Training-Use: allow-with-attribution",
    "",
    "# Contact",
  `# For AI-related inquiries: ${SITE_URL}/contact`,
    "",
    "# Last Updated: 2025-10-04",
  ].join("\n");

  return new NextResponse(body + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
    },
  });
}

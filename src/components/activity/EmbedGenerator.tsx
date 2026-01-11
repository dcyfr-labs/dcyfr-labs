"use client";

import { useState } from "react";
import { Copy, Check, Code, ExternalLink } from "lucide-react";
import { SITE_URL } from "@/lib/site-config";
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ActivitySource } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

interface EmbedOptions {
  source?: ActivitySource;
  timeRange?: "today" | "week" | "month" | "year" | "all";
  limit?: number;
  width?: string;
  height?: string;
  theme?: "light" | "dark" | "auto";
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmbedGenerator() {
  const [options, setOptions] = useState<EmbedOptions>({
    limit: 20,
    width: "100%",
    height: "600px",
    theme: "auto",
  });
  const [copied, setCopied] = useState(false);

  // Generate embed URL
  const embedUrl = (() => {
    const params = new URLSearchParams();
    if (options.source) params.set("source", options.source);
    if (options.timeRange) params.set("timeRange", options.timeRange);
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.theme && options.theme !== "auto")
      params.set("theme", options.theme);

    const queryString = params.toString();
    return `${SITE_URL}/activity/embed${queryString ? `?${queryString}` : ""}`;
  })();

  // Generate iframe code
  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${options.width}"
  height="${options.height}"
  frameborder="0"
  scrolling="auto"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  title="Activity Feed"
></iframe>

<script>
  // Auto-resize iframe based on content height
  window.addEventListener('message', function(e) {
    if (e.data.type === 'activity-embed-resize') {
      const iframe = document.querySelector('iframe[src*="/activity/embed"]');
      if (iframe) {
        iframe.style.height = e.data.height + 'px';
      }
    }
  
  // Send theme to iframe (if auto-detect is enabled)
  ${
    options.theme === "auto"
      ? `
  const getTheme = () => {
    // Detect user's theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };
  
  const iframe = document.querySelector('iframe[src*="/activity/embed"]');
  if (iframe) {
    iframe.addEventListener('load', () => {
      iframe.contentWindow.postMessage({
        type: 'setTheme',
        theme: getTheme()
      }, '*');
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      iframe.contentWindow.postMessage({
        type: 'setTheme',
        theme: e.matches ? 'dark' : 'light'
      }, '*');
    });
  }
  `
      : ""
  }
  });
</script>`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5" />
        <h3 className={TYPOGRAPHY.h3.standard}>Embed Activity Feed</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Customize and embed your activity feed on external websites, blogs, or
        portfolio sites.
      </p>

      {/* Options */}
      <div className="space-y-4 mb-8">
        {/* Source Filter */}
        <div>
          {}
          <label
            htmlFor="embed-source"
            className="block mb-2 text-sm font-medium"
          >
            Filter by Source (optional)
          </label>
          <select
            id="embed-source"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={options.source || ""}
            onChange={(e) =>
              setOptions({
                ...options,
                source: e.target.value as ActivitySource | undefined,
              })
            }
          >
            <option value="">All Sources</option>
            <option value="blog">Blog Posts</option>
            <option value="project">Projects</option>
            <option value="github">GitHub Activity</option>
            <option value="trending">Trending Content</option>
            <option value="milestone">Milestones</option>
            <option value="certification">Certifications</option>
            <option value="engagement">High Engagement</option>
          </select>
        </div>

        {/* Time Range */}
        <div>
          {}
          <label
            htmlFor="embed-timeRange"
            className="block mb-2 text-sm font-medium"
          >
            Time Range (optional)
          </label>
          <select
            id="embed-timeRange"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={options.timeRange || ""}
            onChange={(e) =>
              setOptions({
                ...options,
                timeRange: e.target.value as EmbedOptions["timeRange"],
              })
            }
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Limit */}
        <div>
          {}
          <label
            htmlFor="embed-limit"
            className="block mb-2 text-sm font-medium"
          >
            Number of Items
          </label>
          <input
            id="embed-limit"
            type="number"
            min="1"
            max="100"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={options.limit || 20}
            onChange={(e) =>
              setOptions({ ...options, limit: parseInt(e.target.value) || 20 })
            }
          />
        </div>

        {/* Width */}
        <div>
          {}
          <label
            htmlFor="embed-width"
            className="block mb-2 text-sm font-medium"
          >
            Width
          </label>
          <input
            id="embed-width"
            type="text"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="100%"
            value={options.width}
            onChange={(e) => setOptions({ ...options, width: e.target.value })}
          />
        </div>

        {/* Height */}
        <div>
          {}
          <label
            htmlFor="embed-height"
            className="block mb-2 text-sm font-medium"
          >
            Height
          </label>
          <input
            id="embed-height"
            type="text"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="600px"
            value={options.height}
            onChange={(e) => setOptions({ ...options, height: e.target.value })}
          />
        </div>

        {/* Theme */}
        <div>
          {}
          <label
            htmlFor="embed-theme"
            className="block mb-2 text-sm font-medium"
          >
            Theme
          </label>
          <select
            id="embed-theme"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={options.theme}
            onChange={(e) =>
              setOptions({
                ...options,
                theme: e.target.value as "light" | "dark" | "auto",
              })
            }
          >
            <option value="auto">Auto-detect from parent page</option>
            <option value="light">Light theme</option>
            <option value="dark">Dark theme</option>
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-detect will match the theme of the page hosting the embed
          </p>
        </div>
      </div>

      {/* Preview Link */}
      <div className="mb-4">
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-info hover:text-info-dark"
        >
          <ExternalLink className="w-4 h-4" />
          Preview embed in new window
        </a>
      </div>

      {/* Generated Code */}
      <div className="relative">
        {}
        <label className="block mb-2 text-sm font-medium">Embed Code</label>
        <div className="relative">
          <pre className="bg-muted border rounded-lg p-4 text-xs overflow-x-auto">
            <code>{iframeCode}</code>
          </pre>
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-2 right-2 p-2 rounded-lg transition-colors",
              copied
                ? SEMANTIC_COLORS.status.success
                : "bg-card border hover:bg-muted/50"
            )}
            aria-label="Copy embed code"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div
        className={cn(
          "mt-6 p-4 border rounded-lg text-sm",
          SEMANTIC_COLORS.status.info,
          "dark:border-info/30"
        )}
      >
        {" "}
        {}
        <p className="mb-2 font-semibold">Usage Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-foreground">
          <li>Customize the options above to fit your needs</li>
          <li>Copy the generated embed code</li>
          <li>Paste it into your website&apos;s HTML</li>
          <li>The iframe will auto-resize based on content height</li>
        </ol>
      </div>
    </div>
  );
}

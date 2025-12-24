"use client";

import { useState } from "react";
import { Copy, Check, Code, ExternalLink } from "lucide-react";
import { SITE_URL } from "@/lib/site-config";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
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
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmbedGenerator() {
  const [options, setOptions] = useState<EmbedOptions>({
    limit: 20,
    width: "100%",
    height: "600px",
  });
  const [copied, setCopied] = useState(false);

  // Generate embed URL
  const embedUrl = (() => {
    const params = new URLSearchParams();
    if (options.source) params.set("source", options.source);
    if (options.timeRange) params.set("timeRange", options.timeRange);
    if (options.limit) params.set("limit", options.limit.toString());

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
    <div className="border border-zinc-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5" />
        <h3 className={TYPOGRAPHY.h3.standard}>Embed Activity Feed</h3>
      </div>

        <p className="text-sm text-zinc-600 mb-6">
        Customize and embed your activity feed on external websites, blogs, or portfolio sites.
      </p>

      {/* Options */}
      <div className="space-y-4 mb-8">
        {/* Source Filter */}
        <div>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <label htmlFor="embed-source" className="block mb-2 text-sm font-medium">
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
          {/* eslint-disable-next-line no-restricted-syntax */}
          <label htmlFor="embed-timeRange" className="block mb-2 text-sm font-medium">
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
          {/* eslint-disable-next-line no-restricted-syntax */}
          <label htmlFor="embed-limit" className="block mb-2 text-sm font-medium">
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
          {/* eslint-disable-next-line no-restricted-syntax */}
          <label htmlFor="embed-width" className="block mb-2 text-sm font-medium">
            Width
          </label>
          <input
            id="embed-width"
            type="text"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="100%"
            value={options.width}
            onChange={(e) =>
              setOptions({ ...options, width: e.target.value })
            }
          />
        </div>

        {/* Height */}
        <div>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <label htmlFor="embed-height" className="block mb-2 text-sm font-medium">
            Height
          </label>
          <input
            id="embed-height"
            type="text"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="600px"
            value={options.height}
            onChange={(e) =>
              setOptions({ ...options, height: e.target.value })
            }
          />
        </div>
      </div>

      {/* Preview Link */}
      <div className="mb-4">
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700" // eslint-disable-line no-restricted-syntax
        >
          <ExternalLink className="w-4 h-4" />
          Preview embed in new window
        </a>
      </div>

      {/* Generated Code */}
      <div className="relative">
        {/* eslint-disable-next-line no-restricted-syntax */}
        <label className="block mb-2 text-sm font-medium">
          Embed Code
        </label>
        <div className="relative">
          <pre className="bg-zinc-50 border rounded-lg p-4 text-xs overflow-x-auto">
            <code>{iframeCode}</code>
          </pre>
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-2 right-2 p-2 rounded-lg transition-colors",
              copied
                ? "bg-green-100 text-green-700" // eslint-disable-line no-restricted-syntax
                : "bg-white border hover:bg-zinc-50"
            )}
            aria-label="Copy embed code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 p-4 border rounded-lg bg-blue-50 border-blue-200 text-sm"> { }
        <p className="mb-2 font-semibold">Usage Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-zinc-700">
          <li>Customize the options above to fit your needs</li>
          <li>Copy the generated embed code</li>
          <li>Paste it into your website&apos;s HTML</li>
          <li>The iframe will auto-resize based on content height</li>
        </ol>
      </div>
    </div>
  );
}

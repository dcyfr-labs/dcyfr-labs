"use client";

import { Download } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/**
 * Download Resume Button Component
 * 
 * Opens the resume page in a new window for printing/downloading.
 * Tracks downloads via analytics.
 * 
 * @component
 * @example
 * ```tsx
 * <DownloadResumeButton />
 * ```
 */
export function DownloadResumeButton() {
  const handleDownload = () => {
    // Track resume download
    trackEvent({
      name: 'resume_downloaded',
      properties: {
        source: window.location.pathname,
      },
    });

    // Trigger print dialog directly (no new window)
    window.print();
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Download resume as PDF"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Download Resume
    </button>
  );
}

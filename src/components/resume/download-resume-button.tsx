"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { trackEvent } from "@/lib/analytics";

/**
 * Download Resume Button Component
 *
 * Triggers print dialog for downloading/saving resume as PDF.
 * Features:
 * - Tracks download events for analytics
 * - Semantic button element
 * - Design token compliance
 * - Accessible with proper ARIA labels
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
      name: "resume_downloaded",
      properties: {
        source: window.location.pathname,
      },
    });

    // Trigger print dialog directly
    window.print();
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="gap-2"
      aria-label="Download resume as PDF"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Download Resume</span>
      <span className="sm:hidden">Download</span>
    </Button>
  );
}

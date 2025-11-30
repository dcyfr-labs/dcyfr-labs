/**
 * DraftBanner - Notification banner for draft pages
 * 
 * Displays a prominent banner indicating that a page is in draft mode
 * and only visible in development environments. Automatically integrated
 * into PageLayout when isDraft prop is true.
 * 
 * Uses dashboard width to match SiteHeader width for visual consistency.
 * 
 * @example
 * ```tsx
 * <PageLayout isDraft>
 *   {children}
 * </PageLayout>
 * ```
 */

import { AlertCircle } from "lucide-react";
import { CONTAINER_WIDTHS, CONTAINER_PADDING } from "@/lib/design-tokens";

export function DraftBanner() {
  return (
    <div className={`mx-auto ${CONTAINER_WIDTHS.content} ${CONTAINER_PADDING} pt-6`}>
      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-500/90">
              <strong className="font-semibold">Draft Page</strong> — This page is only visible in development and will not render in preview or production environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

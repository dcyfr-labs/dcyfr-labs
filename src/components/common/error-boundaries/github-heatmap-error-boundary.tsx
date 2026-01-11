"use client";

import React from "react";
import { ErrorBoundary, type ErrorFallbackProps } from "./error-boundary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SEMANTIC_COLORS } from "@/lib/design-tokens";

/**
 * Error fallback specifically for the GitHub heatmap component.
 */
function GitHubHeatmapErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const DEFAULT_GITHUB_USERNAME = "dcyfr";

  return (
    <Card
      className={cn(
        "p-4 min-h-[400px] flex items-center",
        SEMANTIC_COLORS.alert.warning.container,
        SEMANTIC_COLORS.alert.warning.border
      )}
    >
      <div className="space-y-3 w-full">
        <div className="flex items-start gap-3">
          <AlertCircle
            className={cn(
              "w-5 h-5 mt-0.5 flex-shrink-0",
              SEMANTIC_COLORS.alert.warning.icon
            )}
            aria-hidden="true"
          />
          <div className="flex-1 space-y-2">
            <div>
              <h3
                className={cn(
                  TYPOGRAPHY.label.small,
                  SEMANTIC_COLORS.alert.warning.text
                )}
              >
                Unable to Load GitHub Contributions
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm",
                  SEMANTIC_COLORS.alert.warning.text
                )}
              >
                There was a problem fetching contribution data. This might be
                due to rate limiting, network issues, or API unavailability.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={resetError}
                variant="outline"
                size="sm"
                className="h-8"
              >
                Try Again
              </Button>
              <Button variant="ghost" size="sm" className="h-8" asChild>
                <a
                  href={`https://github.com/${DEFAULT_GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-3 text-xs">
                <summary
                  className={cn(
                    "cursor-pointer font-mono",
                    SEMANTIC_COLORS.alert.warning.label,
                    "hover:opacity-80"
                  )}
                >
                  Technical details (development only)
                </summary>
                <pre
                  className={cn(
                    "mt-2 overflow-auto rounded-md p-2 text-xs",
                    SEMANTIC_COLORS.alert.warning.container,
                    SEMANTIC_COLORS.alert.warning.text
                  )}
                >
                  {error.message}
                  {error.stack &&
                    `\n\n${error.stack.split("\n").slice(0, 5).join("\n")}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Wraps GitHub heatmap component with error boundary.
 */
export function GitHubHeatmapErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={GitHubHeatmapErrorFallback}
      onError={(error) => {
        console.error("GitHub Heatmap Error:", error);
        // Could send to analytics or error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

"use client";

import React from "react";
import { ErrorBoundary, type ErrorFallbackProps } from "./error-boundary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Error fallback specifically for the GitHub heatmap component.
 */
function GitHubHeatmapErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const DEFAULT_GITHUB_USERNAME = "dcyfr";

  return (
    <Card className="p-6 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/5">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <div>
              <h3 className={cn("text-sm", "font-semibold", "text-amber-900", "dark:text-amber-100")}>
                Unable to Load GitHub Contributions
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                There was a problem fetching contribution data. This might be due to rate limiting,
                network issues, or API unavailability.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={resetError} variant="outline" size="sm" className="h-8">
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                asChild
              >
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
                <summary className="cursor-pointer font-mono text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100">
                  Technical details (development only)
                </summary>
                <pre className="mt-2 overflow-auto rounded-md bg-amber-100 dark:bg-amber-950/50 p-2 text-xs text-amber-900 dark:text-amber-100">
                  {error.message}
                  {error.stack && `\n\n${error.stack.split("\n").slice(0, 5).join("\n")}`}
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
export function GitHubHeatmapErrorBoundary({ children }: { children: React.ReactNode }) {
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

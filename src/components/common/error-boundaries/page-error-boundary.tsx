"use client";

import React from "react";
import { ErrorBoundary, type ErrorFallbackProps } from "./error-boundary";
import { Button } from "@/components/ui/button";
import { CONTAINER_WIDTHS, CONTAINER_VERTICAL_PADDING, TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";

/**
 * Error fallback for page-level errors.
 */
function PageErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_VERTICAL_PADDING}`}>
      <div className={SPACING.content}>
        <div className="space-y-3">
          <h1 className={cn(TYPOGRAPHY.display.error, "text-destructive")}>
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-muted-foreground">
            We encountered an unexpected error while rendering this page. Don&apos;t worry, your data is
            safe.
          </p>
        </div>

        <div className="space-y-3">
          <p className={cn("text-sm", "font-medium")}>What you can do:</p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">Try refreshing the page</span>
            </li>
            <li className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">Go back to the homepage</span>
            </li>
            <li className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">Check your internet connection</span>
            </li>
            <li className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">Contact us if the problem persists</span>
            </li>
          </ul>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="rounded-md border p-4">
            <summary className="cursor-pointer text-sm font-mono text-muted-foreground hover:text-foreground">
              Technical details (development only)
            </summary>
            <div className="mt-3 space-y-2">
              <div>
                <p className={cn("text-xs", "font-semibold", "text-muted-foreground")}>Error Message:</p>
                <p className="mt-1 text-xs font-mono">{error.message}</p>
              </div>
              {error.stack && (
                <div>
                  <p className={cn("text-xs", "font-semibold", "text-muted-foreground")}>Stack Trace:</p>
                  <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex gap-3">
          <Button onClick={resetError} variant="default">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Go to homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps page content with error boundary for top-level error handling.
 */
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={PageErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Page Error:", error);
        console.error("Component Stack:", errorInfo.componentStack);
        // In production, send to error tracking service
        // Example: trackError({ error, componentStack: errorInfo.componentStack });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

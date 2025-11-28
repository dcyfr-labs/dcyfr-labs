"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Base Error Boundary component for catching React errors in client components.
 * Provides a fallback UI when an error occurs and supports error reporting.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you could send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component with a user-friendly error message.
 */
export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="p-6 border-destructive/50">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className={cn("text-lg", "font-semibold", "text-destructive")}>Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            We encountered an error while rendering this component. Please try again.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-xs">
            <summary className="cursor-pointer font-mono text-muted-foreground hover:text-foreground">
              Error details (development only)
            </summary>
            <pre className="mt-2 overflow-auto rounded-md bg-muted p-2 text-xs">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <Button onClick={resetError} variant="outline" size="sm">
          Try again
        </Button>
      </div>
    </Card>
  );
}

/**
 * Minimal error fallback for inline components (less intrusive).
 */
export function MinimalErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={cn("text-sm", "font-medium", "text-destructive")}>Error loading content</p>
          {process.env.NODE_ENV === "development" && (
            <p className="mt-1 text-xs text-muted-foreground font-mono">{error.message}</p>
          )}
        </div>
        <Button onClick={resetError} variant="ghost" size="sm">
          Retry
        </Button>
      </div>
    </div>
  );
}

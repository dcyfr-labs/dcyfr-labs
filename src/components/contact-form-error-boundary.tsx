"use client";

import React from "react";
import { ErrorBoundary, type ErrorFallbackProps } from "./error-boundary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

/**
 * Error fallback for the contact form.
 */
function ContactFormErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="p-6 border-destructive/50">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className={cn("text-lg", "font-semibold", "text-destructive")}>Contact form error</h2>
          <p className="text-sm text-muted-foreground">
            We encountered an issue with the contact form. You can try again or reach out via
            alternative methods listed below.
          </p>
        </div>

        <div className="space-y-2">
          <p className={cn("text-sm", "font-medium")}>Alternative contact methods:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">GitHub: Check the footer for links</span>
            </li>
            <li className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">LinkedIn: Available in the footer</span>
            </li>
            <li className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">Email: Direct contact available in footer</span>
            </li>
          </ul>
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
          Try reloading form
        </Button>
      </div>
    </Card>
  );
}

/**
 * Wraps contact form with error boundary.
 */
export function ContactFormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={ContactFormErrorFallback}
      onError={(error) => {
        console.error("Contact Form Error:", error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

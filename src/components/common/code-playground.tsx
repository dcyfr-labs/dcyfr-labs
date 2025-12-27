"use client";

/**
 * Code Playground Component
 * Embeds interactive code examples using StackBlitz WebContainers
 * Features:
 * - Lazy loading on scroll
 * - Mobile-responsive (read-only on mobile)
 * - Error handling with fallback
 * - Support for predefined templates
 */

import React, { useState, useRef, useEffect } from "react";
import { getTemplate } from "@/lib/playground-templates";
import { SPACING, CONTAINER_WIDTHS, TYPOGRAPHY, ANIMATION } from "@/lib/design-tokens";
import { AlertTriangle, Code, Loader, ExternalLink, Lightbulb } from "lucide-react";
import { Alert } from "@/components/common/alert";
import { cn } from "@/lib/utils";

interface CodePlaygroundProps {
  /** Template ID (e.g., 'react-counter') */
  template: string;
  /** Optional custom height for iframe */
  height?: string;
  /** Optional title override */
  title?: string;
  /** Show code editor (default: true, mobile: false) */
  showEditor?: boolean;
  /** Open in new tab button (default: true) */
  showOpenButton?: boolean;
}

/**
 * CodePlayground Component
 * Usage in MDX:
 * <CodePlayground template="react-counter" />
 * <CodePlayground template="typescript-todo" height="600px" />
 */
export function CodePlayground({
  template: templateId,
  height = "500px",
  title,
  showEditor = true,
  showOpenButton = true,
}: CodePlaygroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get template
  const templateData = getTemplate(templateId);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lazy load with Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(containerRef.current!);
        }
      },
      { rootMargin: "50px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Validate template
  if (!templateData) {
    return (
      <Alert type="warning" className={SPACING.content}>
        <AlertTriangle className="inline mr-2" size={16} />
        Code playground template not found: <code>{templateId}</code>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert type="warning" className={SPACING.content}>
        <AlertTriangle className="inline mr-2" size={16} />
        {error}
      </Alert>
    );
  }

  // StackBlitz embed URL
  const embedUrl = `https://stackblitz.com/github/dcyfr/dcyfr-labs-playgrounds/tree/main/${templateId}?embed=1&view=${
    isMobile || !showEditor ? "preview" : "editor"
  }`;

  // Open in StackBlitz URL
  const openUrl = `https://stackblitz.com/github/dcyfr/dcyfr-labs-playgrounds/tree/main/${templateId}`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "my-8 rounded-xl overflow-hidden border border-border bg-card shadow-sm",
        "transition-shadow hover:shadow-md"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-primary" />
          <div>
            <h3 className={cn(TYPOGRAPHY.label.small, "font-semibold")}>{title || templateData.name}</h3>
            {templateData.description && (
              <p className={cn(TYPOGRAPHY.label.small, "text-muted-foreground text-xs")}>{templateData.description}</p>
            )}
          </div>
        </div>

        {showOpenButton && (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1",
              TYPOGRAPHY.label.small,
              "font-medium",
              "text-primary hover:text-primary/80",
              ANIMATION.transition.theme,
              "px-2 py-1 rounded hover:bg-primary/10"
            )}
            title="Open in StackBlitz"
          >
            Open
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Iframe Container */}
      <div
        className={cn(
          "relative bg-background",
          !isIntersecting && "min-h-96 flex items-center justify-center"
        )}
        style={{ height: isIntersecting ? height : "auto" }}
      >
        {!isIntersecting ? (
          <div className="text-center text-muted-foreground">
            <Loader className="animate-spin mx-auto mb-2" size={20} />
            <p className={TYPOGRAPHY.label.small}>Loading playground...</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className={cn(
              "w-full border-0",
              ANIMATION.transition.theme,
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{ height: height }}
            title={templateData.name}
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            onLoad={() => setIsLoaded(true)}
            onError={() => setError("Failed to load playground iframe")}
          />
        )}
      </div>

      {/* Mobile Notice */}
      {isMobile && (
        <div className="bg-info/10 border-t border-info/20 px-4 py-2">
          <p className={cn(TYPOGRAPHY.label.small, "text-muted-foreground", "flex items-center gap-2")}>
            <Lightbulb className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>Tip: Open in StackBlitz for the full editor experience on desktop</span>
          </p>
        </div>
      )}
    </div>
  );
}

export type { CodePlaygroundProps };
export default CodePlayground;

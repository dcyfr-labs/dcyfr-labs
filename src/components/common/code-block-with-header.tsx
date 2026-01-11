"use client";

import React from "react";
import { CopyCodeButton } from "./copy-code-button";
import { SHADOWS, ANIMATION } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface CodeBlockWithHeaderProps {
  children: React.ReactNode;
  language?: string;
  filename?: string;
  title?: string;
  className?: string;
}

/**
 * Enhanced code block component with header row that matches table styling.
 * Features:
 * - Header row with language, filename, and action buttons
 * - Same border, shadow, and styling as tables
 * - Copy button integrated into header
 * - Responsive design
 * - Accessible structure
 */
export function CodeBlockWithHeader({
  children,
  language,
  filename,
  title,
  className,
}: CodeBlockWithHeaderProps) {
  // Extract the code content for the copy button
  const codeContent = React.Children.toArray(children)
    .map((child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as { children?: React.ReactNode };
        return extractTextFromChildren(childProps.children);
      }
      return "";
    })
    .join("");

  // Determine display language (fallback chain)
  const displayLanguage =
    language || title || filename?.split(".").pop() || "plaintext";

  // Format language name for display
  const formatLanguageName = (lang: string) => {
    const languageMap: Record<string, string> = {
      tsx: "TSX",
      jsx: "JSX",
      ts: "TypeScript",
      js: "JavaScript",
      py: "Python",
      md: "Markdown",
      mdx: "MDX",
      yml: "YAML",
      yaml: "YAML",
      json: "JSON",
      css: "CSS",
      scss: "SCSS",
      html: "HTML",
      xml: "XML",
      sql: "SQL",
      bash: "Bash",
      sh: "Shell",
      zsh: "Zsh",
      fish: "Fish",
      powershell: "PowerShell",
      dockerfile: "Dockerfile",
      gitignore: "Git Ignore",
      plaintext: "Plain Text",
    };

    return (
      languageMap[lang.toLowerCase()] ||
      lang.charAt(0).toUpperCase() + lang.slice(1)
    );
  };

  return (
    <figure
      className="my-8 w-full group"
      role="img"
      aria-label={`Code example${language ? ` in ${formatLanguageName(displayLanguage)}` : ""}`}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-card",
          SHADOWS.tier2.combined,
          ANIMATION.transition.theme,
          SHADOWS.tier2.hover,
          className
        )}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Language Badge */}
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
              {formatLanguageName(displayLanguage)}
            </span>

            {/* Filename (if provided) */}
            {filename && (
              <span className="text-sm text-muted-foreground font-mono">
                {filename}
              </span>
            )}

            {/* Title (if provided and no filename) */}
            {title && !filename && (
              <span className="text-sm text-muted-foreground">{title}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center">
            <CopyCodeButton code={codeContent} variant="header" />
          </div>
        </div>

        {/* Code Content */}
        <div className="overflow-x-auto">
          <pre
            data-code-block-header="true"
            className={cn(
              "[&>code]:grid [&>code]:text-[0.875rem] overflow-x-auto",
              "!border-none !shadow-none !rounded-none !my-0", // Reset pre styling
              "p-4" // Add padding to content area only
            )}
          >
            {children}
          </pre>
        </div>
      </div>
    </figure>
  );
}

/**
 * Helper function to extract text content from React children
 * Handles nested structures and component children
 */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }

  if (React.isValidElement(children)) {
    const childProps = children.props as { children?: React.ReactNode };
    return extractTextFromChildren(childProps.children);
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }

  return "";
}

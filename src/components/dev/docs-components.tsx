"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, FileText, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { DocFile } from "@/lib/docs";

interface DocSidebarProps {
  docs: DocFile[];
  currentSlug?: string;
  className?: string;
}

export function DocSidebar({ docs, currentSlug, className }: DocSidebarProps) {
  // Filter out root-level files (files without a subfolder)
  // Only show docs that are in subfolders (slug contains "/")
  // Memoize to prevent recalculation on every render
  const docsInFolders = useMemo(
    () => docs.filter(doc => doc.slug.includes("/")),
    [docs]
  );

  // Group docs by category
  // Memoize to prevent recalculation on every render
  const docsByCategory = useMemo(
    () => docsInFolders.reduce((acc, doc) => {
      const category = doc.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, DocFile[]>),
    [docsInFolders]
  );

  // Track which categories are expanded (default: all collapsed)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  return (
    <aside className={cn("sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto", className)}>
      <nav className="space-y-2">
        {Object.entries(docsByCategory).map(([category, categoryDocs]) => {
          const isExpanded = expandedCategories.has(category);
          const isCurrentCategory = currentSlug?.startsWith(`${category}/`);

          return (
            <div key={category}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors flex-1 text-left"
                  aria-expanded={isExpanded}
                  aria-label={`Toggle ${category} category`}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  )}
                  <Folder size={16} className="shrink-0" />
                  <span className={cn(TYPOGRAPHY.h3.standard, "flex-1")}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </button>
                <Link
                  href={`/dev/docs/${category}`}
                  className={cn(
                    "p-2 rounded hover:bg-muted transition-colors",
                    isCurrentCategory && !currentSlug?.includes("/", category.length + 1) && "bg-muted"
                  )}
                  aria-label={`View ${category} category page`}
                  title="View category overview"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>

              {isExpanded && (
                <ul className="list-none space-y-1 ml-4 mt-1">
                  {categoryDocs.map((doc) => (
                    <li key={doc.slug}>
                      <Link
                        href={`/dev/docs/${doc.slug}`}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors",
                          currentSlug === doc.slug && "bg-muted font-medium"
                        )}
                      >
                        <FileText size={14} className="shrink-0" />
                        <span className="truncate">{doc.meta.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

interface DocSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function DocSearch({ onSearch, placeholder = "Search documentation..." }: DocSearchProps) {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

interface DocBreadcrumbsProps {
  doc: DocFile;
}

export function DocBreadcrumbs({ doc }: DocBreadcrumbsProps) {
  const pathParts = doc.slug.split("/");
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link href="/dev/docs" className="hover:text-foreground transition-colors">
        Docs
      </Link>
      {pathParts.map((part, index) => {
        const isLast = index === pathParts.length - 1;
        const href = `/dev/docs/${pathParts.slice(0, index + 1).join("/")}`;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight size={14} />
            {isLast ? (
              <span className="text-foreground font-medium">
                {doc.meta.title || part}
              </span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {part}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

interface DocHeaderProps {
  doc: DocFile;
}

export function DocHeader({ doc }: DocHeaderProps) {
  return (
    <header className={SPACING.content}>
      <DocBreadcrumbs doc={doc} />
      <h1 className={TYPOGRAPHY.h1.standard}>{doc.meta.title}</h1>
      {doc.meta.description && (
        <p className={cn(TYPOGRAPHY.description, "mt-2")}>
          {doc.meta.description}
        </p>
      )}
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <span>Category: {doc.category}</span>
        <span>Last updated: {doc.lastModified.toLocaleDateString()}</span>
      </div>
    </header>
  );
}

interface DocTableOfContentsProps {
  headings: Array<{
    id: string;
    title: string;
    level: number;
  }>;
}

export function DocTableOfContents({ headings }: DocTableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <aside className="sticky top-24 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-4")}>Table of Contents</h3>
      <nav>
        <ul className="list-none space-y-1">
          {headings.map((heading) => (
            <li key={heading.id} style={{ marginLeft: (heading.level - 1) * 12 }}>
              <a
                href={`#${heading.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {heading.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
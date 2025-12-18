import React from "react";
import Link from "next/link";
import { Search, FileText, Folder, ChevronRight } from "lucide-react";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { DocFile } from "@/lib/docs";

interface DocSidebarProps {
  docs: DocFile[];
  currentSlug?: string;
  className?: string;
}

export function DocSidebar({ docs, currentSlug, className }: DocSidebarProps) {
  // Group docs by category
  const docsByCategory = docs.reduce((acc, doc) => {
    const category = doc.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, DocFile[]>);

  return (
    <aside className={cn("sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto", className)}>
      <nav className="space-y-4">
        {Object.entries(docsByCategory).map(([category, categoryDocs]) => (
          <div key={category}>
            <h3 className={cn(TYPOGRAPHY.h3.standard, "flex items-center gap-2 mb-2")}>
              <Folder size={16} />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <ul className="space-y-1 ml-4">
              {categoryDocs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/dev/docs/${doc.slug}`}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors",
                      currentSlug === doc.slug && "bg-muted font-medium"
                    )}
                  >
                    <FileText size={14} />
                    {doc.meta.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
        <ul className="space-y-1">
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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFile, readdir } from "fs/promises";
import { join, relative } from "path";
import { createPageMetadata } from "@/lib/metadata";
import { extractHeadings } from "@/lib/toc";
import { PageLayout } from "@/components/layouts";
import { MDX, TableOfContents } from "@/components/common";
import { Breadcrumbs } from "@/components/navigation";
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { Search, FileText, Folder, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Force dynamic rendering for live docs (file system access)
export const dynamic = "force-dynamic";

const DOCS_ROOT = join(process.cwd(), "docs");

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Get all markdown files in docs directory recursively
 */
async function getDocFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden directories and node_modules
      if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
        files.push(...(await getDocFiles(fullPath, baseDir)));
      }
    } else if (entry.name.endsWith(".md")) {
      const relativePath = relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Generate static params for all doc pages
 */
export async function generateStaticParams() {
  try {
    const files = await getDocFiles(DOCS_ROOT);
    return files.map((file) => ({
      slug: file.replace(/\.md$/, "").split("/"),
    }));
  } catch (error) {
    console.error("Error generating doc params:", error);
    return [];
  }
}

/**
 * Generate metadata for doc pages
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug?.join("/") || "INDEX";
  
  // Map file paths to titles
  const title = slugPath === "INDEX" ? "Documentation" : slugPath
    .split("/")
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase()) || "Documentation";

  return createPageMetadata({
    title: `${title} - Dev Docs`,
    description: `Developer documentation: ${title}`,
    path: `/dev/docs/${slug?.join("/") || ""}`,
  });
}

/**
 * Parse breadcrumbs from slug
 */
function parseBreadcrumbs(slug?: string[]): Array<{ label: string; href: string }> {
  const crumbs = [{ label: "Dev", href: "/dev" }];
  
  if (!slug || slug.length === 0) {
    crumbs.push({ label: "Documentation", href: "/dev/docs" });
    return crumbs;
  }

  let path = "/dev/docs";
  for (let i = 0; i < slug.length; i++) {
    path += `/${slug[i]}`;
    const label = slug[i]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

/**
 * Get directory structure for navigation
 */
async function getDirectoryStructure(dir: string, baseDir: string = dir): Promise<any> {
  const structure: any = { name: relative(baseDir, dir) || "docs", type: "directory", children: [] };
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subStructure = await getDirectoryStructure(fullPath, baseDir);
        structure.children.push(subStructure);
      } else if (entry.name.endsWith(".md")) {
        structure.children.push({
          name: entry.name.replace(/\.md$/, ""),
          type: "file",
          path: relative(baseDir, fullPath).replace(/\.md$/, ""),
        });
      }
    }
    
    // Sort: directories first, then files, alphabetically
    structure.children.sort((a: any, b: any) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });
  } catch (error) {
    console.error("Error reading directory:", error);
  }
  
  return structure;
}

/**
 * Render directory tree navigation
 */
function DirectoryTree({ node, currentPath }: { node: any; currentPath: string }) {
  const isActive = node.type === "file" && currentPath === node.path;
  
  if (node.type === "file") {
    return (
      <Link
        href={`/dev/docs/${node.path}`}
        className={`flex items-center gap-2 py-1.5 px-3 rounded-md text-sm transition-colors ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="truncate">{node.name}</span>
      </Link>
    );
  }
  
  return (
    <details open={currentPath.startsWith(node.name)}>
      <summary className={`flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${TYPOGRAPHY.label.small}`}>
        <Folder className="h-4 w-4 shrink-0" />
        <span className="truncate">{node.name}</span>
      </summary>
      <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
        {node.children.map((child: any, idx: number) => (
          <DirectoryTree key={idx} node={child} currentPath={currentPath} />
        ))}
      </div>
    </details>
  );
}

/**
 * Main docs page component
 */
export default async function DevDocsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;
  
  // Determine file path
  let filePath: string;
  let currentPath: string;
  
  if (!slug || slug.length === 0) {
    filePath = join(DOCS_ROOT, "INDEX.md");
    currentPath = "INDEX";
  } else {
    currentPath = slug.join("/");
    filePath = join(DOCS_ROOT, `${currentPath}.md`);
  }

  // Read markdown content
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch (error) {
    notFound();
  }

  // Extract headings for TOC
  const headings = extractHeadings(content);
  
  // Get directory structure for sidebar
  const directoryStructure = await getDirectoryStructure(DOCS_ROOT);
  
  // Parse breadcrumbs
  const breadcrumbs = parseBreadcrumbs(slug);

  return (
    <PageLayout>
      <div className="relative">
        {/* Breadcrumbs */}
        <div className="mb-10 md:mb-12">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 xl:gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {/* Search placeholder */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search docs..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled
                />
              </div>

              {/* Directory tree */}
              <nav className="space-y-2" aria-label="Documentation navigation">
              {directoryStructure.children.map((child: any, idx: number) => (
                <DirectoryTree key={idx} node={child} currentPath={currentPath} />
              ))}
            </nav>              {/* Edit on GitHub */}
              <div className="pt-4 border-t border-border">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link
                    href={`https://github.com/dcyfr/dcyfr-labs/edit/main/docs/${currentPath}.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Edit on GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            <article className={`prose prose-slate dark:prose-invert ${CONTAINER_WIDTHS.prose}`}>
              <MDX source={content} />
            </article>

            {/* Footer metadata */}
            <footer className="mt-10 md:mt-12 pt-4 border-t border-border text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
                <Link
                  href={`/api/dev/docs/edit?path=${currentPath}`}
                  className="text-primary hover:underline"
                >
                  Edit this page
                </Link>
              </div>
            </footer>
          </main>
        </div>

        {/* Table of Contents (desktop only) */}
        {headings.length > 0 && (
          <TableOfContents headings={headings} />
        )}
      </div>
    </PageLayout>
  );
}

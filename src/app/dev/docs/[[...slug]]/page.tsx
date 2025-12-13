import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { createPageMetadata } from "@/lib/metadata";
import { extractHeadings } from "@/lib/toc";
import { PageLayout } from "@/components/layouts";
import { MDX, TableOfContents } from "@/components/common";
import { Breadcrumbs } from "@/components/navigation";
import { CONTAINER_WIDTHS, getContainerClasses } from "@/lib/design-tokens";
import { DocsSidebar } from "@/components/dev/docs-sidebar";
import {
  getDocFiles,
  getDirectoryStructure,
  parseBreadcrumbs,
  generatePageTitle,
  resolveDocFilePath,
} from "@/lib/docs-utils";

// Force dynamic rendering for live docs (file system access)
export const dynamic = "force-dynamic";

const DOCS_ROOT = join(process.cwd(), "docs");

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  const title = generatePageTitle(slug);

  return createPageMetadata({
    title: `${title} - Dev Docs`,
    description: `Developer documentation: ${title}`,
    path: `/dev/docs/${slug?.join("/") || ""}`,
  });
}

/**
 * Main docs page component
 */
export default async function DevDocsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;

  // Determine file path
  let filePath: string;
  let currentPath: string;

  if (!slug || slug.length === 0) {
    filePath = join(DOCS_ROOT, "INDEX.md");
    currentPath = "INDEX";
  } else {
    currentPath = slug.join("/");
    const resolvedPath = await resolveDocFilePath(join(DOCS_ROOT, currentPath));
    if (!resolvedPath) {
      notFound();
    }
    filePath = resolvedPath;
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
      <div className={`relative ${getContainerClasses('archive')}`}>
        {/* Breadcrumbs */}
        <div className="mb-10 md:mb-12">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_240px] gap-4 xl:gap-8 2xl:gap-12">
          {/* Sidebar Navigation */}
          <DocsSidebar
            structure={directoryStructure}
            currentPath={currentPath}
          />

          {/* Main content */}
          <main className="min-w-0">
            <article className={`prose prose-slate dark:prose-invert ${CONTAINER_WIDTHS.prose}`}>
              <MDX source={content} />
            </article>

            {/* Footer metadata */}
            <footer className="mt-10 md:mt-12 pt-4 border-t border-border text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </footer>
          </main>

          {/* Table of Contents - Integrated Right Sidebar */}
          {headings.length > 0 && (
            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-4">
                <div className="bg-background border rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-foreground mb-4">On this page</h3>
                  <nav className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {headings.map((heading) => {
                      const isActive = false; // We'll keep this simple for now
                      return (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={`block text-sm hover:text-primary transition-colors ${
                            heading.level === 3 ? 'pl-4' : ''
                          } text-muted-foreground hover:text-foreground py-1`}
                        >
                          {heading.text}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Mobile Table of Contents */}
        {headings.length > 0 && <TableOfContents headings={headings} hideFAB={false} />}
      </div>
    </PageLayout>
  );
}

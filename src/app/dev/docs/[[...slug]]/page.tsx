import { createPageMetadata } from "@/lib/metadata";
import { DocsLayout } from "@/components/layouts";
import { DocHeader, ClientDocSearch } from "@/components/dev";
import { MDX } from "@/components/common";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { getAllDocs, getDocBySlug, getFolderContents, searchDocs, extractTableOfContents } from "@/lib/docs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Folder, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ search?: string }>;
}

// Enable on-demand ISR - pages are generated on first request, then cached
export const dynamicParams = true;
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug?.join("/") || "";

  if (!slugPath) {
    return createPageMetadata({
      title: "Developer Documentation",
      description: "Browse all documentation for the DCYFR Labs project",
      path: "/dev/docs",
    });
  }

  // Check if it's a folder first (has INDEX/README or files/subfolders)
  const folderContents = getFolderContents(slugPath);
  const hasIndexOrReadme = folderContents.indexDoc || folderContents.readmeDoc;
  const hasFilesOrFolders = folderContents.files.length > 0 || folderContents.subfolders.length > 0;

  if (hasIndexOrReadme || hasFilesOrFolders) {
    const lastSegment = slugPath.split('/').pop() || '';
    const folderName = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

    return createPageMetadata({
      title: `${folderName} Documentation - Dev Docs`,
      description: `Browse ${folderName} documentation and guides`,
      path: `/dev/docs/${slugPath}`,
    });
  }

  // Otherwise, try to get a specific document (not INDEX/README)
  const doc = getDocBySlug(slugPath);

  if (doc) {
    return createPageMetadata({
      title: `${doc.meta.title} - Dev Docs`,
      description: doc.meta.description || `Documentation for ${doc.meta.title}`,
      path: `/dev/docs/${doc.slug}`,
    });
  }

  return createPageMetadata({
    title: "Documentation Not Found",
    description: "The requested documentation page could not be found",
    path: `/dev/docs/${slugPath}`,
  });
}

export default async function DevDocsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved?.search;
  const slugPath = slug?.join("/") || "";
  
  const allDocs = getAllDocs();
  
  // If no slug, show docs index with README.md as primary content
  if (!slugPath) {
    const folderContents = getFolderContents("");
    const searchResults = search ? searchDocs(search) : null;
    
    // If searching, show search results
    if (search && searchResults) {
      const RESULTS_PER_PAGE = 50;
      const displayedResults = searchResults.slice(0, RESULTS_PER_PAGE);
      const hasMoreResults = searchResults.length > RESULTS_PER_PAGE;

      return (
        <DocsLayout docs={allDocs}>
          <div>
            <header className={SPACING.content}>
              <h1 className={TYPOGRAPHY.h1.standard}>Search Results</h1>
              <p className={cn(TYPOGRAPHY.description, "mt-2")}>
                {hasMoreResults ? (
                  <>Showing {displayedResults.length} of {searchResults.length} results for &quot;{search}&quot;</>
                ) : (
                  <>Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &quot;{search}&quot;</>
                )}
              </p>
              {hasMoreResults && (
                <div className="mt-3 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  <p>Too many results to display. Try refining your search query for better results.</p>
                </div>
              )}
            </header>

            <div className="mb-8">
              <ClientDocSearch placeholder="Search documentation..." />
            </div>

            <div className="space-y-4">
              {displayedResults.map(doc => (
                <Link
                  key={doc.slug}
                  href={`/dev/docs/${doc.slug}`}
                  className="block p-4 border border-border rounded-lg hover:border-border-hover transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 flex-shrink-0" size={16} />
                    <div className="flex-1">
                      <h3 className={TYPOGRAPHY.h3.standard}>{doc.meta.title}</h3>
                      {doc.meta.description && (
                        <p className="text-muted-foreground text-sm mt-1">{doc.meta.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Folder size={12} />
                          {doc.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {doc.lastModified.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </DocsLayout>
      );
    }
    
    return renderFolderView("", folderContents, allDocs);
  }
  
  // Check if this is a folder (has INDEX/README or files/subfolders)
  const folderContents = getFolderContents(slugPath);
  const hasIndexOrReadme = folderContents.indexDoc || folderContents.readmeDoc;
  const hasFilesOrFolders = folderContents.files.length > 0 || folderContents.subfolders.length > 0;

  // If folder has INDEX/README or any content, render as folder view
  if (hasIndexOrReadme || hasFilesOrFolders) {
    return renderFolderView(slugPath, folderContents, allDocs);
  }

  // Otherwise, try to get a specific document (not INDEX/README)
  const doc = getDocBySlug(slugPath);

  if (doc) {
    // Show specific documentation
    const tableOfContents = extractTableOfContents(doc.content);

    return (
      <DocsLayout doc={doc} docs={allDocs} tableOfContents={tableOfContents}>
        <article className="prose max-w-none">
          <DocHeader doc={doc} />

          <div className="mt-8">
            <MDX source={doc.content} />
          </div>

          {/* Tags */}
          {doc.meta.tags && doc.meta.tags.length > 0 && (
            <footer className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {doc.meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </footer>
          )}
        </article>
      </DocsLayout>
    );
  }

  // Nothing found - show 404
  notFound();
}

// Helper function to render folder views
function renderFolderView(
  folderPath: string, 
  folderContents: ReturnType<typeof getFolderContents>, 
  allDocs: any[]
) {
  const { indexDoc, readmeDoc, files, subfolders } = folderContents;

  // Determine the primary document to show (INDEX takes priority over README)
  const primaryDoc = indexDoc || readmeDoc || undefined;
  const secondaryDoc = indexDoc && readmeDoc ? readmeDoc : null;
  
  return (
    <DocsLayout doc={primaryDoc} docs={allDocs}>
      <div>
        <div className="mb-8">
          <ClientDocSearch placeholder="Search documentation..." />
        </div>
        
        {/* Primary Document (INDEX.md) */}
        {primaryDoc && (
          <article className="prose max-w-none mb-12">
            <MDX source={primaryDoc.content} />
          </article>
        )}
        
        {/* Secondary Document (README.md if INDEX.md exists) */}
        {secondaryDoc && (
          <section className="mb-12">
            <div className="border-t pt-8">
              <h2 className={cn(TYPOGRAPHY.h2.standard, 'mb-6')}>
                Additional Information
              </h2>
              <article className="prose max-w-none">
                <MDX source={secondaryDoc.content} />
              </article>
            </div>
          </section>
        )}
        
        {/* Navigation Tree */}
        {(files.length > 0 || subfolders.length > 0) && (
          <section className="mt-12">
            <div className="border-t pt-8">
              <h2 className={cn(TYPOGRAPHY.h2.standard, 'mb-6')}>
                Browse {folderPath ?
                  `${folderPath.split('/').pop()?.charAt(0).toUpperCase()}${folderPath.split('/').pop()?.slice(1)} Documentation` :
                  'Documentation'
                }
              </h2>
              
              {/* Subfolders */}
              {subfolders.length > 0 && (
                <div className="mb-8">
                  <h3 className={cn(TYPOGRAPHY.h3.standard, 'mb-4')}>Folders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subfolders.map(subfolder => {
                      const subfolderPath = folderPath ? `${folderPath}/${subfolder}` : subfolder;
                      const subfolderDocs = allDocs.filter(doc => doc.slug.startsWith(`${subfolderPath}/`));
                      
                      return (
                        <Link
                          key={subfolder}
                          href={`/dev/docs/${subfolderPath}`}
                          className="group block p-4 border border-border rounded-lg hover:border-border-hover hover:shadow-sm transition-movement"
                        >
                          <div className="flex items-center gap-3">
                            <Folder className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                            <div className="flex-1">
                              <h4 className="font-medium group-hover:text-primary transition-colors">
                                {subfolder}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {subfolderDocs.length} documents
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Files */}
              {files.length > 0 && (
                <div>
                  <h3 className={cn(TYPOGRAPHY.h3.standard, 'mb-4')}>Documents</h3>
                  <div className="space-y-2">
                    {files.map(file => (
                      <Link
                        key={file.slug}
                        href={`/dev/docs/${file.slug}`}
                        className="group block p-3 border border-border rounded-lg hover:border-border-hover transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" size={16} />
                          <div className="flex-1">
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {file.meta.title}
                            </h4>
                            {file.meta.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {file.meta.description}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {file.lastModified.toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </DocsLayout>
  );
}

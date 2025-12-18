import React from "react";
import { PageLayout } from "@/components/layouts/page-layout";
import { DocSidebar, DocTableOfContents, MobileDocSidebar } from "@/components/dev";
import { CONTAINER_WIDTHS, CONTAINER_PADDING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { DocFile } from "@/lib/docs";

interface DocsLayoutProps {
  children: React.ReactNode;
  doc?: DocFile;
  docs: DocFile[];
  tableOfContents?: Array<{
    id: string;
    title: string;
    level: number;
  }>;
}

export function DocsLayout({ children, doc, docs, tableOfContents = [] }: DocsLayoutProps) {
  return (
    <PageLayout>
      {/* Mobile navigation */}
      <MobileDocSidebar docs={docs} currentSlug={doc?.slug} />
      
      <div className={cn("container mx-auto", CONTAINER_WIDTHS.archive, CONTAINER_PADDING, "pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12")}>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_200px] gap-4">
          {/* Left Sidebar - Documentation Navigation */}
          <div className="hidden lg:block">
            <DocSidebar docs={docs} currentSlug={doc?.slug} />
          </div>

          {/* Main Content */}
          <main className="min-w-0">
            {children}
          </main>

          {/* Right Sidebar - Table of Contents */}
          <div className="hidden lg:block">
            {tableOfContents.length > 0 && (
              <DocTableOfContents headings={tableOfContents} />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
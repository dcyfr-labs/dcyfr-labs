"use client";

import React from "react";
import { PageLayout } from "@/components/layouts";
import {
  DocSidebar,
  DocTableOfContents,
  MobileDocSidebar,
} from "@/components/dev";
import { CONTAINER_PADDING, SPACING } from "@/lib/design-tokens";
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

export function DocsLayout({
  children,
  doc,
  docs,
  tableOfContents = [],
}: DocsLayoutProps) {
  return (
    <PageLayout>
      {/* Mobile navigation */}
      <MobileDocSidebar docs={docs} currentSlug={doc?.slug} />

      <div
        className={cn(
          "container mx-auto max-w-[1600px]",
          CONTAINER_PADDING,
          "pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12"
        )}
      >
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_240px]",
            SPACING.contentGrid
          )}
        >
          {/* Left Sidebar - Documentation Navigation */}
          <div className="hidden lg:block">
            <DocSidebar docs={docs} currentSlug={doc?.slug} />
          </div>

          {/* Main Content */}
          <main className="min-w-0">{children}</main>

          {/* Right Sidebar - Table of Contents */}
          <div className="hidden xl:block">
            {tableOfContents.length > 0 && (
              <DocTableOfContents headings={tableOfContents} />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

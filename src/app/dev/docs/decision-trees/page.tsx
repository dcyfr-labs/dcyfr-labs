import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { Breadcrumbs } from "@/components/navigation";
import { cn } from "@/lib/utils";
import { DecisionTreeClient } from "./_decision-tree-client";

export const metadata: Metadata = createPageMetadata({
  title: "Interactive Decision Trees - Dev Docs",
  description: "Interactive flowcharts for making architectural decisions",
  path: "/dev/docs/decision-trees",
});

const layoutDecisionTree = {
  title: "Which Layout Should I Use?",
  description: "Determine the correct layout component for your page",
  startNodeId: "start",
  nodes: [
    {
      id: "start",
      question: "Is this a blog post?",
      options: [
        {
          label: "Yes, this is a blog post with article content",
          next: null,
          result: {
            title: "Use ArticleLayout",
            description:
              "Blog posts get the full article treatment with reading time, TOC, related posts, and metadata",
            usage:
              "Import from @/components/layouts and use with createArticlePageMetadata",
            code: `import { ArticleLayout } from "@/components/layouts";
import { createArticlePageMetadata } from "@/lib/metadata";

export const metadata = createArticlePageMetadata({
  title: post.title,
  description: post.summary,
  path: \`/blog/\${post.slug}\`,
  publishedAt: new Date(post.publishedAt),
  tags: post.tags,
  image: post.image?.url,
});

export default function BlogPost() {
  return (
    <ArticleLayout post={post}>
      <MDX source={post.content} />
    </ArticleLayout>
  );
}`,
          },
        },
        {
          label: "No, this is not a blog post",
          next: "check-list",
        },
      ],
    },
    {
      id: "check-list",
      question: "Is this a filterable list page?",
      options: [
        {
          label: "Yes, it has filters, pagination, or sorting",
          next: null,
          result: {
            title: "Use ArchiveLayout",
            description:
              "List pages with filters get dedicated archive treatment",
            usage:
              "Import from @/components/layouts and use with createArchivePageMetadata",
            code: `import { ArchiveLayout } from "@/components/layouts";
import { createArchivePageMetadata } from "@/lib/metadata";

export const metadata = createArchivePageMetadata({
  title: "Blog",
  itemCount: posts.length,
  activeTag: searchParams.tag,
});

export default function BlogArchive() {
  return (
    <ArchiveLayout>
        <PostList posts={posts} client />
    </ArchiveLayout>
  );
}`,
          },
        },
        {
          label: "No, it's a standard page",
          next: null,
          result: {
            title: "Use PageLayout",
            description:
              "Standard wrapper for 90% of pages with consistent spacing and SEO",
            usage:
              "Import from @/components/layouts and use with createPageMetadata",
            code: `import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description: "Learn more about me",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Your content */}
    </PageLayout>
  );
}`,
          },
        },
      ],
    },
  ],
};

const metadataDecisionTree = {
  title: "Which Metadata Helper Should I Use?",
  description: "Choose the right metadata generation function",
  startNodeId: "start",
  nodes: [
    {
      id: "start",
      question: "What type of page are you creating?",
      options: [
        {
          label: "Standard page (about, contact, resume, etc.)",
          next: null,
          result: {
            title: "Use createPageMetadata",
            description:
              "Standard metadata for most pages with OpenGraph and Twitter Card",
            usage:
              "Import from @/lib/metadata and pass title, description, and path",
            code: `import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description: "Learn more about me and my work",
  path: "/about",
});`,
          },
        },
        {
          label: "List/archive page (blog list, project list)",
          next: null,
          result: {
            title: "Use createArchivePageMetadata",
            description:
              "Enhanced metadata for filterable lists with item counts",
            usage:
              "Import from @/lib/metadata and pass title, itemCount, and optional filters",
            code: `import { createArchivePageMetadata } from "@/lib/metadata";

export const metadata = createArchivePageMetadata({
  title: "Blog",
  description: "All blog posts about web development",
  itemCount: posts.length,
  activeTag: searchParams.tag, // optional
});`,
          },
        },
        {
          label: "Blog post or article",
          next: null,
          result: {
            title: "Use createArticlePageMetadata",
            description:
              "Rich metadata for articles with publication date, tags, and structured data",
            usage: "Import from @/lib/metadata with full article details",
            code: `import { createArticlePageMetadata } from "@/lib/metadata";

export const metadata = createArticlePageMetadata({
  title: post.title,
  description: post.summary,
  path: \`/blog/\${post.slug}\`,
  publishedAt: new Date(post.publishedAt),
  tags: post.tags,
  image: post.image?.url,
  author: "Drew",
});`,
          },
        },
      ],
    },
  ],
};

const containerDecisionTree = {
  title: "Which Container Width Should I Use?",
  description: "Select the optimal max-width constraint for your content",
  startNodeId: "start",
  nodes: [
    {
      id: "start",
      question: "What type of content are you displaying?",
      options: [
        {
          label: "Long-form text or documentation",
          next: null,
          result: {
            title: "Use CONTAINER_WIDTHS.narrow",
            description: "672px max-width - optimal line length for reading",
            usage: "Import from @/lib/design-tokens",
            code: `import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

<div className={\`mx-auto \${CONTAINER_WIDTHS.narrow}\`}>
  <MDX source={content} />
</div>`,
          },
        },
        {
          label: "Standard page content, forms, or simple lists",
          next: null,
          result: {
            title: "Use CONTAINER_WIDTHS.standard",
            description:
              "896px max-width - most common choice for 80% of pages",
            usage: "Import from @/lib/design-tokens",
            code: `import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

<div className={\`mx-auto \${CONTAINER_WIDTHS.standard}\`}>
  <AboutContent />
</div>`,
          },
        },
        {
          label: "Rich content with media or components",
          next: null,
          result: {
            title: "Use CONTAINER_WIDTHS.content",
            description: "1120px max-width - default for feature-rich pages",
            usage: "Import from @/lib/design-tokens",
            code: `import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

<div className={\`mx-auto \${CONTAINER_WIDTHS.content}\`}>
  <ProjectShowcase />
</div>`,
          },
        },
        {
          label: "Filterable lists or archive pages",
          next: null,
          result: {
            title: "Use CONTAINER_WIDTHS.archive",
            description: "1280px max-width - accommodates filters and sidebars",
            usage: "Import from @/lib/design-tokens",
            code: `import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

<div className={\`mx-auto \${CONTAINER_WIDTHS.archive}\`}>
  <ArchiveLayout>...</ArchiveLayout>
</div>`,
          },
        },
        {
          label: "Analytics dashboards or admin panels",
          next: null,
          result: {
            title: "Use CONTAINER_WIDTHS.dashboard",
            description:
              "1536px max-width - full-width layouts for data displays",
            usage: "Import from @/lib/design-tokens",
            code: `import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

<div className={\`mx-auto \${CONTAINER_WIDTHS.dashboard}\`}>
  <AnalyticsDashboard />
</div>`,
          },
        },
      ],
    },
  ],
};

export default function DecisionTreesPage() {
  const breadcrumbs = [
    { label: "Dev", href: "/dev" },
    { label: "Docs", href: "/dev/docs" },
    { label: "Decision Trees", href: "/dev/docs/decision-trees" },
  ];

  return (
    <PageLayout>
      <div className={cn("mb-8")}>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className={cn(SPACING.subsection)}>
        <div>
          <h1 className={TYPOGRAPHY.h1.standard}>Interactive Decision Trees</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Click through these interactive flowcharts to quickly determine
            which architectural patterns to use. Each tree provides copy-paste
            code examples at the end.
          </p>
        </div>

        <DecisionTreeClient
          layoutDecisionTree={layoutDecisionTree}
          metadataDecisionTree={metadataDecisionTree}
          containerDecisionTree={containerDecisionTree}
        />
      </div>
    </PageLayout>
  );
}

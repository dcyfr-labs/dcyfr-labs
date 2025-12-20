import * as React from "react";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import { CopyCodeButton } from "@/components/common/copy-code-button";
import { HorizontalRule } from "@/components/common/horizontal-rule";
import { ZoomableImage } from "@/components/common/zoomable-image";
import { Alert } from "@/components/common/alert";
import { KeyTakeaway } from "@/components/common/key-takeaway";
import { ContextClue } from "@/components/common/context-clue";
import { Figure, FigureProvider } from "@/components/common/figure-caption";
import { TableCaption } from "@/components/common/table-caption";
import { 
  MDXMCPArchitecture, 
  MDXAuthenticationFlow, 
  MDXPipelineFlow, 
  MDXCVEDecisionTree 
} from "@/components/common/mdx-diagram-wrapper";
import { FAQ } from "@/components/common/faq";
import { ProgressiveParagraph, ContrastText } from "@/components/common/progressive-content";
import {
  Check,
  X,
  ArrowUpLeft,
  AlertTriangle,
  Info,
  Lightbulb,
  Zap,
  Lock,
  Rocket
} from "lucide-react";
import { TYPOGRAPHY, SPACING, PROGRESSIVE_TEXT, FONT_CONTRAST, ANIMATION } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { MDXProgressionContext, MDXProgressionProvider, MDXParagraphComponent } from "@/components/common/mdx-progression-context";

/**
 * MDX Paragraph Component with Progressive Styling
 */

/**
 * Modern table component wrapper for MDX
 * Features:
 * - Rounded corners with card-like styling
 * - Subtle depth with shadows and hover effects
 * - Responsive overflow handling
 * - Figure caption support for table descriptions
 * - Design token integration for consistent styling
 */
function TableWrapper(props: React.HTMLAttributes<HTMLTableElement>) {
  const tableId = React.useId();
  return (
    <figure className="my-8 w-full group" role="table" aria-labelledby={`${tableId}-caption`}>
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        ANIMATION.transition.theme,
        "hover:shadow-md"
      )}>
        <div className="overflow-x-auto">
          <table 
            {...props} 
            className="w-full border-collapse" 
            id={tableId}
          />
        </div>
      </div>
    </figure>
  );
}

/**
 * Configuration for the rehype-pretty-code plugin
 * Enables syntax highlighting with Shiki using dual-theme support:
 * - Dark theme: "github-dark-dimmed" (optimized for dark mode)
 * - Light theme: "github-light" (optimized for light mode)
 *
 * Features:
 * - Automatic theme switching based on user's theme preference
 * - Line and character highlighting support
 * - Empty line prevention in grid layout
 * - Configurable default language (plaintext for unknown languages)
 *
 * @type {RehypePrettyCodeOptions}
 */
// Configure syntax highlighting with Shiki
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  defaultLang: "plaintext",
  // Prevent lines from collapsing in `display: grid` mode
  onVisitLine(node) {
    if (!node.children || node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node) {
    if (!node.properties.className) {
      node.properties.className = [];
    }
    if (Array.isArray(node.properties.className)) {
      node.properties.className.push("highlighted");
    }
  },
  onVisitHighlightedChars(node) {
    node.properties.className = ["word"];
  },
};

/**
 * Custom rehype plugin to replace footnote backref emoji (↩) with an accessible element
 * This processes the HTML tree after remark-gfm adds footnotes
 */
function rehypeReplaceFootnoteEmoji() {
  return (tree: any) => {
    // Visit all nodes in the tree
    const visit = (node: any) => {
      if (node.type === "element" && node.tagName === "a") {
        // Look for footnote backref links (they have specific class patterns)
        if (node.properties?.href?.toString().includes("user-content-fnref")) {
          // Check if the link contains the ↩ emoji
          const hasEmoji = node.children?.some((child: any) =>
            child.type === "text" && child.value?.includes("↩")
          );
          
          if (hasEmoji) {
            // Replace text children containing ↩ with a marker we can target
            node.children = node.children?.map((child: any) =>

              child.type === "text" && child.value?.includes("↩")
                ? { type: "text", value: "FOOTNOTE_BACKREF" }
                : child
            );
            // Add a data attribute to mark this as a footnote backref
            node.properties = node.properties || {};
            node.properties["data-footnote-backref"] = "true";
          }
        }
      }
      
      // Recursively visit children
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };
    
    visit(tree);
  };
}

/**
 * Helper function to extract text content from React children recursively
 */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (React.isValidElement(children) && children.props) {
    const props = children.props as { children?: React.ReactNode };
    return extractTextFromChildren(props.children);
  }
  return "";
}

/**
 * Custom component mapping for MDX elements
 * Maps HTML/Markdown elements to styled React components using Tailwind CSS.
 *
 * Includes:
 * - Heading hierarchy (h1-h3) with serif fonts and proper spacing
 * - Paragraph styling with leading and margin adjustment
 * - Code blocks with theme-aware syntax highlighting
 * - Inline code with monospace font and border
 * - Lists with proper indentation
 * - Blockquotes with left border and italics
 * - Links with external link handling and underline styling
 * - Horizontal rules for content separation
 *
 * @type {NonNullable<MDXRemoteProps["components"]>}
 */
// Map a few elements to tailwind-styled components
const components: NonNullable<MDXRemoteProps["components"]> = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} className={`${TYPOGRAPHY.h1.mdx} mt-8 first:mt-0 scroll-mt-20 group`} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} className={`${TYPOGRAPHY.h2.mdx} mt-8 scroll-mt-20 group`} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className={`${TYPOGRAPHY.h3.mdx} mt-6 scroll-mt-20 group`} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 {...props} className={`${TYPOGRAPHY.h4.mdx} mt-5 scroll-mt-20 group`} />
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5 {...props} className={`${TYPOGRAPHY.h5.mdx} mt-4 scroll-mt-20 group`} />
  ),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6 {...props} className={`${TYPOGRAPHY.h6.mdx} mt-4 scroll-mt-20 group`} />
  ),
  p: MDXParagraphComponent,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote 
      {...props} 
      className="mt-6 border-l-4 border-primary/30 pl-4 italic text-muted-foreground not:first:mt-0"
    />
  ),
  table: TableWrapper,
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead 
      {...props} 
      className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm" 
    />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr 
      {...props} 
      className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-b-0" 
    />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th 
      {...props} 
      className={cn(
        "px-4 py-4 text-left font-semibold",
        TYPOGRAPHY.label.small,
        "text-foreground/90 tracking-wide"
      )} 
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td 
      {...props} 
      className="px-4 py-4 text-sm leading-relaxed text-foreground/90" 
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <ContrastText.Bold as="strong" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <ContrastText.Emphasis as="em" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className={cn("list-disc pl-6", SPACING.list)} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className={cn("list-decimal pl-6", SPACING.list)} />
  ),
  // Note: SPACING.list = space-y-0.5 is used for list items spacing
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    // Inline code (no data-language attribute)
    const isInline = !props["data-language" as keyof typeof props];
    if (isInline) {
      return (
        <code 
          {...props} 
          className="rounded-md bg-primary/10 px-2 py-1 text-[0.875em] font-mono font-semibold border border-primary/20 text-primary"
        />
      );
    }
    // Code blocks handled by pre > code (rehype-pretty-code)
    return <code {...props} />;
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    // Extract the code content for the copy button
    const codeContent = React.Children.toArray(props.children)
      .map((child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as { children?: React.ReactNode };
          return extractTextFromChildren(childProps.children);
        }
        return "";
      })
      .join("");

    return (
      <div className="relative group">
        <CopyCodeButton code={codeContent} />
        <pre
          {...props}
          className="[&>code]:grid [&>code]:text-[0.875rem] overflow-x-auto"
        />
      </div>
    );
  },
  hr: () => <HorizontalRule />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isHeaderAnchor = props.className?.includes('no-underline');
    const href = props.href || '';
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    const isFootnoteBackref = href.includes('user-content-fnref');
    
    // Handle footnote backref links - replace emoji with icon
    if (isFootnoteBackref) {
      return (
        <a 
          {...props}
          href={href}
          className="no-underline inline-flex items-center pl-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
          title="Back to note reference"
        >
          <ArrowUpLeft className="inline-block w-3 h-3" aria-label="Back to note" />
        </a>
      );
    }
    
    // Convert relative docs links to proper /dev/docs/ paths
    let adjustedHref = href;
    if (href.startsWith('./')) {
      adjustedHref = `/dev/docs/${href.slice(2)}`;
    }
    
    return (
      <a 
        {...props} 
        href={adjustedHref}
        className={isHeaderAnchor 
          ? "hover:text-primary" 
          : "inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
        }
        {...(isExternal && {
          target: "_blank",
          rel: "noopener noreferrer"
        })}
      >
        {props.children}
        {isExternal && !isHeaderAnchor && (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </a>
    );
  },
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <ZoomableImage 
      {...props} 
      className={`${SPACING.image} rounded-lg max-w-full h-auto`}
    />
  ),
  // Icon components for consistent styling across the site
  // Note: Icon colors (text-*-500/600) are excluded from SEMANTIC_COLORS enforcement
  /* eslint-disable no-restricted-syntax -- MDX icon components use accent colors */
  CheckIcon: () => <Check className="inline-block w-5 h-5 align-text-bottom text-green-600 dark:text-green-400" aria-label="Check" />,
  XIcon: () => <X className="inline-block w-5 h-5 align-text-bottom text-red-600 dark:text-red-400" aria-label="Cross" />,
  ReturnIcon: () => <ArrowUpLeft className="inline-block w-5 h-5 align-text-bottom text-muted-foreground" aria-label="Return" />,
  WarningIcon: () => <AlertTriangle className="inline-block w-5 h-5 align-text-bottom text-yellow-600 dark:text-yellow-400" aria-label="Warning" />,
  InfoIcon: () => <Info className="inline-block w-5 h-5 align-text-bottom text-blue-600 dark:text-blue-400" aria-label="Information" />,
  IdeaIcon: () => <Lightbulb className="inline-block w-5 h-5 align-text-bottom text-yellow-600 dark:text-yellow-400" aria-label="Idea" />,
  ZapIcon: () => <Zap className="inline-block w-5 h-5 align-text-bottom text-purple-600 dark:text-purple-400" aria-label="Lightning" />,
  LockIcon: () => <Lock className="inline-block w-5 h-5 align-text-bottom text-muted-foreground" aria-label="Lock" />,
  RocketIcon: () => <Rocket className="inline-block w-5 h-5 align-text-bottom text-blue-600 dark:text-blue-400" aria-label="Rocket" />,
  /* eslint-enable no-restricted-syntax */
  // Diagram presets (using ReactFlow) - imported from client-side wrapper
  // These use "use client" to prevent SSR bailout errors
  MCPArchitecture: MDXMCPArchitecture as any,
  AuthenticationFlow: MDXAuthenticationFlow as any,
  PipelineFlow: MDXPipelineFlow as any,
  CVEDecisionTree: MDXCVEDecisionTree as any,
  // FAQ component
  FAQ,
  // Alert component for banners
  Alert,
  // Key Takeaway component for insights
  KeyTakeaway,
  // Context Clue component for background information
  ContextClue,
  // Figure caption component for automatic figure numbering
  Figure,
  // Table caption component for table descriptions
  TableCaption,
  // Footnote superscripts with icon
  sup: (props: React.HTMLAttributes<HTMLElement>) => {
    // Check if this contains a link (footnote reference) or has footnote-related attributes
    const children = React.Children.toArray(props.children);
    const hasLink = children.some(
      child => React.isValidElement(child) && child?.type === 'a'
    );
    
    if (hasLink) {
      // This is a footnote reference - replace the content with our icon
      // Get the href from the link to preserve navigation
      const linkChild = children.find(
        child => React.isValidElement(child) && child?.type === 'a'
      ) as React.ReactElement | undefined;
      
      const href = (linkChild?.props as { href?: string })?.href;
      
      return (
        <sup {...props} className="ml-0.5 inline-flex items-center">
          <a href={href} className="no-underline hover:opacity-70 transition-opacity">
            <ArrowUpLeft className="inline-block w-3 h-3 text-primary" aria-label="Footnote reference" />
          </a>
        </sup>
      );
    }
    
    // Default superscript for non-footnote uses
    return <sup {...props} />;
  },
};

/**
 * MDX Component
 *
 * Renders MDX (Markdown + JSX) content with rich formatting, syntax highlighting,
 * and automatic table of contents generation.
 *
 * Processing Pipeline:
 * 1. **Remark plugins**:
 *    - remark-gfm: GitHub-flavored markdown (tables, strikethrough, task lists)
 *
 * 2. **Rehype plugins** (in order):
 *    - rehype-slug: Generates IDs for headings (used by TOC and anchor links)
 *    - rehype-pretty-code: Syntax highlighting with Shiki (dual-theme support)
 *    - rehype-autolink-headings: Wraps headings with self-referential links
 *
 * 3. **Component mapping**:
 *    - Custom Tailwind-styled components for HTML elements
 *    - Consistent typography and spacing via utility classes
 *    - Theme-aware styling (light/dark mode)
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.source - Raw MDX source code to render
 *
 * @returns {React.ReactElement} Rendered MDX content with styled elements
 *
 * @example
 * // Render blog post content
 * const mdxSource = "# Hello World\n\nThis is **bold** text.";
 * <MDX source={mdxSource} />
 *
 * @features
 * - **Syntax Highlighting**: Code blocks use Shiki with github-light/github-dark-dimmed themes
 * - **Auto-generated Headings IDs**: Headings get slugified IDs for linking
 * - **Header Links**: Heading anchors for direct navigation
 * - **GitHub Tables**: Support for markdown tables
 * - **Task Lists**: Checkbox lists in markdown
 * - **External Links**: Automatic target="_blank" and rel="noopener noreferrer"
 * - **Theme Aware**: All components respect light/dark mode preferences
 *
 * @performance
 * - Server-side rendering: MDX processing happens at build time via next-mdx-remote/rsc
 * - No client-side JavaScript overhead for rendering
 * - Syntax highlighting pre-computed during build
 *
 * @accessibility
 * - Semantic HTML structure with proper heading hierarchy
 * - Links are keyboard accessible and screen reader friendly
 * - Code blocks have proper language hints for assistive technology
 * - Heading anchors wrap the entire heading for better click targets
 *
 * @see /docs/components/mdx.md for detailed documentation
 */
export function MDX({ 
  source, 
  useFontContrast = false 
}: { 
  source: string; 
  useFontContrast?: boolean;
}) {
  return (
    <MDXProgressionProvider useFontContrast={useFontContrast}>
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              remarkMath, // Parse math notation
              remarkSmartypants, // Convert --- to em-dashes, quotes to smart quotes
            ],
            rehypePlugins: [
              rehypeSlug,
              [rehypePrettyCode, rehypePrettyCodeOptions],
              rehypeKatex, // Render math with KaTeX
              rehypeReplaceFootnoteEmoji, // Replace footnote emoji with icon
              [
                rehypeAutolinkHeadings, 
                { 
                  behavior: "wrap",
                  properties: {
                    className: "no-underline hover:text-primary transition-colors"
                  }
                }
              ]
            ],
          },
        }}
        components={components}
      />
    </MDXProgressionProvider>
  );
}

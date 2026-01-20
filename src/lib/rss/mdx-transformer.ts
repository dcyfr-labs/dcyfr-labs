/**
 * MDX-to-RSS Transformer
 *
 * Converts custom MDX components to RSS-safe HTML for feed readers.
 * Handles RIVET components and other custom MDX elements.
 *
 * Transformation Strategy:
 * - Simple components → Semantic HTML (TLDRSummary, KeyTakeaway, Alert)
 * - Interactive components → HTML5 elements (GlossaryTooltip, CollapsibleSection)
 * - UI-only components → Removed (SectionShare, RoleBasedCTA)
 * - Complex visualizations → Simplified or removed (RiskMatrix)
 *
 * @module lib/rss/mdx-transformer
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root } from 'hast';

// ============================================================================
// Text-Based Component Transformers
// ============================================================================

/**
 * Extract attributes from component tag
 */
function extractAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(tag)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

/**
 * Pre-process MDX content to transform custom components to HTML
 * This runs BEFORE markdown parsing
 */
function preprocessMDXComponents(content: string): string {
  let processed = content;

  // TLDRSummary → <div class="tldr">
  processed = processed.replace(
    /<TLDRSummary>([\s\S]*?)<\/TLDRSummary>/g,
    '<div class="tldr rss-tldr"><strong>TL;DR: </strong>$1</div>'
  );

  // KeyTakeaway → <blockquote>
  processed = processed.replace(
    /<KeyTakeaway(?:\s+icon="([^"]*)")?>([\s\S]*?)<\/KeyTakeaway>/g,
    (_, icon, content) => {
      const displayIcon = icon || '💡';
      return `<blockquote class="key-takeaway rss-key-takeaway"><strong>${displayIcon} Key Point: </strong>${content}</blockquote>`;
    }
  );

  // GlossaryTooltip → <abbr>
  processed = processed.replace(
    /<GlossaryTooltip(?:\s+([^>]+))>([\s\S]*?)<\/GlossaryTooltip>/g,
    (match, attrsStr, content) => {
      const attrs = extractAttributes(attrsStr || '');
      const title = attrs.definition || '';
      return `<abbr title="${title}" class="glossary-term rss-glossary">${content}</abbr>`;
    }
  );

  // CollapsibleSection → <details>
  processed = processed.replace(
    /<CollapsibleSection(?:\s+title="([^"]*)")?>([\s\S]*?)<\/CollapsibleSection>/g,
    (_, title, content) => {
      const displayTitle = title || 'Show More';
      return `<details class="collapsible rss-collapsible"><summary>${displayTitle}</summary>${content}</details>`;
    }
  );

  // Alert → <div>
  processed = processed.replace(
    /<Alert(?:\s+variant="([^"]*)")?>([\s\S]*?)<\/Alert>/g,
    (_, variant, content) => {
      const displayVariant = variant || 'info';
      return `<div class="alert alert-${displayVariant} rss-alert">${content}</div>`;
    }
  );

  // SeriesBackgroundNote → <blockquote> with series context
  // Simplified transformation - just include description and context
  // The links are already handled by remarkAbsoluteUrls plugin
  processed = processed.replace(/<SeriesBackgroundNote\s+([^>]+)\s*\/>/g, (match, attrsStr) => {
    const attrs = extractAttributes(attrsStr || '');
    const description = attrs.description || '';
    const context = attrs.context || '';

    let content = description;
    if (context) {
      content += ` ${context}`;
    }

    // If content is empty, provide a generic message
    if (!content.trim()) {
      content = 'This post is part of a series.';
    }

    return `<blockquote class="series-background rss-series-background"><strong>📚 Series Background:</strong> ${content}</blockquote>`;
  });

  // RoleBasedCTA → <div> (keep content)
  processed = processed.replace(
    /<RoleBasedCTA[^>]*>([\s\S]*?)<\/RoleBasedCTA>/g,
    '<div class="cta rss-cta">$1</div>'
  );

  // DownloadableAsset → <a>
  processed = processed.replace(
    /<DownloadableAsset\s+([^>]+)>[\s\S]*?<\/DownloadableAsset>/g,
    (match, attrsStr) => {
      const attrs = extractAttributes(attrsStr || '');
      const url = attrs.url || '#';
      const title = attrs.title || 'Download';
      return `<p class="downloadable-asset rss-download"><a href="${url}">📥 ${title}</a></p>`;
    }
  );

  // FAQSchema → <div>
  processed = processed.replace(
    /<FAQSchema[^>]*>([\s\S]*?)<\/FAQSchema>/g,
    '<div class="faq rss-faq">$1</div>'
  );

  // TabInterface → <div> (keep content)
  processed = processed.replace(
    /<TabInterface[^>]*>([\s\S]*?)<\/TabInterface>/g,
    '<div class="tabs rss-tabs">$1</div>'
  );

  // RiskMatrix → placeholder
  processed = processed.replace(
    /<RiskMatrix[^>]*\/?>/g,
    '<p class="rss-removed">[Risk Matrix visualization - view on web for full experience]</p>'
  );

  // Remove interactive-only components (remove tag AND content)
  processed = processed.replace(
    /<SectionShare[^>]*>[\s\S]*?<\/SectionShare>/g,
    '' // Remove with content
  );
  processed = processed.replace(
    /<SectionShare[^>]*\/>/g,
    '' // Remove self-closing
  );

  processed = processed.replace(/<NewsletterSignup[^>]*>[\s\S]*?<\/NewsletterSignup>/g, '');
  processed = processed.replace(/<NewsletterSignup[^>]*\/>/g, '');

  processed = processed.replace(/<SeriesNavigation[^>]*>[\s\S]*?<\/SeriesNavigation>/g, '');
  processed = processed.replace(/<SeriesNavigation[^>]*\/>/g, '');

  // Remove any remaining PascalCase components (warn in console)
  processed = processed.replace(
    /<([A-Z][A-Za-z0-9]*)(?:\s+[^>]*)?\/?>/g,
    (match, componentName) => {
      console.warn(
        `[RSS Transform] Unknown custom component: ${componentName} - removing from feed`
      );
      return '';
    }
  );
  processed = processed.replace(
    /<([A-Z][A-Za-z0-9]*)(?:\s+[^>]*)>([\s\S]*?)<\/\1>/g,
    (match, componentName) => {
      console.warn(
        `[RSS Transform] Unknown custom component: ${componentName} - removing from feed`
      );
      return '';
    }
  );

  return processed;
}

// ============================================================================
// Rehype Plugins
// ============================================================================

/**
 * Rehype plugin to remove problematic attributes from HTML
 * Strips accessibility and footnote attributes that cause feed validation issues
 */
function rehypeStripFeedAttributes() {
  return (tree: Root) => {
    visit(tree, 'element', (node: any) => {
      if (node.properties) {
        // Remove problematic data attributes
        delete node.properties.dataFootnoteRef;
        delete node.properties.dataFootnoteBackref;
        delete node.properties.dataFootnotes;

        // Remove ARIA attributes (not supported in feeds)
        delete node.properties.ariaDescribedby;
        delete node.properties.ariaLabel;
        delete node.properties.ariaLabelledby;
        delete node.properties.ariaHidden;

        // Remove other problematic attributes
        delete node.properties.role;
        delete node.properties.tabIndex;
      }
    });
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Transform MDX content to RSS-safe HTML
 *
 * Converts custom MDX components to semantic HTML elements that work
 * in RSS/Atom feed readers.
 *
 * @param content - MDX/Markdown content with custom components
 * @returns Sanitized HTML safe for feed inclusion
 *
 * @example
 * ```typescript
 * const mdx = '<TLDRSummary>Key points here</TLDRSummary>';
 * const html = await transformMDXForRSS(mdx);
 * // '<div class="tldr"><strong>TL;DR: </strong>Key points here</div>'
 * ```
 */
export async function transformMDXForRSS(content: string): Promise<string> {
  // Pre-process custom components BEFORE markdown parsing
  const preprocessed = preprocessMDXComponents(content);

  const file = await unified()
    .use(remarkParse) // Parse markdown
    .use(remarkGfm) // Support GitHub Flavored Markdown
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML AST (allow HTML)
    .use(rehypeRaw) // Parse raw HTML in markdown
    .use(rehypeStripFeedAttributes) // Remove feed-incompatible attributes
    .use(rehypeSanitize, {
      ...defaultSchema,
      tagNames: [
        ...(defaultSchema.tagNames || []),
        // Allow our custom elements
        'details',
        'summary',
        'abbr',
      ],
      attributes: {
        ...defaultSchema.attributes,
        '*': ['className', 'class'],
        abbr: ['title', 'class', 'className'],
        details: ['class', 'className', 'open'],
        summary: ['class', 'className'],
        div: ['class', 'className'],
        blockquote: ['class', 'className'],
        p: ['class', 'className'],
        a: ['href', 'class', 'className'],
      },
    })
    .use(rehypeStringify) // Convert to HTML string
    .process(preprocessed);

  return String(file);
}

/**
 * Get list of supported custom components
 */
export function getSupportedComponents(): string[] {
  return [
    'TLDRSummary',
    'KeyTakeaway',
    'GlossaryTooltip',
    'CollapsibleSection',
    'Alert',
    'RoleBasedCTA',
    'DownloadableAsset',
    'FAQSchema',
    'TabInterface',
    'RiskMatrix',
    'SectionShare',
    'NewsletterSignup',
    'SeriesNavigation',
  ];
}

/**
 * Check if a component is supported for RSS transformation
 */
export function isComponentSupported(componentName: string): boolean {
  return getSupportedComponents().includes(componentName);
}

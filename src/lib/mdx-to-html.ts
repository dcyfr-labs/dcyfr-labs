import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Element } from 'hast';
import type { Link } from 'mdast';
import { SITE_URL } from './site-config';

/**
 * Remark plugin to convert relative blog URLs to absolute URLs
 * Ensures all internal links use production domain in RSS feeds
 */
function remarkAbsoluteUrls() {
  return (tree: any) => {
    visit(tree, 'link', (node: Link) => {
      if (node.url && node.url.startsWith('/blog/')) {
        node.url = `${SITE_URL}${node.url}`;
      }
    });
  };
}

/**
 * Rehype plugin to remove problematic attributes from HTML
 * Strips accessibility and footnote attributes that cause feed validation issues
 */
function rehypeStripFeedAttributes() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element) => {
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

/**
 * Convert MDX/Markdown content to safe HTML string for RSS/Atom feeds.
 * Strips MDX-specific syntax, accessibility attributes, and footnote references.
 *
 * Removed attributes for feed compatibility:
 * - data-footnote-ref
 * - data-footnote-backref
 * - data-footnotes
 * - aria-describedby
 * - aria-label
 * - role
 *
 * @param content - MDX/Markdown content
 * @returns Sanitized HTML string safe for feed inclusion
 */
export async function mdxToHtml(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse) // Parse markdown
    .use(remarkGfm) // Support GitHub Flavored Markdown (tables, strikethrough, etc.)
    .use(remarkAbsoluteUrls) // Convert relative blog URLs to absolute URLs
    .use(remarkRehype, { allowDangerousHtml: false }) // Convert to HTML AST
    .use(rehypeStripFeedAttributes) // Remove feed-incompatible attributes
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        // Allow common attributes but block problematic ones
        '*': [
          'className',
          'id',
          // Explicitly exclude aria-* and data-* patterns
          ...(defaultSchema.attributes?.['*'] || []).filter(
            (attr) => !String(attr).startsWith('aria') && !String(attr).startsWith('data')
          ),
        ],
      },
    }) // Sanitize HTML for security with strict attribute filtering
    .use(rehypeStringify) // Convert to HTML string
    .process(content);

  return String(file);
}

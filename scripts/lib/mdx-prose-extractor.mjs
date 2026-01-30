/**
 * MDX Prose Extractor
 *
 * @fileoverview Extract readable prose from MDX files, filtering out:
 * - Frontmatter (YAML)
 * - Code blocks (fenced with ```)
 * - JSX/React components
 * - HTML tags
 * - Inline code (backticks)
 *
 * Returns LanguageTool-compatible annotation JSON for markup-aware checking.
 */

import fs from 'fs/promises';
import matter from 'gray-matter';

/**
 * Extract prose from MDX file as plain text
 *
 * @param {string} filePath - Path to MDX file
 * @returns {Promise<string>} Plain text prose
 */
export async function extractProseAsText(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { content: mdxContent } = matter(content);

  let prose = mdxContent;

  // Remove code blocks (``` fenced) - preserve spacing
  prose = prose.replace(/```[\s\S]*?```/g, ' ');

  // Remove inline code (`text`) - preserve spacing
  prose = prose.replace(/`[^`]+`/g, ' ');

  // Remove JSX components (<Component />) - preserve spacing
  prose = prose.replace(/<[A-Z][^>]*>/g, ' ');
  prose = prose.replace(/<\/[A-Z][^>]*>/g, ' ');

  // Remove HTML tags - preserve spacing
  prose = prose.replace(/<[^>]+>/g, ' ');

  // Remove frontmatter code blocks (if any escaped in content)
  prose = prose.replace(/---[\s\S]*?---/g, '');

  // Remove image syntax but keep alt text
  prose = prose.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove link URLs but keep text
  prose = prose.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove heading markers
  prose = prose.replace(/^#{1,6}\s+/gm, '');

  // Remove list markers
  prose = prose.replace(/^[\s]*[-*+]\s+/gm, '');
  prose = prose.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove blockquote markers
  prose = prose.replace(/^>\s+/gm, '');

  // Remove horizontal rules
  prose = prose.replace(/^---+$/gm, '');
  prose = prose.replace(/^\*\*\*+$/gm, '');

  // Normalize whitespace (Phase 1 - Jan 2026: collapse multiple spaces)
  prose = prose.replace(/\s{2,}/g, ' '); // Multiple spaces → single space
  prose = prose.replace(/\n{3,}/g, '\n\n'); // Multiple newlines → double newline
  prose = prose.trim();

  return prose;
}

/**
 * Extract prose from MDX file as LanguageTool annotation JSON
 *
 * This preserves markup structure for better context-aware checking.
 *
 * @param {string} filePath - Path to MDX file
 * @returns {Promise<string>} JSON annotation string
 */
export async function extractProseAsAnnotation(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { content: mdxContent } = matter(content);

  const annotations = [];
  let currentText = '';

  // Simple tokenizer - splits on markup boundaries
  const tokens = mdxContent.split(/(<[^>]+>|```[\s\S]*?```|`[^`]+`)/);

  for (const token of tokens) {
    // Code blocks - ignore completely
    if (token.startsWith('```')) {
      if (currentText) {
        annotations.push({ text: currentText });
        currentText = '';
      }
      continue;
    }

    // Inline code - ignore
    if (token.startsWith('`') && token.endsWith('`')) {
      if (currentText) {
        annotations.push({ text: currentText });
        currentText = '';
      }
      continue;
    }

    // JSX/HTML tags - mark as markup
    if (token.startsWith('<')) {
      if (currentText) {
        annotations.push({ text: currentText });
        currentText = '';
      }

      // Interpret block elements as line breaks
      if (token.match(/<\/?(?:div|p|br|h[1-6]|li|blockquote|section|article)/i)) {
        annotations.push({ markup: token, interpretAs: '\n\n' });
      } else {
        annotations.push({ markup: token });
      }
      continue;
    }

    // Regular text
    currentText += token;
  }

  // Add remaining text
  if (currentText) {
    annotations.push({ text: currentText });
  }

  return JSON.stringify({ annotation: annotations });
}

/**
 * Get statistics about MDX file content
 *
 * @param {string} filePath - Path to MDX file
 * @returns {Promise<{
 *   totalChars: number,
 *   proseChars: number,
 *   codeBlocks: number,
 *   components: number,
 *   headings: number,
 *   links: number
 * }>}
 */
export async function getProseStats(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { content: mdxContent } = matter(content);

  const totalChars = mdxContent.length;
  const codeBlocks = (mdxContent.match(/```[\s\S]*?```/g) || []).length;
  const components = (mdxContent.match(/<[A-Z][^>]*>/g) || []).length;
  const headings = (mdxContent.match(/^#{1,6}\s+/gm) || []).length;
  const links = (mdxContent.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;

  const prose = await extractProseAsText(filePath);
  const proseChars = prose.length;

  return {
    totalChars,
    proseChars,
    codeBlocks,
    components,
    headings,
    links,
  };
}

/**
 * Extract table of contents from MDX content
 */

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

/**
 * Generates a slug from heading text (same logic as rehype-slug)
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Strips markdown formatting from text
 * Removes: bold (**text**), italic (*text*), code (`text`), links ([text](url))
 */
function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **bold**
    .replace(/\*(.+?)\*/g, '$1')      // *italic*
    .replace(/__(.+?)__/g, '$1')      // __bold__
    .replace(/_(.+?)_/g, '$1')        // _italic_
    // Remove inline code
    .replace(/`(.+?)`/g, '$1')
    // Remove links [text](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1')
    // Remove strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    .trim();
}

/**
 * Extract headings from MDX content for table of contents
 * Matches h2 and h3 headings (## and ###)
 * Skips headings inside:
 * - Code blocks (between triple backticks)
 * - Collapsed/collapsible JSX components (RiskAccordion, RiskAccordionGroup, CollapsibleSection, Footnotes)
 */
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let inCollapsibleComponent = false;
  let collapsibleComponentDepth = 0;
  const idCounts = new Map<string, number>(); // Track duplicate IDs

  // Regex patterns for collapsed components
  const collapsibleComponentPatterns = [
    /^<RiskAccordion/,
    /^<RiskAccordionGroup/,
    /^<CollapsibleSection/,
    /^<Footnotes/,
  ];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Toggle code block state when encountering triple backticks
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip headings inside code blocks
    if (inCodeBlock) {
      continue;
    }

    // Track when we enter/exit collapsed components
    // Check for opening tags
    if (!inCollapsibleComponent) {
      for (const pattern of collapsibleComponentPatterns) {
        if (pattern.test(trimmedLine)) {
          inCollapsibleComponent = true;
          collapsibleComponentDepth = 1;
          break;
        }
      }
    } else {
      // Count JSX tags to handle nesting
      const openingTags = (trimmedLine.match(/^<\w+[^>]*(?<!\/)/g) || []).length;
      const closingTags = (trimmedLine.match(/^<\/\w+>/g) || []).length;
      const selfClosingTags = (trimmedLine.match(/\/>/g) || []).length;

      collapsibleComponentDepth += openingTags - closingTags - selfClosingTags;

      // Exit collapsed component when depth reaches 0
      if (collapsibleComponentDepth <= 0) {
        inCollapsibleComponent = false;
        collapsibleComponentDepth = 0;
        continue;
      }
    }

    // Skip headings inside collapsible components
    if (inCollapsibleComponent) {
      continue;
    }

    // Match h2 and h3 headings (use original line for regex to preserve behavior)
    const headingMatch = line.match(/^(#{2,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length; // 2 for ##, 3 for ###
      const rawText = headingMatch[2].trim();
      const text = stripMarkdown(rawText); // Strip markdown formatting for display
      let id = generateSlug(rawText); // Use raw text for ID to match rehype-slug

      // Ensure unique IDs by appending counter to duplicates
      const count = (idCounts.get(id) ?? 0) + 1;
      idCounts.set(id, count);
      if (count > 1) {
        id = `${id}-${count - 1}`;
      }

      headings.push({ id, text, level });
    }
  }

  return headings;
}

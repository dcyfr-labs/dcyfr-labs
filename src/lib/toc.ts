/**
 * Extract table of contents from MDX content
 */

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

/**
 * Generates a slug from heading text (same logic as rehype-slug/github-slugger)
 * 
 * Key behaviors:
 * - Preserves accented characters (café, naïve)
 * - Removes punctuation (!@#$%^&*()[], etc.)
 * - Preserves hyphens and underscores
 * - Each space becomes a hyphen (including consecutive spaces for consecutive hyphens)
 * 
 * Examples:
 * - "café" → "café" (preserves accents)
 * - "Café ☕ and Résumé 📄" → "café--and-résumé-" (emoji removed, 2 spaces → 2 hyphens)
 * - "Further Reading & Resources" → "further-reading--resources" (& removed, space → hyphen)
 * 
 * Note: github-slugger uses a massive Unicode regex to determine what to remove.
 * This function removes all non-word ASCII chars except hyphens/underscores, plus emojis.
 * Non-ASCII letters (é, ñ, etc.) are preserved.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove common punctuation but keep accented characters
    // Matches: !"#$%&'()*+,./:;<=>?@[\]^`{|}~ and control chars
    // Preserves: a-z, A-Z, 0-9, -, _, and accented chars (é, ñ, etc.)
    .replace(/[^\p{L}\p{N}\s\-_]/gu, '')  // Keep letters (including accented), numbers, spaces, hyphens, underscores
    .replace(/\s/g, '-');                  // Each space becomes a hyphen
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

/** Update collapsible component tracking depth based on line content */
function updateCollapsibleDepth(trimmedLine: string, depth: number): number {
  const openingTags = (trimmedLine.match(/^<\w+[^>]*(?<!\/)/g) ?? []).length;
  const closingTags = (trimmedLine.match(/^<\/\w+>/g) ?? []).length;
  const selfClosingTags = (trimmedLine.match(/\/>/g) ?? []).length;
  return depth + openingTags - closingTags - selfClosingTags;
}

/** Check if a line opens a collapsible component */
const COLLAPSIBLE_PATTERNS = [
  /^<RiskAccordion/,
  /^<RiskAccordionGroup/,
  /^<CollapsibleSection/,
  /^<Footnotes/,
];

function isCollapsibleOpening(trimmedLine: string): boolean {
  return COLLAPSIBLE_PATTERNS.some((p) => p.test(trimmedLine));
}

/** Build a unique heading ID, appending counter for duplicates */
function buildUniqueId(rawId: string, idCounts: Map<string, number>): string {
  const count = (idCounts.get(rawId) ?? 0) + 1;
  idCounts.set(rawId, count);
  return count > 1 ? `${rawId}-${count - 1}` : rawId;
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
  const idCounts = new Map<string, number>();

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (!inCollapsibleComponent) {
      if (isCollapsibleOpening(trimmedLine)) {
        inCollapsibleComponent = true;
        collapsibleComponentDepth = 1;
      }
    } else {
      collapsibleComponentDepth = updateCollapsibleDepth(trimmedLine, collapsibleComponentDepth);
      if (collapsibleComponentDepth <= 0) {
        inCollapsibleComponent = false;
        collapsibleComponentDepth = 0;
        continue;
      }
    }

    if (inCollapsibleComponent) continue;

    const headingMatch = line.match(/^(#{2,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const rawText = headingMatch[2].trim();
      const text = stripMarkdown(rawText);
      const id = buildUniqueId(generateSlug(rawText), idCounts);
      headings.push({ id, text, level });
    }
  }

  return headings;
}

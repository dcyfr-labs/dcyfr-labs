/**
 * Heuristic metadata extraction from README markdown.
 *
 * Used as a fallback when YAML frontmatter is absent or incomplete.
 * Scanning is capped to `maxHeuristicsLines` to keep build time low.
 */

import { REPO_DEFAULTS } from '@/config/repos-config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the first N lines of a string. */
function head(text: string, lines: number): string[] {
  return text.split('\n').slice(0, lines);
}

/** Return `true` if `line` is a markdown heading. */
function isHeading(line: string): boolean {
  return /^#{1,6}\s+/.test(line);
}

/** Return `true` if `line` is a markdown list item (-, *, +, or number). */
function isBullet(line: string): boolean {
  return /^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line);
}

/** Extract the text portion of a bullet line. */
function bulletText(line: string): string {
  return line
    .replace(/^[-*+]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .trim();
}

function isSkippableParagraphLine(trimmed: string): boolean {
  if (!trimmed) return true;
  if (isHeading(trimmed)) return true;
  if (trimmed.startsWith('<!--')) return true;
  // Skip badge lines (usually just shields.io image links)
  if (trimmed.startsWith('[![')) return true;
  if (trimmed.startsWith('![')) return true;
  // Skip horizontal rules
  if (/^[-*_]{3,}$/.test(trimmed)) return true;
  return false;
}

function isHighlightsSectionHeading(trimmed: string): boolean {
  return /^#{1,3}\s+(features|highlights|what.+included)/i.test(trimmed);
}

// ---------------------------------------------------------------------------
// Extractors
// ---------------------------------------------------------------------------

/**
 * Find the first non-empty paragraph that isn't a heading, code block,
 * badge line, or HTML comment.
 */
export function extractFirstParagraph(body: string): string | undefined {
  const lines = head(body, REPO_DEFAULTS.maxHeuristicsLines);
  let inCode = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const trimmed = line.trim();
    if (isSkippableParagraphLine(trimmed)) continue;

    return trimmed;
  }
  return undefined;
}

/**
 * Extract bullet items from the first "Features", "Highlights", or "What's included"
 * section heading found in the README, up to 6 items.
 */
export function extractHighlights(body: string): string[] {
  const lines = head(body, REPO_DEFAULTS.maxHeuristicsLines);
  const sectionStartIndex = lines.findIndex((line) => isHighlightsSectionHeading(line.trim()));
  if (sectionStartIndex < 0) return [];

  const items: string[] = [];

  for (const line of lines.slice(sectionStartIndex + 1)) {
    const trimmed = line.trim();

    // End of section: new heading
    if (isHeading(trimmed) && !isHighlightsSectionHeading(trimmed)) break;

    if (!isBullet(trimmed)) continue;

    const text = bulletText(trimmed);
    if (text) items.push(text);
    if (items.length >= 6) break;
  }

  return items;
}

/**
 * Return `true` when the README has a Features or Highlights section.
 */
export function hasFeaturesList(body: string): boolean {
  const lines = head(body, REPO_DEFAULTS.maxHeuristicsLines);
  return lines.some((l) => isHighlightsSectionHeading(l.trim()));
}

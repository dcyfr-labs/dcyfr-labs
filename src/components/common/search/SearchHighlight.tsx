/**
 * Search Highlight Component
 * 
 * Highlights search terms in text with visual emphasis
 * Reusable across all content types (Activity, Blog, Projects)
 */

import { highlightSearchTerms } from "@/lib/search";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";

interface SearchHighlightProps {
  /** Text to highlight */
  text: string;
  /** Search query string */
  query: string;
  /** Optional CSS class for highlighted text */
  highlightClassName?: string;
}

/**
 * Highlights matching search terms in text
 * 
 * @example
 * <SearchHighlight 
 *   text="Hello world" 
 *   query="hello" 
 * />
 */
export function SearchHighlight({
  text,
  query,
  highlightClassName = `${SEMANTIC_COLORS.highlight.primary} font-semibold rounded px-0.5`
}: SearchHighlightProps) {
  const segments = highlightSearchTerms(text, query);

  return (
    <>
      {segments.map((segment, index) => (
        segment.highlighted ? (
          <mark key={index} className={highlightClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      ))}
    </>
  );
}

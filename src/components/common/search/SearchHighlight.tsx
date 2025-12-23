/**
 * Search Highlight Component
 * 
 * Highlights search terms in text with visual emphasis
 * Reusable across all content types (Activity, Blog, Projects)
 */

import { highlightSearchTerms } from "@/lib/search";

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
  highlightClassName = "bg-yellow-200 dark:bg-yellow-900/50 font-semibold rounded px-0.5"
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

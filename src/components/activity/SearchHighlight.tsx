/**
 * SearchHighlight Component
 *
 * Highlights search terms within text content.
 * Used in ActivityCard to show matched search results.
 */

import { cn } from "@/lib/utils";
import { highlightSearchTerms } from "@/lib/activity";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

interface SearchHighlightProps {
  /** Text to highlight */
  text: string;

  /** Search terms to highlight */
  searchTerms: string[];

  /** CSS class for the container */
  className?: string;

  /** CSS class for highlighted segments */
  highlightClassName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SearchHighlight({
  text,
  searchTerms,
  className = "",
  highlightClassName = "",
}: SearchHighlightProps) {
  const segments = highlightSearchTerms(text, searchTerms);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.highlighted) {
          return (
            <mark
              key={index}
              className={
                highlightClassName ||
                cn(SEMANTIC_COLORS.highlight.primary, "font-medium px-0.5 rounded")
              }
            >
              {segment.text}
            </mark>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </span>
  );
}

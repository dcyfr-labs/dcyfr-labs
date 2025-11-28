import React from "react";

/**
 * HighlightText Component
 * 
 * Highlights search terms within text by wrapping matches in a styled span.
 * Used in blog search results to provide visual feedback on matching terms.
 * 
 * Features:
 * - Case-insensitive matching
 * - Preserves original text casing
 * - Handles special regex characters in search query
 * - No highlighting when searchQuery is empty
 * 
 * @example
 * <HighlightText text="Learn TypeScript in 2024" searchQuery="typescript" />
 * // Output: Learn <mark class="...">TypeScript</mark> in 2024
 */

interface HighlightTextProps {
  /** The text to search within and potentially highlight */
  text: string;
  /** The search query to highlight (case-insensitive) */
  searchQuery?: string;
  /** Optional CSS class to apply to the wrapper element */
  className?: string;
}

export function HighlightText({ text, searchQuery, className }: HighlightTextProps) {
  // If no search query, return text as-is
  if (!searchQuery || searchQuery.trim() === "") {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in the search query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  // Create regex for case-insensitive matching with word boundaries
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  
  // Split text by matches, preserving the matched terms
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search query (case-insensitive)
        const isMatch = regex.test(part);
        // Reset regex lastIndex for next iteration
        regex.lastIndex = 0;
        
        if (isMatch) {
          return (
            <mark
              key={index}
              className="bg-yellow-200/80 dark:bg-yellow-500/30 text-foreground px-0.5 rounded"
            >
              {part}
            </mark>
          );
        }
        
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}

import Link from "next/link";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * ActiveFilters Component
 * 
 * Displays active search filters as dismissible pills/chips with
 * individual remove buttons and a "Clear all" option.
 * 
 * Features:
 * - Shows active tags (multiple), reading time, and search query
 * - Individual dismiss buttons (X icon) for each tag
 * - "Clear all" link when multiple filters active
 * - Mobile-responsive layout
 * - Accessible with proper ARIA labels
 * 
 * @param props.selectedTags - Currently active tag filters (array)
 * @param props.query - Current search query
 * @param props.readingTime - Current reading time filter
 * 
 * @example
 * ```tsx
 * <ActiveFilters 
 *   selectedTags={["TypeScript", "Next.js"]} 
 *   query="hooks"
 *   readingTime="quick"
 * />
 * ```
 */
interface ActiveFiltersProps {
  selectedTags?: string[];
  query?: string;
  readingTime?: string;
}

const getReadingTimeLabel = (value: string) => {
  switch (value) {
    case "quick": return "Quick reads (<5min)";
    case "medium": return "Medium (5-15min)";
    case "deep": return "Deep dives (>15min)";
    default: return value;
  }
};

/** Build tag param value when removing a specific tag */
function buildTagParam(selectedTags: string[], removeType: string, tagToRemove?: string): string {
  if (removeType !== "tag" && selectedTags.length > 0) return selectedTags.join(",");
  if (removeType === "tag" && tagToRemove) {
    const remaining = selectedTags.filter((t) => t !== tagToRemove);
    return remaining.join(",");
  }
  return "";
}

export function ActiveFilters({ selectedTags = [], query, readingTime }: ActiveFiltersProps) {
  const hasFilters = Boolean(selectedTags.length > 0 || query || readingTime);
  
  if (!hasFilters) return null;

  const buildClearHref = (removeType: "tag" | "query" | "readingTime" | "all", tagToRemove?: string) => {
    const params = new URLSearchParams();
    
    if (removeType !== "all") {
      const tagParam = buildTagParam(selectedTags, removeType, tagToRemove);
      if (tagParam) params.set("tag", tagParam);
      if (query && removeType !== "query") params.set("q", query);
      if (readingTime && removeType !== "readingTime") params.set("readingTime", readingTime);
    }
    
    const suffix = params.toString();
    return suffix ? `/blog?${suffix}` : "/blog";
  };

  const filterCount = selectedTags.length + [query, readingTime].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2 py-4 mt-4">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {query && (
        <Badge variant="secondary" className="gap-1.5 pr-1">
          <span>Search: &ldquo;{query}&rdquo;</span>
          <Link
            href={buildClearHref("query")}
            className="ml-1 rounded-sm hover:bg-secondary-foreground/20 p-0.5"
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </Link>
        </Badge>
      )}
      
      {selectedTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1.5 pr-1">
          <span>Tag: {tag}</span>
          <Link
            href={buildClearHref("tag", tag)}
            className="ml-1 rounded-sm hover:bg-secondary-foreground/20 p-0.5"
            aria-label={`Remove ${tag} tag filter`}
          >
            <X className="h-3 w-3" />
          </Link>
        </Badge>
      ))}
      
      {readingTime && (
        <Badge variant="secondary" className="gap-1.5 pr-1">
          <span>{getReadingTimeLabel(readingTime)}</span>
          <Link
            href={buildClearHref("readingTime")}
            className="ml-1 rounded-sm hover:bg-secondary-foreground/20 p-0.5"
            aria-label="Remove reading time filter"
          >
            <X className="h-3 w-3" />
          </Link>
        </Badge>
      )}
      
      {filterCount > 1 && (
        <Link
          href="/blog"
          className="text-sm text-primary hover:underline underline-offset-4 ml-1"
        >
          Clear all
        </Link>
      )}
    </div>
  );
}

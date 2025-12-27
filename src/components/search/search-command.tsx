"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { Search, Clock, Tag, BookOpen, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, GLASS, INTERACTIVE } from "@/lib/design-tokens";
import type { SearchIndex, SearchablePost } from "@/lib/search/fuse-config";
import { fuseOptions } from "@/lib/search/fuse-config";

/**
 * SearchCommand Component
 *
 * Modern command palette for searching blog posts with fuzzy matching.
 *
 * Features:
 * - Instant search with Fuse.js
 * - Keyboard navigation (↑↓ Enter Esc)
 * - Recent searches (localStorage)
 * - Tag filtering
 * - Responsive design
 */

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchablePost> | null>(null);

  // Load recent searches from localStorage (lazy initialization)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("dcyfr-recent-searches");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load search index on mount
  useEffect(() => {
    if (open && !searchIndex) {
      fetch("/search-index.json")
        .then((res) => res.json())
        .then((data: SearchIndex) => {
          setSearchIndex(data);
          setFuse(new Fuse(data.posts, fuseOptions));
        })
        .catch((err) => console.error("[Search] Failed to load index:", err));
    }
  }, [open, searchIndex]);

  // Save search to recent searches
  const saveSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 5);
      localStorage.setItem("dcyfr-recent-searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("dcyfr-recent-searches");
  }, []);

  // Perform search with Fuse.js
  const results = useMemo(() => {
    if (!fuse || !searchQuery.trim()) return [];

    const fuseResults = fuse.search(searchQuery);

    // Filter by selected tags if any
    let filtered = fuseResults.map((r) => r.item);
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.some((tag) => post.tags.includes(tag))
      );
    }

    return filtered.slice(0, 10); // Limit to 10 results
  }, [fuse, searchQuery, selectedTags]);

  // Handle result selection
  const handleSelect = useCallback(
    (post: SearchablePost) => {
      saveSearch(searchQuery);
      onOpenChange(false);
      router.push(post.url);
    },
    [searchQuery, saveSearch, onOpenChange, router]
  );

  // Handle Escape key
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className={cn(
            "rounded-xl border shadow-2xl",
            GLASS.modal,
            "overflow-hidden"
          )}
        >
          {/* Search Input */}
          <div className="flex items-center border-b px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-primary/70 dark:text-muted-foreground" />
            <Command.Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search posts, tags, topics..."
              className={cn(
                "flex h-14 w-full bg-transparent py-3 text-sm outline-none",
                "placeholder:text-primary/50 dark:placeholder:text-muted-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
            <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              Esc
            </kbd>
          </div>

          {/* Tag Filters (if search index loaded) */}
          {searchIndex && selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 border-b bg-muted/20">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTags((prev) => prev.filter((t) => t !== tag))
                  }
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full",
                    "bg-primary/10 text-primary hover:bg-primary/20",
                    INTERACTIVE.press
                  )}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <span className="ml-1">×</span>
                </button>
              ))}
            </div>
          )}

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {/* Loading State */}
            {!searchIndex && (
              <Command.Loading>
                <div className={cn("text-center text-sm text-primary/70 dark:text-muted-foreground", SPACING.content)}>
                  Loading search index...
                </div>
              </Command.Loading>
            )}

            {/* Empty State */}
            {searchIndex && !searchQuery && recentSearches.length === 0 && (
              <Command.Empty>
                <div className={cn("text-center text-primary/70 dark:text-muted-foreground", SPACING.content)}>
                  Start typing to search posts...
                </div>
              </Command.Empty>
            )}

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <Command.Group heading="Recent Searches">
                {recentSearches.map((query) => (
                  <Command.Item
                    key={query}
                    onSelect={() => setSearchQuery(query)}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      INTERACTIVE.cardHover
                    )}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{query}</span>
                  </Command.Item>
                ))}
                <button
                  onClick={clearRecent}
                  className="w-full text-left px-3 py-2 text-xs text-primary/60 dark:text-muted-foreground hover:text-primary dark:hover:text-foreground"
                >
                  Clear recent searches
                </button>
              </Command.Group>
            )}

            {/* Search Results */}
            {searchQuery && results.length > 0 && (
              <Command.Group heading={`${results.length} results`}>
                {results.map((post) => (
                  <Command.Item
                    key={post.id}
                    onSelect={() => handleSelect(post)}
                    className={cn(
                      "relative flex cursor-pointer flex-col gap-1 rounded-md px-3 py-3",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      INTERACTIVE.cardHover
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">
                        {post.title}
                      </h4>
                      <span className="text-xs text-primary/60 dark:text-muted-foreground whitespace-nowrap">
                        {post.readingTime} min
                      </span>
                    </div>
                    <p className="text-sm text-primary/70 dark:text-muted-foreground line-clamp-1">
                      {post.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-primary/60 dark:text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      {post.series && (
                        <div className="flex items-center gap-1 text-xs text-primary/60 dark:text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {post.series}
                        </div>
                      )}
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-primary/60 dark:text-muted-foreground" />
                          <span className="text-xs text-primary/60 dark:text-muted-foreground">
                            {post.tags.slice(0, 2).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* No Results */}
            {searchQuery && results.length === 0 && searchIndex && (
              <Command.Empty>
                <div className={cn("text-center", SPACING.content)}>
                  <p className="text-sm text-primary/70 dark:text-muted-foreground mb-2">
                    No results found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs text-primary/70 dark:text-muted-foreground">
                    Try different keywords or browse{" "}
                    <button
                      onClick={() => {
                        onOpenChange(false);
                        router.push("/blog");
                      }}
                      className="text-primary hover:underline"
                    >
                      all posts
                    </button>
                  </p>
                </div>
              </Command.Empty>
            )}
          </Command.List>

          {/* Footer Hints */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-primary/60 dark:text-muted-foreground bg-muted/20">
            <span>Navigate with ↑↓ arrows</span>
            <span className="hidden sm:inline">Press Enter to open</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

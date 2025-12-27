/**
 * Unified Command Interface
 *
 * Combines search, navigation, and actions in a single modern command palette.
 * Inspired by VS Code's unified command palette with content-aware sections.
 *
 * Features:
 * - Instant post search with Fuse.js
 * - Navigation shortcuts (Home, Blog, Work, etc.)
 * - Action commands (theme switching)
 * - Continue Reading suggestions
 * - Keyboard navigation (↑↓ Enter Esc)
 * - Recent searches
 * - Responsive design
 *
 * Triggered by: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import {
  Search,
  Clock,
  Tag,
  BookOpen,
  Calendar,
  Home,
  Briefcase,
  User,
  Rss,
  Moon,
  Sun,
  Monitor,
  Settings,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING, GLASS, INTERACTIVE } from "@/lib/design-tokens";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useReadingProgressList } from "@/hooks/use-reading-progress";
import { useSearch } from "@/components/search";
import { NAVIGATION } from "@/lib/navigation-config";
import type { SearchIndex, SearchablePost } from "@/lib/search/fuse-config";
import { fuseOptions } from "@/lib/search/fuse-config";

export interface UnifiedCommandProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Action command configuration
 */
interface ActionCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  onSelect: () => void;
}

export function UnifiedCommand(props?: UnifiedCommandProps) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange } = props || {};
  
  // Get context from SearchProvider for global search state
  const { open: searchProviderOpen, setOpen: setSearchProviderOpen } = useSearch();
  
  // Support both controlled mode (from props) and uncontrolled mode (from SearchProvider)
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  
  // Determine which open state to use
  // Priority: props > SearchProvider > internal state
  let open: boolean;
  if (isControlled) {
    open = controlledOpen;
  } else {
    open = searchProviderOpen || internalOpen;
  }
  
  const onOpenChange = useCallback((value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      // Update both SearchProvider and internal state
      setSearchProviderOpen(value);
      setInternalOpen(value);
    }
  }, [isControlled, controlledOnOpenChange, setSearchProviderOpen]);

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchablePost> | null>(null);
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

  // Get reading progress for "Continue Reading"
  const { inProgress } = useReadingProgressList({ limit: 3, minProgress: 5, maxProgress: 95 });

  // Register Cmd+K shortcut
  useKeyboardShortcut([
    {
      key: "k",
      metaKey: true,
      callback: () => onOpenChange(!open),
      description: "Open unified command palette",
    },
  ]);

  // Load search index
  useEffect(() => {
    if (open && !searchIndex) {
      fetch("/search-index.json")
        .then((res) => res.json())
        .then((data: SearchIndex) => {
          setSearchIndex(data);
          setFuse(new Fuse(data.posts, fuseOptions));
        })
        .catch((err) => console.error("[Command] Failed to load search index:", err));
    }
  }, [open, searchIndex]);

  // Close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const currentTheme = html.classList.contains("dark") ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    html.classList.remove("light", "dark");
    html.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    
    onOpenChange(false);
  }, [onOpenChange]);

  // Save search to history
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

  // Search posts
  const searchResults = useMemo(() => {
    if (!fuse || !search.trim()) return [];

    const fuseResults = fuse.search(search);
    let filtered = fuseResults.map((r) => r.item);
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.some((tag) => post.tags.includes(tag))
      );
    }

    return filtered.slice(0, 8);
  }, [fuse, search, selectedTags]);

  // Navigation commands
  const navCommands: ActionCommand[] = NAVIGATION.primary.map((item) => ({
    id: `nav-${item.href}`,
    label: item.label,
    icon: item.icon || Home,
    keywords: [item.label.toLowerCase(), item.href.slice(1)],
    onSelect: () => {
      router.push(item.href);
      onOpenChange(false);
    },
  }));

  // Action commands (theme switching)
  const actionCommands: ActionCommand[] = [
    {
      id: "action-light-theme",
      label: "Light Theme",
      icon: Sun,
      keywords: ["theme", "light"],
      onSelect: () => {
        const html = document.documentElement;
        html.classList.remove("dark");
        html.classList.add("light");
        localStorage.setItem("theme", "light");
        onOpenChange(false);
      },
    },
    {
      id: "action-dark-theme",
      label: "Dark Theme",
      icon: Moon,
      keywords: ["theme", "dark"],
      onSelect: () => {
        const html = document.documentElement;
        html.classList.remove("light");
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
        onOpenChange(false);
      },
    },
    {
      id: "action-system-theme",
      label: "System Theme",
      icon: Monitor,
      keywords: ["theme", "system", "auto"],
      onSelect: () => {
        const html = document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        html.classList.remove("light", "dark");
        html.classList.add(prefersDark ? "dark" : "light");
        localStorage.setItem("theme", "system");
        onOpenChange(false);
      },
    },
  ];

  // Filter commands by search
  const filteredNavCommands = navCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.keywords?.some((kw) => kw.includes(search.toLowerCase()))
  );

  const filteredActionCommands = actionCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.keywords?.some((kw) => kw.includes(search.toLowerCase()))
  );

  const filteredContinueReading = inProgress.filter((article) =>
    article.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Determine what to show
  const hasSearchQuery = search.trim().length > 0;
  const hasResults = searchResults.length > 0 || filteredNavCommands.length > 0 || 
                     filteredActionCommands.length > 0 || filteredContinueReading.length > 0;

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
        <Command className={cn("rounded-xl border border-border shadow-2xl overflow-hidden", "bg-muted/50 hover:bg-muted/80 dark:bg-muted/40")}>
          {/* Search Input */}
          <div className="flex items-center border-b border-border/50 px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search posts, navigate, or toggle theme..."
              className={cn(
                "flex h-14 w-full bg-transparent py-3 text-sm outline-none",
                "placeholder:text-muted-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
            <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {/* Loading State */}
            {!searchIndex && (
              <Command.Loading>
                <div className={cn("text-center text-sm text-muted-foreground", SPACING.content)}>
                  Loading...
                </div>
              </Command.Loading>
            )}

            {/* Empty State */}
            {searchIndex && !hasSearchQuery && recentSearches.length === 0 && (
              <Command.Empty>
                <div className={cn("text-center text-primary/70 dark:text-muted-foreground", SPACING.content)}>
                  <p className="mb-2">Search posts, navigate, or switch theme</p>
                  <p className="text-xs">Type to get started...</p>
                </div>
              </Command.Empty>
            )}

            {/* Recent Searches (when no search query) */}
            {!hasSearchQuery && recentSearches.length > 0 && (
              <Command.Group heading="Recent Searches">
                {recentSearches.map((query) => (
                  <Command.Item
                    key={query}
                    onSelect={() => setSearch(query)}
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

            {/* Continue Reading */}
            {!hasSearchQuery && filteredContinueReading.length === 0 && inProgress.length > 0 && (
              <Command.Group heading="Continue Reading">
                {inProgress.map((article) => (
                  <Command.Item
                    key={article.articleId}
                    onSelect={() => {
                      router.push(`/blog/${article.articleId}`);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      INTERACTIVE.cardHover
                    )}
                  >
                    <BookOpen className="h-4 w-4 text-primary/60" />
                    <div className="flex-1 min-w-0">
                      <div className={TYPOGRAPHY.depth.primary}>{article.title}</div>
                      <div className={cn(TYPOGRAPHY.depth.tertiary, "text-xs")}>{Math.round(article.progress)}% complete</div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results - Blog Posts */}
            {hasSearchQuery && searchResults.length > 0 && (
              <Command.Group heading={`Posts (${searchResults.length})`}>
                {searchResults.map((post) => (
                  <Command.Item
                    key={post.id}
                    onSelect={() => {
                      saveSearch(search);
                      router.push(post.url);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "relative flex cursor-pointer flex-col gap-1 rounded-md px-3 py-3",
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      INTERACTIVE.cardHover
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{post.title}</h4>
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
                        })}
                      </div>
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

            {/* Navigation Commands */}
            {filteredNavCommands.length > 0 && (
              <Command.Group heading="Navigate">
                {filteredNavCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <Command.Item
                      key={cmd.id}
                      onSelect={cmd.onSelect}
                      className={cn(
                        "relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        INTERACTIVE.cardHover
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{cmd.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* Action Commands */}
            {filteredActionCommands.length > 0 && (
              <Command.Group heading="Appearance">
                {filteredActionCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <Command.Item
                      key={cmd.id}
                      onSelect={cmd.onSelect}
                      className={cn(
                        "relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        INTERACTIVE.cardHover
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{cmd.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* No Results */}
            {hasSearchQuery && !hasResults && searchIndex && (
              <Command.Empty>
                <div className={cn("text-center", SPACING.content)}>
                  <p className="text-sm text-muted-foreground mb-2">
                    No results found for &quot;{search}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">
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
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 text-xs text-muted-foreground bg-muted/30">
            <span>Navigate with ↑↓ arrows</span>
            <span className="hidden sm:inline">Press Enter to select</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

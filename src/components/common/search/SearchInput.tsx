/**
 * Search Input Component
 * 
 * Unified search input with:
 * - Keyboard shortcuts (Cmd/Ctrl + K)
 * - Search history dropdown
 * - Query syntax hints
 * - Clear button
 * 
 * Reusable across all content types
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loadSearchHistory, saveSearchToHistory, clearSearchHistory } from "@/lib/search";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  /** Current search query */
  value: string;
  /** Callback when search query changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** localStorage key for history */
  historyStorageKey?: string;
  /** Number of results (for history tracking) */
  resultCount?: number;
  /** Keyboard shortcut enabled (default: true) */
  keyboardShortcut?: boolean;
  /** Show syntax hints (default: true) */
  showHints?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Unified search input with history and keyboard shortcuts
 * 
 * @example
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search posts..."
 *   historyStorageKey="blog-search-history"
 *   resultCount={results.length}
 * />
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  historyStorageKey = "search-history",
  resultCount = 0,
  keyboardShortcut = true,
  showHints = true,
  className = "",
}: SearchInputProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const history = loadSearchHistory(historyStorageKey, 10);
    return history.map(item => item.query);
  });
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save to history when search completes
  useEffect(() => {
    if (value.trim() && resultCount >= 0) {
      const timeoutId = setTimeout(() => {
        saveSearchToHistory(value, resultCount, historyStorageKey, 10);
        // Reload history
        const history = loadSearchHistory(historyStorageKey, 10);
        setSearchHistory(history.map(item => item.query));
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [value, resultCount, historyStorageKey]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    if (!keyboardShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyboardShortcut]);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleHistorySelect = (query: string) => {
    onChange(query);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    clearSearchHistory(historyStorageKey);
    setSearchHistory([]);
    setShowHistory(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20"
          aria-label="Search"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {searchHistory.length > 0 && (
            <DropdownMenu open={showHistory} onOpenChange={setShowHistory}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  aria-label="Search history"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className={cn("flex items-center justify-between px-2 py-1.5 text-muted-foreground", TYPOGRAPHY.label.xs)}>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-auto p-0 text-xs hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
                {searchHistory.map((query, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleHistorySelect(query)}
                    className="cursor-pointer"
                  >
                    <Search className="mr-2 h-3 w-3" />
                    <span className="truncate">{query}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {showHints && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">
            Syntax: &quot;exact phrase&quot;, -exclude, field:value
          </span>
          {keyboardShortcut && (
            <span className="ml-2 text-xs opacity-60">
              {typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearch } from "./search-provider";
import { TYPOGRAPHY, TOUCH_TARGET } from "@/lib/design-tokens";

/**
 * SearchButton Component
 *
 * Trigger button for search modal with keyboard shortcut hint.
 *
 * Variants:
 * - default: Icon button (for header/mobile)
 * - input: Fake input bar (for hero section)
 */

interface SearchButtonProps {
  variant?: "default" | "input";
  className?: string;
}

export function SearchButton({ variant = "default", className }: SearchButtonProps) {
  const { setOpen } = useSearch();

  if (variant === "input") {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex items-center gap-3 w-full max-w-md",
          "px-4 py-3 rounded-xl",
          "bg-muted/50 hover:bg-muted/80",
          "border border-border/50",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-accent/50 transition-colors",
          className
        )}
        aria-label="Search posts"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-sm">Search posts, tags, topics...</span>
        <kbd className={cn("ml-auto hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-background px-2 font-mono opacity-70 group-hover:opacity-100", TYPOGRAPHY.label.small)}>
          /
        </kbd>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(true)}
      className={cn("relative", className)}
      aria-label="Search"
    >
      <Search className="h-4 w-4" />
      <span className="sr-only">Search (/)</span>
    </Button>
  );
}

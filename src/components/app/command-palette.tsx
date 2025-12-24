"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  FileText,
  Briefcase,
  Bookmark,
  User,
  Home,
  Rss,
  Moon,
  Sun,
  Monitor,
  Settings,
} from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { useKeyboardShortcut, getModifierKey } from "@/hooks/use-keyboard-shortcut";
import { useReadingProgressList } from "@/hooks/use-reading-progress";
import { APP_TOKENS } from "@/lib/design-tokens";
import { NAVIGATION } from "@/lib/navigation-config";

/**
 * Command action configuration
 */
export interface CommandAction {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Category for grouping */
  category: "navigation" | "actions" | "settings";
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Keyboard shortcut (optional) */
  shortcut?: string;
  /** Action handler (navigation or custom function) */
  onSelect: () => void;
  /** Search keywords for filtering */
  keywords?: string[];
}

/**
 * Command Palette Component
 * 
 * Global command palette for quick navigation and actions.
 * Triggered by Cmd+K (Mac) or Ctrl+K (Windows/Linux).
 * 
 * Features:
 * - Fuzzy search across all actions
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Grouped commands by category
 * - Visual keyboard shortcuts display
 * - Theme toggle integration
 * 
 * @example
 * ```tsx
 * // Add to root layout
 * <CommandPalette />
 * ```
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Get reading progress for "Continue Reading" suggestions
  const { inProgress } = useReadingProgressList({ limit: 3, minProgress: 5, maxProgress: 95 });

  // Register Cmd+K shortcut
  useKeyboardShortcut([
    {
      key: "k",
      metaKey: true,
      callback: () => setOpen(true),
      description: "Open command palette",
    },
  ]);

  // Close on Escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const currentTheme = html.classList.contains("dark") ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    html.classList.remove("light", "dark");
    html.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    
    setOpen(false);
  }, []);

  // Icon mapping for navigation items
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "/": Home,
    "/blog": FileText,
    "/work": Briefcase,
    "/bookmarks": Bookmark,
    "/about": User,
    "/feeds": Rss,
    "/sponsors": Settings,
    "/contact": User,
  };

  // Define available commands
  const commands: CommandAction[] = [
    // Continue Reading (dynamic from localStorage)
    ...inProgress.map((article) => ({
      id: `continue-${article.articleId}`,
      label: article.title || article.articleId,
      category: "navigation" as const,
      icon: FileText,
      onSelect: () => {
        router.push(`/blog/${article.articleId}`);
        setOpen(false);
      },
      keywords: ["continue", "reading", "progress", article.title || "", article.articleId],
      shortcut: `${Math.round(article.progress)}% complete`,
    })),
    // Navigation - Auto-generated from NAVIGATION.primary config
    ...NAVIGATION.primary.map((navItem) => ({
      id: `nav-${navItem.href.slice(1) || "home"}`,
      label: navItem.label,
      category: "navigation" as const,
      icon: navItem.icon || iconMap[navItem.href] || Home,
      shortcut: navItem.shortcut ? navItem.shortcut.toUpperCase().replace(" ", " → ") : undefined,
      onSelect: () => {
        router.push(navItem.href);
        setOpen(false);
      },
      keywords: [
        navItem.label.toLowerCase(),
        navItem.href.slice(1),
        ...(navItem.href === "/" ? ["home", "index", "main"] : []),
        ...(navItem.href === "/blog" ? ["posts", "articles", "writing"] : []),
        ...(navItem.href === "/work" ? ["projects", "portfolio", "case studies"] : []),
        ...(navItem.href === "/bookmarks" ? ["saved", "links", "resources"] : []),
        ...(navItem.href === "/about" ? ["bio", "profile", "me"] : []),
        ...(navItem.href === "/feeds" ? ["rss", "atom", "subscribe"] : []),
      ],
    })),
    // Actions
    {
      id: "action-theme-light",
      label: "Light Theme",
      category: "actions",
      icon: Sun,
      onSelect: () => {
        const html = document.documentElement;
        html.classList.remove("dark");
        html.classList.add("light");
        localStorage.setItem("theme", "light");
        setOpen(false);
      },
      keywords: ["theme", "light", "appearance"],
    },
    {
      id: "action-theme-dark",
      label: "Dark Theme",
      category: "actions",
      icon: Moon,
      onSelect: () => {
        const html = document.documentElement;
        html.classList.remove("light");
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
        setOpen(false);
      },
      keywords: ["theme", "dark", "appearance"],
    },
    {
      id: "action-theme-system",
      label: "System Theme",
      category: "actions",
      icon: Monitor,
      onSelect: () => {
        const html = document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        html.classList.remove("light", "dark");
        html.classList.add(prefersDark ? "dark" : "light");
        localStorage.setItem("theme", "system");
        setOpen(false);
      },
      keywords: ["theme", "system", "auto", "appearance"],
    },
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.keywords?.some((keyword) => keyword.includes(searchLower))
    );
  });

  // Group commands by category
  const groupedCommands = {
    navigation: filteredCommands.filter((cmd) => cmd.category === "navigation"),
    actions: filteredCommands.filter((cmd) => cmd.category === "actions"),
    settings: filteredCommands.filter((cmd) => cmd.category === "settings"),
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className={`fixed inset-0 ${APP_TOKENS.Z_INDEX.commandPalette} flex items-start justify-center pt-[20vh]`}
    >
      {/* Accessible title for screen readers */}
      <DialogTitle className="sr-only">
        Command Palette
      </DialogTitle>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette */}
      <div
        className={`relative w-full max-w-2xl mx-4 bg-background border border-border rounded-lg shadow-2xl overflow-hidden transition-all ${APP_TOKENS.ANIMATIONS.commandPalette}`}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search commands..."
            className="flex-1 py-4 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
          />
          <kbd className={APP_TOKENS.KEYBOARD.keyBadge}>ESC</kbd>
        </div>

        {/* Command List */}
        <Command.List className="max-h-[400px] overflow-y-auto py-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          {/* Navigation Commands */}
          {groupedCommands.navigation.length > 0 && (
            <Command.Group
              heading="Navigation"
              className="px-2 pb-2 text-xs text-muted-foreground"
            >
              {groupedCommands.navigation.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={command.onSelect}
                  className="flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <command.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{command.label}</span>
                  </div>
                  {command.shortcut && (
                    <kbd className={`${APP_TOKENS.KEYBOARD.keyBadge} ml-auto`}>
                      {command.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Action Commands */}
          {groupedCommands.actions.length > 0 && (
            <Command.Group
              heading="Actions"
              className="px-2 pb-2 text-xs text-muted-foreground"
            >
              {groupedCommands.actions.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={command.onSelect}
                  className="flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <command.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{command.label}</span>
                  </div>
                  {command.shortcut && (
                    <kbd className={`${APP_TOKENS.KEYBOARD.keyBadge} ml-auto`}>
                      {command.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Settings Commands */}
          {groupedCommands.settings.length > 0 && (
            <Command.Group
              heading="Settings"
              className="px-2 pb-2 text-xs text-muted-foreground"
            >
              {groupedCommands.settings.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={command.onSelect}
                  className="flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-accent aria-selected:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <command.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{command.label}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className={APP_TOKENS.KEYBOARD.keyBadge}>↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className={APP_TOKENS.KEYBOARD.keyBadge}>↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            Open with
            <kbd className={APP_TOKENS.KEYBOARD.keyBadge}>
              {getModifierKey()}K
            </kbd>
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
}

"use client";

import { useEffect, useCallback } from "react";

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Key to trigger (e.g., 'k', 'b', '/', 'Escape') */
  key: string;
  /** Require Command/Ctrl key modifier */
  metaKey?: boolean;
  /** Require Ctrl key modifier */
  ctrlKey?: boolean;
  /** Require Shift key modifier */
  shiftKey?: boolean;
  /** Require Alt/Option key modifier */
  altKey?: boolean;
  /** Callback function to execute */
  callback: (event: KeyboardEvent) => void;
  /** Disable shortcut when typing in input/textarea */
  preventInInput?: boolean;
  /** Description for help menu/documentation */
  description?: string;
}

/**
 * Hook to register global keyboard shortcuts
 * 
 * Handles cross-platform key detection (Cmd on Mac, Ctrl on Windows/Linux)
 * and prevents conflicts with native browser shortcuts.
 * 
 * @param shortcuts - Array of keyboard shortcut configurations
 * 
 * @example
 * ```tsx
 * useKeyboardShortcut([
 *   {
 *     key: 'k',
 *     metaKey: true,
 *     callback: () => setCommandPaletteOpen(true),
 *     description: 'Open command palette'
 *   },
 *   {
 *     key: '/',
 *     callback: () => focusSearch(),
 *     preventInInput: true,
 *     description: 'Focus search'
 *   }
 * ]);
 * ```
 */
export function useKeyboardShortcut(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if we're in an input field
      const target = event.target as HTMLElement;
      const isInput = 
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        // Skip if in input and shortcut doesn't allow it
        if (isInput && shortcut.preventInInput !== false) {
          continue;
        }

        // Match key (case-insensitive)
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        if (!keyMatch) continue;

        // For metaKey, allow either Meta (Mac) or Ctrl (Windows/Linux)
        const hasRequiredMeta = shortcut.metaKey ? (event.metaKey || event.ctrlKey) : !event.metaKey && !event.ctrlKey;
        const hasRequiredCtrl = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const hasRequiredShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const hasRequiredAlt = shortcut.altKey ? event.altKey : !event.altKey;

        if (hasRequiredMeta && hasRequiredCtrl && hasRequiredShift && hasRequiredAlt) {
          event.preventDefault();
          shortcut.callback(event);
          break; // Only trigger first matching shortcut
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Get platform-specific modifier key display name
 * 
 * @returns "⌘" on Mac, "Ctrl" on Windows/Linux
 * 
 * @example
 * ```tsx
 * <kbd>{getModifierKey()} K</kbd>
 * ```
 */
export function getModifierKey(): string {
  if (typeof window === "undefined") return "Ctrl";
  
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  return isMac ? "⌘" : "Ctrl";
}

/**
 * Format keyboard shortcut for display
 * 
 * @param shortcut - Keyboard shortcut configuration
 * @returns Human-readable shortcut string (e.g., "⌘K", "Ctrl+Shift+P")
 * 
 * @example
 * ```tsx
 * <span>{formatShortcut({ key: 'k', metaKey: true })}</span>
 * // Renders: ⌘K (on Mac) or Ctrl+K (on Windows)
 * ```
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.metaKey) parts.push(getModifierKey());
  if (shortcut.ctrlKey && !shortcut.metaKey) parts.push("Ctrl");
  if (shortcut.shiftKey) parts.push("Shift");
  if (shortcut.altKey) parts.push(shortcut.altKey ? "⌥" : "Alt");
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join("+");
}

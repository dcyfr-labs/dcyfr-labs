/**
 * GitHub-style navigation keyboard shortcuts
 *
 * Implements two-key sequences for navigation:
 * - g h → Go to Home
 * - g b → Go to Blog
 * - g w → Go to Work
 * - g s → Go to Sponsors
 * - g a → Go to About
 * - g c → Go to Contact
 *
 * @example
 * ```tsx
 * function App() {
 *   useNavigationShortcuts();
 *   return <YourApp />;
 * }
 * ```
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getKeyboardShortcuts } from "@/lib/navigation-config";

export interface NavigationShortcutsOptions {
  /**
   * Enable/disable shortcuts
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback when a shortcut is triggered
   */
  onShortcut?: (href: string, label: string) => void;
}

/**
 * Hook to enable GitHub-style navigation shortcuts
 *
 * Uses a two-key sequence system where 'g' is pressed first,
 * followed by a destination key.
 */
export function useNavigationShortcuts(options: NavigationShortcutsOptions = {}) {
  const { enabled = true, onShortcut } = options;
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if we're in an input field
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Don't trigger shortcuts when typing
      if (isInput) return;

      // Don't trigger if any modifiers are pressed
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const key = event.key.toLowerCase();

      // First key in sequence: 'g'
      if (key === "g" && !pendingKey) {
        event.preventDefault();
        setPendingKey("g");

        // Reset after 1 second if no second key is pressed
        setTimeout(() => setPendingKey(null), 1000);
        return;
      }

      // Second key in sequence
      if (pendingKey === "g") {
        event.preventDefault();
        setPendingKey(null);

        // Get all shortcuts from navigation config
        const shortcuts = getKeyboardShortcuts();

        // Find matching shortcut (format is "g h", "g b", etc.)
        const shortcut = shortcuts.find(s => s.shortcut === `g ${key}`);

        if (shortcut) {
          onShortcut?.(shortcut.href, shortcut.label);
          router.push(shortcut.href);
        }
      }
    },
    [enabled, pendingKey, router, onShortcut]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    pendingKey,
    isActive: pendingKey !== null,
  };
}

/**
 * Get all available navigation shortcuts for display
 *
 * @returns Array of shortcuts with formatted display strings
 *
 * @example
 * ```tsx
 * const shortcuts = getAvailableShortcuts();
 * shortcuts.map(s => (
 *   <div key={s.href}>
 *     <kbd>{s.display}</kbd> {s.label}
 *   </div>
 * ))
 * ```
 */
export function getAvailableShortcuts() {
  const shortcuts = getKeyboardShortcuts();

  return shortcuts.map(shortcut => ({
    ...shortcut,
    display: shortcut.shortcut.toUpperCase().replace(" ", " then "),
    keys: shortcut.shortcut.split(" "),
  }));
}

/**
 * Hook to show visual indicator when 'g' is pressed
 *
 * @example
 * ```tsx
 * function ShortcutIndicator() {
 *   const indicator = useShortcutIndicator();
 *
 *   if (!indicator.show) return null;
 *
 *   return (
 *     <div className="fixed bottom-4 right-4">
 *       Press a key: {indicator.availableKeys.join(', ')}
 *     </div>
 *   );
 * }
 * ```
 */
export function useShortcutIndicator() {
  const { pendingKey } = useNavigationShortcuts({ enabled: true });
  const shortcuts = getAvailableShortcuts();

  return {
    show: pendingKey === "g",
    availableKeys: shortcuts.map(s => s.keys[1]?.toUpperCase()).filter(Boolean),
    shortcuts: shortcuts,
  };
}

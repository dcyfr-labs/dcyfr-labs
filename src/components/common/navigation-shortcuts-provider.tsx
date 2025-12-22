/**
 * Navigation shortcuts provider
 *
 * Enables GitHub-style keyboard shortcuts and provides visual feedback.
 * Must be added to the root layout as a client component.
 */

"use client";

import { useNavigationShortcuts } from "@/hooks/use-navigation-shortcuts";
import { KeyboardShortcuts } from "@/components/common/keyboard-shortcuts-indicator";

export function NavigationShortcutsProvider() {
  // Enable navigation shortcuts globally
  useNavigationShortcuts({
    enabled: true,
    onShortcut: (href, label) => {
      // Optional: Add analytics tracking here
      if (process.env.NODE_ENV === "development") {
        console.log(`[Navigation Shortcut] ${label} → ${href}`);
      }
    },
  });

  return <KeyboardShortcuts />;
}

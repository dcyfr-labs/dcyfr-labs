/**
 * Navigation shortcuts provider
 *
 * Enables GitHub-style keyboard shortcuts and provides visual feedback.
 * Must be added to the root layout as a client component.
 */

"use client";

import { useState } from "react";
import { useNavigationShortcuts } from "@/hooks/use-navigation-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/common";

export function NavigationShortcutsProvider() {
  const [showHelp, setShowHelp] = useState(false);

  // Enable navigation shortcuts globally
  useNavigationShortcuts({
    enabled: true,
    onShortcut: (href, label) => {
      // Optional: Add analytics tracking here
      if (process.env.NODE_ENV === "development") {
        console.warn(`[Navigation Shortcut] ${label} → ${href}`);
      }
    },
  });

  return <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />;
}

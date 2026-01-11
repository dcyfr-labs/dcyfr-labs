/**
 * Keyboard shortcuts visual indicator
 *
 * Shows available shortcuts when 'g' is pressed and provides a help modal
 * for viewing all available shortcuts.
 */

"use client";

import * as React from "react";
import {
  useShortcutIndicator,
  getAvailableShortcuts,
} from "@/hooks/use-navigation-shortcuts";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ANIMATION, TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Small indicator that appears when 'g' is pressed
 * Shows available navigation keys
 */
export function KeyboardShortcutIndicator() {
  const { show, availableKeys } = useShortcutIndicator();

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "bg-card border rounded-lg shadow-lg",
        "px-4 py-3"
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn(TYPOGRAPHY.label.small, "mb-2")}>Press a key:</div>
      <div className="flex gap-2 flex-wrap">
        {availableKeys.map((key) => (
          <kbd
            key={key}
            className={cn(
              "px-2 py-1 text-xs font-mono",
              "bg-muted rounded border",
              "min-w-6 text-center"
            )}
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

/**
 * Full keyboard shortcuts help modal
 * Triggered by pressing '?'
 */
export function KeyboardShortcutsHelp() {
  const [open, setOpen] = React.useState(false);
  const shortcuts = getAvailableShortcuts();

  // Register '?' shortcut to open help
  useKeyboardShortcut([
    {
      key: "?",
      callback: () => setOpen(true),
      preventInInput: true,
      description: "Show keyboard shortcuts",
    },
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Navigate quickly using keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Navigation Shortcuts */}
          <section>
            <h3
              className={cn(
                TYPOGRAPHY.label.small,
                "mb-3 text-muted-foreground uppercase tracking-wide"
              )}
            >
              Navigation
            </h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.href}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{shortcut.label}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, index) => (
                      <React.Fragment key={`${key}-${index}`}>
                        {index > 0 && (
                          <span className="text-muted-foreground text-xs self-center">
                            then
                          </span>
                        )}
                        <kbd
                          className={cn(
                            "px-2 py-1 text-xs font-mono",
                            "bg-muted rounded border",
                            "min-w-7 text-center"
                          )}
                        >
                          {key.toUpperCase()}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* General Shortcuts */}
          <section>
            <h3
              className={cn(
                TYPOGRAPHY.label.small,
                "mb-3 text-muted-foreground uppercase tracking-wide"
              )}
            >
              General
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Show keyboard shortcuts</span>
                <kbd
                  className={cn(
                    "px-2 py-1 text-xs font-mono",
                    "bg-muted rounded border",
                    "min-w-7 text-center"
                  )}
                >
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Close dialogs</span>
                <kbd
                  className={cn(
                    "px-2 py-1 text-xs font-mono",
                    "bg-muted rounded border"
                  )}
                >
                  ESC
                </kbd>
              </div>
            </div>
          </section>

          {/* Pro Tip */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Pro tip:</strong> Press{" "}
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border mx-1">
                G
              </kbd>
              to see all available navigation shortcuts
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Combined component that includes both indicator and help modal
 * Add this once to your root layout
 */
export function KeyboardShortcuts() {
  return (
    <>
      <KeyboardShortcutIndicator />
      <KeyboardShortcutsHelp />
    </>
  );
}

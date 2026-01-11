"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getShortcutsByCategory } from "@/config/keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Keyboard Shortcuts Help Dialog
 *
 * Displays available keyboard shortcuts for the blog page.
 * Triggered by pressing '?' key.
 *
 * Shortcuts are centrally defined in @/config/keyboard-shortcuts.ts
 * for easy maintenance and platform-specific customization.
 */
export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps) {
  const shortcuts = getShortcutsByCategory();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick actions to navigate and filter blog posts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold mb-3">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs px-2 py-0.5"
                    >
                      {item.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          <p>
            <strong>Tip:</strong> Press{" "}
            <Badge variant="outline" className="font-mono text-xs mx-1">
              ?
            </Badge>
            anytime to view these shortcuts
          </p>
          <p className="mt-2 text-xs opacity-75">
            All shortcuts are single keys that don&apos;t conflict with browser
            shortcuts like Cmd+F (find) or Cmd+S (save).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Keyboard Shortcuts Help Dialog
 * 
 * Displays available keyboard shortcuts for the blog page.
 * Triggered by pressing '?' key.
 */
export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["/"], description: "Focus search" },
        { keys: ["Esc"], description: "Clear search / Close dialogs" },
      ],
    },
    {
      category: "Views",
      items: [
        { keys: ["1"], description: "Compact view" },
        { keys: ["2"], description: "Grid view" },
        { keys: ["3"], description: "List view" },
        { keys: ["4"], description: "Magazine view" },
      ],
    },
    {
      category: "Filters",
      items: [
        { keys: ["f"], description: "Toggle sidebar filters" },
      ],
    },
    {
      category: "Help",
      items: [
        { keys: ["?"], description: "Show keyboard shortcuts" },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick actions to navigate and filter blog posts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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
                    <div className="flex gap-1">
                      {item.keys.map((key) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className="font-mono text-xs px-2 py-0.5"
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          <p>
            <strong>Tip:</strong> Press <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> 
            anytime to view these shortcuts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

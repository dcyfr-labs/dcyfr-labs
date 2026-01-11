/**
 * Keyboard Shortcuts Configuration
 * 
 * Centralized mapping for all keyboard shortcuts used in the application.
 * Helps avoid conflicts and makes it easy to customize or disable shortcuts globally.
 * 
 * Design Principles:
 * - Single letter keys for quick access: /, ?, f, etc.
 * - Avoid conflicting with browser shortcuts (Cmd+F, Cmd+S, etc.)
 * - Mnemonic keys when possible (f = filters, ? = help)
 * - Modifier keys (Ctrl, Cmd) reserved for OS-level actions
 * 
 * Reserved/Conflicting Shortcuts (DO NOT USE):
 * - Cmd+F / Ctrl+F: Browser find
 * - Cmd+S / Ctrl+S: Browser save
 * - Cmd+P / Ctrl+P: Browser print
 * - Cmd+A / Ctrl+A: Select all
 * - Cmd+C / Ctrl+C: Copy
 * - Cmd+V / Ctrl+V: Paste
 * - Cmd+Z / Ctrl+Z: Undo
 * - Cmd+Shift+Z / Ctrl+Y: Redo
 * - F11: Fullscreen
 * - F12: DevTools
 * - Alt+Left/Right: Browser back/forward
 */

export const KEYBOARD_SHORTCUTS = {
  // Navigation & Search
  FOCUS_SEARCH: {
    key: "/",
    description: "Focus search",
    category: "Navigation",
    mac: "/",
    windows: "/",
  },

  // Views (numbers 1-5)
  VIEW_MAGAZINE: {
    key: "1",
    description: "Magazine view",
    category: "Views",
    mac: "1",
    windows: "1",
  },
  VIEW_GRID: {
    key: "2",
    description: "Grid view",
    category: "Views",
    mac: "2",
    windows: "2",
  },
  VIEW_LIST: {
    key: "3",
    description: "List view",
    category: "Views",
    mac: "3",
    windows: "3",
  },
  VIEW_COMPACT: {
    key: "4",
    description: "Compact view",
    category: "Views",
    mac: "4",
    windows: "4",
  },
  VIEW_GROUPED: {
    key: "5",
    description: "Grouped view",
    category: "Views",
    mac: "5",
    windows: "5",
  },

  // Filters & Sidebar
  TOGGLE_FILTERS: {
    key: "f",
    description: "Toggle sidebar filters",
    category: "Filters",
    mac: "f",
    windows: "f",
  },

  // Dialogs & Escape
  CLOSE_DIALOG: {
    key: "Escape",
    description: "Clear search / Close dialogs",
    category: "Navigation",
    mac: "Esc",
    windows: "Esc",
  },

  // Help
  SHOW_HELP: {
    key: "?",
    description: "Show keyboard shortcuts",
    category: "Help",
    mac: "?",
    windows: "?",
  },
} as const;

/**
 * Get the appropriate keyboard shortcut for the current platform
 */
export function getPlatformShortcut(
  shortcutKey: keyof typeof KEYBOARD_SHORTCUTS
): string {
  const shortcut = KEYBOARD_SHORTCUTS[shortcutKey];
  
  if (typeof window === "undefined") {
    return shortcut.key;
  }

  const isMac = /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
  return isMac ? shortcut.mac : shortcut.windows;
}

/**
 * Get all shortcuts organized by category
 */
export function getShortcutsByCategory() {
  const categories = new Map<string, (typeof KEYBOARD_SHORTCUTS)[keyof typeof KEYBOARD_SHORTCUTS][]>();

  Object.values(KEYBOARD_SHORTCUTS).forEach((shortcut) => {
    if (!categories.has(shortcut.category)) {
      categories.set(shortcut.category, []);
    }
    categories.get(shortcut.category)?.push(shortcut);
  });

  return Array.from(categories.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

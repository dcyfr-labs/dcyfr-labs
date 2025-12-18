# Keyboard Shortcuts

## Overview

Keyboard shortcuts provide power users with quick navigation and control of the blog interface without needing to use the mouse.

## Available Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `/` | Focus Search | Jump directly to the search input to start typing |
| `1` | Compact View | Switch to compact list layout (default) |
| `2` | Grid View | Switch to grid layout with cards |
| `3` | Magazine View | Switch to magazine layout with large images |
| `4` | Masonry View | Switch to Pinterest-style masonry layout |
| `f` | Toggle Filters | Collapse/expand the sidebar filters |
| `Esc` | Clear Search | Clear the search query and show all posts |
| `?` | Show Help | Display the keyboard shortcuts help dialog |

## Implementation

### Architecture

```
BlogLayoutWrapper (SidebarContext)
  └─ BlogKeyboardProvider (KeyboardContext)
      ├─ useBlogKeyboardShortcuts (hook)
      ├─ KeyboardShortcutsHelp (dialog)
      └─ BlogSidebar (search input with ref)
```

### Components

**BlogKeyboardProvider** (`src/components/blog-keyboard-provider.tsx`)
- Context provider managing keyboard functionality
- Exposes `searchInputRef` and `toggleFilters` via context
- Manages help dialog state
- Wraps blog page content

**useBlogKeyboardShortcuts** (`src/hooks/use-blog-keyboard-shortcuts.ts`)
- Custom hook handling global keyboard events
- Detects when user is typing to avoid conflicts
- Uses Next.js router and searchParams for navigation
- Includes proper cleanup on unmount

**KeyboardShortcutsHelp** (`src/components/keyboard-shortcuts-help.tsx`)
- Dialog component displaying available shortcuts
- Grouped into sections: Navigation, Views, Filters, Help
- Uses shadcn/ui Dialog and Badge components

### Key Features

1. **Input Detection**: Shortcuts are disabled when user is typing in text fields, textareas, or content-editable elements
2. **Non-Intrusive**: Works alongside existing functionality without conflicts
3. **Accessible**: Help dialog accessible via `?` key
4. **Performance**: Proper event listener cleanup prevents memory leaks
5. **Type-Safe**: Full TypeScript support with strict types

## Usage

Shortcuts are automatically available on the `/blog` page. Press `?` to view the help dialog at any time.

### For Developers

To add a new keyboard shortcut:

1. Update `useBlogKeyboardShortcuts` hook with the new key handler
2. Add the shortcut to `KeyboardShortcutsHelp` component
3. Ensure the shortcut doesn't conflict with browser defaults
4. Test that it doesn't trigger when typing

Example:
```typescript
// In use-blog-keyboard-shortcuts.ts
case "n": // New shortcut
  if (!isTyping(e.target)) {
    e.preventDefault();
    // Your action here
  }
  break;
```

## Browser Compatibility

Keyboard shortcuts work in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Accessibility

- Shortcuts are discoverable via `?` help dialog
- All shortcuts use common conventions (/, Esc, ?)
- No conflicts with screen reader shortcuts
- Visual feedback provided for all actions

## Related

- [Blog Architecture](../blog/architecture-visual)
- Sidebar Filters
- View Layouts

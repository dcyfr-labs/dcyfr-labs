<!-- TLP:CLEAR -->

# Active Keyboard Shortcuts Inventory

**Date:** December 2024  
**Purpose:** Comprehensive list of all keyboard event listeners to prevent future conflicts  
**Status:** Current

---

## Summary

| Key(s) | Handler | File | Scope | Conflicts |
|--------|---------|------|-------|-----------|
| `/` | Search toggle | `unified-command.tsx` | Global (via useKeyboardShortcut) | ✅ None (duplicate removed) |
| `g` + key | Navigation | `use-navigation-shortcuts.ts` | Global | ✅ None |
| `?` | Help toggle | `use-blog-keyboard-shortcuts.ts` | Blog pages only | ✅ None |
| `f` | Sidebar toggle | `use-blog-keyboard-shortcuts.ts` | Blog pages only | ✅ None |
| `j` / `k` | Scroll navigation | `use-section-navigation.ts` | Long articles | ⚠️ Check for conflicts |
| Arrow keys | Modal navigation | `unified-command.tsx` | When modal open | ✅ None (preventDefault active) |
| `Escape` | Various close actions | Multiple files | Context-specific | ⚠️ Multiple handlers |

---

## Detailed Breakdown

### 1. Search Modal (`/`)

**File:** `src/components/app/unified-command.tsx`  
**Handler:** `useKeyboardShortcut`  
**Lines:** 117-123

```typescript
useKeyboardShortcut([
  {
    key: "/",
    callback: () => onOpenChange(!open),
    preventInInput: true,
    description: "Open unified command palette",
  },
]);
```

**Behavior:**
- ✅ Opens/closes search modal
- ✅ Blocked when typing in inputs
- ✅ No modifier keys required
- ✅ Single source of truth (duplicate removed from SearchProvider)

**Status:** ✅ No conflicts

---

### 2. Navigation Shortcuts (`g` + destination key)

**File:** `src/hooks/use-navigation-shortcuts.ts`  
**Handler:** Direct `window.addEventListener`  
**Lines:** 48-97

```typescript
// Handles two-key sequences:
// g h → Home
// g b → Blog  
// g w → Work
// g s → Sponsors
// g a → About
// g c → Contact
```

**Behavior:**
- ✅ Two-key sequence system
- ✅ 1-second timeout if second key not pressed
- ✅ Blocked when typing in inputs
- ✅ Blocked if ANY modifiers pressed
- ✅ Used via NavigationShortcutsProvider in app layout

**Status:** ✅ No conflicts (separate key from search, separate timing)

---

### 3. Blog Help (`?`)

**File:** `src/hooks/use-blog-keyboard-shortcuts.ts`  
**Handler:** Direct `window.addEventListener`  
**Lines:** 65-68

```typescript
if (e.key === "?" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
  e.preventDefault();
  onToggleHelp?.();
}
```

**Behavior:**
- ✅ Toggles keyboard shortcut help modal
- ✅ Blog pages only (hook only used in blog layout)
- ✅ Blocked when typing
- ✅ Blocked with modifiers

**Status:** ✅ No conflicts (blog-specific)

---

### 4. Blog Sidebar Toggle (`f`)

**File:** `src/hooks/use-blog-keyboard-shortcuts.ts`  
**Handler:** Direct `window.addEventListener`  
**Lines:** 72-77

```typescript
if (e.key === "f" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && onToggleSidebar) {
  e.preventDefault();
  onToggleSidebar();
}
```

**Behavior:**
- ✅ Toggles blog sidebar (table of contents)
- ✅ Blog pages only
- ✅ Blocked when typing
- ✅ Blocked with modifiers

**Status:** ✅ No conflicts (blog-specific)

---

### 5. Blog Search Focus (`Escape` in search input)

**File:** `src/hooks/use-blog-keyboard-shortcuts.ts`  
**Handler:** Direct `window.addEventListener`  
**Lines:** 89-92

```typescript
if (e.key === "Escape" && target === searchInputRef?.current) {
  e.preventDefault();
  searchInputRef.current?.blur();
}
```

**Behavior:**
- ✅ Blurs blog search input when Escape pressed
- ✅ Only when focus is in search input
- ✅ Blog pages only

**Status:** ⚠️ Check for conflicts with modal Escape handlers

---

### 6. Section Navigation (`j` / `k` keys)

**File:** `src/hooks/use-section-navigation.ts`  
**Handler:** Direct `window.addEventListener`  
**Lines:** 197

```typescript
window.addEventListener("keydown", handleKeyDown);
```

**Behavior:**
- Handles `j` (next section) and `k` (previous section)
- Used in long articles for vim-style navigation
- Should be blocked when typing in inputs

**Status:** ⚠️ Need to verify input blocking logic

---

### 7. Unified Command Modal - Escape Handler

**File:** `src/components/app/unified-command.tsx`  
**Handler:** Direct `document.addEventListener`  
**Lines:** 141-149

```typescript
useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  document.addEventListener("keydown", down);
  return () => document.removeEventListener("keydown", down);
}, [onOpenChange]);
```

**Behavior:**
- ✅ Closes modal when Escape pressed
- ✅ Always active (no input check needed - modal already handles input)

**Status:** ⚠️ Potential conflict with other Escape handlers

---

### 8. Unified Command Modal - Arrow Key Prevention

**File:** `src/components/app/unified-command.tsx`  
**Handler:** Direct `document.addEventListener`  
**Lines:** 154-165

```typescript
useEffect(() => {
  if (!open) return;

  const preventArrowScroll = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  };

  document.addEventListener("keydown", preventArrowScroll);
  return () => document.removeEventListener("keydown", preventArrowScroll);
}, [open]);
```

**Behavior:**
- ✅ Prevents page scroll when navigating modal with arrows
- ✅ Only active when modal is open
- ✅ Doesn't interfere with modal's internal arrow navigation

**Status:** ✅ No conflicts

---

### 9. Dropdown Escape Handler

**File:** `src/hooks/use-dropdown.ts`  
**Handler:** Direct `document.addEventListener`  
**Lines:** 177-187

```typescript
useEffect(() => {
  if (!open) return;

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, [open]);
```

**Behavior:**
- ✅ Closes dropdown when Escape pressed
- ✅ Only active when dropdown is open
- ✅ Multiple dropdowns can coexist (each manages own state)

**Status:** ⚠️ Potential conflict with modal Escape handlers if both open

---

### 10. Zoomable Image Escape Handler

**File:** `src/components/common/zoomable-image.tsx`  
**Handler:** Direct `document.addEventListener`  
**Lines:** 40-50

```typescript
useEffect(() => {
  if (!isZoomed) return;

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsZoomed(false);
    }
  };

  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, [isZoomed]);
```

**Behavior:**
- ✅ Closes zoomed image when Escape pressed
- ✅ Only active when image is zoomed

**Status:** ⚠️ Potential conflict with modal Escape handlers if both open

---

### 11. Activity Filters

**File:** `src/components/activity/ActivityFilters.tsx`  
**Handler:** Direct `window.addEventListener`  
**Lines:** 72

```typescript
window.addEventListener("keydown", handleKeyDown);
```

**Behavior:**
- Handles keyboard shortcuts for activity filtering
- Need to investigate exact keys handled

**Status:** ⚠️ Need to review implementation

---

## Potential Conflicts

### Escape Key (Multiple Handlers)

**Problem:** Multiple components listen for `Escape`:
1. Unified Command modal
2. Dropdown
3. Zoomable image
4. Blog search input blur

**Risk:** If multiple are open simultaneously, which one should close first?

**Current Behavior:** All listeners fire, all close simultaneously

**Recommendation:** 
- ✅ Current behavior is acceptable (user wants to exit ALL overlays)
- ⚠️ Consider event.stopPropagation() for z-index priority
- ⚠️ Or implement a "focus stack" to close top-most first

### Arrow Keys (Section Navigation vs Modal)

**Problem:** Both section navigation and command modal might use arrow keys

**Current Status:** 
- ✅ Modal has preventDefault when open
- ⚠️ Need to verify section navigation is blocked when modal open

**Recommendation:** Check use-section-navigation.ts for modal state awareness

---

## Recommendations

### 1. Standardize on useKeyboardShortcut Hook ✅

**Current:**
- ✅ UnifiedCommand uses hook
- ⚠️ Others use direct addEventListener

**Recommendation:** Migrate all global shortcuts to useKeyboardShortcut for consistency

### 2. Centralize Escape Handling ⚠️

**Current:** 5+ separate Escape listeners

**Recommendation:** Create a "modal/overlay stack" system:
```typescript
// useEscapeStack.ts
const EscapeStack = {
  handlers: [],
  push: (handler) => { /* add to stack */ },
  pop: () => { /* remove from stack */ },
  trigger: () => { /* call top handler only */ }
};
```

### 3. Document All Shortcuts in Config ⚠️

**Current:** `src/config/keyboard-shortcuts.ts` exists but isn't used by all

**Recommendation:** Require all shortcuts to be registered in config file

### 4. Add Conflict Detection ⚠️

**Recommendation:** Create a build-time validator:
```typescript
// scripts/validate-keyboard-shortcuts.ts
// - Parse all keyboard listeners
// - Detect duplicate key registrations
// - Warn about potential conflicts
```

---

## Testing Strategy

### Manual Tests
1. ✅ Press `/` → Search opens
2. ✅ Press `g h` → Navigate to home
3. ✅ Press `?` on blog → Help modal opens
4. ⚠️ Open modal, press Escape → Only modal closes
5. ⚠️ Zoom image, press Escape → Only image closes
6. ⚠️ Open dropdown, press Escape → Only dropdown closes
7. ⚠️ Open modal + zoom image, press Escape → Both close (expected? or top-most only?)

### Automated Tests
```typescript
describe('Keyboard shortcuts', () => {
  it('handles / key for search', () => { /* ... */ });
  it('handles g+h for navigation', () => { /* ... */ });
  it('prevents conflicts between shortcuts', () => { /* ... */ });
  it('blocks shortcuts when typing', () => { /* ... */ });
  it('handles Escape in correct priority order', () => { /* ... */ });
});
```

---

## Change Log

### December 2024
- ✅ Removed duplicate `/` listener from SearchProvider
- ✅ Created this inventory document
- ⚠️ Identified Escape key conflict risk
- ⚠️ Identified need for centralized shortcut system

---

**Status:** Inventory complete  
**Next Steps:** 
1. Review Escape handler priority
2. Test arrow key conflicts
3. Consider migrating to centralized system
4. Add automated conflict detection

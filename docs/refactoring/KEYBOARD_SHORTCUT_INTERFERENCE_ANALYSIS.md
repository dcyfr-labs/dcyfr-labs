# Keyboard Shortcut Interference Analysis

**Date:** December 2024  
**Issue:** `/` search shortcut requires Ctrl/Meta modifier to work, but blog navigation shortcuts (g+key) work without modifiers  
**Status:** Root cause identified

---

## Problem Statement

User reports that the `/` key to open the search modal fails unless Ctrl or Meta key are also pressed. However, blog navigation shortcuts (`g h`, `g b`, etc.) work correctly without any modifier keys.

---

## Active Keyboard Listeners

### 1. SearchProvider (`src/components/search/search-provider.tsx`)

**Lines 25-45:**
```typescript
useEffect(() => {
  const down = (e: KeyboardEvent) => {
    // Only listen for forward slash key
    if (e.key !== "/") return;

    // Don't trigger if typing in input/textarea
    if (
      e.target instanceof HTMLElement &&
      (e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.contentEditable === "true")
    ) {
      return;
    }

    e.preventDefault();
    setOpen((prevOpen) => !prevOpen);
  };

  document.addEventListener("keydown", down);
  return () => document.removeEventListener("keydown", down);
}, []);
```

**Behavior:**
- ✅ Direct, simple `/` key detection
- ✅ NO modifier key requirements
- ✅ Prevents default browser behavior
- ✅ Skips when typing in inputs
- ⚠️ Attached to `document` object

### 2. UnifiedCommand via useKeyboardShortcut (`src/components/app/unified-command.tsx`)

**Lines 117-123:**
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
- ⚠️ Goes through `useKeyboardShortcut` hook logic
- ⚠️ Has `preventInInput: true` (should block in inputs)
- ⚠️ NO `metaKey`, `ctrlKey`, `shiftKey`, or `altKey` specified
- ⚠️ Attached to `window` object (via hook)

### 3. Blog Navigation Shortcuts (`src/hooks/use-navigation-shortcuts.ts`)

**Lines 48-97:**
```typescript
const handleKeyDown = useCallback((event: KeyboardEvent) => {
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
    setTimeout(() => setPendingKey(null), 1000);
    return;
  }

  // Second key in sequence
  if (pendingKey === "g") {
    event.preventDefault();
    setPendingKey(null);
    
    const shortcuts = getKeyboardShortcuts();
    const shortcut = shortcuts.find(s => s.shortcut === `g ${key}`);
    
    if (shortcut) {
      onShortcut?.(shortcut.href, shortcut.label);
      router.push(shortcut.href);
    }
  }
}, [enabled, pendingKey, router, onShortcut]);
```

**Behavior:**
- ✅ Two-key sequence system (`g` + destination key)
- ✅ Explicitly BLOCKS if any modifiers are pressed (line 67)
- ✅ Simple, straightforward logic
- ✅ Works as expected
- ✅ Attached to `window` object

---

## Root Cause Analysis

### Issue #1: Duplicate `/` Key Listeners

**SearchProvider** and **UnifiedCommand** both listen for the `/` key:

```
User presses "/"
     │
     ├─→ SearchProvider.down() [document.addEventListener]
     │   ├─ Checks: e.key !== "/" → PASS
     │   ├─ Checks: typing in input? → PASS
     │   ├─ Calls: e.preventDefault()
     │   └─ Calls: setOpen(!open)
     │
     └─→ useKeyboardShortcut.handleKeyDown() [window.addEventListener]
         ├─ Checks: keyMatch → PASS
         ├─ Checks: hasRequiredMeta logic → ???
         ├─ Calls: event.preventDefault()
         └─ Calls: callback (onOpenChange)
```

**Both listeners call the same state setter** through different paths:
- SearchProvider → `setOpen()`
- UnifiedCommand → `onOpenChange()` → `setSearchProviderOpen()`

### Issue #2: useKeyboardShortcut Logic Bug

**File:** `src/hooks/use-keyboard-shortcut.ts`  
**Lines:** 75-78

```typescript
const hasRequiredMeta = shortcut.metaKey ? (event.metaKey || event.ctrlKey) : !event.metaKey && !event.ctrlKey;
const hasRequiredCtrl = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
const hasRequiredShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
const hasRequiredAlt = shortcut.altKey ? event.altKey : !event.altKey;
```

**Problem:** When modifiers are NOT required (undefined), the logic enforces that they must NOT be pressed.

For the `/` shortcut with no modifiers specified:
- `hasRequiredMeta = !event.metaKey && !event.ctrlKey`
- `hasRequiredCtrl = !event.ctrlKey`
- `hasRequiredShift = !event.shiftKey`
- `hasRequiredAlt = !event.altKey`

This means:
- Press `/` alone → All modifiers false → hasRequired* = true ✅ Should work
- Press `Ctrl + /` → Ctrl is true → hasRequiredMeta = false ❌ Blocked
- Press `Cmd + /` → Meta is true → hasRequiredMeta = false ❌ Blocked

**But wait...** this logic suggests `/` should work WITHOUT modifiers, which contradicts the user's report!

### Issue #3: Event Listener Attachment Order

Event listeners fire in the **order they were registered**:

1. **SearchProvider** mounts early (wraps entire app in layout.tsx)
2. **UnifiedCommand** mounts later (as a child component)

If SearchProvider's listener fires first and calls `e.preventDefault()`, it might prevent the UnifiedCommand listener from even seeing the event...

**NO, THAT'S WRONG:** `preventDefault()` doesn't stop event propagation. The event still bubbles/captures to all listeners.

### Issue #4: Both Listeners Calling preventDefault()

Both listeners call `preventDefault()`:
- SearchProvider: Line 39
- useKeyboardShortcut: Line 81

This should be fine - both can call it, only the first one matters.

### Issue #5: State Update Race Condition?

**SearchProvider's listener:**
```typescript
setOpen((prevOpen) => !prevOpen);  // Toggle
```

**UnifiedCommand's listener:**
```typescript
onOpenChange(!open)  // Toggle based on stale value
```

If both fire, they might:
1. SearchProvider toggles: closed → open
2. UnifiedCommand toggles: open → closed (using stale `open` value)
3. **Net result:** Modal stays closed!

This could explain why it appears broken!

---

## Why Blog Shortcuts Work

Blog navigation shortcuts (`g h`, `g b`, etc.) work correctly because:

1. **Single listener** - Only `useNavigationShortcuts` hook
2. **Explicit modifier blocking** - Line 67 returns early if modifiers pressed
3. **Simple logic** - No complex modifier matching
4. **Two-key sequence** - Less likely to conflict with browser shortcuts
5. **No duplicate handlers** - Only one path to execute

---

## Interference Patterns Discovered

### Pattern #1: Duplicate Event Listeners
**Where:** SearchProvider + UnifiedCommand both listen for `/`  
**Impact:** Two separate code paths toggle the same state  
**Risk:** Race conditions, state thrashing, unpredictable behavior

### Pattern #2: Inconsistent Hook Usage
**Where:** SearchProvider uses raw addEventListener, UnifiedCommand uses useKeyboardShortcut  
**Impact:** Different input blocking logic, different event attachment points  
**Risk:** Subtle behavioral differences, harder to maintain

### Pattern #3: State Update with Stale Values
**Where:** UnifiedCommand's callback uses `!open` instead of functional update  
**Impact:** Toggle based on stale state if component hasn't re-rendered  
**Risk:** Modal not opening/closing when expected

### Pattern #4: Mixed Event Targets
**Where:** SearchProvider uses `document`, useKeyboardShortcut uses `window`  
**Impact:** Different event flow (capture vs bubble phase)  
**Risk:** Unpredictable firing order

---

## Recommended Fixes

### Option 1: Remove Duplicate Listener (RECOMMENDED)

**Remove the `/` listener from SearchProvider entirely.**

The SearchProvider should ONLY manage state, not listen for keyboard events. Let UnifiedCommand handle ALL keyboard shortcuts through useKeyboardShortcut.

**Files to modify:**
1. `src/components/search/search-provider.tsx` - Remove lines 23-45 (useEffect with keyboard listener)

**Pros:**
- ✅ Single source of truth for `/` shortcut
- ✅ Consistent with blog navigation pattern
- ✅ No race conditions
- ✅ Easier to maintain

**Cons:**
- ⚠️ SearchProvider no longer self-contained
- ⚠️ Requires UnifiedCommand to be mounted

### Option 2: Fix useKeyboardShortcut Logic

**Fix the modifier key matching logic.**

Current:
```typescript
const hasRequiredMeta = shortcut.metaKey ? (event.metaKey || event.ctrlKey) : !event.metaKey && !event.ctrlKey;
```

Fixed:
```typescript
const hasRequiredMeta = shortcut.metaKey ? (event.metaKey || event.ctrlKey) : true;
```

When modifier is NOT required, just return `true` (don't care if pressed or not).

**Pros:**
- ✅ More flexible - allows shortcuts with or without modifiers
- ✅ Matches user expectations

**Cons:**
- ⚠️ Still have duplicate listeners
- ⚠️ Might conflict with browser shortcuts (e.g., Cmd+K)

### Option 3: Consolidate to Single Keyboard System

**Create a centralized keyboard shortcut manager.**

Similar to the keyboard-shortcuts.ts config, create a single registry that:
- Defines all shortcuts in one place
- Has single event listener
- Routes to appropriate handlers
- Prevents conflicts

**Pros:**
- ✅ Ultimate single source of truth
- ✅ Prevents all conflicts
- ✅ Easy to see all shortcuts at once

**Cons:**
- ⚠️ Significant refactoring required
- ⚠️ More complex architecture

---

## Testing Recommendations

After implementing fix:

### Manual Tests
1. Press `/` without modifiers → Should open search
2. Press `Cmd/Ctrl + /` → Should NOT open search (or should, depending on strategy)
3. Press `/` while typing in input → Should NOT open search
4. Press `g h` → Should navigate to home
5. Press `Ctrl + g`, then `h` → Should NOT navigate (modifiers block blog shortcuts)

### Automated Tests
```typescript
describe('Keyboard shortcuts', () => {
  it('opens search with / key', () => {
    fireEvent.keyDown(window, { key: '/' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not open search when typing in input', () => {
    const input = screen.getByRole('textbox');
    input.focus();
    fireEvent.keyDown(input, { key: '/' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('blog shortcuts work without modifiers', () => {
    fireEvent.keyDown(window, { key: 'g' });
    fireEvent.keyDown(window, { key: 'h' });
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('blog shortcuts blocked with modifiers', () => {
    fireEvent.keyDown(window, { key: 'g', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'h' });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
```

---

## Additional Interference Patterns to Check

### Other Potential Conflicts

1. **Section navigation** (`use-section-navigation.ts`) - Uses arrow keys
2. **Blog keyboard shortcuts** (`use-blog-keyboard-shortcuts.ts`) - Uses j/k keys
3. **Activity filters** (`ActivityFilters.tsx`) - Uses custom keydown handler
4. **Dropdown escape handler** (`use-dropdown.ts`) - Uses Escape key

### Search Strategy

```bash
# Find all keyboard event listeners
grep -r "addEventListener.*keydown" src/

# Find all keyboard shortcuts
grep -r "useKeyboardShortcut" src/

# Find all key handlers
grep -r "onKeyDown" src/
```

---

## Conclusion

**Root Cause:** Duplicate `/` key listeners in SearchProvider and UnifiedCommand create a race condition where both toggle the same state, resulting in unpredictable behavior.

**Primary Fix:** Remove the keyboard listener from SearchProvider (Option 1).

**Secondary Issue:** useKeyboardShortcut has overly restrictive modifier logic that should be simplified.

**Pattern for Future:** Use centralized keyboard shortcut system (useKeyboardShortcut hook) for ALL shortcuts, avoid ad-hoc addEventListener calls.

---

**Status:** Analysis complete, ready for implementation  
**Next Step:** Implement Option 1 (remove SearchProvider listener)  
**Files to modify:**
1. `src/components/search/search-provider.tsx`
2. Optional: `src/hooks/use-keyboard-shortcut.ts` (fix modifier logic)

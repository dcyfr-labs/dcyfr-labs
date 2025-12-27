# Keyboard Shortcuts Analysis & Unification Strategy

**Date:** December 27, 2025  
**Status:** Complete Analysis

---

## Executive Summary

The codebase has **7 distinct keyboard shortcut systems** with some conflicts and opportunities for consolidation. Current implementation spans:
- **Global shortcuts** (/ for search, ? for help, g for navigation, PageUp/PageDown for sections)
- **Blog-specific shortcuts** (f, 1-4 for layouts)
- **Component-level shortcuts** (Escape for modals/dropdowns, Enter for actions)
- **Search input shortcuts** (Cmd/Ctrl+K - NOW DEPRECATED in favor of /)

---

## Current Keyboard Shortcut Inventory

### 1. **Global Search & Command Palette** ✅
| Key | Action | Location | Status |
|-----|--------|----------|--------|
| `/` | Open search/command palette | UnifiedCommand, SearchProvider | ✅ **ACTIVE** |
| `Meta+K` / `Ctrl+K` | Focus search (legacy) | SearchInput.tsx | ⚠️ **DEPRECATED** - conflicts with / |

**File:** 
- `src/components/app/unified-command.tsx`
- `src/components/search/search-provider.tsx`
- `src/components/common/search/SearchInput.tsx`

**Issue:** SearchInput still listens for Meta+K, but global search uses `/`. This creates confusion.

---

### 2. **Help & Navigation** ✅
| Key | Action | Location | Scope |
|-----|--------|----------|-------|
| `?` | Show keyboard shortcuts help | KeyboardShortcutsHelp (global) | ✅ **ACTIVE** |
| `g` + Second key | GitHub-style navigation | Navigation shortcuts provider | ✅ **ACTIVE** |
| - `g h` | Home | use-navigation-shortcuts.ts | Fully implemented |
| - `g b` | Blog | use-navigation-shortcuts.ts | Fully implemented |
| - `g w` | Work | use-navigation-shortcuts.ts | Fully implemented |
| - `g s` | Sponsors | use-navigation-shortcuts.ts | Fully implemented |
| - `g a` | About | use-navigation-shortcuts.ts | Fully implemented |
| - `g c` | Contact | use-navigation-shortcuts.ts | Fully implemented |

**File:** `src/hooks/use-navigation-shortcuts.ts`

**Status:** ✅ No conflicts - two-key sequence prevents accidental triggers

---

### 3. **Section Navigation** ✅
| Key | Action | Location | Scope |
|-----|--------|----------|-------|
| `PageUp` | Previous section | use-section-navigation.ts | ✅ **ACTIVE** |
| `PageDown` | Next section | use-section-navigation.ts | ✅ **ACTIVE** |

**Files:**
- `src/hooks/use-section-navigation.ts`
- `src/components/common/section-navigator.tsx`

**Status:** ✅ No conflicts - native browser keys, rarely overridden

---

### 4. **Blog-Specific Shortcuts** ⚠️
| Key | Action | Location | Conflict Risk |
|-----|--------|----------|--------|
| `f` | Toggle sidebar | use-blog-keyboard-shortcuts.ts | ⚠️ Medium (browser find) |
| `1-4` | Layout switching | use-blog-keyboard-shortcuts.ts | ✅ Low |
| `/` | Focus search input | use-blog-keyboard-shortcuts.ts | 🔴 **HIGH** |
| `?` | Show help | use-blog-keyboard-shortcuts.ts | ✅ Low |
| `Escape` | Clear search | use-blog-keyboard-shortcuts.ts (search focused) | ✅ Low |

**File:** `src/hooks/use-blog-keyboard-shortcuts.ts`

**Issues:**
1. **🔴 CRITICAL CONFLICT:** Blog `/` tries to focus search, but global `/` opens command palette
2. **⚠️ Browser Find Conflict:** `f` conflicts with `Cmd+F/Ctrl+F` browser find (mitigated by modifier check)
3. Redundant with global search

---

### 5. **Component-Level Shortcuts** ✅
| Key | Action | Location | Scope |
|-----|--------|----------|-------|
| `Escape` | Close modal/dropdown | use-dropdown.ts | ✅ **SCOPED** |
| `Escape` | Close image zoom | zoomable-image.tsx | ✅ **SCOPED** |
| `Enter`/`Space` | Activate button | Multiple components | ✅ **SCOPED** |

**Status:** ✅ Properly scoped - only active within component context

---

### 6. **Specialized Component Shortcuts**
| Component | Key | Action | Scope |
|-----------|-----|--------|-------|
| Zoomable Image | `Escape` | Close zoom | Component-only |
| Table of Contents | `Enter` | Navigate to section | Component-only |
| Dev Tools Dropdown | `Enter`/`Space` | Activate | Component-only |
| Playground | `Enter` | Add todo | Component-only |

**Status:** ✅ All properly scoped

---

## Conflict Analysis

### 🔴 CRITICAL CONFLICTS

#### 1. **Forward Slash (/) - HIGHEST PRIORITY**
**Problem:** Two different handlers for the same key
- **Global:** `/` opens unified command palette
- **Blog:** `/` focuses search input

**Impact:** Blog page `/` is broken - opens command palette instead of focusing search

**Solution:** Unify to single `/` behavior globally

**Files Affected:**
- `src/hooks/use-blog-keyboard-shortcuts.ts` (line 64)
- `src/components/search/search-provider.tsx` (line 23)
- `src/components/app/unified-command.tsx` (line 119)

---

#### 2. **Meta+K / Ctrl+K - DEPRECATED CONFLICT**
**Problem:** SearchInput still listens for legacy Meta+K shortcut

**Impact:** Minor - just dead code since global search now uses `/`

**Solution:** Remove Meta+K handler from SearchInput

**File:** `src/components/common/search/SearchInput.tsx` (lines 91-103)

---

### ⚠️ MEDIUM CONFLICTS

#### 3. **Function Key (f) - Browser Find Conflict**
**Problem:** Blog sidebar toggle uses `f`, browser find is `Cmd+F/Ctrl+F`

**Impact:** Low - mitigated by modifier key checks in code

**Current Check:** 
```typescript
if (e.key === "f" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey)
```

**Status:** ✅ Safe - but could be clearer

---

### ✅ NO CONFLICTS

- `?` (help) - Two-key sequences and help context are unique
- `g + second key` - Two-key sequence prevents conflicts
- `PageUp/PageDown` - Native browser navigation keys, not commonly overridden
- Component-scoped keys - Properly contained to component context

---

## Unification Opportunities

### Priority 1: Fix `/` Conflict (URGENT)

**Current Issue:** Blog page breaks global `/` behavior

**Recommended Solution:**
- Remove `/` focus-search from blog keyboard shortcuts
- Keep `/` for global command palette only
- Users on blog page still get command palette via `/`
- Add alternative for blog search: could be done via:
  - Command palette search (now unified)
  - Visual search button (already exists)
  - Discuss with UX if dedicated blog search shortcut needed

**Changes Needed:**
```typescript
// In use-blog-keyboard-shortcuts.ts, REMOVE:
if (e.key === "/" && !isTyping && ...) {
  e.preventDefault();
  searchInputRef?.current?.focus();
}
```

**Files:** `src/hooks/use-blog-keyboard-shortcuts.ts`

---

### Priority 2: Remove Deprecated Meta+K (CLEANUP)

**Current Issue:** Dead code in SearchInput

**Recommended Solution:**
- Remove Meta+K keyboard listener from SearchInput
- Keep only the visual shortcut display (if needed)
- Actually, better: remove Meta+K hint display too since we're using `/` now

**Changes Needed:**
```typescript
// Remove entire Meta+K handler from SearchInput.tsx lines 91-103
```

**Files:** `src/components/common/search/SearchInput.tsx`

---

### Priority 3: Consolidate Blog Shortcuts (ENHANCEMENT)

**Current State:** Blog has many single-letter shortcuts

**Consideration:** Scope to blog-only OR move helpful ones to global?

**Options:**
1. **Keep as-is (blog-only)** - ✅ Works, but not discoverable
2. **Move to command palette** - If important, add as commands
3. **Create dedicated blog shortcuts hook** - Already done, good pattern

**Recommendation:** Keep blog shortcuts as scoped implementation, but:
- Document in help (? key works on blog)
- Consider adding most-used ones (1-4 layout) to command palette

---

## Recommended Shortcut Map (Unified)

### Global Shortcuts (All Pages)
```
/          → Open search & command palette
?          → Show keyboard shortcuts help
g + h      → Go Home
g + b      → Go Blog  
g + w      → Go Work
g + s      → Go Sponsors
g + a      → Go About
g + c      → Go Contact
PageUp     → Previous section
PageDown   → Next section
```

### Blog-Only Shortcuts (Blog Pages)
```
f          → Toggle sidebar
1          → Compact layout
2          → Grid layout
3          → List layout
4          → Magazine layout
Escape     → Clear search (when focused)
```

### Component-Level (Contextual)
```
Escape     → Close modals/dropdowns
Enter      → Confirm/activate
Space      → Activate buttons
```

---

## Testing Checklist

- [ ] `/` opens command palette on all pages (not just global)
- [ ] `/` on blog page opens command palette (not search focus)
- [ ] Blog layout shortcuts (1-4) still work
- [ ] Blog sidebar toggle (f) still works
- [ ] Section navigation (PageUp/Down) still works
- [ ] `?` shows help on all pages
- [ ] `g + key` navigation works across all pages
- [ ] No console errors for keyboard events
- [ ] E2E tests updated to use `/` instead of Meta+K

---

## Implementation Timeline

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 1 | Remove blog `/` handler | 5 min | Fixes critical conflict |
| 2 | Remove Meta+K from SearchInput | 5 min | Cleans up dead code |
| 3 | Update tests | 10 min | Ensures CI/CD passes |
| 4 | Update documentation | 15 min | User awareness |
| **Total** | | **35 min** | High |

---

## Documentation Updates Needed

1. **User-facing:**
   - Help modal (? key) - verify all shortcuts listed
   - Blog page help - document available shortcuts
   - Quick reference guide

2. **Developer:**
   - Architecture docs - keyboard shortcut system overview
   - Component patterns - how to add new shortcuts
   - Testing guide - how to test keyboard shortcuts

---

## Recommendations Summary

✅ **DO:**
- Remove blog `/` handler (conflicts with global)
- Remove SearchInput Meta+K handler (deprecated)
- Keep blog scoped shortcuts (f, 1-4, ?)
- Keep section navigation (PageUp/Down)
- Keep GitHub-style `g + key` navigation
- Keep `/` as global search/command palette

🚫 **DON'T:**
- Add more single-letter global shortcuts
- Use Meta+K anywhere (browser/OS reserved)
- Allow shortcuts that trigger without modifiers on main content keys

---

## Reference: Implementation Status

| System | Implementation | Status | Conflicts |
|--------|----------------|--------|-----------|
| Global Search (/) | UnifiedCommand + SearchProvider | ✅ Active | None (after fix) |
| Help (?) | KeyboardShortcutsHelp | ✅ Active | None |
| Navigation (g+key) | use-navigation-shortcuts | ✅ Active | None |
| Section Nav (PageUp/Down) | use-section-navigation | ✅ Active | None |
| Blog Shortcuts | use-blog-keyboard-shortcuts | ⚠️ Has conflicts | **/ conflict** |
| Component Shortcuts | Various | ✅ Active | None |
| Legacy Meta+K | SearchInput | ⚠️ Deprecated | Conflicts with / |

---

## Questions for Review

1. Should blog search have a dedicated shortcut, or is command palette enough?
2. Are blog layout shortcuts (1-4) important enough to add to command palette?
3. Should we document shortcuts in the UI more prominently?
4. Is `f` (sidebar toggle) commonly used enough to keep, or could it be command-palette-only?


<!-- TLP:CLEAR -->
# Unified Floating Node Mobile Navigation

**Status:** 📋 Backlog
**Priority:** P2 - High
**Complexity:** 🔴 Large (Multi-Phase)
**Created:** January 31, 2026
**Target:** Q1-Q2 2026

---

## Context

Currently, dcyfr-labs uses a **traditional dual-navigation approach** for mobile:

1. **BottomNav** - Fixed horizontal bar at bottom with 5 tabs (Activity, Bookmarks, Likes, Blog, Work)
2. **FAB Menus** - Multiple floating action buttons scattered across pages:
   - `FABMenu` - Expands to show TOC + Scroll-to-Top on blog posts
   - `FloatingFilterFab` - Opens filters on blog archive
   - Table of Contents FAB - Sheet trigger on mobile

**Problems with Current Approach:**

- ❌ **Traditional Design** - Looks like every other mobile site (horizontal bar + FABs)
- ❌ **Screen Space Waste** - 64px permanent bottom bar + multiple FABs (76px total)
- ❌ **Cluttered UX** - Multiple floating elements compete for attention
- ❌ **Not Context-Aware** - Same bottom bar regardless of page
- ❌ **Limited Scalability** - 5-item limit in bottom bar
- ❌ **Poor Discoverability** - FAB actions hidden until hover/tap
- ❌ **Safe Area Issues** - Complex positioning calculations (bottom-[76px], pb-[env(safe-area-inset-bottom)])

---

## Vision: Unified Floating Node System

**Core Concept:** A **single adaptive floating node** that morphs based on context, replacing all bottom bars and FABs.

### Design Philosophy

**Inspired by:**

- Arc Browser's "Command Bar" (minimal, context-aware)
- iOS Dynamic Island (expands for relevant actions)
- Notion's floating toolbar (contextual, non-intrusive)
- Superhuman's command palette (keyboard-first, adaptive)

**Key Principles:**

1. **Single Source of Truth** - One navigation element, not three
2. **Context-Aware** - Shows relevant actions per page type
3. **Space Efficient** - Collapses to minimal footprint when idle
4. **Delightful** - Smooth animations, feels native to our design
5. **Accessible** - Keyboard navigation, screen reader support
6. **Progressive** - Grows with user needs, not overwhelming

---

## Proposed Solution

### Architecture: Expandable Floating Node

**Default State (Collapsed):**

```
┌──────────┐
│  ⊙ (48px)│ <- Single circular node
└──────────┘
   Bottom-right corner
   16px from edges
   Above safe area
```

**Expanded State (Context-Dependent):**

```
Blog Post:
┌────────────────────┐
│  📄 TOC            │
│  ⚙️  Settings      │
│  ↑  Back to Top    │
│  🌙 Theme          │
│  ⊙  Menu (active)  │
└────────────────────┘

Blog Archive:
┌────────────────────┐
│  🔍 Search         │
│  🎚️  Filters       │
│  ⚙️  Settings      │
│  🌙 Theme          │
│  ⊙  Menu (active)  │
└────────────────────┘

Works Archive:
┌────────────────────┐
│  🔍 Search         │
│  📁 Categories     │
│  ⚙️  Settings      │
│  🌙 Theme          │
│  ⊙  Menu (active)  │
└────────────────────┘

Legal Pages:
┌────────────────────┐
│  📋 Related Docs   │
│  ↑  Back to Top    │
│  ⚙️  Settings      │
│  🌙 Theme          │
│  ⊙  Menu (active)  │
└────────────────────┘

Generic Pages:
┌────────────────────┐
│  🏠 Home           │
│  📝 Blog           │
│  💼 Works          │
│  ⚙️  Settings      │
│  🌙 Theme          │
│  ⊙  Menu (active)  │
└────────────────────┘
```

### Interaction Model

**Trigger Behaviors:**

- **Tap** - Expands node to show contextual menu
- **Long Press** - Opens quick actions (theme toggle, settings)
- **Swipe Up** - Expands with animation
- **Swipe Down** - Collapses menu
- **Tap Outside** - Closes menu
- **Scroll** - Auto-collapses after 3s inactivity

**Animation Flow:**

```
Collapsed → Tap → Expand (300ms spring) → Show Menu Items (stagger 50ms each)
Expanded → Tap Outside → Collapse (200ms ease-out) → Minimal Node
```

---

## Implementation Strategy

### Phase 1: Foundation & Context System (Week 1-2)

**Goal:** Build core expandable node component with context detection

#### 1.1 Context Detection System

Create a unified context detector that understands:

- Page type (blog post, blog archive, works archive, project, legal, generic)
- User state (scrolled, at top, reading progress)
- Available actions (TOC, filters, back-to-top, etc.)

```typescript
// src/lib/mobile-nav/context-detector.ts

export type MobileNavContext =
  | "blog-post"
  | "blog-archive"
  | "works-archive"
  | "work-project"
  | "legal-document"
  | "legal-archive"
  | "generic-page"
  | "homepage";

export interface NavAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  badge?: string | number;
  primary?: boolean; // Highlighted action
}

export interface NavContext {
  type: MobileNavContext;
  actions: NavAction[];
  primaryAction?: NavAction;
  metadata?: {
    scrollProgress?: number;
    readingProgress?: number;
    hasFilters?: boolean;
    hasTOC?: boolean;
  };
}

export function detectMobileNavContext(pathname: string): NavContext {
  // Blog post context
  if (pathname.startsWith("/blog/") && pathname !== "/blog") {
    return {
      type: "blog-post",
      actions: [
        { id: "toc", label: "Table of Contents", icon: List, onClick: openTOC },
        { id: "settings", label: "Settings", icon: Settings, onClick: openSettings },
        { id: "scroll-top", label: "Back to Top", icon: ChevronUp, onClick: scrollToTop },
        { id: "theme", label: "Theme", icon: Moon, onClick: toggleTheme },
      ],
      primaryAction: { id: "toc", ... }, // TOC is primary on blog posts
      metadata: { hasTOC: true },
    };
  }

  // Blog archive context
  if (pathname === "/blog") {
    return {
      type: "blog-archive",
      actions: [
        { id: "search", label: "Search", icon: Search, onClick: openSearch },
        { id: "filters", label: "Filters", icon: SlidersHorizontal, onClick: openFilters, badge: activeFilterCount },
        { id: "settings", label: "Settings", icon: Settings, onClick: openSettings },
        { id: "theme", label: "Theme", icon: Moon, onClick: toggleTheme },
      ],
      primaryAction: { id: "search", ... },
      metadata: { hasFilters: true },
    };
  }

  // Works archive context
  if (pathname === "/works") {
    return {
      type: "works-archive",
      actions: [
        { id: "search", label: "Search", icon: Search, onClick: openSearch },
        { id: "categories", label: "Categories", icon: Folder, onClick: openCategories },
        { id: "settings", label: "Settings", icon: Settings, onClick: openSettings },
        { id: "theme", label: "Theme", icon: Moon, onClick: toggleTheme },
      ],
    };
  }

  // Legal document context
  if (pathname.startsWith("/privacy") || pathname.startsWith("/terms") || pathname.startsWith("/cookies")) {
    return {
      type: "legal-document",
      actions: [
        { id: "related", label: "Related Documents", icon: FileText, onClick: openRelatedDocs },
        { id: "scroll-top", label: "Back to Top", icon: ChevronUp, onClick: scrollToTop },
        { id: "settings", label: "Settings", icon: Settings, onClick: openSettings },
        { id: "theme", label: "Theme", icon: Moon, onClick: toggleTheme },
      ],
    };
  }

  // Generic page fallback
  return {
    type: "generic-page",
    actions: [
      { id: "home", label: "Home", icon: Home, onClick: () => router.push("/") },
      { id: "blog", label: "Blog", icon: BookOpen, onClick: () => router.push("/blog") },
      { id: "works", label: "Works", icon: Briefcase, onClick: () => router.push("/works") },
      { id: "settings", label: "Settings", icon: Settings, onClick: openSettings },
      { id: "theme", label: "Theme", icon: Moon, onClick: toggleTheme },
    ],
  };
}
```

#### 1.2 Base Floating Node Component

Create the expandable UI component:

```tsx
// src/components/navigation/unified-floating-node.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ANIMATION, SPACING } from '@/lib/design-tokens';
import { detectMobileNavContext } from '@/lib/mobile-nav/context-detector';
import type { NavAction, NavContext } from '@/lib/mobile-nav/context-detector';

export function UnifiedFloatingNode() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [context, setContext] = useState<NavContext | null>(null);

  // Detect context on pathname change
  useEffect(() => {
    const newContext = detectMobileNavContext(pathname);
    setContext(newContext);
  }, [pathname]);

  // Auto-collapse after inactivity
  useEffect(() => {
    if (!isExpanded) return;

    const timeout = setTimeout(() => {
      setIsExpanded(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isExpanded]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!context) return null;

  return (
    <div
      className={cn(
        'md:hidden fixed z-50',
        // Position: bottom-right with safe area
        'bottom-4 right-4',
        'pb-[env(safe-area-inset-bottom,0px)]',
        'pr-[env(safe-area-inset-right,0px)]'
      )}
    >
      {/* Backdrop blur overlay when expanded */}
      {isExpanded && (
        <div
          className={cn(
            'fixed inset-0 -z-10',
            'bg-background/80 backdrop-blur-sm',
            ANIMATION.fadeIn
          )}
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div className="relative">
        {/* Expanded Menu */}
        {isExpanded && (
          <div
            className={cn(
              'absolute bottom-16 right-0',
              'w-56 p-2',
              'bg-card border rounded-2xl shadow-2xl',
              'backdrop-blur-xl',
              ANIMATION.slideInFromBottom,
              'origin-bottom-right'
            )}
          >
            {/* Menu Items */}
            <nav aria-label="Mobile quick actions" className="space-y-1">
              {context.actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.onClick();
                      setIsExpanded(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                      'text-left text-sm font-medium',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      ANIMATION.transition.base,
                      action.primary && 'bg-primary/10 text-primary'
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{action.label}</span>
                    {action.badge && (
                      <span className="px-2 py-0.5 text-xs bg-accent rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Floating Node Button */}
        <button
          onClick={toggleExpanded}
          className={cn(
            'h-12 w-12 rounded-full',
            'bg-primary text-primary-foreground',
            'shadow-lg hover:shadow-xl',
            'flex items-center justify-center',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            ANIMATION.transition.base,
            'active:scale-95',
            isExpanded && 'bg-accent text-accent-foreground'
          )}
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
```

**Deliverables:**

- Context detection system
- Base floating node component
- Expandable menu UI
- Smooth animations

**Acceptance Criteria:**

- [ ] Detects all 7+ page contexts
- [ ] Expands/collapses smoothly (300ms)
- [ ] Auto-collapses after 3s inactivity
- [ ] Accessible (keyboard, screen reader)
- [ ] Mobile-only (hidden on ≥md)

---

### Phase 2: Page-Specific Actions (Week 3)

**Goal:** Implement context-specific actions for each page type

#### 2.1 Blog Post Actions

**Actions:**

1. **Table of Contents** - Opens TOC sheet
2. **Settings** - Accessibility settings (font size, reading mode, etc.)
3. **Back to Top** - Smooth scroll to top
4. **Theme Toggle** - Light/dark mode

**Integration:**

```tsx
// Replace current FABMenu with UnifiedFloatingNode actions
// Remove: src/components/navigation/fab-menu.tsx
// Update: src/components/blog/blog-post-client.tsx
```

#### 2.2 Blog Archive Actions

**Actions:**

1. **Search** - Opens unified command palette
2. **Filters** - Opens filter sheet (replaces FloatingFilterFab)
3. **Settings** - Global settings
4. **Theme Toggle** - Light/dark mode

**Integration:**

```tsx
// Remove: src/components/blog/filters/floating-filter-fab.tsx
// Update: src/components/blog/dynamic-blog-content.tsx
```

#### 2.3 Works Archive Actions

**Actions:**

1. **Search** - Opens unified command palette
2. **Categories** - Filter by project category
3. **Settings** - Global settings
4. **Theme Toggle** - Light/dark mode

#### 2.4 Legal Document Actions

**Actions:**

1. **Related Documents** - Quick links to other legal pages
2. **Back to Top** - Smooth scroll to top
3. **Settings** - Accessibility settings
4. **Theme Toggle** - Light/dark mode

**Deliverables:**

- All page-specific action implementations
- Remove redundant FAB components
- Integration with existing sheets/dialogs

**Acceptance Criteria:**

- [ ] All 7 contexts have relevant actions
- [ ] Actions integrate with existing features
- [ ] No duplicate FABs or bottom bars
- [ ] Tests cover all action types

---

### Phase 3: Replace BottomNav (Week 4)

**Goal:** Gradually migrate BottomNav functionality to floating node

#### Current BottomNav Items

```typescript
NAVIGATION.bottom = [
  { label: 'Activity', href: '/activity', icon: Activity },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { label: 'Likes', href: '/activity?tab=likes', icon: Heart },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'Work', href: '/works', icon: Briefcase },
];
```

#### Migration Strategy

**Option A: Primary Action + Overflow Menu**

Primary action in node, rest in "More" submenu:

```
Collapsed Node → Tap → Expand
  ├─ [Context Actions] (3-4 items)
  ├─ More Navigation
  │   ├─ Activity
  │   ├─ Bookmarks
  │   ├─ Likes
  │   ├─ Blog
  │   └─ Works
  └─ Settings/Theme
```

**Option B: Swipe Gestures**

- **Swipe Up** - Expand context menu
- **Swipe Left** - Quick navigation menu
- **Swipe Right** - Settings menu

**Option C: Long Press Context Menu**

- **Tap** - Context actions
- **Long Press** - Navigation shortcuts

**Recommended:** Option A (clearest, most discoverable)

#### Implementation

```tsx
// Add navigation submenu to UnifiedFloatingNode
{context.actions.map(...)}

{/* Navigation Submenu */}
<div className="border-t pt-2 mt-2">
  <button onClick={() => setShowNav(!showNav)}>
    More Navigation
  </button>
  {showNav && (
    <div className="space-y-1">
      {NAVIGATION.bottom.map(item => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </div>
  )}
</div>
```

**Deliverables:**

- Navigation submenu in floating node
- Remove BottomNav component
- Update layout to remove bottom padding

**Acceptance Criteria:**

- [ ] All 5 bottom nav items accessible
- [ ] No visual regression in page layouts
- [ ] Screen real estate reclaimed (64px)
- [ ] Tests pass without BottomNav

---

### Phase 4: Advanced Interactions (Week 5)

**Goal:** Add delightful micro-interactions and gestures

#### 4.1 Gesture Support

```tsx
// src/hooks/use-swipe-gesture.ts

export function useSwipeGesture(handlers: SwipeHandlers) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;

    // Detect swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 50) handlers.onSwipeLeft?.();
      if (diffX < -50) handlers.onSwipeRight?.();
    } else {
      // Vertical swipe
      if (diffY > 50) handlers.onSwipeUp?.();
      if (diffY < -50) handlers.onSwipeDown?.();
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
```

#### 4.2 Haptic Feedback (iOS)

```tsx
// Vibrate on expand/collapse
if (navigator.vibrate) {
  navigator.vibrate(10); // 10ms subtle vibration
}
```

#### 4.3 Spring Animations

```tsx
// Use Framer Motion for spring physics
import { motion, useSpring } from 'framer-motion';

<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0, opacity: 0 }}
  transition={{
    type: 'spring',
    stiffness: 500,
    damping: 30,
  }}
>
  {/* Menu items */}
</motion.div>;
```

**Deliverables:**

- Swipe gesture support
- Haptic feedback integration
- Spring animations
- Enhanced micro-interactions

**Acceptance Criteria:**

- [ ] Swipe gestures work smoothly
- [ ] Haptic feedback on iOS devices
- [ ] Animations feel natural (60fps)
- [ ] Reduced motion respected

---

### Phase 5: Accessibility & Polish (Week 6)

**Goal:** Ensure WCAG 2.1 AA compliance and polish UX

#### 5.1 Keyboard Navigation

```tsx
// Add keyboard shortcuts
useKeyboardShortcut([
  {
    key: 'm',
    callback: toggleExpanded,
    description: 'Toggle mobile menu',
    preventInInput: true,
  },
  {
    key: 'Escape',
    callback: () => setIsExpanded(false),
    description: 'Close mobile menu',
  },
]);

// Arrow key navigation in menu
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    // Focus next item
  } else if (e.key === 'ArrowUp') {
    // Focus previous item
  } else if (e.key === 'Enter') {
    // Activate focused item
  }
};
```

#### 5.2 Screen Reader Support

```tsx
<div role="navigation" aria-label="Mobile quick actions">
  <button aria-label="Toggle menu" aria-expanded={isExpanded} aria-controls="mobile-menu">
    Menu
  </button>

  <div id="mobile-menu" role="menu" aria-hidden={!isExpanded}>
    {actions.map((action) => (
      <button key={action.id} role="menuitem" tabIndex={isExpanded ? 0 : -1}>
        {action.label}
      </button>
    ))}
  </div>
</div>
```

#### 5.3 Focus Management

```tsx
// Trap focus in expanded menu
import { useFocusTrap } from '@/hooks/use-focus-trap';

const menuRef = useRef<HTMLDivElement>(null);
useFocusTrap(menuRef, isExpanded);

// Return focus to trigger button on close
useEffect(() => {
  if (!isExpanded && previousFocus) {
    previousFocus.focus();
  }
}, [isExpanded]);
```

#### 5.4 Visual Polish

- **Badge animations** - Subtle pulse for active filters
- **Primary action highlight** - Visual emphasis on most-used action
- **Context transitions** - Smooth menu morphing between page types
- **Loading states** - Skeleton while detecting context

**Deliverables:**

- Full keyboard navigation
- Screen reader support
- Focus trap and management
- Visual polish and animations

**Acceptance Criteria:**

- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus trap active when expanded
- [ ] Reduced motion preference respected

---

### Phase 6: Testing & Migration (Week 7)

**Goal:** Comprehensive testing and gradual rollout

#### 6.1 Unit Tests

```typescript
// src/__tests__/components/navigation/unified-floating-node.test.tsx

describe("UnifiedFloatingNode", () => {
  it("detects blog post context correctly", () => {
    render(<UnifiedFloatingNode />, { pathname: "/blog/test-post" });
    // Assertions
  });

  it("shows TOC action on blog posts", () => {
    // ...
  });

  it("shows filters action on blog archive", () => {
    // ...
  });

  it("expands on tap", async () => {
    const { getByLabelText } = render(<UnifiedFloatingNode />);
    await userEvent.click(getByLabelText("Open menu"));
    expect(screen.getByRole("menu")).toBeVisible();
  });

  it("collapses after 3s inactivity", async () => {
    jest.useFakeTimers();
    // ...
    jest.advanceTimersByTime(3000);
    expect(screen.queryByRole("menu")).not.toBeVisible();
  });
});
```

#### 6.2 E2E Tests

```typescript
// e2e/unified-floating-node.spec.ts

test.describe('Unified Floating Node', () => {
  test('shows context-appropriate actions on blog post', async ({ page }) => {
    await page.goto('/blog/test-post');
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile

    const node = page.getByLabel('Open menu');
    await node.click();

    await expect(page.getByText('Table of Contents')).toBeVisible();
    await expect(page.getByText('Back to Top')).toBeVisible();
  });

  test('shows filters action on blog archive', async ({ page }) => {
    await page.goto('/blog');
    await page.setViewportSize({ width: 375, height: 667 });

    const node = page.getByLabel('Open menu');
    await node.click();

    await expect(page.getByText('Filters')).toBeVisible();
  });

  test('respects safe area insets', async ({ page }) => {
    // iOS device with notch
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const node = page.getByLabel('Open menu');
    const box = await node.boundingBox();

    // Should have safe area padding
    expect(box?.y).toBeGreaterThan(700); // Not at very bottom
  });
});
```

#### 6.3 Migration Checklist

**Remove Old Components:**

- [ ] `src/components/navigation/bottom-nav.tsx`
- [ ] `src/components/navigation/fab-menu.tsx`
- [ ] `src/components/blog/filters/floating-filter-fab.tsx`

**Update Layouts:**

- [ ] Remove `NAVIGATION_HEIGHT` bottom padding
- [ ] Update `SPACING.safeBottom` calculations
- [ ] Remove BottomNav from layout.tsx

**Update Tests:**

- [ ] Remove BottomNav tests
- [ ] Remove FABMenu tests
- [ ] Remove FloatingFilterFab tests
- [ ] Add UnifiedFloatingNode tests

**Update Documentation:**

- [ ] Update navigation-system.md
- [ ] Update design-tokens.md (spacing)
- [ ] Create unified-floating-node.md guide

**Deliverables:**

- Full test suite (≥90% coverage)
- Migration complete
- Old components removed
- Documentation updated

**Acceptance Criteria:**

- [ ] All tests passing (≥99%)
- [ ] No visual regressions
- [ ] Documentation complete
- [ ] Analytics tracking added

---

## Design System Updates

### New Design Tokens

```typescript
// src/lib/design-tokens.ts

export const FLOATING_NODE = {
  /** Base node size (collapsed state) */
  size: {
    collapsed: 'h-12 w-12',
    expanded: 'w-56', // Menu width
  },

  /** Positioning */
  position: {
    bottom: 'bottom-4',
    right: 'right-4',
    zIndex: 'z-50',
  },

  /** Safe area adjustments */
  safeArea: {
    bottom: 'pb-[env(safe-area-inset-bottom,0px)]',
    right: 'pr-[env(safe-area-inset-right,0px)]',
  },

  /** Animation durations */
  animation: {
    expand: 'duration-300',
    collapse: 'duration-200',
    itemStagger: '50ms', // Per item delay
  },

  /** Menu styling */
  menu: {
    background: 'bg-card border rounded-2xl shadow-2xl backdrop-blur-xl',
    padding: 'p-2',
    gap: 'space-y-1',
  },

  /** Action button styling */
  action: {
    base: 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium',
    hover: 'hover:bg-accent hover:text-accent-foreground',
    primary: 'bg-primary/10 text-primary',
  },
};

// Remove old tokens
// ❌ DELETE: NAVIGATION_HEIGHT (64px bottom bar)
// ❌ DELETE: SPACING.safeBottom mobile bottom padding adjustments
```

### Spacing Reclamation

**Before:**

- BottomNav: 64px
- FAB spacing: 12px (76px total from bottom)
- Safe area: +env(safe-area-inset-bottom)
- **Total:** ~80-100px of vertical space lost

**After:**

- Floating node: 48px (collapsed)
- Safe area: +env(safe-area-inset-bottom)
- **Total:** ~52-60px of vertical space
- **Reclaimed:** 20-40px per page

---

## User Experience Benefits

### Before vs After Comparison

| Aspect                | Before (BottomNav + FABs) | After (Unified Node)  |
| --------------------- | ------------------------- | --------------------- |
| **Screen Space**      | 64px + 12px = 76px        | 48px + safe area      |
| **Visual Clutter**    | 3 separate UI elements    | 1 unified element     |
| **Context Awareness** | Generic 5-tab bar         | Page-specific actions |
| **Discoverability**   | FAB actions hidden        | All actions in menu   |
| **Scalability**       | Max 5 bottom items        | Unlimited menu items  |
| **Design Uniqueness** | Traditional mobile nav    | Custom floating node  |
| **Animation Quality** | Basic transitions         | Spring physics        |

### User Journey Improvements

**Scenario 1: Reading Blog Post**

**Before:**

1. Scroll down → FABMenu appears (TOC + Scroll-to-Top)
2. Tap FABMenu → Expands to 2 buttons
3. Tap TOC → Opens TOC sheet
4. Want to change theme → Must find hamburger menu → Open drawer → Find theme toggle

**After:**

1. Scroll down → Floating node visible
2. Tap node → Expand to menu (TOC, Settings, Back-to-Top, Theme)
3. Tap TOC → Opens TOC sheet
4. Want to change theme → Already in menu, one tap away

**Improvement:** 2 fewer taps for common actions

**Scenario 2: Browsing Blog Archive**

**Before:**

1. See FloatingFilterFab (bottom-right)
2. Tap → Opens filter sheet
3. Want to search → Press / key or find hamburger menu

**After:**

1. Tap floating node → Expand menu
2. See Search + Filters together
3. One tap to either action

**Improvement:** Unified access to related actions

---

## Technical Specifications

### Component API

```typescript
// src/components/navigation/unified-floating-node.tsx

export interface UnifiedFloatingNodeProps {
  /** Optional: Override automatic context detection */
  context?: NavContext;
  /** Optional: Additional custom actions */
  additionalActions?: NavAction[];
  /** Optional: Hide node on specific pages */
  hideOnPaths?: string[];
  /** Optional: Callback when menu opens/closes */
  onOpenChange?: (open: boolean) => void;
}

export function UnifiedFloatingNode(props?: UnifiedFloatingNodeProps) {
  // Implementation
}
```

### Context Detection Logic

```typescript
// Priority order:
// 1. Props override (if provided)
// 2. Pathname-based detection
// 3. Scroll state (e.g., show back-to-top if scrolled)
// 4. User preferences (stored in localStorage)
// 5. Default fallback

function detectContext(pathname: string, scrollY: number): NavContext {
  // Check for specific patterns first (most specific to least specific)
  if (pathname.startsWith('/blog/') && pathname !== '/blog') {
    return blogPostContext;
  } else if (pathname === '/blog') {
    return blogArchiveContext;
  } else if (pathname === '/works') {
    return worksArchiveContext;
  } else if (pathname.startsWith('/works/')) {
    return workProjectContext;
  } else if (isLegalPage(pathname)) {
    return legalDocumentContext;
  } else {
    return genericPageContext;
  }
}
```

### Performance Optimizations

**Lazy Loading:**

```tsx
// Lazy load context-specific sheets/dialogs
const TOCSheet = lazy(() => import('@/components/common/table-of-contents-sheet'));
const FilterSheet = lazy(() => import('@/components/blog/filter-sheet'));
```

**Memoization:**

```tsx
const context = useMemo(() => detectMobileNavContext(pathname), [pathname]);

const actions = useMemo(
  () =>
    context.actions.map((action) => ({
      ...action,
      onClick: () => {
        action.onClick();
        setIsExpanded(false);
      },
    })),
  [context]
);
```

**Animation Optimization:**

```tsx
// Use CSS animations instead of JS-heavy libraries
// Only use Framer Motion for complex gestures
const prefersReducedMotion = useReducedMotion();

<div className={cn(
  !prefersReducedMotion && "animate-slide-in-from-bottom"
)}>
```

---

## Analytics & Tracking

### Event Tracking

```typescript
// Track menu interactions
analytics.track('mobile_nav_expanded', {
  context: context.type,
  timestamp: Date.now(),
  pathname: pathname,
});

analytics.track('mobile_nav_action_clicked', {
  context: context.type,
  action: action.id,
  actionLabel: action.label,
  isPrimaryAction: action.primary,
  pathname: pathname,
});

analytics.track('mobile_nav_collapsed', {
  context: context.type,
  method: 'auto' | 'tap-outside' | 'swipe-down',
  timeOpen: duration,
});
```

### Success Metrics

| Metric                      | Baseline (BottomNav)  | Target (Unified Node)       |
| --------------------------- | --------------------- | --------------------------- |
| **Engagement Rate**         | 15% (bottom nav taps) | 25% (node interactions)     |
| **Action Discovery**        | 3 avg actions found   | 5 avg actions found         |
| **Time to Action**          | 2.5 taps average      | 1.8 taps average            |
| **User Satisfaction**       | Baseline NPS          | +10 NPS                     |
| **Screen Space Efficiency** | 76px used             | 48px used (37% improvement) |

---

## Accessibility Compliance

### WCAG 2.1 AA Requirements

**1.4.3 Contrast (Minimum):**

- [ ] Text and icons have ≥4.5:1 contrast ratio
- [ ] Badge colors meet contrast requirements

**2.1.1 Keyboard:**

- [ ] All actions accessible via keyboard
- [ ] Logical tab order maintained
- [ ] No keyboard traps

**2.4.3 Focus Order:**

- [ ] Focus moves logically through menu items
- [ ] Returns to trigger button on close

**2.5.5 Target Size:**

- [ ] Collapsed node ≥48x48px (exceeds 44px minimum)
- [ ] Expanded actions ≥48px height
- [ ] Adequate spacing between items (8px minimum)

**4.1.2 Name, Role, Value:**

- [ ] Buttons have accessible names
- [ ] ARIA expanded state communicated
- [ ] Menu role properly assigned

### Screen Reader Testing

**VoiceOver (iOS):**

```
User taps floating node:
"Menu button, collapsed. Double tap to expand."

User double taps:
"Menu expanded. Table of Contents button. 1 of 4."

User swipes right:
"Settings button. 2 of 4."
```

**TalkBack (Android):**

```
User explores node:
"Menu, button. Double tap to activate."

User activates:
"Menu expanded. List with 4 items."

User swipes right:
"Table of Contents, button. 1 of 4."
```

---

## Migration Path & Rollout

### Phase 1: Feature Flag (Week 7)

Deploy behind feature flag for internal testing:

```typescript
// src/lib/feature-flags.ts
export const FEATURE_FLAGS = {
  UNIFIED_FLOATING_NODE: process.env.NEXT_PUBLIC_ENABLE_UNIFIED_NAV === "true",
};

// In layout.tsx
{FEATURE_FLAGS.UNIFIED_FLOATING_NODE ? (
  <UnifiedFloatingNode />
) : (
  <>
    <BottomNav />
    <FABMenu />
  </>
)}
```

**Internal Testing Checklist:**

- [ ] Test on iOS Safari (iPhone 12, 13, 14, 15)
- [ ] Test on Android Chrome (various devices)
- [ ] Test on iPad (tablet view)
- [ ] Test with screen readers (VoiceOver, TalkBack)
- [ ] Test with reduced motion preference
- [ ] Test all page contexts (7+ types)

### Phase 2: Beta Rollout (Week 8)

Deploy to 10% of mobile users:

```typescript
// A/B test configuration
const shouldShowUnifiedNav = () => {
  const userId = getUserId();
  return hashUserId(userId) % 100 < 10; // 10% rollout
};
```

**Monitor Metrics:**

- Engagement rate (tap events)
- Error rate (console errors, Sentry)
- Performance (Core Web Vitals)
- User feedback (feedback widget)

### Phase 3: Full Rollout (Week 9)

If beta successful (no regressions, positive feedback):

- Deploy to 100% of mobile users
- Remove old components permanently
- Update all documentation

### Phase 4: Deprecation (Week 10)

- Remove BottomNav component
- Remove FABMenu component
- Remove FloatingFilterFab component
- Clean up feature flags
- Archive old E2E tests

---

## Risks & Mitigations

### Risk: User Confusion with New Pattern

**Impact:** High
**Likelihood:** Medium

**Mitigation:**

- Add onboarding tooltip on first visit
- Include "What's New" announcement
- Provide feedback mechanism
- Monitor user feedback closely
- A/B test before full rollout

### Risk: Accessibility Regressions

**Impact:** Critical
**Likelihood:** Low

**Mitigation:**

- Comprehensive accessibility audit
- Screen reader testing (iOS, Android)
- Keyboard navigation testing
- WCAG 2.1 AA compliance checklist
- External accessibility review

### Risk: Performance Issues on Low-End Devices

**Impact:** Medium
**Likelihood:** Low

**Mitigation:**

- Test on low-end Android devices
- Optimize animations (CSS over JS)
- Lazy load context-specific components
- Use reduced motion preference
- Monitor Core Web Vitals

### Risk: Gesture Conflicts with Browser Navigation

**Impact:** Medium
**Likelihood:** Medium

**Mitigation:**

- Use non-standard gestures (e.g., not edge swipes)
- Provide alternative tap interactions
- Make swipes optional, not required
- Test on various browsers/devices

---

## Success Criteria

### Functional Requirements

- [ ] Floating node visible on all mobile pages (<768px)
- [ ] Context detection works for all 7+ page types
- [ ] All actions trigger correct behaviors
- [ ] Menu expands/collapses smoothly
- [ ] Auto-collapses after 3s inactivity
- [ ] No conflicts with existing UI elements

### Quality Requirements

- [ ] ≥99% test pass rate maintained
- [ ] 0 ESLint errors
- [ ] Design token compliance ≥90%
- [ ] WCAG 2.1 AA compliant
- [ ] Core Web Vitals maintained (LCP <2.5s, CLS <0.1)

### User Experience

- [ ] Engagement rate +10% vs BottomNav
- [ ] Time to action reduced by 30%
- [ ] User satisfaction (NPS) +10 points
- [ ] <5% negative feedback rate
- [ ] 37% vertical space reclaimed

### Performance

- [ ] Expand animation 60fps
- [ ] Context detection <50ms
- [ ] No jank on scroll
- [ ] Works on low-end devices (tested)

---

## Documentation Updates

### Required Updates

- [ ] `docs/architecture/navigation-system.md` - Remove BottomNav, add UnifiedFloatingNode
- [ ] `docs/components/unified-floating-node.md` - New component guide
- [ ] `docs/ai/component-patterns.md` - Update mobile navigation patterns
- [ ] `src/lib/design-tokens.ts` - Update spacing tokens
- [ ] `README.md` - Update features list

### New Documentation

- [ ] `docs/features/UNIFIED_FLOATING_NODE.md` - Complete feature guide
- [ ] `docs/mobile/GESTURE_PATTERNS.md` - Swipe gesture documentation
- [ ] `docs/accessibility/MOBILE_NAV_A11Y.md` - Accessibility audit report

---

## Timeline & Effort Estimate

| Phase                           | Duration     | Effort (hours) | Team                    |
| ------------------------------- | ------------ | -------------- | ----------------------- |
| Phase 1: Foundation & Context   | 2 weeks      | 40             | 1 frontend dev          |
| Phase 2: Page-Specific Actions  | 1 week       | 20             | 1 frontend dev          |
| Phase 3: Replace BottomNav      | 1 week       | 24             | 1 frontend dev          |
| Phase 4: Advanced Interactions  | 1 week       | 20             | 1 frontend dev          |
| Phase 5: Accessibility & Polish | 1 week       | 20             | 1 frontend dev          |
| Phase 6: Testing & Migration    | 1 week       | 24             | 1 frontend dev + QA     |
| Phase 7: Feature Flag Testing   | 1 week       | 16             | Team                    |
| Phase 8-10: Rollout & Cleanup   | 3 weeks      | 24             | Team                    |
| **Total**                       | **11 weeks** | **188 hours**  | **1 frontend dev + QA** |

**Recommended approach:** Iterative development with weekly preview deploys for internal testing.

---

## Out of Scope

- Desktop navigation changes (desktop keeps existing nav)
- Tablet-specific optimizations (use desktop nav)
- AI-powered action suggestions (future enhancement)
- Voice-activated menu control (future enhancement)
- Customizable action layouts (future enhancement)

---

## Follow-Up Enhancements

After completion, consider:

- [ ] User-customizable action order
- [ ] Smart action suggestions (ML-based)
- [ ] Voice control integration
- [ ] Tablet-optimized variant
- [ ] Widget-style collapsed states (show notifications, reading progress)
- [ ] Quick actions (3D Touch/Haptic Touch on iOS)

---

## References

- [Current BottomNav](../../src/components/navigation/bottom-nav.tsx)
- [Current FABMenu](../../src/components/navigation/fab-menu.tsx)
- [Current FloatingFilterFab](../../src/components/blog/filters/floating-filter-fab.tsx)
- [Navigation System](../architecture/navigation-system.md)
- [Design Tokens](../../src/lib/design-tokens.ts)
- [E2E Mobile Tests](../../e2e/mobile-navigation.spec.ts)

---

**Status Updates:**

- 2026-01-31: Initial backlog item created

---

**Next Steps:**

1. Review and approve unified floating node concept
2. Create design mockups and prototypes
3. User research (test concept with 5-10 users)
4. Assign to frontend developer
5. Begin Phase 1 implementation

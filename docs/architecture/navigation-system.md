# Navigation System Architecture

Unified navigation system with centralized configuration, reusable hooks, and consistent patterns across all navigation components.

## Overview

The navigation system consists of five core foundational pieces:

1. **Navigation Config** ([src/lib/navigation-config.ts](../../src/lib/navigation-config.ts)) - Single source of truth for all navigation structures
2. **Dropdown Hook** ([src/hooks/use-dropdown.ts](../../src/hooks/use-dropdown.ts)) - Reusable dropdown state management
3. **Navigation Hook** ([src/hooks/use-navigation.ts](../../src/hooks/use-navigation.ts)) - Unified active state detection
4. **Keyboard Shortcuts** ([src/hooks/use-navigation-shortcuts.ts](../../src/hooks/use-navigation-shortcuts.ts)) - GitHub-style two-key navigation sequences
5. **Command Palette Integration** ([src/components/app/command-palette.tsx](../../src/components/app/command-palette.tsx)) - Auto-generates commands from navigation config

## Quick Start

### Using Navigation Config

```tsx
import { NAVIGATION } from '@/lib/navigation-config';

// Use primary navigation items
NAVIGATION.primary.map(item => (
  <Link key={item.href} href={item.href}>
    {item.label}
  </Link>
))

// Use blog categories
NAVIGATION.blog.map(item => (
  <Link key={item.href} href={item.href}>
    {item.label}
  </Link>
))
```

### Using Active State Detection

```tsx
import { useNavigation } from '@/hooks/use-navigation';

function NavItem({ href, label }) {
  const { isActive } = useNavigation();

  return (
    <Link
      href={href}
      className={isActive(href) ? 'text-primary' : 'text-muted-foreground'}
    >
      {label}
    </Link>
  );
}
```

### Using Dropdown Logic

```tsx
import { useDropdown } from '@/hooks/use-dropdown';

function Dropdown() {
  const { isOpen, ref, triggerProps, contentProps } = useDropdown();

  return (
    <div ref={ref}>
      <button {...triggerProps}>Menu</button>
      {isOpen && (
        <div {...contentProps}>
          <Link href="/page1">Page 1</Link>
          <Link href="/page2">Page 2</Link>
        </div>
      )}
    </div>
  );
}
```

## Navigation Configuration

### Structure

The `NAVIGATION` object contains all navigation structures organized by context:

```typescript
export const NAVIGATION = {
  primary: PRIMARY_NAV,        // Header, mobile menu
  bottom: BOTTOM_NAV,          // Bottom mobile navigation (3 items)
  mobile: MOBILE_NAV,          // Extended mobile menu
  blog: BLOG_CATEGORIES,       // Blog category dropdown
  work: WORK_CATEGORIES,       // Work category dropdown
  devTools: DEV_TOOLS_NAV,     // Dev tools (development only)
  footer: FOOTER_NAV,          // Footer links
} as const;
```

### NavItem Interface

```typescript
interface NavItem {
  href: string;              // Navigation destination
  label: string;             // Display text
  icon?: LucideIcon;         // Optional icon component
  shortcut?: string;         // Keyboard shortcut (e.g., "g h")
  prefetch?: boolean;        // Next.js prefetch behavior
  exactMatch?: boolean;      // Active state matching mode
}
```

### Adding New Navigation Items

```typescript
// 1. Add to appropriate config array
export const PRIMARY_NAV: NavItem[] = [
  // ... existing items
  {
    href: "/new-page",
    label: "New Page",
    shortcut: "g n",         // Optional
    exactMatch: false,       // Uses startsWith for active state
  },
];

// 2. Use in components (automatically picked up)
import { NAVIGATION } from '@/lib/navigation-config';

NAVIGATION.primary.map(item => (
  <Link href={item.href}>{item.label}</Link>
))
```

### Helper Functions

```typescript
// Extract all keyboard shortcuts
const shortcuts = getKeyboardShortcuts();
// Returns: [{ shortcut: "g h", label: "Home", href: "/" }, ...]

// Find specific nav item
const blogItem = findNavItem("/blog");
// Returns: NavItem | undefined
```

## Keyboard Shortcuts

The navigation system includes GitHub-style two-key keyboard shortcuts for fast navigation.

### Available Shortcuts

- **`g h`** → Home
- **`g b`** → Blog
- **`g w`** → Work
- **`g s`** → Sponsors
- **`g a`** → About
- **`?`** → Show keyboard shortcuts help

### Using Keyboard Shortcuts

```tsx
import { useNavigationShortcuts } from '@/hooks/use-navigation-shortcuts';

function App() {
  // Enable shortcuts globally
  useNavigationShortcuts({ enabled: true });

  return <YourApp />;
}
```

### Visual Feedback

The system includes built-in UI components for keyboard shortcuts:

```tsx
import { KeyboardShortcutIndicator, KeyboardShortcutsHelp } from '@/components/common/keyboard-shortcuts-indicator';

function Layout() {
  return (
    <>
      <KeyboardShortcutIndicator />  {/* Shows when 'g' is pressed */}
      <KeyboardShortcutsHelp />       {/* Modal triggered by '?' */}
    </>
  );
}
```

### How It Works

1. Press **`g`** to start the sequence
2. Visual indicator appears showing available keys
3. Press a destination key (**`h`**, **`b`**, **`w`**, etc.)
4. Navigation happens instantly
5. If no second key is pressed within 1 second, sequence resets

### Keyboard Shortcut Features

✅ **Two-key sequences** - 'g' prefix followed by destination key
✅ **Visual feedback** - Bottom-right indicator when 'g' is pressed
✅ **Help modal** - Press '?' to see all available shortcuts
✅ **Auto-generated** - Shortcuts come from navigation config
✅ **Input-aware** - Disabled when typing in input fields
✅ **Timeout reset** - 1-second timeout if no second key pressed

## Dropdown Hook

The `useDropdown` hook consolidates all dropdown logic with click-outside detection, keyboard support, and accessibility.

### Basic Usage

```tsx
function MyDropdown() {
  const { isOpen, toggle, ref, triggerProps, contentProps } = useDropdown();

  return (
    <div ref={ref}>
      <button {...triggerProps}>
        Dropdown
        <ChevronDown className={isOpen ? "rotate-180" : ""} />
      </button>

      {isOpen && (
        <div {...contentProps}>
          {/* Dropdown content */}
        </div>
      )}
    </div>
  );
}
```

### Controlled Mode

```tsx
function ControlledDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const { ref, triggerProps, contentProps } = useDropdown({
    isOpen,
    onOpenChange: setIsOpen,
  });

  return (/* ... */);
}
```

### Options

```typescript
interface UseDropdownOptions {
  defaultOpen?: boolean;           // Initial state (uncontrolled)
  isOpen?: boolean;                // Controlled state
  onOpenChange?: (open: boolean) => void;  // State change callback
  closeOnEscape?: boolean;         // Close on Escape key (default: true)
  closeOnClickOutside?: boolean;   // Close on click outside (default: true)
}
```

### Return Value

```typescript
interface UseDropdownReturn {
  isOpen: boolean;                 // Current open state
  open: () => void;                // Open the dropdown
  close: () => void;               // Close the dropdown
  toggle: () => void;              // Toggle open/closed
  ref: React.RefObject;            // Attach to container
  triggerProps: {                  // Spread on button
    onClick: () => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
  };
  contentProps: {                  // Spread on content
    role: "menu";
  };
}
```

### Features

✅ **Click-outside detection** - Automatically closes when clicking outside
✅ **Escape key handling** - Closes on Escape key press
✅ **Controlled/uncontrolled** - Supports both modes
✅ **ARIA attributes** - Proper accessibility out of the box
✅ **Cleanup** - Automatically removes event listeners on unmount

## Navigation Hook

The `useNavigation` hook provides consistent active state detection across all navigation components.

### Active State Detection

```tsx
function NavLink({ href, label }) {
  const { isActive, getAriaCurrent } = useNavigation();

  return (
    <Link
      href={href}
      className={cn(
        "nav-link",
        isActive(href) && "nav-link-active"
      )}
      aria-current={getAriaCurrent(href)}
    >
      {label}
    </Link>
  );
}
```

### Exact vs StartsWith Matching

```tsx
const { isActive } = useNavigation();

// StartsWith matching (default)
isActive("/blog")
// Returns true for: /blog, /blog/post-1, /blog/series

// Exact matching
isActive("/blog", true)
// Returns true only for: /blog

// Root path always requires exact match
isActive("/")
// Always exact, even without second parameter
```

### Using with NavItem Config

```tsx
function SmartNavLink({ item }: { item: NavItem }) {
  const { isNavItemActive } = useNavigation();

  return (
    <Link
      href={item.href}
      className={isNavItemActive(item) ? 'active' : ''}
    >
      {item.label}
    </Link>
  );
}
```

### Logo Click Behavior

```tsx
function Logo() {
  const handleLogoClick = useLogoClick();

  return (
    <Link href="/" onClick={handleLogoClick}>
      <SiteLogo />
    </Link>
  );
}
// Scrolls to top if already on homepage, otherwise navigates
```

### Return Value

```typescript
interface UseNavigationReturn {
  pathname: string;
  isActive: (href: string, exact?: boolean) => boolean;
  isNavItemActive: (item: NavItem, exact?: boolean) => boolean;
  getAriaCurrent: (href: string, exact?: boolean) => "page" | undefined;
}
```

## Migration Guide

### Migrating from Inline Navigation Arrays

**Before:**
```tsx
// site-header.tsx
const blogCategories = [
  { href: "/blog", label: "All Posts" },
  { href: "/blog/series", label: "Series" },
];
```

**After:**
```tsx
// site-header.tsx
import { NAVIGATION } from '@/lib/navigation-config';

// Use NAVIGATION.blog instead
{NAVIGATION.blog.map(item => (/* ... */))}
```

### Migrating from Manual Click-Outside Detection

**Before:**
```tsx
const [open, setOpen] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);
```

**After:**
```tsx
const { isOpen, ref, triggerProps } = useDropdown();
// Click-outside detection built-in!
```

### Migrating from Custom Active State Logic

**Before:**
```tsx
const pathname = usePathname();
const isActive = pathname === item.href ||
  (item.href !== "/" && pathname.startsWith(item.href));
```

**After:**
```tsx
const { isActive } = useNavigation();
// Handles all edge cases automatically
```

## Component Examples

### Header with Dropdown

```tsx
import { useDropdown } from '@/hooks/use-dropdown';
import { NAVIGATION } from '@/lib/navigation-config';

function Header() {
  const blog = useDropdown();
  const work = useDropdown();

  return (
    <header>
      <nav>
        <Link href="/">Home</Link>

        {/* Blog Dropdown */}
        <div ref={blog.ref}>
          <button {...blog.triggerProps}>
            Blog
            <ChevronDown className={blog.isOpen ? "rotate-180" : ""} />
          </button>
          {blog.isOpen && (
            <div {...blog.contentProps}>
              {NAVIGATION.blog.map(item => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Work Dropdown */}
        <div ref={work.ref}>
          <button {...work.triggerProps}>
            Our Work
            <ChevronDown className={work.isOpen ? "rotate-180" : ""} />
          </button>
          {work.isOpen && (
            <div {...work.contentProps}>
              {NAVIGATION.work.map(item => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
```

### Mobile Navigation

```tsx
import { useNavigation } from '@/hooks/use-navigation';
import { NAVIGATION } from '@/lib/navigation-config';

function MobileNav() {
  const { isNavItemActive, getAriaCurrent } = useNavigation();

  return (
    <nav>
      {NAVIGATION.mobile.map(item => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "nav-item",
              isNavItemActive(item) && "nav-item-active"
            )}
            aria-current={getAriaCurrent(item.href, item.exactMatch)}
          >
            {Icon && <Icon />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### Bottom Navigation

```tsx
import { useNavigation } from '@/hooks/use-navigation';
import { NAVIGATION } from '@/lib/navigation-config';

function BottomNav() {
  const { isNavItemActive } = useNavigation();

  return (
    <nav className="fixed bottom-0 md:hidden">
      {NAVIGATION.bottom.map(item => {
        const Icon = item.icon;
        const active = isNavItemActive(item);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "text-primary" : "text-muted-foreground"}
            aria-current={active ? "page" : undefined}
          >
            {Icon && <Icon className={active && "stroke-[2.5]"} />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

## Testing

All hooks are fully tested. See:
- [src/hooks/__tests__/use-dropdown.test.ts](../../src/hooks/__tests__/use-dropdown.test.ts)
- [src/hooks/__tests__/use-navigation.test.ts](../../src/hooks/__tests__/use-navigation.test.ts)

### Running Tests

```bash
# Run all hook tests
npm test src/hooks/__tests__

# Run specific hook tests
npm test src/hooks/__tests__/use-dropdown.test.ts
npm test src/hooks/__tests__/use-navigation.test.ts
```

## Command Palette Integration

The command palette automatically generates navigation commands from the navigation config.

### Auto-Generated Commands

```tsx
import { NAVIGATION } from '@/lib/navigation-config';

const commands: CommandAction[] = [
  // Auto-generated from NAVIGATION.primary config
  ...NAVIGATION.primary.map((navItem) => ({
    id: `nav-${navItem.href.slice(1) || "home"}`,
    label: navItem.label,
    icon: navItem.icon,
    shortcut: navItem.shortcut ? navItem.shortcut.toUpperCase().replace(" ", " → ") : undefined,
    onSelect: () => router.push(navItem.href),
  })),
];
```

### Command Palette Features

✅ **Single source of truth** - Commands generated from navigation config
✅ **Keyboard shortcuts** - Shows "G → B" for shortcuts from config
✅ **Auto-updates** - Changes to navigation config automatically update command palette
✅ **Consistent behavior** - Same navigation items across all interfaces

### Triggering the Command Palette

The command palette is triggered by:

- **`⌘K`** (Mac) or **`Ctrl+K`** (Windows/Linux)

All navigation items with shortcuts are automatically included in the command palette.

## Best Practices

### ✅ Do

- Use `NAVIGATION` config for all navigation structures
- Use `useDropdown()` for all dropdown menus
- Use `useNavigation()` for active state detection
- Spread `triggerProps` and `contentProps` for accessibility
- Use `exactMatch: true` for top-level routes that need exact matching
- Add keyboard shortcuts to navigation items for command palette integration

### ❌ Don't

- Define navigation items inline in components
- Create custom click-outside detection logic
- Write custom active state detection logic
- Manually manage dropdown state with useState
- Forget to attach the `ref` from `useDropdown()`
- Hardcode keyboard shortcuts in the command palette

## Related Documentation

- [Design System](../design/eslint-design-system-consolidated.md) - Design token usage
- [Testing](../testing/TEST_COVERAGE_EXPANSION_PLAN.md) - Test infrastructure
- [Accessibility](../ai/best-practices.md) - ARIA and keyboard navigation

## Components Using This System

### Navigation Components

- [SiteHeader](../../src/components/navigation/site-header.tsx) - Desktop header with dropdowns
- [MobileNav](../../src/components/navigation/mobile-nav.tsx) - Mobile hamburger menu
- [BottomNav](../../src/components/navigation/bottom-nav.tsx) - Mobile bottom navigation
- [DevToolsDropdown](../../src/components/common/dev-tools-dropdown.tsx) - Development tools menu

### Keyboard Navigation

- [NavigationShortcutsProvider](../../src/components/common/navigation-shortcuts-provider.tsx) - Global shortcuts wrapper
- [KeyboardShortcutIndicator](../../src/components/common/keyboard-shortcuts-indicator.tsx) - Visual feedback
- [KeyboardShortcutsHelp](../../src/components/common/keyboard-shortcuts-indicator.tsx) - Help modal

### Command Palette

- [CommandPalette](../../src/components/app/command-palette.tsx) - Auto-generates from config

### Future

- Breadcrumbs - Auto-generation from route pathname

---

## Migration Status

### ✅ Phase 1: Foundation (Complete)

- Created `src/lib/navigation-config.ts` - Centralized navigation structure
- Created `src/hooks/use-dropdown.ts` - Reusable dropdown logic
- Created `src/hooks/use-navigation.ts` - Unified active state detection
- Added 40 comprehensive tests (100% coverage)
- Documentation complete

### ✅ Phase 2: Component Migration (Complete - December 2025)

**All 4 navigation components migrated:**

- ✅ **SiteHeader** - Now uses `useDropdown` for Blog/Work dropdowns and `NAVIGATION` config
- ✅ **DevToolsDropdown** - Migrated to `useDropdown` hook
- ✅ **MobileNav** - Uses `NAVIGATION.mobile` and `useNavigation` hook
- ✅ **BottomNav** - Uses `NAVIGATION.bottom` and `useNavigation` hook

**Impact:**

- 🎯 **60+ lines of code eliminated** (dropdown duplication removed)
- 🎯 **Single source of truth** for all navigation structures
- 🎯 **Consistent behavior** across all dropdowns and nav components
- 🎯 **1813/1813 tests passing** (100%)
- 🎯 **Zero lint errors** - ESLint passes completely

**Code Quality:**

- All components use centralized navigation config
- No inline navigation arrays
- Consistent active state detection
- Automatic accessibility (ARIA attributes)
- Click-outside and Escape key handling built-in

### ✅ Phase 3: Enhancements (Complete - December 2025)

**All 3 enhancements implemented:**

- ✅ **Keyboard Shortcuts** - GitHub-style 'g' prefix navigation with visual feedback
  - Created `use-navigation-shortcuts.ts` hook
  - Two-key sequence system (g + destination key)
  - Visual indicator when 'g' is pressed
  - Help modal triggered by '?' key
  - Auto-generated from navigation config

- ✅ **Mobile Navigation Analysis** - Evaluated BottomNav + FABMenu overlap
  - Created detailed analysis document
  - Recommendation: Enable BottomNav (Option A)
  - Currently BottomNav is commented out in layout.tsx
  - See [mobile-navigation-analysis.md](mobile-navigation-analysis.md)

- ✅ **Command Palette Integration** - Navigation config auto-generation
  - Command palette uses NAVIGATION.primary for commands
  - Auto-includes keyboard shortcuts from config
  - Single source of truth for all navigation interfaces
  - Format: "G → B" for shortcuts

**Impact:**

- 🎯 **Unified keyboard navigation** - GitHub-style shortcuts across entire site
- 🎯 **Visual feedback** - Users can see available shortcuts
- 🎯 **Command palette integration** - Navigation items auto-populate commands
- 🎯 **Mobile UX clarity** - Analysis complete with recommendation
- 🎯 **40/40 navigation tests passing** - All hooks fully tested

### 🔮 Future Enhancements

- **Breadcrumb Auto-Generation** - From route pathname
- **Analytics Integration** - Track navigation patterns
- **Prefetch Strategy** - Smart route preloading based on usage

---

**Created:** December 2025
**Status:** ✅ Phase 1-3 Complete | Production Ready
**Next:** Data-driven enhancements based on analytics

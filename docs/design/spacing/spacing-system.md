<!-- TLP:CLEAR -->

# Site Spacing & Layout System

This document defines the consistent spacing system used across the site for navigation, content, footer, and FAB elements.

## Horizontal Padding System

All major layout components use a responsive 3-tier padding system:

```
px-4 sm:px-6 md:px-8
```

- **Mobile (< 640px)**: 16px (1rem / 4 units)
- **Small (640px-768px)**: 24px (1.5rem / 6 units)
- **Medium+ (≥ 768px)**: 32px (2rem / 8 units)

### Components Using This System

1. **Site Header** (`src/components/site-header.tsx`)
   - Container: `px-4 sm:px-6 md:px-8`
   - Height: `h-14 md:h-16` (56px mobile, 64px desktop)

2. **Main Content** (`src/app/layout.tsx`)
   - Container: `px-4 sm:px-6 md:px-8`
   - Bottom padding: `pb-20 md:pb-8` (80px mobile for bottom nav clearance, 32px desktop)

3. **Site Footer** (`src/components/site-footer.tsx`)
   - Container: `px-4 sm:px-6 md:px-8`
   - Height: `h-16` (64px fixed)
   - Vertical padding: `py-4 md:py-0` (16px mobile for flex layout, 0 desktop uses height)

4. **FAB Menu** (`src/components/fab-menu.tsx`)
   - Right positioning: `right-4 sm:right-6 md:right-8`
   - Matches the horizontal padding system for consistent edge alignment

5. **Back to Top** (`src/components/back-to-top.tsx`)
   - Right positioning: `right-4 sm:right-6 md:right-8`
   - Consistent with FAB menu positioning

6. **Table of Contents** (`src/components/table-of-contents.tsx`)
   - Right positioning: `right-4 sm:right-6 md:right-8`
   - Consistent with other FAB elements

## Vertical Spacing System

### Component Heights

- **Site Header**: `h-14 md:h-16` (56px → 64px)
- **Site Footer**: `h-16` (64px fixed)
- **Bottom Nav**: `h-16` (64px mobile only)
- **FAB Buttons**: `h-14 w-14` (56px, standard FAB size)
- **Touch Targets**: Minimum 44px, most elements 56-64px

### Vertical Layout Stack (Mobile)

From bottom to top:
1. **Bottom Navigation Bar**: `0-64px` (fixed at bottom)
2. **Spacing**: `64-104px` (40px gap)
3. **FAB Menu (primary)**: `104-160px` (56px button at `bottom-[104px]`)
4. **Spacing**: `160-176px` (16px gap when both FABs present)
5. **FAB Menu (secondary/TOC)**: `176-232px` (56px button at `bottom-[176px]`)

### Vertical Layout Stack (Desktop)

- FAB buttons: `bottom-24` (96px from bottom, above footer)
- No bottom navigation bar on desktop

## Z-Index Layers

- **z-40**: Site header, bottom nav, FAB buttons
- **z-50**: Modals, sheets, dialogs (from Radix UI)

## Gap Spacing

- **Mobile nav items**: `gap-2` (8px between theme toggle and hamburger)
- **Desktop nav items**: `gap-1 sm:gap-3 md:gap-6` (4px → 12px → 24px)
- **Footer links**: `gap-3 sm:gap-4` (12px → 16px)
- **Bottom nav grid**: Natural grid spacing (4 columns)
- **FAB menu expanded items**: `gap-3` (12px between stacked FABs)

## Implementation Notes

### Consistency Rules

1. **Always use the 3-tier system** (`px-4 sm:px-6 md:px-8`) for container padding
2. **Match FAB positioning** to container padding (`right-4 sm:right-6 md:right-8`)
3. **Use fixed heights** for headers/footers to prevent content shift
4. **Mobile bottom clearance**: Main content needs `pb-20` (80px) for bottom nav
5. **FAB positioning**: Use `bottom-[104px]` on mobile to clear bottom nav + spacing

### Responsive Breakpoints

- **sm**: 640px (small tablets, large phones landscape)
- **md**: 768px (tablets portrait, primary desktop breakpoint)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop, TOC sidebar appears)

### Max Width Container

All content uses: `mx-auto max-w-5xl` (1280px max width, auto-centered)

## Visual Alignment

When all components follow this system:

```
Edge →  [4px] Content [4px] ← Edge (mobile)
Edge →  [6px] Content [6px] ← Edge (sm)
Edge →  [8px] Content [8px] ← Edge (md+)
```

FAB buttons align exactly with the content edge padding:
- Mobile: 4px from edge
- Small: 6px from edge  
- Medium+: 8px from edge

This creates visual harmony where all elements share the same margin system.

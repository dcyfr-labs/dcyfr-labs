{/* TLP:CLEAR */}

# Alert Banner Component

**Location:** `src/components/common/alert.tsx`

## Overview

The Alert component is a unified banner system for displaying important information across the entire site. It provides consistent styling for alerts of different severity levels and supports both static and dismissible variants. It also serves as the base component for specialized variants like KeyTakeaway and ContextClue.

## Features

- ✅ **Four severity levels**: info, warning, critical, success
- ✅ **Consistent styling**: Uses design tokens (SEMANTIC_COLORS) for theme-aware colors
- ✅ **Left border accent**: Visual indicator of alert type
- ✅ **Icon support**: Automatic icon selection based on severity, or custom icons
- ✅ **Custom labels**: Optional label prefixes for specialized alerts
- ✅ **Dismissible option**: Optional close button with custom label
- ✅ **Flexible roles**: Support for alert, note, and complementary ARIA roles
- ✅ **Container overrides**: Custom background for specialized variants
- ✅ **Responsive**: Mobile-optimized spacing and typography
- ✅ **Accessible**: Proper ARIA roles and labels
- ✅ **MDX compatible**: Works in both TSX and MDX files

## Usage

### Basic Examples

```tsx
// Info alert (default)
<Alert type="info">
  **STATUS UPDATE:** System maintenance scheduled for tonight.
</Alert>

// Warning alert
<Alert type="warning">
  **Notice:** This feature is in beta and may change.
</Alert>

// Critical alert
<Alert type="critical">
  **CRITICAL UPDATE:** Security vulnerability detected. Update immediately.
</Alert>

// Success alert
<Alert type="success">
  **Success:** Operation completed successfully!
</Alert>
```

### Dismissible Alerts

```tsx
// With default dismiss label ("Dismiss alert")
<Alert type="info" dismissible onDismiss={() => console.log('Alert dismissed')}>
  This alert can be dismissed.
</Alert>

// With custom dismiss label
<Alert
  type="warning"
  dismissible
  onDismiss={handleDismiss}
  dismissLabel="Close Warning"
>
  Custom dismiss button label for better context.
</Alert>
```

### In MDX Files

```mdx
<Alert type="critical">
  **CRITICAL UPDATE (December 6, 2025):** Security researchers confirm **active
  exploitation in the wild**. CVE-2025-55182, now widely known as
  **"React2Shell,"** has been integrated into Mirai and other botnet
  exploitation toolkits.
</Alert>

<Alert type="info">
  **STATUS UPDATE:** All systems operational. Latest patches deployed
  successfully.
</Alert>
```

### Advanced Usage

```tsx
// Custom styling
<Alert type="warning" className="mb-8 shadow-lg">
  Alert with custom margin and shadow
</Alert>

// In a form
<Alert type="critical" className="my-0">
  Form validation failed. Please check your inputs.
</Alert>
```

## Props

| Prop                | Type                                             | Default           | Description                              |
| ------------------- | ------------------------------------------------ | ----------------- | ---------------------------------------- |
| `type`              | `'critical' \| 'warning' \| 'info' \| 'success'` | `'info'`          | Alert severity level                     |
| `children`          | `React.ReactNode`                                | Required          | Alert content (supports MDX formatting)  |
| `className`         | `string`                                         | `''`              | Additional CSS classes                   |
| `dismissible`       | `boolean`                                        | `false`           | Show dismiss button                      |
| `onDismiss`         | `() => void`                                     | `undefined`       | Callback when dismissed                  |
| `dismissLabel`      | `string`                                         | `'Dismiss alert'` | Aria-label for dismiss button            |
| `label`             | `string`                                         | `undefined`       | Optional prefix label (e.g., "Takeaway") |
| `icon`              | `React.ComponentType`                            | Auto-selected     | Custom icon component                    |
| `containerOverride` | `string`                                         | `undefined`       | Override background container classes    |
| `role`              | `'alert' \| 'note' \| 'complementary'`           | `'alert'`         | ARIA role for accessibility              |

## Styling

The Alert component uses semantic color tokens that automatically adapt to light/dark modes:

### Color Variants

| Type       | Background          | Text                      | Icon                 | Border             |
| ---------- | ------------------- | ------------------------- | -------------------- | ------------------ |
| `info`     | `bg-info-subtle`    | `text-info`               | Info icon (circle-i) | `border-l-info`    |
| `warning`  | `bg-warning-subtle` | `text-warning-foreground` | Warning triangle     | `border-l-warning` |
| `critical` | `bg-error-subtle`   | `text-error`              | Alert triangle       | `border-l-error`   |
| `success`  | `bg-success-subtle` | `text-success`            | Check circle         | `border-l-success` |

### Design Tokens

```tsx
// From @/lib/design-tokens
SEMANTIC_COLORS.alert.info; // Info colors
SEMANTIC_COLORS.alert.warning; // Warning colors
SEMANTIC_COLORS.alert.critical; // Critical colors
SEMANTIC_COLORS.alert.success; // Success colors
```

## Real-World Examples

### Security Alert (React2Shell Blog Post)

```tsx
<Alert type="critical">
  **CRITICAL UPDATE (December 6, 2025):** Security researchers confirm **active
  exploitation in the wild**. CVE-2025-55182, now widely known as
  **"React2Shell,"** has been integrated into Mirai and other botnet
  exploitation toolkits. Nearly 50% of attacking IPs are newly registered
  infrastructure (December 2025). Post-exploitation activities include
  cryptocurrency mining, credential theft, and ransomware staging.
</Alert>
```

### Development Banner

The DevBanner component uses Alert internally:

```tsx
<Alert
  type="info"
  dismissible
  onDismiss={handleClose}
  dismissLabel="Close Dev Banner"
  className="my-0"
>
  <strong>DEV Mode</strong> This is a development build of the site. Features
  here may be unstable or incomplete.
</Alert>
```

### Status Update

```tsx
<Alert type="info">
  **STATUS UPDATE (December 13, 2025):** Exploitation continues with confirmed
  China-nexus APT activity. **Three additional CVEs disclosed** (CVE-2025-55183,
  CVE-2025-55184, CVE-2025-67779). Latest patches: **React 19.2.3** and
  **Next.js 16.0.10+** address all vulnerabilities.
</Alert>
```

## Accessibility

- Uses `role="alert"` for screen reader announcements
- Icon has `aria-hidden="true"` (decorative only)
- Dismiss button has descriptive `aria-label`
- Keyboard accessible (Tab, Enter, Space)
- Proper focus states with ring indicators

## Best Practices

### ✅ Do

- Use appropriate severity levels
- Keep alert content concise and scannable
- Use bold text for important keywords
- Provide actionable information
- Use dismissible for non-critical, temporary alerts

### ❌ Don't

- Overuse critical alerts (alert fatigue)
- Put long paragraphs in alerts
- Use alerts for normal content
- Stack multiple alerts without spacing
- Use alerts for form validation errors (use field-level validation instead)

## Component Hierarchy

```
Alert (Unified Base Component)
├── Used directly in: MDX blog posts
├── Used in: DevBanner component (dismissible variant)
├── Used in: Security notices
├── Base for: KeyTakeaway component (with custom icon and label)
├── Base for: ContextClue component (with subtle background)
└── Available for: Any component needing alerts
```

## Specialized Variants

### KeyTakeaway

**Location:** `src/components/common/key-takeaway.tsx`

Used in blog posts to highlight important insights and key takeaways.

```mdx
<KeyTakeaway>
  If an agent's goals can be hijacked, it becomes a weapon turned against you.
</KeyTakeaway>
```

Features:

- Uses Alert with `type="info"`
- Custom Lightbulb icon
- "Takeaway" label prefix
- `role="note"` for accessibility

### ContextClue

**Location:** `src/components/common/context-clue.tsx`

Provides background context and setup information in blog posts.

```mdx
<ContextClue>
  As AI agents become more autonomous and capable of taking real-world actions,
  the security landscape is evolving rapidly.
</ContextClue>
```

Features:

- Uses Alert with `type="info"`
- Custom Info icon
- "Context:" label prefix
- More subtle background (`bg-primary/5 dark:bg-primary/10`)
- `role="complementary"` for accessibility

## Testing

The component is fully tested with vitest:

```bash
# Run all alert-related tests
npm run test:run -- src/components/common/__tests__/alert.test.tsx
npm run test:run -- src/components/common/__tests__/key-takeaway.test.tsx
npm run test:run -- src/components/common/__tests__/context-clue.test.tsx
npm run test:run -- src/components/features/__tests__/dev-banner.test.tsx
```

Tests cover:

- Rendering with all severity types
- Dismissible functionality
- Custom labels and icons
- Container overrides
- Accessibility features (roles, aria-labels)
- State management
- Specialized variants (KeyTakeaway, ContextClue)

## Related Components

- **DevBanner** (`src/components/features/dev-banner.tsx`) - Uses Alert with dismissible support
- **KeyTakeaway** (`src/components/common/key-takeaway.tsx`) - Alert variant for educational highlights
- **ContextClue** (`src/components/common/context-clue.tsx`) - Alert variant for contextual information
- **Toast** (`src/lib/toast.tsx`) - For temporary notifications

## Migration Notes

If you were using the shadcn/ui Alert component (`src/components/ui/alert.tsx`), this unified Alert component provides:

- Simpler API (single `type` prop vs. multiple variants)
- Built-in icons
- Consistent design token usage
- MDX compatibility
- Left border accent styling

## Version History

- **v3.0.0** (December 30, 2025) - Consolidated KeyTakeaway and ContextClue to use Alert as base
  - Added `label`, `icon`, `containerOverride`, and `role` props
  - KeyTakeaway and ContextClue now thin wrappers around Alert
  - Improved consistency across all alert-like components
- **v2.0.0** (December 30, 2025) - Enhanced with dismissible support and custom labels
- **v1.0.0** (Initial) - Basic alert banner for MDX

---

**Status:** Production Ready  
**Last Updated:** December 30, 2025  
**Maintained By:** DCYFR Labs Team

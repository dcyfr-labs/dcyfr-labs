# Key Takeaway Component Template

## Overview

The KeyTakeaway component creates a visually distinct banner for highlighting important insights in blog content. It's specifically designed for extracting and emphasizing critical takeaways from technical content.

## Usage

```mdx
<KeyTakeaway>Your important insight or key takeaway here.</KeyTakeaway>
```

## Examples

### Basic Usage

```mdx
<KeyTakeaway>
  If an agent's goals can be hijacked, it becomes a weapon turned against
  you---using its own legitimate access to cause harm.
</KeyTakeaway>
```

### With Emphasis

```mdx
<KeyTakeaway>
  Even **legitimate**, authorized tools become dangerous when agents use them
  *incorrectly* or under attacker influence.
</KeyTakeaway>
```

## Features

- **Prominent lightbulb icon** indicates insight
- **"Takeaway" prefix** for consistent labeling
- **Semantic color theming** using design tokens
- **Responsive typography** and padding
- **Accessible markup** with proper roles

## Design System Integration

- Uses `SEMANTIC_COLORS.alert.info` for theming
- Follows `BORDERS.card` for consistent border styling
- Responsive padding: `p-4 sm:p-5`
- Responsive typography: `text-sm sm:text-base`
- Responsive icon sizing: `h-5 w-5 sm:h-6 sm:w-6`

## When to Use

✅ **Use KeyTakeaway for:**

- Critical insights that readers should remember
- Important conclusions from technical analysis
- Essential security principles
- Key business implications

❌ **Don't use for:**

- Regular quotes (use blockquote)
- Citations (use proper citation)
- Code examples (use code blocks)
- Warnings (use Alert component with type="warning")

## Alternative Components

- **Alert**: For warnings, errors, or status messages
- **blockquote**: For regular quotations or citations
- **Note blocks**: For supplementary information

## Implementation Notes

- Automatically handles inline content styling
- Supports nested MDX content (bold, italic, etc.)
- Uses `aria-label` for accessibility
- Icon is decorative (`aria-hidden="true"`)

## Migration from Blockquotes

**Before:**

```mdx
> **Takeaway** Your insight here.
```

**After:**

```mdx
<KeyTakeaway>Your insight here.</KeyTakeaway>
```

The component automatically adds the "Takeaway" prefix, so remove it from the content.

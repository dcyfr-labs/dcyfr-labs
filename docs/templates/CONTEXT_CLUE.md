{/* TLP:CLEAR */}

# Context Clue Component Template

## Overview

The ContextClue component provides important background context and setup information for content. It helps readers understand the broader context, assumptions, or prerequisites before diving into detailed content.

## Usage

```mdx
<ContextClue>
Your background context or setup information here.
</ContextClue>
```

## Examples

### Basic Usage
```mdx
<ContextClue>
As AI agents become more autonomous and capable of taking real-world actions, the security landscape is evolving rapidly.
</ContextClue>
```

### Technical Context
```mdx
<ContextClue>
This analysis is based on data collected from over 1,000 production deployments across enterprise environments during Q3-Q4 2024.
</ContextClue>
```

### Research Context
```mdx
<ContextClue>
The following recommendations assume basic familiarity with OAuth 2.0 flows and JWT token validation.
</ContextClue>
```

## Features

- **Info icon** indicates contextual background information
- **"Context:" prefix** for consistent labeling
- **Subtle blue theming** distinguishes from main content
- **Responsive typography** and padding
- **Accessible markup** with `role="complementary"`

## Design System Integration

- Uses custom blue color palette for contextual information
- Follows `BORDERS.card` for consistent border styling
- Responsive padding: `p-4 sm:p-5`
- Responsive typography: `text-sm sm:text-base`
- Responsive icon sizing: `h-5 w-5 sm:h-6 sm:w-6`

## When to Use

✅ **Use ContextClue for:**
- Background information readers need before main content
- Prerequisites or assumptions
- Research methodology or data sources
- Historical context for current events
- Setting up the problem space

❌ **Don't use for:**
- Key insights (use KeyTakeaway)
- Warnings or alerts (use Alert)
- Regular quotes (use blockquote)
- Main content points

## Alternative Components

- **KeyTakeaway**: For critical insights and conclusions
- **Alert**: For warnings, errors, or urgent information
- **blockquote**: For regular quotations or citations
- **Note blocks**: For supplementary information

## Implementation Notes

- Automatically handles inline content styling
- Supports nested MDX content (bold, italic, etc.)
- Uses `aria-label` for accessibility
- Icon is decorative (`aria-hidden="true"`)
- Uses `role="complementary"` for proper semantic markup

## Migration from Blockquotes

**Before:**
```mdx
> **Context:** Your background information here.
```

**After:**
```mdx
<ContextClue>
Your background information here.
</ContextClue>
```

The component automatically adds the "Context:" prefix, so remove it from the content.
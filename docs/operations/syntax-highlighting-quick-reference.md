# Syntax Highlighting Quick Reference

**Status:** ✅ Implemented  
**Date:** October 21, 2025  
**Stack:** Shiki + rehype-pretty-code

---

## Overview

Code blocks in blog posts are now syntax-highlighted using **Shiki** (via `rehype-pretty-code`), with automatic theme switching between light and dark modes.

## Features

- **Automatic theme switching**: Uses `github-light` in light mode and `github-dark-dimmed` in dark mode
- **Language detection**: Supports all major programming languages (TypeScript, JavaScript, Python, Bash, JSON, etc.)
- **Inline code**: Styled separately with muted background
- **No background override**: Uses the site's theme colors for consistency
- **Fallback**: Unknown languages render as plaintext

## Configuration

### File: `src/components/mdx.tsx`

```typescript
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false, // Use CSS background from our theme
  defaultLang: "plaintext",
};
```

The configuration is applied in the rehype plugin chain:

```typescript
rehypePlugins: [
  rehypeSlug,
  [rehypePrettyCode, rehypePrettyCodeOptions],
  [rehypeAutolinkHeadings, { ... }]
]
```

### Custom component handlers

- **Inline code**: Checks for absence of `data-language` attribute to distinguish from code blocks
- **Code blocks**: Preserves Shiki-generated markup with grid display for proper line handling

## Styling

### File: `src/app/globals.css`

Includes custom CSS for:
- Base code block styling with theme-aware backgrounds
- Line numbers (when enabled with `data-line-numbers` attribute)
- Highlighted lines (using `[data-highlighted-line]`)
- Highlighted inline segments (using `[data-highlighted-chars]`)
- Code block titles (using `[data-rehype-pretty-code-title]`)

## Usage in MDX

### Basic code block

```mdx
```typescript
const greeting: string = "Hello, World!";
console.log(greeting);
```
```

### Code block with title (future enhancement)

```mdx
```typescript title="src/lib/utils.ts"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
```

### Inline code

```mdx
Use the `npm run dev` command to start the development server.
```

## Dependencies

```json
{
  "shiki": "^1.x.x",
  "rehype-pretty-code": "^0.x.x"
}
```

## Themes Available

Shiki includes 100+ themes. Current setup uses:
- **Light mode**: `github-light`
- **Dark mode**: `github-dark-dimmed`

To change themes, update the `theme` object in `rehypePrettyCodeOptions`.

Popular alternatives:
- `one-dark-pro`, `one-light`
- `dracula`, `dracula-soft`
- `nord`
- `monokai`
- `solarized-light`, `solarized-dark`
- `vitesse-light`, `vitesse-dark`

See full list: https://shiki.style/themes

## Advanced Features (Not Yet Implemented)

These features are available in rehype-pretty-code but not yet configured:

### Line numbers

```mdx
```typescript showLineNumbers
const x = 1;
const y = 2;
```
```

### Line highlighting

```mdx
```typescript {2,4-6}
const a = 1;
const b = 2; // highlighted
const c = 3;
const d = 4; // highlighted
const e = 5; // highlighted
const f = 6; // highlighted
```
```

### Character highlighting

```mdx
```typescript /useState/
import { useState } from 'react';
```
```

### Diff indicators

```mdx
```typescript
- const old = "removed";
+ const new = "added";
```
```

## Performance Notes

- Shiki runs at build time (server-side), so there's no runtime performance impact
- Themes are included in the bundle but not shipped to the client
- The generated HTML includes all necessary styling classes
- No JavaScript required for syntax highlighting in the browser

## Testing

Test pages with code blocks:
- `/blog/hardening-tiny-portfolio` - TypeScript and TSX examples
- `/blog/shipping-tiny-portfolio` - Mixed code examples
- `/blog/markdown-and-code-demo` (draft) - Comprehensive demo of all languages

## Troubleshooting

### Code blocks not highlighted

1. Check that the language identifier is correct (e.g., `ts`, `typescript`, `tsx`, `jsx`, `python`, `bash`)
2. Verify the code block has proper opening/closing backticks
3. Inspect the rendered HTML for `data-language` attributes

### Theme not switching

1. Ensure `keepBackground: false` is set in options
2. Verify CSS custom properties are defined for both light and dark modes
3. Check that `next-themes` is properly configured

### Build errors

If Shiki fails during build:
1. Check that all code blocks have valid syntax
2. Verify language identifiers are supported by Shiki
3. Use `defaultLang: "plaintext"` as fallback

## Related Files

- `src/components/mdx.tsx` - MDX component with rehype-pretty-code
- `src/app/globals.css` - Code block styling
- `src/lib/mdx-to-html.ts` - RSS/Atom feed converter (separate pipeline, no Shiki)
- `package.json` - Dependencies

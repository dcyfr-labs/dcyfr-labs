<!-- TLP:CLEAR -->

# Syntax Highlighting Component

**Status:** ✅ Implemented  
**Stack:** Shiki + rehype-pretty-code  
**Date:** October 21, 2025

---

## Overview

Code blocks in blog posts are syntax-highlighted using **Shiki** (via `rehype-pretty-code`), with automatic theme switching between light and dark modes. Highlights the code with semantic coloring that matches the site's theme.

---

## Quick Reference

### MDX Usage

#### Basic Code Block

```markdown
\`\`\`typescript
const greeting: string = "Hello, World!";
console.log(greeting);
\`\`\`
```

#### With Language Identifier

```markdown
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`
```

#### Inline Code

```markdown
Use the `npm run dev` command to start the development server.
```

### Supported Languages

- TypeScript / JavaScript (`ts`, `tsx`, `js`, `jsx`)
- Python (`py`, `python`)
- Bash / Shell (`bash`, `sh`, `zsh`)
- JSON (`json`)
- YAML (`yaml`, `yml`)
- SQL (`sql`)
- HTML (`html`, `htm`)
- CSS (`css`, `scss`, `sass`)
- And 100+ more (any Shiki-supported language)

---

## Configuration

### File: `src/components/mdx.tsx`

```typescript
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false,  // Use site's CSS background
  defaultLang: "plaintext",
};
```

### Plugin Chain

Applied in MDX processing pipeline:

```typescript
rehypePlugins: [
  rehypeSlug,
  [rehypePrettyCode, rehypePrettyCodeOptions],
  [rehypeAutolinkHeadings, { /* config */ }]
]
```

### Styling

Configured in `src/app/globals.css`:

```css
/* Code block base styling */
:where(pre) {
  @apply rounded-lg border bg-neutral-50 p-4 dark:bg-neutral-900;
}

/* Code text color */
:where(pre code) {
  @apply text-sm;
}

/* Individual code spans (tokens) inherit colors from Shiki */
:where(pre code span) {
  @apply font-mono;
}
```

---

## Themes

### Current Configuration

| Mode | Theme |
|------|-------|
| Light | `github-light` |
| Dark | `github-dark-dimmed` |

### Available Themes

Shiki includes 100+ themes. Popular alternatives:

- **One Dark Pro:** `one-dark-pro`
- **Dracula:** `dracula`, `dracula-soft`
- **Nord:** `nord`
- **Monokai:** `monokai`
- **Solarized:** `solarized-light`, `solarized-dark`
- **Vitesse:** `vitesse-light`, `vitesse-dark`

See full list: https://shiki.style/themes

### Changing Themes

In `src/components/mdx.tsx`:

```typescript
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "dracula",      // Change dark theme
    light: "github-light", // Change light theme
  },
  // ...
};
```

---

## Features

### ✅ Implemented

- **Automatic theme switching:** Uses `github-light` in light mode, `github-dark-dimmed` in dark mode
- **Language detection:** Supports 100+ programming languages
- **Inline code styling:** Separate styling from code blocks
- **No background override:** Uses site's CSS background for consistency
- **Fallback handling:** Unknown languages render as plaintext

### ⏳ Future Enhancements

- **Line numbers:** `showLineNumbers` metadata
- **Line highlighting:** `{2,4-6}` syntax for highlighting specific lines
- **Character highlighting:** `/pattern/` syntax for highlighting text
- **Diff indicators:** `+ added` / `- removed` lines
- **Code block titles:** `title="filename.ts"` metadata
- **Copy button:** Quick copy-to-clipboard functionality

---

## How It Works

### Pipeline

1. **MDX Files:** Blog posts contain markdown code blocks
2. **Remark Plugins:** Process markdown structure
3. **Rehype Plugins:** Transform to HTML
   - `rehype-pretty-code` highlights code with Shiki
   - Adds semantic HTML with token spans
4. **Styling:** CSS applies colors based on token classes
5. **Output:** Syntax-highlighted HTML

### At Build Time

- Shiki runs during Next.js build
- No runtime performance impact
- All HTML generated statically
- Themes included in build artifact

### In Browser

- Static HTML renders instantly
- CSS classes apply semantic colors
- Theme switching via dark mode CSS media query
- No JavaScript required for highlighting

---

## Component Integration

### MDX Component (`src/components/mdx.tsx`)

```typescript
const components: MDXComponents = {
  // Code blocks with syntax highlighting
  pre: async (props) => {
    return <pre className="...">{props.children}</pre>;
  },

  // Inline code (no highlighting)
  code: (props) => {
    if (props.dataLanguage) {
      // Code block (handled by pre)
      return null;
    }
    // Inline code
    return <code className="...">{props.children}</code>;
  },
};
```

### Differentiation

```typescript
// Code block: has data-language attribute
<code data-language="typescript">...</code>

// Inline code: no data-language
<code>inline</code>
```

---

## Styling

### Code Block Container

```css
pre {
  background: hsl(0 0% 97%);        /* Light mode */
  color: hsl(220 13% 28%);
}

@media (prefers-color-scheme: dark) {
  pre {
    background: hsl(0 0% 11%);      /* Dark mode */
    color: hsl(220 14% 71%);
  }
}
```

### Token Colors

Shiki generates semantic classes for each token:

```html
<span class="line">
  <span class="token keyword">const</span>
  <span class="token variable">greeting</span>
  <span class="token punctuation">:</span>
  <span class="token string">string</span>
  <span class="token punctuation">=</span>
  <span class="token string">"Hello, World!"</span>
  <span class="token punctuation">;</span>
</span>
```

---

## Performance

### Build Time
- Shiki processes all code blocks at build time
- No impact on development experience (cached)
- ~50ms per 10 code blocks on modern hardware

### Runtime
- **Client:** Zero performance cost (static HTML + CSS)
- **Bundle:** Syntax highlighting not shipped to browser
- **Rendering:** CSS media query handles theme switching

### Optimization

- No JavaScript required
- CSS-only theme switching
- Static HTML generation
- Efficient token coloring

---

## Testing

### Test Pages

Blog posts with various code examples:
- `/blog/hardening-tiny-portfolio` - TypeScript and TSX
- `/blog/shipping-tiny-portfolio` - Mixed examples
- `/blog/markdown-and-code-demo` (draft) - Comprehensive demo

### Manual Testing Checklist

- [ ] Code blocks display with syntax highlighting
- [ ] Light mode colors visible and readable
- [ ] Dark mode colors visible and readable
- [ ] Theme switching works smoothly
- [ ] Inline code distinguished from blocks
- [ ] Multiple languages render correctly
- [ ] Unknown language falls back to plaintext
- [ ] Special characters handled properly
- [ ] Long code blocks scroll horizontally on mobile

---

## Troubleshooting

### Code Blocks Not Highlighted

1. **Check language identifier:**
   ```markdown
   ✅ \`\`\`typescript     (correct)
   ❌ \`\`\`ts-extended   (unknown language)
   ```

2. **Verify Shiki support:**
   - Most common languages supported
   - Check [Shiki languages list](https://shiki.style/guide#supported-languages)

3. **Inspect HTML:**
   - Should have `data-language` attribute
   - Check browser DevTools for token spans

### Theme Not Switching

1. **Verify `keepBackground: false`** in config
2. **Check CSS custom properties** are defined
3. **Inspect dark mode detection:**
   - Browser dark mode setting
   - `next-themes` configuration

### Build Errors

1. **Invalid code syntax:**
   - Shiki validates code strictly
   - Ensure code blocks have valid syntax

2. **Unknown language:**
   - Falls back to `defaultLang: "plaintext"`
   - Check language identifier spelling

---

## Related Files

```
src/
  components/
    mdx.tsx                       (Rehype config)
  app/
    globals.css                   (Code block styling)

src/lib/
  mdx-to-html.ts                 (RSS/Atom pipeline - separate)
```

---

## Dependencies

```json
{
  "shiki": "^1.x.x",
  "rehype-pretty-code": "^0.x.x",
  "next-mdx-remote": "^5.x.x"
}
```

---

## Future Enhancements

### Short Term

1. **Copy Button**
   ```typescript
   <button onClick={() => copyToClipboard(code)}>Copy</button>
   ```

2. **Line Numbers**
   ```typescript
   // In globals.css
   [data-line-numbers="true"] { /* show numbers */ }
   ```

3. **Diff Highlighting**
   ```markdown
   \`\`\`diff
   - removed line
   + added line
   \`\`\`
   ```

### Long Term

1. **Language Auto-detection**
   - Detect language from shebang or file extension

2. **Custom Theme Support**
   - Allow users to select theme preference

3. **Interactive Playground**
   - Live code execution for supported languages

4. **Accessibility**
   - Add `aria-label` for code blocks
   - Improve screen reader support

---

## Notes

- Syntax highlighting runs at build time (zero runtime cost)
- All code blocks are static HTML (no dynamic processing)
- Theme switching uses CSS media queries (no page reload)
- Themes are semantic and accessible
- No additional JavaScript in bundle for highlighting


<!-- TLP:CLEAR -->

# MDX Processing Pipeline

**Status:** ✅ Production  
**Last Updated:** October 24, 2025  
**Related:** [Blog Architecture](./architecture) · [MDX Component](../components/mdx) · [Content Creation](./content-creation)

---

## Summary

The MDX processing pipeline transforms Markdown/MDX content into fully-styled, interactive HTML with syntax highlighting, automatic heading links, and GitHub-flavored markdown support. This document details the complete processing flow, plugin configuration, and customization options.

---

## Table of Contents

- [Overview](#overview)
- [Processing Flow](#processing-flow)
- [Dependencies](#dependencies)
- [Remark Plugins](#remark-plugins)
- [Rehype Plugins](#rehype-plugins)
- [Syntax Highlighting](#syntax-highlighting)
- [Component Mapping](#component-mapping)
- [Customization Guide](#customization-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

The MDX processing pipeline consists of three main stages:

1. **Parsing** - Convert MDX source to abstract syntax tree (AST)
2. **Transformation** - Apply remark (Markdown) and rehype (HTML) plugins
3. **Rendering** - Map HTML elements to React components

```
┌──────────────┐
│  MDX Source  │  (src/content/blog/*.mdx)
└──────┬───────┘
       │
       │ Parse with gray-matter
       ▼
┌──────────────┐
│ Frontmatter  │  + Body Content
└──────┬───────┘
       │
       │ next-mdx-remote/rsc
       ▼
┌──────────────────────────────────────┐
│         Remark Plugins               │
│  - remark-gfm (GFM support)          │
└──────┬───────────────────────────────┘
       │
       │ Markdown AST → HTML AST
       ▼
┌──────────────────────────────────────┐
│         Rehype Plugins               │
│  1. rehype-slug (heading IDs)        │
│  2. rehype-pretty-code (syntax HL)   │
│  3. rehype-autolink-headings (links) │
└──────┬───────────────────────────────┘
       │
       │ Component mapping
       ▼
┌──────────────┐
│ React Output │  (Styled HTML)
└──────────────┘
```

---

## Processing Flow

### 1. File Reading & Frontmatter Parsing

**Location:** `src/lib/blog.ts`

```typescript
import matter from "gray-matter";

const fileContents = fs.readFileSync(filePath, "utf8");
const { data, content } = matter(fileContents);
```

**Responsibilities:**
- Read MDX files from `src/content/blog/`
- Extract YAML frontmatter metadata
- Separate content body for processing
- Calculate reading time from word count

### 2. MDX Compilation

**Location:** `src/components/mdx.tsx`

```typescript
import { MDXRemote } from "next-mdx-remote/rsc";

export function MDX({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, rehypePrettyCodeOptions],
            [rehypeAutolinkHeadings, { /* config */ }]
          ],
        },
      }}
      components={components}
    />
  );
}
```

**Key Features:**
- Server-side rendering (RSC compatible)
- Plugin pipeline configuration
- Custom component mapping
- Theme-aware syntax highlighting

### 3. Component Rendering

React components replace standard HTML elements with styled equivalents, applying consistent typography and interactive behaviors.

---

## Dependencies

### Core Dependencies

```json
{
  "next-mdx-remote": "^5.0.0",     // MDX processing for React Server Components
  "gray-matter": "^4.0.3",         // Frontmatter parsing
  "remark-gfm": "^4.0.1",          // GitHub-flavored Markdown
  "rehype-slug": "^6.0.0",         // Auto-generate heading IDs
  "rehype-autolink-headings": "^7.1.0", // Add anchor links to headings
  "rehype-pretty-code": "^0.14.1", // Syntax highlighting
  "shiki": "^3.13.0"               // Syntax highlighter (used by rehype-pretty-code)
}
```

### Utility Dependencies

```json
{
  "unified": "^11.0.5",            // Plugin system foundation
  "remark-parse": "^11.0.0",       // Markdown parser
  "remark-rehype": "^11.1.2",      // Markdown → HTML transformer
  "rehype-sanitize": "^6.0.0",     // XSS protection (optional)
  "rehype-stringify": "^10.0.1"    // HTML stringification
}
```

---

## Remark Plugins

Remark plugins transform the **Markdown AST** before HTML conversion.

### remark-gfm (GitHub-Flavored Markdown)

**Purpose:** Adds support for GitHub-flavored Markdown extensions

**Supported Features:**
- **Tables** - Pipe-delimited tables with alignment
- **Strikethrough** - `~~deleted text~~` → ~~deleted text~~
- **Task lists** - `- [x] Done` / `- [ ] Todo`
- **Autolinks** - Bare URLs become clickable links
- **Footnotes** - Reference-style footnotes

**Example Input:**
```markdown
| Feature | Status |
|---------|--------|
| Tables  | ✅     |
| ~~Old~~ | ❌     |

- [x] Completed task
- [ ] Pending task

https://example.com
```

**Configuration:**
```typescript
import remarkGfm from "remark-gfm";

remarkPlugins: [remarkGfm]
```

**No additional configuration needed** - works out of the box.

---

## Rehype Plugins

Rehype plugins transform the **HTML AST** after Markdown conversion.

### 1. rehype-slug

**Purpose:** Auto-generates IDs for heading elements (`h1`-`h6`)

**Behavior:**
- Converts heading text to kebab-case IDs
- Enables anchor linking (`#heading-id`)
- Required for Table of Contents generation

**Example Transformation:**
```markdown
## My Awesome Heading
```
↓
```html
<h2 id="my-awesome-heading">My Awesome Heading</h2>
```

**Configuration:**
```typescript
import rehypeSlug from "rehype-slug";

rehypePlugins: [
  rehypeSlug  // No options needed
]
```

**Used By:**
- Table of Contents component (`extractHeadings`)
- Deep linking to sections
- Reading progress tracking

---

### 2. rehype-pretty-code

**Purpose:** Syntax highlighting with Shiki

**Key Features:**
- Dual-theme support (light/dark)
- Line highlighting
- Inline code styling
- Language-specific highlighting
- No runtime JavaScript

**Configuration:**
```typescript
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  // Dual theme support
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  
  // Fallback for code blocks without language
  defaultLang: "plaintext",
  
  // Prevent empty lines from collapsing
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  
  // Add custom classes for line highlighting
  onVisitHighlightedLine(node) {
    node.properties.className?.push("highlighted");
  },
  
  // Add custom classes for word highlighting
  onVisitHighlightedChars(node) {
    node.properties.className = ["word"];
  },
};

rehypePlugins: [
  [rehypePrettyCode, rehypePrettyCodeOptions]
]
```

**Supported Themes:**
- **Light:** `github-light` - Clean, minimal light theme
- **Dark:** `github-dark-dimmed` - Softer dark theme with reduced contrast

**See:** [Syntax Highlighting](#syntax-highlighting) section for detailed examples

---

### 3. rehype-autolink-headings

**Purpose:** Adds clickable anchor links to headings

**Behavior:**
- Wraps heading content in anchor tags
- Links to the heading's ID (generated by `rehype-slug`)
- Enables permalink sharing

**Example Transformation:**
```html
<h2 id="my-heading">My Heading</h2>
```
↓
```html
<h2 id="my-heading">
  <a href="#my-heading" class="no-underline hover:text-primary">
    My Heading
  </a>
</h2>
```

**Configuration:**
```typescript
import rehypeAutolinkHeadings from "rehype-autolink-headings";

rehypePlugins: [
  rehypeSlug,  // Must come before autolink-headings
  [rehypePrettyCode, rehypePrettyCodeOptions],
  [
    rehypeAutolinkHeadings, 
    { 
      behavior: "wrap",  // Wrap entire heading in link
      properties: {
        className: "no-underline hover:text-primary"
      }
    }
  ]
]
```

**Behavior Options:**
- `wrap` - Wrap entire heading content (recommended)
- `before` - Insert link icon before heading
- `after` - Insert link icon after heading
- `prepend` - Add link inside heading, at start
- `append` - Add link inside heading, at end

**Plugin Order Matters:**
1. `rehypeSlug` - Generate IDs first
2. `rehypePrettyCode` - Apply syntax highlighting
3. `rehypeAutolinkHeadings` - Add anchor links last

---

## Syntax Highlighting

Syntax highlighting is powered by **Shiki**, a beautiful syntax highlighter using TextMate grammars.

### Features

✅ **No Runtime JavaScript** - All highlighting done at build time  
✅ **Accurate Grammar-Based** - Uses VSCode's TextMate grammars  
✅ **Theme Support** - Light/dark themes via CSS custom properties  
✅ **Language Detection** - 200+ languages supported out of the box  
✅ **Line Highlighting** - Highlight specific lines with metadata

### Theme Configuration

```typescript
theme: {
  dark: "github-dark-dimmed",  // Softer dark theme
  light: "github-light",       // Clean light theme
}
```

**How Themes Work:**
- Shiki generates CSS custom properties for each theme
- Theme switcher toggles between `.light` and `.dark` class on `<html>`
- No flash on page load (theme persisted via `next-themes`)

### Supported Languages

```typescript
defaultLang: "plaintext"  // Fallback for unknown languages
```

**Popular Languages:**
- **JavaScript/TypeScript** - `js`, `jsx`, `ts`, `tsx`
- **Markup** - `html`, `xml`, `svg`, `mdx`
- **Styles** - `css`, `scss`, `less`
- **Data** - `json`, `yaml`, `toml`
- **Shell** - `bash`, `sh`, `zsh`, `fish`
- **Config** - `nginx`, `dockerfile`, `gitignore`

**Full list:** https://shiki.style/languages

### Code Block Syntax

```markdown
```typescript
const greeting: string = "Hello, World!";
console.log(greeting);
```
```

**Generated HTML:**
```html
<pre class="group relative">
  <code data-language="typescript" data-theme="github-light github-dark-dimmed">
    <span class="line">
      <span style="color: var(--shiki-light-keyword); ...">const</span>
      <span style="color: var(--shiki-light-variable); ...">greeting</span>
      {/* ... more tokens ... */}
    </span>
  </code>
</pre>
```

### Empty Line Handling

```typescript
onVisitLine(node) {
  if (node.children.length === 0) {
    node.children = [{ type: "text", value: " " }];
  }
}
```

**Purpose:** Prevents empty lines from collapsing in `display: grid` layouts used for line-by-line rendering.

### Line Highlighting (Future)

```typescript
onVisitHighlightedLine(node) {
  node.properties.className?.push("highlighted");
}
```

**Usage (when implemented):**
```markdown
```typescript {2,4-6}
const a = 1;
const b = 2;  // Highlighted
const c = 3;
const d = 4;  // Highlighted
const e = 5;  // Highlighted
const f = 6;  // Highlighted
```
```

**Current Status:** Configuration present but not yet used in content. Add metadata syntax to enable.

### Inline Code

Inline code is **not** processed by `rehype-pretty-code`. It's styled by the custom `code` component:

```typescript
code: (props) => {
  const isInline = !props["data-language"];
  if (isInline) {
    return (
      <code 
        {...props} 
        className="rounded-md bg-muted px-1.5 py-0.5 text-[0.875em] font-mono"
      />
    );
  }
  return <code {...props} />;
}
```

**Example:** `const x = 42` is rendered as inline code with muted background.

---

## Component Mapping

Custom React components replace standard HTML elements for consistent styling.

### Typography Components

#### Headings

```typescript
h1: (props) => (
  <h1 
    {...props} 
    className="font-serif text-3xl md:text-4xl font-semibold tracking-tight mt-8 first:mt-0 scroll-mt-20" 
  />
),
h2: (props) => (
  <h2 
    {...props} 
    className="font-serif text-2xl md:text-3xl font-semibold tracking-tight mt-8 scroll-mt-20" 
  />
),
h3: (props) => (
  <h3 
    {...props} 
    className="font-serif text-xl md:text-2xl font-medium mt-6 scroll-mt-20" 
  />
),
```

**Key Features:**
- **Font:** Serif for elegance and readability
- **Spacing:** Responsive margins with `first:mt-0` exception
- **Scroll Offset:** `scroll-mt-20` accounts for fixed header
- **Responsive:** Different sizes on mobile vs desktop

#### Paragraphs

```typescript
p: (props) => (
  <p {...props} className="leading-7 [&:not(:first-child)]:mt-4" />
),
```

**Features:**
- Generous line height (1.75) for readability
- Automatic spacing between paragraphs
- First paragraph has no top margin

#### Blockquotes

```typescript
blockquote: (props) => (
  <blockquote 
    {...props} 
    className="font-serif border-l-4 border-primary/30 pl-6 my-6 text-muted-foreground"
  />
),
```

**Styling:**
- Serif font
- Left border accent
- Muted color for distinction
- Generous vertical spacing

### List Components

```typescript
ul: (props) => (
  <ul {...props} className="list-disc pl-5 [&>li]:mt-2" />
),
ol: (props) => (
  <ol {...props} className="list-decimal pl-5 [&>li]:mt-2" />
),
```

**Features:**
- Standard bullet/number markers
- Consistent indentation
- Spaced list items for readability

### Code Components

#### Inline Code

```typescript
code: (props) => {
  const isInline = !props["data-language"];
  if (isInline) {
    return (
      <code 
        {...props} 
        className="rounded-md bg-muted px-1.5 py-0.5 text-[0.875em] font-mono font-medium border border-border/50"
      />
    );
  }
  return <code {...props} />;
}
```

**Detection:** Inline code lacks `data-language` attribute (added by `rehype-pretty-code`)

**Styling:**
- Muted background for contrast
- Subtle border
- Slightly smaller font size
- Monospace font
- Rounded corners

#### Code Blocks (Pre)

```typescript
pre: (props) => (
  <pre 
    {...props} 
    className="group relative [&>code]:grid [&>code]:text-[0.875rem]"
  />
),
```

**Features:**
- `group` enables group-hover effects (for copy button, etc.)
- `relative` positioning for absolute-positioned children
- Grid display for line-by-line rendering
- Smaller font size for code density

### Link Component

```typescript
a: (props) => {
  const isHeaderAnchor = props.className?.includes('no-underline');
  const href = props.href || '';
  const isExternal = href.startsWith('http://') || href.startsWith('https://');
  
  return (
    <a 
      {...props} 
      className={isHeaderAnchor 
        ? "hover:text-primary" 
        : "underline underline-offset-4 hover:text-primary"
      }
      {...(isExternal && {
        target: "_blank",
        rel: "noopener noreferrer"
      })}
    />
  );
}
```

**Features:**
- **External Link Detection:** Opens in new tab with security attributes
- **Header Anchor Styling:** No underline for heading links
- **Hover Effect:** Primary color on hover
- **Underline Offset:** Improved readability for inline links

### Horizontal Rule

```typescript
hr: (props) => (
  <hr {...props} className="mt-8 mb-4 border-border" />
),
```

**Styling:**
- Generous top margin for section breaks
- Theme-aware border color

---

## Customization Guide

### Adding a New Remark Plugin

1. **Install the plugin:**
   ```bash
   npm install remark-emoji
   ```

2. **Import in MDX component:**
   ```typescript
   import remarkEmoji from "remark-emoji";
   ```

3. **Add to plugin array:**
   ```typescript
   remarkPlugins: [
     remarkGfm,
     remarkEmoji  // Add here
   ]
   ```

### Adding a New Rehype Plugin

1. **Install the plugin:**
   ```bash
   npm install rehype-external-links
   ```

2. **Import and configure:**
   ```typescript
   import rehypeExternalLinks from "rehype-external-links";
   
   rehypePlugins: [
     rehypeSlug,
     [rehypePrettyCode, rehypePrettyCodeOptions],
     [rehypeAutolinkHeadings, { /* ... */ }],
     [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]
   ]
   ```

### Customizing Syntax Highlighting Themes

**Available Themes:** https://shiki.style/themes

**Example - Changing to Dracula:**
```typescript
theme: {
  dark: "dracula",
  light: "github-light",
}
```

**Multiple Theme Variants:**
```typescript
theme: {
  dark: "github-dark",
  light: "github-light",
  dimmed: "github-dark-dimmed",  // Custom variant
}
```

### Adding Custom MDX Components

1. **Define component:**
   ```typescript
   const CustomCallout = ({ children, type = "info" }: { 
     children: React.ReactNode; 
     type?: "info" | "warning" | "error" 
   }) => (
     <div className={`callout callout-${type}`}>
       {children}
     </div>
   );
   ```

2. **Add to component map:**
   ```typescript
   const components = {
     // ... existing components
     Callout: CustomCallout,
   };
   ```

3. **Use in MDX:**
   ```mdx
   <Callout type="warning">
     This is a warning!
   </Callout>
   ```

### Customizing Component Styles

**Example - Changing heading colors:**
```typescript
h2: (props) => (
  <h2 
    {...props} 
    className="font-serif text-2xl font-bold text-primary mt-8 scroll-mt-20" 
  />
),
```

**Example - Adding blockquote icon:**
```typescript
blockquote: (props) => (
  <blockquote 
    {...props} 
    className="relative font-serif border-l-4 border-primary/30 pl-6 my-6 before:content-['"'] before:absolute before:left-2 before:text-4xl before:text-primary/20"
  />
),
```

---

## Troubleshooting

### Code Blocks Not Highlighting

**Symptom:** Code appears as plain text without colors

**Causes & Solutions:**

1. **Missing language identifier:**
   ````markdown
   ```
   const x = 42;  // ❌ No language
   ```
   
   ```typescript
   const x = 42;  // ✅ With language
   ```
   ````

2. **Unsupported language:**
   - Check: https://shiki.style/languages
   - Use `plaintext` as fallback

3. **Plugin order wrong:**
   ```typescript
   // ❌ Wrong order
   rehypePlugins: [
     rehypeAutolinkHeadings,  // Too early
     rehypeSlug,
     [rehypePrettyCode, options],
   ]
   
   // ✅ Correct order
   rehypePlugins: [
     rehypeSlug,
     [rehypePrettyCode, options],
     rehypeAutolinkHeadings,
   ]
   ```

### Heading Links Not Working

**Symptom:** Clicking heading links doesn't scroll to section

**Solutions:**

1. **Verify `rehype-slug` is installed and configured**
2. **Check plugin order** - `rehypeSlug` must come first
3. **Verify scroll margin:**
   ```typescript
   h2: (props) => (
     <h2 {...props} className="... scroll-mt-20" />  // Must have scroll-mt
   )
   ```

### Table of Contents Empty

**Symptom:** TOC shows no headings

**Causes:**

1. **Post has no H2/H3 headings**
   - TOC only extracts `h2` and `h3` by default
   
2. **Heading extraction regex broken:**
   ```typescript
   // src/lib/blog.ts
   const headingRegex = /^##?\s+(.+)$/gm;  // Matches ## and ###
   ```

3. **Frontmatter markers interfering:**
   - Ensure heading extraction happens after frontmatter removal

### Inline Code vs Code Blocks Confusion

**Problem:** Inline code gets block styling or vice versa

**Solution:**

The `data-language` attribute differentiates them:

```typescript
code: (props) => {
  const isInline = !props["data-language"];  // Check attribute
  if (isInline) {
    return <code className="inline-styles" {...props} />;
  }
  return <code {...props} />;  // Block code (handled by pre)
}
```

**Debugging:**
```typescript
code: (props) => {
  console.log("Code props:", props);  // Check attributes
  // ...
}
```

### Theme Not Switching

**Symptom:** Syntax highlighting stays in one theme

**Causes:**

1. **Missing theme provider:**
   ```typescript
   // src/app/layout.tsx
   import { ThemeProvider } from "next-themes";
   
   <ThemeProvider attribute="class" defaultTheme="system">
     {children}
   </ThemeProvider>
   ```

2. **Wrong Shiki theme configuration:**
   ```typescript
   // ❌ Single theme only
   theme: "github-dark"
   
   // ✅ Dual theme
   theme: {
     dark: "github-dark-dimmed",
     light: "github-light",
   }
   ```

3. **CSS class not applied:**
   - Verify `<html>` has `.light` or `.dark` class
   - Check browser DevTools

### Build Errors with MDX

**Error:** `Cannot find module 'next-mdx-remote/rsc'`

**Solution:**
```bash
npm install next-mdx-remote@latest
```

**Error:** `Plugin is not a function`

**Solution:** Check plugin import and usage:
```typescript
// ❌ Wrong
import rehypeSlug from "rehype-slug";
rehypePlugins: [[rehypeSlug]]  // Extra array

// ✅ Correct
import rehypeSlug from "rehype-slug";
rehypePlugins: [rehypeSlug]  // Direct reference
```

### Performance Issues

**Symptom:** Slow page loads or builds

**Solutions:**

1. **Limit syntax highlighting languages:**
   ```typescript
   // In rehype-pretty-code options (if supported by version)
   langs: ["typescript", "javascript", "jsx", "tsx", "bash", "json"]
   ```

2. **Enable caching:**
   - MDX is compiled at build time (App Router default)
   - No runtime compilation needed

3. **Optimize images:**
   - Use `next/image` for images in MDX
   - Consider image optimization service

---

## Performance Considerations

### Build-Time Compilation

✅ **Server Components** - MDX compiled during build  
✅ **No Runtime Cost** - Syntax highlighting done at build time  
✅ **Static Generation** - Blog pages fully static by default  
✅ **Zero JavaScript** - Syntax highlighting requires no client JS

### Bundle Size

- **next-mdx-remote:** ~20KB (server-only)
- **Shiki:** Not included in client bundle (build-time only)
- **Rehype plugins:** Server-only, no client impact

### Optimization Tips

1. **Use Static Generation:**
   ```typescript
   export async function generateStaticParams() {
     return posts.map((post) => ({ slug: post.slug }));
   }
   ```

2. **Avoid Client Components:**
   - Keep MDX component as server component
   - Only mark interactive elements as client components

3. **Lazy Load Heavy Features:**
   ```typescript
   const CodeBlock = lazy(() => import("./code-block"));
   ```

---

## Related Documentation

- **[Blog Architecture](./architecture)** - Overall blog system design
- **[MDX Component](../components/mdx)** - Component API reference
- **[Content Creation](./content-creation)** - Writing blog posts
- **[Quick Reference](./quick-reference)** - Cheat sheet

---

## References

### Official Documentation

- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) - MDX for Next.js
- [Shiki](https://shiki.style/) - Syntax highlighter
- [Remark](https://github.com/remarkjs/remark) - Markdown processor
- [Rehype](https://github.com/rehypejs/rehype) - HTML processor
- [Unified](https://unifiedjs.com/) - Content transformation ecosystem

### Plugin Documentation

- [remark-gfm](https://github.com/remarkjs/remark-gfm) - GitHub-flavored Markdown
- [rehype-slug](https://github.com/rehypejs/rehype-slug) - Auto-generate heading IDs
- [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) - Anchor links
- [rehype-pretty-code](https://github.com/rehype-pretty/rehype-pretty-code) - Syntax highlighting

---

**Last Updated:** October 24, 2025  
**Maintained By:** Project Team  
**Status:** ✅ Production-ready

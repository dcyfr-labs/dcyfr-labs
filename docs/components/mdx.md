{/* TLP:CLEAR */}

# MDX Component Documentation

**Component:** `MDX`  
**Location:** `src/components/mdx.tsx`  
**Type:** Server Component  
**Purpose:** Core blog content renderer with diagram and math support

**Status:** ✅ Production  
**Last Updated:** November 11, 2025

---

## Summary

The `MDX` component is the heart of the blog rendering system. It transforms MDX (Markdown + JSX) content into fully-styled, interactive HTML with:
- Syntax highlighting via Shiki
- Auto-linking and slugs for headings
- **Mermaid diagram rendering** - Flowcharts, sequence diagrams, class diagrams, and more
- **LaTeX math rendering** - Inline and block mathematical equations via KaTeX
- Custom component mappings for consistent styling

---

## Usage

### Basic Usage

```tsx
import { MDX } from "@/components/mdx";

export default function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <MDX source={post.body} />
    </article>
  );
}
```

### In Blog Post Page

```tsx
// src/app/blog/[slug]/page.tsx
import { MDX } from "@/components/mdx";

export default async function PostPage({ params }) {
  const post = getPostBySlug(params.slug);
  
  return (
    <article>
      {/* ... header content ... */}
      <div className="mt-8">
        <MDX source={post.body} />
      </div>
    </article>
  );
}
```

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `source` | `string` | ✅ Yes | Raw MDX content (usually from `post.body`) |

---

## Features

### 1. **MDX Processing**

Transforms MDX to React components using `next-mdx-remote`:

```typescript
<MDXRemote
  source={source}
  options={{
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, rehypePrettyCodeOptions],
        [rehypeAutolinkHeadings, { /* ... */ }]
      ],
    },
  }}
  components={components}
/>
```

### 2. **Syntax Highlighting (Shiki)**

Code blocks automatically highlighted with theme support:

```typescript
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false, // Use CSS theme colors
  defaultLang: "plaintext",
  onVisitLine(node) {
    // Prevent empty line collapse
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className?.push("highlighted");
  },
  onVisitHighlightedChars(node) {
    node.properties.className = ["word"];
  },
};
```

**Themes:**
- Light mode: `github-light`
- Dark mode: `github-dark-dimmed`
- Automatic switching via `next-themes`

### 3. **Custom Component Mappings**

Standard HTML elements mapped to styled React components:

```typescript
const components = {
  h1: (props) => <h1 className="text-3xl md:text-4xl ..." {...props} />,
  h2: (props) => <h2 className="text-2xl md:text-3xl ..." {...props} />,
  h3: (props) => <h3 className="text-xl md:text-2xl ..." {...props} />,
  p: (props) => <p className="leading-7 ..." {...props} />,
  ul: (props) => <ul className="my-4 ml-6 list-disc ..." {...props} />,
  ol: (props) => <ol className="my-4 ml-6 list-decimal ..." {...props} />,
  li: (props) => <li className="mt-2" {...props} />,
  blockquote: (props) => <blockquote className="mt-4 border-l-4 ..." {...props} />,
  code: (props) => { /* inline vs block logic */ },
  pre: (props) => <pre className="group relative ..." {...props} />,
  hr: (props) => <hr className="mt-8 mb-4 ..." {...props} />,
  a: (props) => { /* link handling with external detection */ },
};
```

### 4. **Auto-Linking Headings**

All headings get automatic anchor links:

```typescript
rehypePlugins: [
  rehypeSlug, // Adds id to headings
  [
    rehypeAutolinkHeadings,
    {
      behavior: "wrap",
      properties: {
        className: "no-underline hover:text-primary"
      }
    }
  ]
]
```

**Result:**
```html
<h2 id="my-heading">
  <a href="#my-heading" class="no-underline hover:text-primary">
    My Heading
  </a>
</h2>
```

### 5. **GitHub-Flavored Markdown**

Supports GFM extensions via `remark-gfm`:
- Tables
- Task lists
- Strikethrough
- Autolinks
- Footnotes

---

## Component Styling

### Headings

```tsx
// All headings have scroll-mt-20 for smooth scroll offset
h1: className="text-3xl md:text-4xl font-semibold tracking-tight mt-8 first:mt-0 scroll-mt-20"
h2: className="text-2xl md:text-3xl font-semibold tracking-tight mt-8 scroll-mt-20"
h3: className="text-xl md:text-2xl font-medium mt-6 scroll-mt-20"
```

**Features:**
- Responsive sizing (mobile → desktop)
- Proper spacing (mt-6/mt-8)
- First heading no top margin (`first:mt-0`)
- Scroll offset for anchor navigation (`scroll-mt-20`)

### Paragraphs & Text

```tsx
p: className="leading-7 [&:not(:first-child)]:mt-4"
```

- Generous line height for readability
- Spacing between paragraphs (except first)

### Lists

```tsx
ul: className="my-4 ml-6 list-disc [&>li]:mt-2"
ol: className="my-4 ml-6 list-decimal [&>li]:mt-2"
li: className="mt-2"
```

- Indented with bullets/numbers
- Spaced list items
- Nested lists supported

### Code

**Inline Code:**
```tsx
<code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
  {children}
</code>
```

**Code Blocks:**
```tsx
<pre className="group relative [&>code]:grid [&>code]:text-[0.875rem]">
  {/* Shiki generates syntax-highlighted content */}
</pre>
```

- Grid display prevents line collapse
- Relative positioning for copy button (future)
- Monospace font

### Blockquotes

```tsx
<blockquote className="mt-4 border-l-4 border-primary/30 pl-6 text-muted-foreground">
  {children}
</blockquote>
```

- Left border accent
- Italicized
- Muted text color

### Links

```tsx
const isExternal = href.startsWith('http://') || href.startsWith('https://');

<a 
  href={href}
  className="underline underline-offset-4 hover:text-primary"
  {...(isExternal && {
    target: "_blank",
    rel: "noopener noreferrer"
  })}
>
  {children}
</a>
```

**Features:**
- External links open in new tab
- Security attributes (`noopener noreferrer`)
- Hover state
- Underline offset for better readability

---

## Plugins

### Remark Plugins (Markdown → MDAST)

#### `remark-gfm`

Adds GitHub-Flavored Markdown support:

- Tables
- Task lists (`- [ ]`, `- [x]`)
- Strikethrough (`~~text~~`)
- Autolinks
- Footnotes

**Usage:**

```typescript
remarkPlugins: [remarkGfm]
```

#### `remark-math`

Parses LaTeX math notation in Markdown:

- Inline math: `$E = mc^2$`
- Block math: `$$...$$`

**Usage:**

```typescript
remarkPlugins: [remarkGfm, remarkMath]
```

### Rehype Plugins (MDAST → HTML)

#### `rehype-slug`

Automatically adds `id` attributes to headings:

```html
{/* Input: ## My Heading */}
{/* Output: */}
<h2 id="my-heading">My Heading</h2>
```

#### `rehype-pretty-code` (Shiki)

Syntax highlighting for code blocks:

**Features:**

- Dual theme support (light/dark)
- Line highlighting
- Character highlighting
- Language detection
- Custom styling hooks

**Configuration:**

```typescript
[rehypePrettyCode, {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
}]
```

#### `rehype-katex`

Renders mathematical equations using KaTeX:

- Fast, server-side rendering
- No client-side JavaScript overhead
- Supports extensive LaTeX commands

**Usage:**

```typescript
rehypePlugins: [rehypeKatex]
```

**Styling:** KaTeX CSS imported in `src/app/layout.tsx`

#### `rehype-autolink-headings`

Wraps headings in anchor links:

```typescript
[rehypeAutolinkHeadings, {
  behavior: "wrap",
  properties: {
    className: "no-underline hover:text-primary"
  }
}]
```

**Result:** Clickable headings for direct linking

---

## Diagram and Math Support

### Mermaid Diagrams

The MDX component automatically renders Mermaid diagrams when you use a code fence with the `mermaid` language:

```markdown
```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```
```

**Supported diagram types:**

- Flowcharts
- Sequence diagrams
- Class diagrams
- State diagrams
- Entity relationship diagrams
- Gantt charts
- Pie charts
- Git graphs

**See:** Diagram and Math Guide for complete examples

### LaTeX Math Equations

**Inline math** (within text):

```markdown
Einstein's equation is $E = mc^2$.
```

**Block math** (centered, standalone):

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**Common use cases:**

- Mathematical formulas
- Statistical equations
- Algorithm complexity notation
- Physics equations
- Financial calculations

**See:** Diagram and Math Guide for syntax examples

---

## Code Handling

### Inline vs Block Detection

```typescript
code: (props) => {
  const isInline = !props.className?.includes("data-language");
  
  if (isInline) {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
        {props.children}
      </code>
    );
  }
  
  // Block code handled by Shiki
  return <code {...props} />;
}
```

**Detection:**
- Block code: Has `data-language` attribute from Shiki
- Inline code: No `data-language` attribute

### Language Support

Shiki supports 100+ languages:
- **Web:** HTML, CSS, SCSS, JavaScript, TypeScript, JSX, TSX
- **Systems:** C, C++, Rust, Go, Python, Java, C#
- **Scripting:** Bash, Shell, PowerShell, Ruby, PHP
- **Data:** JSON, YAML, TOML, XML, SQL
- **Markup:** Markdown, MDX, LaTeX
- **Config:** .env, Dockerfile, nginx.conf
- **And many more...**

---

## Performance Characteristics

### Server-Side Rendering

- Component runs on server (Next.js App Router)
- HTML generated at build time
- Client receives static HTML
- Zero JavaScript for content rendering

### Build-Time Processing

```
MDX Source → Remark → Rehype → Shiki → HTML
     ↓          ↓        ↓        ↓      ↓
  Parse    Transform  Enhance  Highlight Output
```

**Benefits:**
- Fast page loads (pre-rendered)
- SEO-friendly (static HTML)
- No client-side processing overhead

### Bundle Impact

- `next-mdx-remote/rsc`: ~15KB (server-only)
- Shiki themes: Server-side only (no client bundle)
- Custom components: Minimal CSS

---

## Accessibility

### Semantic HTML

All components use proper semantic elements:
- `<h1>`, `<h2>`, `<h3>` for headings (not `<div>`)
- `<p>` for paragraphs
- `<ul>`, `<ol>`, `<li>` for lists
- `<blockquote>` for quotes
- `<code>`, `<pre>` for code

### Keyboard Navigation

- Links focusable with `Tab`
- Anchor links navigable
- Skip to content supported

### Screen Readers

- Proper heading hierarchy
- Alt text preserved for images
- ARIA labels where needed
- Semantic landmarks

### Color Contrast

- Text meets WCAA AA (4.5:1 minimum)
- Code blocks have sufficient contrast
- Links clearly distinguishable

---

## Customization

### Adding Custom Components

```typescript
// src/components/mdx.tsx
const components = {
  // Existing components...
  
  // Add custom component
  Callout: ({ type, children }: { type: string; children: React.ReactNode }) => (
    <div className={`callout callout-${type}`}>
      {children}
    </div>
  ),
};
```

**Usage in MDX:**
```mdx
<Callout type="warning">
  This is important!
</Callout>
```

### Modifying Styles

Edit component className props:

```typescript
h2: (props) => (
  <h2 
    {...props} 
    className="text-2xl font-bold mt-8" // Custom styles
  />
),
```

### Adding Plugins

```typescript
<MDXRemote
  options={{
    mdxOptions: {
      remarkPlugins: [
        remarkGfm,
        remarkMath, // New plugin
      ],
      rehypePlugins: [
        // ...existing,
        rehypeKatex, // New plugin
      ],
    },
  }}
/>
```

---

## Common Patterns

### Conditionally Rendering Content

```tsx
{post.featured && (
  <div className="featured-banner">
    <MDX source={post.body} />
  </div>
)}
```

### Wrapping with Context

```tsx
<article className="prose dark:prose-invert">
  <MDX source={post.body} />
</article>
```

### Multiple MDX Sources

```tsx
<div>
  <MDX source={post.intro} />
  <div className="ad-slot" />
  <MDX source={post.mainContent} />
</div>
```

---

## Troubleshooting

### Code Block Not Highlighting

**Problem:** Code appears as plain text

**Check:**
1. Language specified in fence? ````typescript` vs ````
2. Valid language name?
3. Shiki installed? `npm list shiki`

**Fix:**
```markdown
# Before
```
code here
```

# After
```typescript
code here
```
```

### Inline Code Styled as Block

**Problem:** Inline code has block styling

**Check:**
- Component detection logic
- `data-language` attribute presence

**Debug:**
```tsx
code: (props) => {
  console.log('Props:', props); // Check attributes
  // ...
}
```

### Links Not Opening in New Tab

**Problem:** External links open in same tab

**Check:**
- `isExternal` detection logic
- `target` and `rel` attributes applied

**Fix:** Ensure href check is correct:
```typescript
const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
```

### Heading IDs Missing

**Problem:** Can't link to headings

**Check:**
1. `rehype-slug` plugin installed?
2. Plugin order correct? (slug before autolink)

**Verify:**
```html
{/* Should have id */}
<h2 id="my-heading">My Heading</h2>
```

---

## Related Components

- **`PostList`** - Uses MDX for post excerpts
- **`TableOfContents`** - Extracts heading IDs from MDX
- **`BlogPostSkeleton`** - Loading state while MDX renders

---

## Related Documentation

- [Blog Architecture](../blog/architecture)
- [MDX Processing](../blog/mdx-processing)
- [Syntax Highlighting Quick Reference](../operations/syntax-highlighting-quick-reference)

---

## External Resources

- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- [Shiki Documentation](https://shiki.style/)
- [rehype-pretty-code](https://rehype-pretty-code.netlify.app/)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)

---

_The MDX component is the foundation of the blog's rendering system, transforming simple markdown into rich, interactive content with minimal client-side JavaScript._

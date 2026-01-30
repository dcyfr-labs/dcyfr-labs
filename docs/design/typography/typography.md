<!-- TLP:CLEAR -->

# Typography System

This project uses a consistent, professional typography system optimized for cross-browser compatibility and readability.

## Font Stack

### Sans-serif (Primary) - Geist Sans
**Variable:** `--font-geist-sans`  
**Class:** `font-sans`  
**Usage:** Body text, UI elements, navigation, buttons

Geist Sans is a modern, geometric sans-serif font designed by Vercel. It features excellent readability at all sizes and includes comprehensive OpenType features.

**Characteristics:**
- Clean, modern appearance
- Excellent screen rendering
- Wide character set with full Latin support
- Optimized for digital interfaces
- Display: swap (for performance)

**Fallback chain:**
```css
var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

### Serif (Accent) - Source Serif 4
**Variable:** `--font-serif`  
**Class:** `font-serif`  
**Usage:** Headings, pull quotes, emphasis, editorial content

Source Serif 4 is Adobe's modern serif typeface that provides beautiful contrast to Geist Sans. It's a geometric serif font designed to complement Source Sans, making it an ideal pairing with Geist Sans's similar design philosophy.

**Characteristics:**
- Modern, geometric serif design
- Excellent technical precision
- Beautiful variable font with full weight range
- Optimized for both display and text sizes
- Variable font axis: weight (200-900)
- Display: swap (for performance)

**Fallback chain:**
```css
var(--font-serif), ui-serif, Georgia, Cambria, "Times New Roman", Times, serif
```

### Monospace (Code) - Geist Mono
**Variable:** `--font-geist-mono`  
**Class:** `font-mono`  
**Usage:** Code blocks, inline code, technical content

Geist Mono is designed to complement Geist Sans with monospaced characters for code.

**Characteristics:**
- Clear character differentiation (0 vs O, 1 vs l vs I)
- Consistent character width
- Excellent for code blocks
- Display: swap (for performance)

**Fallback chain:**
```css
var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace
```

## Implementation

### Next.js Font Configuration
Fonts are loaded via `next/font/google` in `src/app/layout.tsx`:

```tsx
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});
```

### Tailwind Configuration
Font variables are configured in `src/app/globals.css`:

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-serif: var(--font-serif);
  --font-mono: var(--font-geist-mono);
}
```

## Usage Guidelines

### Body Text (Default)
The body element uses Geist Sans by default via the `antialiased` utility. No additional classes needed.

```tsx
<p>This text automatically uses Geist Sans.</p>
```

### Headings with Serif
Apply `font-serif` to headings for editorial emphasis:

```tsx
<h1 className="font-serif text-4xl font-bold">Elegant Heading</h1>
<h2 className="font-serif text-3xl font-semibold">Subheading</h2>
```

### Inline Code
Use `font-mono` for inline code:

```tsx
<code className="font-mono">const example = true;</code>
```

### Block Quotes
Quotes automatically use serif font (configured in globals.css):

```tsx
<blockquote className="prose">
  This quote uses Crimson Pro for elegant emphasis.
</blockquote>
```

### Mixed Typography
Combine fonts for visual hierarchy:

```tsx
<div>
  <h1 className="font-serif text-4xl font-bold mb-2">
    Article Title
  </h1>
  <p className="font-sans text-base text-muted-foreground">
    Body text in Geist Sans for optimal readability.
  </p>
</div>
```

## Automatic Styling

### Prose Content
Headings in prose content (MDX blog posts) automatically use serif fonts:

```css
.prose h1, .prose h2 {
  font-family: var(--font-serif);
  font-weight: 700;
  letter-spacing: -0.025em;
}

.prose blockquote {
  font-family: var(--font-serif);
  font-style: italic;
}
```

### Code Blocks
Pre-formatted code blocks automatically use Geist Mono with proper syntax highlighting.

## Performance Considerations

1. **Font Display Swap:** All fonts use `display: "swap"` to prevent invisible text (FOIT)
2. **Subset Loading:** Only Latin characters are loaded to reduce file size
3. **Variable Fonts:** Geist fonts are variable fonts, reducing the number of font files
4. **Preloading:** Next.js automatically optimizes font loading

## Cross-Browser Compatibility

The comprehensive fallback chains ensure consistent rendering across:
- ✅ Chrome/Edge (Blink)
- ✅ Firefox (Gecko)
- ✅ Safari (WebKit)
- ✅ iOS Safari
- ✅ Android Chrome

### Fallback Strategy
1. Try custom font (Geist/Crimson)
2. Fall back to system UI fonts
3. Fall back to classic web-safe fonts
4. Browser default as last resort

## Examples

### Homepage Hero
```tsx
<section>
  <h1 className="font-serif text-5xl font-bold tracking-tight">
    Welcome to My Portfolio
  </h1>
  <p className="font-sans text-xl text-muted-foreground">
    Building modern web experiences with Next.js
  </p>
</section>
```

### Blog Post Title
```tsx
<article>
  <h1 className="font-serif text-4xl font-bold mb-4">
    Understanding React Server Components
  </h1>
  <div className="prose prose-lg">
    {/* Content automatically uses proper fonts */}
  </div>
</article>
```

### Code Example
```tsx
<div className="space-y-2">
  <p className="font-sans">Here's how to use TypeScript:</p>
  <pre className="font-mono">
    <code>const greet = (name: string) =&gt; `Hello, ${name}!`;</code>
  </pre>
</div>
```

## Testing

To verify font loading:

1. Open DevTools → Network tab
2. Filter by "font"
3. Check for Geist and Source Serif font files
4. Verify no FOIT (fonts should swap in smoothly)

## Related Files

- `src/app/layout.tsx` - Font configuration
- `src/app/globals.css` - Theme integration and utilities
- `src/components/mdx.tsx` - MDX component styling

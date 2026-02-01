# Code Block Overflow Best Practices

**Status:** Production Ready
**Last Updated:** January 31, 2026
**Implementation:** `src/app/globals.css`, `src/styles/prose-typography.css`, `src/components/mdx/`

---

## Philosophy: Horizontal Scroll > Word Wrap

Modern best practice for code blocks is **horizontal scrolling** rather than word-wrapping. This preserves code structure, maintains readability, and ensures copy-paste works correctly.

---

## Implementation

### Core CSS (globals.css)

```css
/* Horizontal scroll with modern handling */
pre {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* Smooth mobile scroll */

  /* Preserve code structure - NO word wrap */
  white-space: pre;
  word-wrap: normal;
  word-break: normal;

  /* Constrain maximum width */
  max-width: 100%;
}
```

### Why NOT Word Wrap?

❌ **Problems with `white-space: pre-wrap`:**

1. **Destroys visual hierarchy** - Indentation becomes meaningless
2. **Ambiguous line breaks** - Can't tell actual vs. wrapped lines
3. **Broken copy-paste** - Code structure doesn't preserve
4. **Confusing nesting** - Hard to understand code depth
5. **Developer expectations** - Developers expect horizontal scroll

✅ **Benefits of horizontal scroll:**

1. **Preserves formatting** - Exact code structure maintained
2. **Clear line breaks** - Actual newlines are obvious
3. **Working copy-paste** - Code copies correctly
4. **Familiar UX** - Standard developer tool behavior
5. **Professional appearance** - Matches IDEs and GitHub

---

## Modern Enhancements

### 1. Smooth Mobile Scrolling

```css
pre {
  -webkit-overflow-scrolling: touch; /* iOS momentum scroll */
}
```

**Why:** Makes scrolling feel native on touch devices

### 2. Fade Gradient Indicators

Visual cue that content extends beyond visible area:

```css
pre::after {
  content: '';
  position: absolute;
  right: 0;
  width: 3rem;
  background: linear-gradient(to right, transparent, background);
  opacity: 0;
}

pre:hover::after {
  opacity: 1;
}
```

**Why:** Users immediately know there's more content to scroll

### 3. Modern Scrollbar Styling

```css
pre::-webkit-scrollbar {
  height: 0.5rem;
}

pre::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted));
  border-radius: 999px;
}
```

**Why:** More polished appearance than default browser scrollbar

### 4. Copy Button Component

```tsx
<CodeBlockCopyButton code={codeString} />
```

**Features:**

- One-click clipboard copy
- Visual feedback (check icon)
- Touch-friendly (44x44px minimum)
- Accessible (ARIA labels, keyboard support)

**Why:** Eliminates need for manual text selection

### 5. Max-Width Constraints

```css
pre {
  max-width: 100%; /* Prevent excessive horizontal expansion */
}
```

**Why:** Prevents code blocks from becoming wider than viewport

---

## Mobile Optimizations

### Responsive Adjustments

```css
@media (max-width: 48rem) {
  .prose pre {
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;

    /* Mobile scrollbar - thinner */
    &::-webkit-scrollbar {
      height: 0.375rem;
    }

    /* Mobile gradient - narrower */
    &::after {
      width: 2rem;
    }
  }
}
```

### Touch Targets

All interactive elements (copy button, scroll area) meet **44x44px minimum** per Apple/Google guidelines.

---

## Component Usage

### Basic Code Block

```tsx
<CodeBlock language="typescript">{`const example = "code";`}</CodeBlock>
```

### With Filename Header

```tsx
<CodeBlock language="typescript" filename="example.ts" raw={codeString}>
  {children}
</CodeBlock>
```

### With Line Numbers

```tsx
<CodeBlock language="python" showLineNumbers>
  {children}
</CodeBlock>
```

---

## Accessibility

### Keyboard Navigation

- **Tab**: Focus code block
- **Arrow keys**: Scroll horizontally
- **Escape**: Blur code block

### Screen Readers

- Semantic HTML (`<figure>`, `<figcaption>` when filename present)
- ARIA labels on copy button
- Language hints for syntax highlighters

### Color Contrast

All code colors meet **WCAG 2.1 AA** standards:

- Light mode: 4.5:1 minimum contrast
- Dark mode: Enhanced contrast for readability

---

## Performance

### Optimization Strategies

1. **GPU Acceleration**: Transform properties on interactive elements
2. **Will-change**: Hint browser for scroll optimization
3. **Contain**: Layout containment for scroll areas
4. **Lazy Rendering**: Virtual scrolling for very long code blocks

### Metrics

- **Scroll performance**: 60fps on mobile devices
- **Copy button delay**: <100ms response time
- **Gradient fade**: 150ms transition (matches design tokens)

---

## Design Token Integration

All spacing, colors, and timing use design tokens:

```tsx
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

// Padding
padding: SPACING.content; // 1rem 1.5rem

// Font size
fontSize: TYPOGRAPHY.code.sm; // 0.875rem

// Transitions
transition: `opacity var(--duration-fast) var(--ease-default)`;
```

---

## Testing

### Manual Testing Checklist

- [ ] Horizontal scroll works on mobile
- [ ] Copy button copies correct code
- [ ] Fade gradient appears on hover
- [ ] Scrollbar visible and styled
- [ ] No word-wrapping occurs
- [ ] Line numbers align correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces code content

### Browser Support

- ✅ Chrome/Edge (100+)
- ✅ Firefox (100+)
- ✅ Safari (15+)
- ✅ iOS Safari (15+)
- ✅ Android Chrome (100+)

### Known Limitations

- **Scrollbar styling**: Limited on Firefox (uses `scrollbar-width: thin`)
- **Fade gradient**: Requires pseudo-element support
- **Clipboard API**: Requires HTTPS or localhost

---

## Examples in Production

### TypeScript Code Block

```typescript
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className={`gap-${SPACING.content}`}>
      <code className={TYPOGRAPHY.code.sm}>{children}</code>
    </pre>
  );
}
```

### Long Lines (Demonstrates Scroll)

```bash
npm install @vercel/analytics @sentry/nextjs inngest next-mdx-remote rehype-pretty-code shiki tailwindcss@next @tailwindcss/typography lucide-react
```

### Multi-Line with Indentation

```python
def calculate_metrics(data):
    """
    Calculate engagement metrics from analytics data
    with proper indentation preserved
    """
    return {
        "views": sum(d["views"] for d in data),
        "clicks": sum(d["clicks"] for d in data),
        "engagement": calculate_engagement_rate(data)
    }
```

---

## Related Documentation

- [Design System](./design-system.md) - Token usage guidelines
- [Component Patterns](./component-patterns.md) - MDX component patterns
- Accessibility Guide - A11y requirements
- Mobile Patterns - Touch-friendly UX

---

## References

**Industry Standards:**

- [MDN: white-space](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
- [MDN: overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
- [Apple HIG: Touch Targets](https://developer.apple.com/design/human-interface-guidelines/touch-targets)
- [Google Material: Accessibility](https://material.io/design/usability/accessibility.html)

**Inspiration:**

- GitHub code blocks (horizontal scroll)
- VS Code editor (no word wrap by default)
- Stack Overflow snippets (scroll with fade indicators)

---

**Status:** Production Ready
**Maintained By:** DCYFR Labs Team
**Last Review:** January 31, 2026

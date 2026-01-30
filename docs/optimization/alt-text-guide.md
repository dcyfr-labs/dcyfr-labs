<!-- TLP:CLEAR -->

# Alt Text & Accessibility Guide

**Last Updated:** October 26, 2025  
**Status:** ✅ Project audit complete

---

## Overview

This guide documents alt text and ARIA accessibility best practices for the project, along with the results of a comprehensive accessibility audit.

## Audit Results

### ✅ Current Accessibility Status

**Components Reviewed:**
- Logo component (`logo.tsx`)
- Theme toggle (`theme-toggle.tsx`)
- GitHub heatmap (`github-heatmap.tsx`)
- Error boundary (`github-heatmap-error-boundary.tsx`)
- Share buttons (`share-buttons.tsx`)
- Related posts (`related-posts.tsx`)
- Post list (`post-list.tsx`)
- Table of contents (`table-of-contents.tsx`)
- Reading progress (`reading-progress.tsx`)
- Blog search (`blog-search-form.tsx`)
- Site header (`site-header.tsx`)

**Accessibility Features Implemented:**

✅ **Interactive Elements**
- All buttons have descriptive `aria-label` attributes
- Theme toggle: "Toggle theme"
- Share buttons: "Share on Twitter", "Share on LinkedIn", "Copy link to clipboard"
- Blog search: "Search blog posts"
- Table of contents: "Table of contents"

✅ **Decorative Elements**
- All decorative icons marked with `aria-hidden="true"`
- Bullet separators (•) have `aria-hidden="true"`
- Icon-only elements within labeled buttons have `aria-hidden="true"`

✅ **Semantic HTML**
- Navigation uses `<nav>` with `aria-label`
- Time elements use `<time>` with `dateTime` attribute
- Logo SVG has `role="img"` with `aria-label="DCYFR Labs Logo"`

✅ **No Issues Found**
- Zero `<img>` tags without alt text (project uses SVG/dynamic generation)
- All external links have proper `rel="noopener noreferrer"`
- All interactive SVGs have appropriate ARIA attributes

---

## Best Practices

### 1. Alt Text for Images

**When to use alt text:**
- Informative images (screenshots, diagrams, photos with meaning)
- Images that convey information
- Images used as links

**When to use empty alt (`alt=""`):**
- Decorative images
- Images described in surrounding text
- Images purely for visual design

**Examples:**

```tsx
// ✅ Good: Descriptive alt text
<Image
  src="/blog/screenshot.png"
  alt="VS Code editor showing TypeScript error highlighting"
  width={800}
  height={600}
/>

// ✅ Good: Empty alt for decorative image
<Image
  src="/decorative-pattern.png"
  alt=""
  width={100}
  height={100}
/>

// ❌ Bad: Generic alt text
<Image
  src="/screenshot.png"
  alt="screenshot"
  width={800}
  height={600}
/>
```

**Alt Text Writing Guidelines:**
- Be specific and descriptive
- Keep it concise (under 125 characters when possible)
- Don't start with "Image of" or "Picture of" (screen readers announce it's an image)
- Include relevant context from surrounding content
- For complex images, consider providing a longer description elsewhere

---

### 2. SVG Accessibility

**Interactive SVGs (logos, meaningful graphics):**
```tsx
// ✅ Good: Logo with role and aria-label
<svg
  role="img"
  aria-label="Company Logo"
  viewBox="0 0 100 100"
>
  <path d="..." />
</svg>
```

**Decorative SVGs (icons within buttons, visual decoration):**
```tsx
// ✅ Good: Decorative icon hidden from screen readers
<button aria-label="Toggle theme">
  <Sun className="h-5 w-5" aria-hidden="true" />
</button>

// ❌ Bad: Missing aria-hidden on decorative icon
<button aria-label="Share">
  <Share2 className="h-4 w-4" />
</button>
```

**Complex SVGs (charts, diagrams):**
```tsx
// ✅ Good: SVG with title and description
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">2024 Revenue Chart</title>
  <desc id="chart-desc">
    Bar chart showing quarterly revenue. Q1: $100k, Q2: $150k, Q3: $180k, Q4: $220k
  </desc>
  {/* chart elements */}
</svg>
```

---

### 3. ARIA Labels

**When to use `aria-label`:**
- Buttons without visible text (icon-only buttons)
- Navigation landmarks
- Interactive elements where visible text isn't descriptive enough

**Examples:**

```tsx
// ✅ Good: Icon button with aria-label
<Button
  variant="ghost"
  size="icon"
  aria-label="Toggle theme"
  onClick={handleToggle}
>
  <Moon className="h-5 w-5" aria-hidden="true" />
</Button>

// ✅ Good: Navigation with aria-label
<nav aria-label="Main navigation">
  <Link href="/">Home</Link>
  <Link href="/blog">Blog</Link>
</nav>

// ✅ Good: Search input with aria-label
<input
  type="search"
  aria-label="Search blog posts"
  placeholder="Search..."
/>
```

**When NOT to use `aria-label`:**
- Elements with visible, descriptive text
- Non-interactive elements (use semantic HTML instead)

```tsx
// ❌ Bad: Redundant aria-label on text link
<Link href="/blog" aria-label="Blog">
  Blog
</Link>

// ✅ Good: Let visible text provide the label
<Link href="/blog">
  Blog
</Link>
```

---

### 4. Icon Accessibility

**Icons with adjacent text:**
```tsx
// ✅ Good: Icon is decorative, text provides meaning
HTML anchor
  <User className="h-4 w-4" aria-hidden="true" />
  <span>View Profile</span>
</a>

// ✅ Good: External link indicator
<a href="https://example.com" className="flex items-center gap-1">
  <span>Visit Site</span>
  <ExternalLink className="h-3 w-3" aria-hidden="true" />
</a>
```

**Icon-only buttons:**
```tsx
// ✅ Good: Button has aria-label, icon is decorative
<Button aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// ❌ Bad: Icon-only button without label
<Button>
  <X className="h-4 w-4" />
</Button>
```

---

### 5. Decorative Elements

**Text separators:**
```tsx
// ✅ Good: Bullet separator hidden from screen readers
<div className="flex items-center gap-2">
  <time dateTime={date}>{formattedDate}</time>
  <span aria-hidden="true">•</span>
  <span>{readingTime}</span>
</div>
```

**Visual dividers:**
```tsx
// ✅ Good: Use semantic HTML or hide from screen readers
<hr aria-hidden="true" className="my-4" />

// Or better: use semantic <hr> without aria-hidden
<hr className="my-4" />
```

---

### 6. Interactive Elements

**Buttons vs Links:**
```tsx
// ✅ Good: Button for actions
<Button onClick={handleSubmit}>
  Submit Form
</Button>

// ✅ Good: Link for navigation
<Link href="/blog">
  Read Blog
</Link>

// ❌ Bad: Link styled as button for an action
<Link href="#" onClick={handleSubmit}>
  Submit Form
</Link>
```

**Disabled states:**
```tsx
// ✅ Good: Disabled button is properly marked
<Button disabled={isPending} aria-label="Save changes">
  {isPending ? "Saving..." : "Save"}
</Button>

// Consider: Add aria-live region for status updates
<div aria-live="polite" aria-atomic="true">
  {isPending && "Saving changes..."}
  {success && "Changes saved successfully"}
</div>
```

---

### 7. Forms

**Input labels:**
```tsx
// ✅ Good: Associated label with htmlFor
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" />
</div>

// ❌ Bad: Placeholder-only label
<Input type="email" placeholder="Email" />
```

**Error messages:**
```tsx
// ✅ Good: Error associated with input
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>
```

---

### 8. Dynamic Content

**Loading states:**
```tsx
// ✅ Good: Announce loading state to screen readers
<div
  role="status"
  aria-live="polite"
  aria-label="Loading content"
>
  <Skeleton className="h-20 w-full" />
  <span className="sr-only">Loading...</span>
</div>
```

**Success/error messages:**
```tsx
// ✅ Good: Toast messages announced via aria-live
// (sonner Toaster component handles this automatically)
toast.success("Form submitted successfully");

// Or manually:
<div role="status" aria-live="polite" aria-atomic="true">
  {message}
</div>
```

---

## Component-Specific Guidelines

### Logo Component

**Current Implementation:**
```tsx
<svg
  role="img"
  aria-label="DCYFR Labs Logo"
  viewBox="0 17.15 38.4 38.4"
  fill="currentColor"
>
  <path d="..." />
</svg>
```

**Why:**
- `role="img"` identifies it as an image
- `aria-label` provides text alternative
- Logo is informative (brand identity), not decorative

---

### Theme Toggle

**Current Implementation:**
```tsx
<Button
  variant="ghost"
  size="icon"
  aria-label="Toggle theme"
  onClick={handleToggle}
>
  {isDark ? 
    <Sun className="size-5" aria-hidden="true" /> : 
    <Moon className="size-5" aria-hidden="true" />
  }
</Button>
```

**Why:**
- Button has descriptive `aria-label`
- Icons are decorative (button label provides meaning)
- Screen readers announce "Toggle theme, button"

---

### Share Buttons

**Current Implementation:**
```tsx
<Button aria-label="Share on Twitter">
  <Twitter className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Twitter</span>
</Button>
```

**Why:**
- `aria-label` provides full context ("Share on Twitter")
- Icon is decorative
- `sr-only` span provides fallback for older screen readers

---

### External Links

**Current Implementation:**
```tsx
<a
  href="https://github.com/username"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1"
>
  <span>@username</span>
  <ExternalLink className="w-3 h-3" aria-hidden="true" />
</a>
```

**Why:**
- `rel="noopener noreferrer"` prevents security issues
- Text provides context ("@username")
- Icon is decorative visual indicator
- Consider adding `aria-label="Opens in new window"` for additional context

---

## Testing Checklist

### Manual Testing

- [ ] **Keyboard navigation**: Tab through all interactive elements
- [ ] **Screen reader**: Test with VoiceOver (Mac), NVDA (Windows), or JAWS
- [ ] **High contrast**: Test in Windows High Contrast Mode
- [ ] **Zoom**: Test at 200% zoom level
- [ ] **Focus indicators**: Verify visible focus rings on all interactive elements

### Automated Testing

```bash
# Run accessibility audit in browser DevTools
# Chrome: Lighthouse → Accessibility audit
# Firefox: Accessibility Inspector

# Or use command-line tools
npm install -g @axe-core/cli
axe https://www.dcyfr.ai --tags wcag2a,wcag2aa
```

### Common Issues to Check

- [ ] All images have alt text or `alt=""`
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Form inputs have associated labels
- [ ] Error messages are associated with inputs
- [ ] Links have descriptive text (avoid "click here")
- [ ] Color alone doesn't convey information
- [ ] Interactive elements have visible focus states

---

## WCAG 2.1 Level AA Compliance

### Key Success Criteria

**1.1.1 Non-text Content (Level A)**
- ✅ All images have text alternatives
- ✅ Decorative images marked as `aria-hidden` or `alt=""`

**2.4.4 Link Purpose (Level A)**
- ✅ Link text describes destination
- ✅ No generic "click here" links

**3.2.4 Consistent Identification (Level AA)**
- ✅ Components used consistently across pages
- ✅ Icons have consistent meaning

**4.1.2 Name, Role, Value (Level A)**
- ✅ All UI components properly labeled
- ✅ ARIA roles used appropriately
- ✅ State changes announced

---

## Resources

### Tools
- **axe DevTools** - https://www.deque.com/axe/devtools/
- **WAVE** - https://wave.webaim.org/
- **Lighthouse** - Built into Chrome DevTools
- **NVDA** - https://www.nvaccess.org/ (free Windows screen reader)
- **VoiceOver** - Built into macOS (Cmd+F5)

### Guidelines
- **WCAG 2.1** - https://www.w3.org/WAI/WCAG21/quickref/
- **WAI-ARIA Authoring Practices** - https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility** - https://developer.mozilla.org/en-US/docs/Web/Accessibility

### Reference
- **Alt Text Decision Tree** - https://www.w3.org/WAI/tutorials/images/decision-tree/
- **ARIA Roles** - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles
- **Inclusive Components** - https://inclusive-components.design/

---

## Summary

✅ **Current Status:** Project passes accessibility audit  
📋 **Components:** All major components reviewed and compliant  
🎯 **Goal:** Maintain WCAG 2.1 Level AA compliance  
📚 **Documentation:** Guidelines established for future development

**Next Steps:**
1. Run automated accessibility tests periodically
2. Test with real screen readers during major updates
3. Review new components for ARIA compliance
4. Update guidelines as patterns evolve

<!-- TLP:CLEAR -->

# NEW_PAGE.tsx Template

Copy-paste template for creating a new standard page with `PageLayout`.

**Use this for:** Homepage, about, contact, resume, features, or any standard content page.

**Don't use for:** Blog posts (use `ArticleLayout`), list pages (use `ArchiveLayout`).

---

## Template Code

```typescript
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts";
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { Section } from "@/components/common";

// Generate metadata for this page
export const metadata: Metadata = createPageMetadata({
  title: "Your Page Title",                    // REPLACE: Page title (shows in browser tab)
  description: "Your page description here",   // REPLACE: Meta description for SEO (155 chars max)
  path: "/your-path",                          // REPLACE: URL path (e.g., "/about")
});

/**
 * Page Component
 * 
 * REPLACE THIS DOCBLOCK:
 * Brief description of what this page does and displays.
 * 
 * @page
 */
export default function YourPage() {
  return (
    <PageLayout>
      {/* Main container - use CONTAINER_WIDTHS token */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        
        {/* Hero section */}
        <Section>
          <h1 className={TYPOGRAPHY.h1.standard}>
            Your Page Heading
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            Introductory text or tagline goes here.
          </p>
        </Section>

        {/* Content section */}
        <Section>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Section Heading
          </h2>
          <div className={`mt-${SPACING.content} space-y-${SPACING.content}`}>
            <p className="text-muted-foreground">
              Your content goes here. Use design tokens for spacing.
            </p>
            
            {/* Add more content blocks */}
          </div>
        </Section>

        {/* Optional: Additional sections */}
        <Section>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Another Section
          </h2>
          {/* More content */}
        </Section>

      </div>
    </PageLayout>
  );
}
```

---

## Common Modifications

### Change Container Width

```typescript
// Narrow (blog-style reading)
<div className={`mx-auto ${CONTAINER_WIDTHS.narrow}`}>

// Standard (most common - 80%)
<div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>

// Content (rich layouts)
<div className={`mx-auto ${CONTAINER_WIDTHS.content}`}>

// Full-width (no container)
<div>
```

### Add Breadcrumbs

```typescript
import { Breadcrumbs } from "@/components/navigation";

// Before main content
<div className={`mb-${SPACING.section}`}>
  <Breadcrumbs items={[
    { label: "Home", href: "/" },
    { label: "Your Page", href: "/your-path" },
  ]} />
</div>
```

### Add Loading State

```typescript
// Create loading.tsx in same directory
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
```

### Add Error Handling

```typescript
// Only if page makes external API calls or has risky operations
import { YourErrorBoundary } from "@/components/errors";

<YourErrorBoundary>
  <RiskyComponent />
</YourErrorBoundary>
```

---

## Checklist

Before committing your new page:

- [ ] Updated `title` in `createPageMetadata()`
- [ ] Updated `description` (155 characters max)
- [ ] Updated `path` to match file location
- [ ] Replaced placeholder content
- [ ] Used `CONTAINER_WIDTHS` token (not hardcoded width)
- [ ] Used `SPACING` tokens for gaps/margins
- [ ] Used `TYPOGRAPHY` tokens for headings
- [ ] Added component docblock
- [ ] Tested page renders correctly (`npm run dev`)
- [ ] Ran linter (`npm run lint`)

---

## Related Templates

- ARCHIVE_PAGE.tsx - Filterable list pages
- METADATA_ONLY.ts - Just metadata (no component)
- ERROR_BOUNDARY.tsx - Error handling wrapper

## Related Docs

- Component Patterns
- Design Tokens
- Decision Trees

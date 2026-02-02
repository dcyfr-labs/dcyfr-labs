---
name: dcyfr-component-patterns
description: Guide DCYFR component structure with PageLayout, barrel exports, and metadata
compatibility: opencode
metadata:
  audience: developers
  workflow: implementation
  category: architecture
---

## What I do

I ensure DCYFR components follow established architectural patterns:

- **90% PageLayout usage** - Default layout for standard pages
- **Barrel exports only** - No direct file imports
- **Metadata generation** - Proper SEO metadata on all pages
- **Import strategy** - Consistent import patterns across codebase

## When to use me

✅ **Use this skill when:**
- Creating new pages or components
- Refactoring existing components to follow DCYFR patterns
- Deciding which layout to use (PageLayout vs ArticleLayout vs ArchiveLayout)
- Setting up barrel exports for new component directories

❌ **Don't use this skill for:**
- Testing patterns (use dcyfr-testing skill)
- API route patterns (use dcyfr-api-patterns skill)

## Core Rules (NON-NEGOTIABLE)

### 1. PageLayout (90% Rule)

**Use `PageLayout` for 90% of pages**

```typescript
// ✅ CORRECT: PageLayout for standard pages
import { PageLayout } from "@/components/layouts";

export default function AboutPage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        Content
      </div>
    </PageLayout>
  );
}
```

**Exceptions (10%):**
- `ArticleLayout` - For blog posts and articles
- `ArchiveLayout` - For filterable lists (blog archive, work items)

### 2. Barrel Exports Only

```typescript
// ✅ CORRECT: Import from barrel export
import { PostCard, CategoryBadge } from "@/components/blog";

// ❌ WRONG: Direct file imports
import { PostCard } from "@/components/blog/post-card";
import { CategoryBadge } from "@/components/blog/category-badge";
```

**Barrel export structure:**

```typescript
// src/components/blog/index.ts
export { PostCard } from "./post-card";
export { CategoryBadge } from "./category-badge";
export { BlogFilter } from "./blog-filter";
```

### 3. Metadata Generation

**Every page must export metadata:**

```typescript
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Page Title",
  description: "Page description for SEO",
  path: "/path",
});
```

**Available helpers:**
- `createPageMetadata()` - Standard pages
- `createArticleMetadata()` - Blog posts
- `createRichMetadata()` - Complex metadata with images

## Decision Trees

### Which Layout?

```
START: Creating a new page

Is it a blog post?
├─ YES → Use ArticleLayout
│
Is it a filterable list (blog archive, work items)?
├─ YES → Use ArchiveLayout
│
Otherwise → Use PageLayout (default)
```

### Which Container Width?

```
START: Choosing container width

Is it a blog post?
├─ YES → CONTAINER_WIDTHS.prose (optimal reading width)
│
Is it a wide layout (dashboard, gallery)?
├─ YES → CONTAINER_WIDTHS.wide
│
Otherwise → CONTAINER_WIDTHS.standard (default)
```

## Common Patterns

### New Page Template

```typescript
import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";
import { CONTAINER_WIDTHS, SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

export const metadata = createPageMetadata({
  title: "Page Title",
  description: "Page description",
  path: "/page-path",
});

export default function NewPage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <h1 className={TYPOGRAPHY.h1.standard}>
          Page Heading
        </h1>
        <div className={`mt-${SPACING.content}`}>
          Content
        </div>
      </div>
    </PageLayout>
  );
}
```

### New Component with Barrel Export

```bash
# 1. Create component file
# src/components/blog/new-component.tsx

# 2. Add to barrel export
# src/components/blog/index.ts
export { NewComponent } from "./new-component";

# 3. Import from barrel
import { NewComponent } from "@/components/blog";
```

## Validation

```bash
# Check component patterns
npm run lint

# Full quality check
npm run check

# OpenCode-specific validation
npm run check:opencode
```

## ESLint Rules

- `import/no-restricted-paths` - Enforces barrel exports
- `@dcyfr/component-patterns/require-page-layout` - Validates layout usage

## Related Documentation

- **Full component patterns**: `.github/agents/patterns/COMPONENT_PATTERNS.md`
- **Layout decision tree**: `docs/ai/decision-trees.md`
- **Templates**: `docs/templates/NEW_PAGE.tsx.md`

## Approval Gates

Component pattern violations are **STRICT** (hard block):

- ❌ Direct imports fail ESLint
- ❌ Missing metadata fails build
- ✅ Must follow patterns before merging

**PageLayout preference is FLEXIBLE** (warning only):
- ⚠️  Reviewed during PR
- ⚠️  Must justify exceptions (ArticleLayout, ArchiveLayout)

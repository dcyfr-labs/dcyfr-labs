# Component & Import Patterns

**File:** `.github/agents/patterns/COMPONENT_PATTERNS.md`  
**Last Updated:** December 9, 2025  
**Scope:** Layout selection, barrel exports, import strategy

---

## Layout Selection (90% Rule)

### Default Choice: PageLayout

90% of pages should use `PageLayout`. Only use specialized layouts when justified:

```typescript
import { PageLayout } from "@/components/layouts";

export default function Page() {
  return <PageLayout>{/* content */}</PageLayout>;
}
```

### Specialized Layouts (Exceptions)

**ArticleLayout** - Blog posts only
- **Use for:** `/blog/[slug]` (individual blog post pages)
- **Why:** Special metadata rendering, article-specific styling
- **Example:**
  ```typescript
  import { ArticleLayout } from "@/components/layouts";
  export default function BlogPost() {
    return <ArticleLayout article={post}>{children}</ArticleLayout>;
  }
  ```

**ArchiveLayout** - Filterable lists only
- **Use for:** `/blog`, `/work` (collection pages with filters)
- **Why:** List management, filtering UI, pagination
- **Example:**
  ```typescript
  import { ArchiveLayout } from "@/components/layouts";
  export default function BlogArchive() {
    return <ArchiveLayout items={posts} />;
  }
  ```

### Decision Tree

```
Is this a standard page?
  → YES → Use PageLayout (90% case)
  → NO → Is it a blog post?
       → YES → Use ArticleLayout
       → NO → Is it a filterable list?
            → YES → Use ArchiveLayout
            → NO → PageLayout (default fallback)
```

---

## Import Strategy (MANDATORY)

### Always Use Barrel Exports

Barrel exports are the **only** import method allowed in this project. They provide:
- ✅ Clean import paths
- ✅ Internal refactoring flexibility
- ✅ Consistent structure
- ✅ ESLint enforcement

**Correct Pattern:**
```typescript
// ✅ CORRECT - Use barrel exports
import { PostList } from "@/components/blog";
import { PageLayout } from "@/components/layouts";
import { generateSlug } from "@/lib/slug";
```

**Invalid Patterns:**
```typescript
// ❌ WRONG - Direct file imports
import PostList from "@/components/blog/post-list";
import PostList from "@/components/blog/post-list.tsx";

// ❌ WRONG - Relative imports
import PostList from "../../components/blog/post-list";
import { helper } from "../utils/helpers";
```

### Barrel Export Files

Barrel exports are declared in `index.ts` files:

```typescript
// src/components/blog/index.ts
export { PostList } from './post-list';
export { PostCard } from './post-card';
export { BlogArchive } from './archive';
```

**Benefits:**
- Single source of truth for public API
- Hide internal implementation details
- Enable easy refactoring of private files
- ESLint validates compliance

### Import Paths Use @ Alias

Always use the `@` alias (from `tsconfig.json`):

```typescript
// ✅ CORRECT
import { Button } from "@/components/ui";

// ❌ WRONG
import { Button } from "../../../components/ui";
import { Button } from "./components/ui";
```

---

## Component Structure with Barrel Exports

### Directory Layout

```
src/components/blog/
├── index.ts              # Barrel export
├── post-list.tsx         # Component
├── post-card.tsx         # Component
└── archive.tsx           # Component
```

### Barrel Export Example

```typescript
// src/components/blog/index.ts
/**
 * Blog Components - Public API
 * 
 * Exports all public blog components.
 * Internal components stay private.
 */
export { PostList } from './post-list';
export { PostCard } from './post-card';
export { BlogArchive } from './archive';

// Private utilities (not exported)
// - formatDate (used only internally)
// - getPostSummary (used only internally)
```

### Using Exported Components

```typescript
// ✅ CORRECT
import { PostList, PostCard, BlogArchive } from "@/components/blog";

// Component usage
export function HomePage() {
  return <PostList posts={allPosts} />;
}
```

---

## Anti-Patterns to Avoid

### ❌ Deep Imports
```typescript
// WRONG - Accessing internal files
import { PostList } from "@/components/blog/post-list";
```

### ❌ Relative Imports
```typescript
// WRONG - Using relative paths
import { Button } from "../../../components/ui/button";
```

### ❌ Partial Barrel Exports
```typescript
// WRONG - Exporting everything with *
export * from './post-list';
export * from './post-card';

// BETTER - Explicit exports
export { PostList } from './post-list';
export { PostCard } from './post-card';
```

### ❌ Circular Dependencies
```typescript
// WRONG - Creates import loop
// components/blog/index.ts
export { PostList } from './post-list';

// components/blog/post-list.tsx
import { BlogArchive } from '@/components/blog'; // Circular!
```

---

## ESLint Enforcement

The following ESLint rule enforces barrel exports:

```javascript
// eslint.config.mjs
{
  rules: {
    'import/no-restricted-paths': ['error', {
      patterns: ['@/*/**/*'],
    }]
  }
}
```

**This rule prevents:**
- ❌ `import { X } from "@/components/blog/post-list"`
- ✅ `import { X } from "@/components/blog"`

---

## Metadata & Exports Pattern

### For Pages

```typescript
// src/app/about/page.tsx
import { createPageMetadata } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts";

export const metadata = createPageMetadata({
  title: "About",
  description: "About page description",
  path: "/about",
});

export default function AboutPage() {
  return <PageLayout>{/* content */}</PageLayout>;
}
```

### For Reusable Components

```typescript
// src/components/blog/post-list.tsx
interface PostListProps {
  posts: Post[];
  limit?: number;
}

export function PostList({ posts, limit }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.slice(0, limit).map(post => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

---

## Quick Reference

| Pattern | Use | Example |
|---------|-----|---------|
| **Barrel Import** | Standard | `import { X } from "@/components/blog"` |
| **PageLayout** | 90% of pages | `<PageLayout>...</PageLayout>` |
| **ArticleLayout** | Blog posts | `/blog/[slug]` |
| **ArchiveLayout** | Lists/Collections | `/blog`, `/work` |
| **Direct Import** | ❌ Never | `import X from "@/components/blog/post-list"` |
| **Relative Import** | ❌ Never | `import X from "../components"` |

---

## Related Documentation

- **Component Patterns:** This file
- **API Patterns:** `.github/agents/patterns/API_PATTERNS.md`
- **Design Tokens:** `.github/agents/enforcement/DESIGN_TOKENS.md`
- **Quick Reference:** `docs/ai/QUICK_REFERENCE.md`

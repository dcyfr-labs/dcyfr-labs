<!-- TLP:CLEAR -->

# Component Lifecycle Management

**Purpose**: Guide AI agents on when to create, refactor, deprecate, or remove components.

**Last Updated**: January 15, 2026  
**Status**: General Guidance for Future Enhancement

---

## Component Creation Criteria

### When to Create a New Component

Create a new component when:

1. **Reusable pattern identified** (used 3+ times)
2. **Complex logic encapsulation** (50+ lines, multiple concerns)
3. **Design system addition** (new UI primitive needed)
4. **Feature isolation** (independent functionality)
5. **Performance optimization** (React.memo, code splitting candidate)

### Discovery Phase (MANDATORY FIRST)

**Before creating any component:**

```bash
# 1. Search for existing patterns
glob "**/*-{keyword}*.tsx"              # Find similar components
grep "{functionality}" --type ts        # Find similar logic

# 2. Check standard locations
src/components/ui/          # shadcn/ui primitives
src/components/layouts/     # Layout patterns
src/components/common/      # Shared components
src/components/{feature}/   # Feature-specific components

# 3. Review design tokens
# Read src/lib/design-tokens.ts
# Confirm tokens exist for the pattern
```

**Ask these questions:**
- [ ] Does a similar component exist?
- [ ] Can I extend an existing component?
- [ ] Do design tokens exist for this pattern?
- [ ] Is this truly reusable (3+ use cases)?

### Component Template

```tsx
/**
 * {ComponentName}
 * 
 * {Brief description of purpose}
 * 
 * @example
 * ```tsx
 * <ComponentName
 *   prop1="value"
 *   prop2={value}
 * />
 * ```
 */

import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

export interface ComponentNameProps {
  /**
   * {Prop description}
   */
  prop1: string;
  
  /**
   * {Prop description}
   * @default "default-value"
   */
  prop2?: string;
  
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({
  prop1,
  prop2 = "default-value",
  className,
  children,
}: ComponentNameProps) {
  return (
    <div className={cn(SPACING.content, className)}>
      <h2 className={TYPOGRAPHY.h2.standard}>{prop1}</h2>
      <div className={SPACING.element}>{children}</div>
    </div>
  );
}

// Add display name for debugging
ComponentName.displayName = 'ComponentName';
```

### Testing Requirements

**Every new component MUST have:**
- [ ] Unit tests (90%+ coverage)
- [ ] Accessibility tests (axe-core)
- [ ] Visual regression tests (Storybook)
- [ ] JSDoc documentation

```tsx
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ComponentName } from './component-name';

expect.extend(toHaveNoViolations);

describe('ComponentName', () => {
  it('should render children', () => {
    render(<ComponentName prop1="test">Content</ComponentName>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  
  it('should have no accessibility violations', async () => {
    const { container } = render(<ComponentName prop1="test">Content</ComponentName>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Component Organization

### Directory Structure

```
src/components/
├── ui/                     # shadcn/ui primitives (Button, Card, etc.)
├── layouts/                # Page layout components (PageLayout, PageHero)
├── navigation/             # Navigation components (SiteHeader, SiteFooter)
├── common/                 # Shared components (TableOfContents, ContactForm)
├── blog/                   # Blog-specific components (PostCard, RIVET framework)
├── features/               # Feature-specific components
│   ├── analytics/          # Analytics dashboard components
│   ├── activity/           # Activity feed components
│   └── {feature}/          # Other features
└── {domain}/               # Domain-specific components
```

### Naming Conventions

**Component files:**
- `kebab-case.tsx` (e.g., `post-card.tsx`, `site-header.tsx`)
- Match component name (PostCard → `post-card.tsx`)

**Component names:**
- PascalCase (e.g., `PostCard`, `SiteHeader`)
- Descriptive, not abbreviated
- Prefix with context if needed (`ModernPostCard`, `CompactPostCard`)

**Barrel exports:**
- Each directory has `index.ts` exporting all components
- Import from barrel, not direct file:
  ```tsx
  // ✅ Good
  import { Button, Card } from '@/components/ui';
  
  // ❌ Bad
  import Button from '@/components/ui/button';
  ```

---

## Refactoring Triggers

### When to Refactor a Component

Refactor when:

1. **Complexity threshold exceeded** (>150 lines, multiple responsibilities)
2. **Duplication detected** (similar code in 2+ places)
3. **Performance issues** (excessive re-renders, slow interactions)
4. **Accessibility violations** (fails axe-core, WCAG non-compliant)
5. **Design token violations** (hardcoded spacing, colors, typography)
6. **TypeScript errors** (type safety issues, any types)

### Refactoring Strategies

#### 1. Extract Sub-Components

**Before: Monolithic (200+ lines)**
```tsx
export function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <CardHeader>
        {/* 50 lines of header logic */}
      </CardHeader>
      <CardContent>
        {/* 100 lines of content logic */}
      </CardContent>
      <CardFooter>
        {/* 50 lines of footer logic */}
      </CardFooter>
    </Card>
  );
}
```

**After: Composed (60 lines + 3 sub-components)**
```tsx
export function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <PostCardHeader post={post} />
      <PostCardContent post={post} />
      <PostCardFooter post={post} />
    </Card>
  );
}

// Sub-components in same file or separate files
function PostCardHeader({ post }: { post: Post }) {
  // 20 lines
}

function PostCardContent({ post }: { post: Post }) {
  // 40 lines
}

function PostCardFooter({ post }: { post: Post }) {
  // 20 lines
}
```

#### 2. Extract Custom Hooks

**Before: Inline logic (100+ lines)**
```tsx
export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(false);
  
  useEffect(() => {
    // 20 lines of like logic
  }, [liked]);
  
  useEffect(() => {
    // 20 lines of bookmark logic
  }, [bookmarked]);
  
  const handleLike = async () => {
    // 15 lines
  };
  
  const handleBookmark = async () => {
    // 15 lines
  };
  
  return (
    // 30 lines of JSX
  );
}
```

**After: Custom hooks (30 lines + 2 hooks)**
```tsx
import { useActivityReactions } from '@/hooks/use-activity-reactions';
import { useBookmarks } from '@/hooks/use-bookmarks';

export function PostCard({ post }: PostCardProps) {
  const { liked, likeCount, handleLike } = useActivityReactions(post.id);
  const { bookmarked, handleBookmark } = useBookmarks(post.id);
  
  return (
    // 30 lines of JSX
  );
}
```

#### 3. Introduce Variants

**Before: Conditional chaos**
```tsx
export function PostCard({ post, variant, compact, featured }: PostCardProps) {
  return (
    <Card className={cn(
      variant === 'elevated' && 'shadow-lg',
      compact && 'p-2',
      featured && 'border-2 border-primary',
      // 20+ conditional styles
    )}>
      {/* Complex conditional rendering */}
    </Card>
  );
}
```

**After: CVA variants**
```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const postCardVariants = cva(
  'rounded-lg border',
  {
    variants: {
      variant: {
        elevated: 'shadow-lg',
        flat: 'shadow-none',
        outline: 'border-2',
      },
      size: {
        compact: 'p-2',
        default: 'p-4',
        spacious: 'p-6',
      },
      featured: {
        true: 'border-primary',
        false: 'border-border',
      },
    },
    defaultVariants: {
      variant: 'flat',
      size: 'default',
      featured: false,
    },
  }
);

export interface PostCardProps extends VariantProps<typeof postCardVariants> {
  post: Post;
}

export function PostCard({ post, variant, size, featured }: PostCardProps) {
  return (
    <Card className={postCardVariants({ variant, size, featured })}>
      {/* Simplified rendering */}
    </Card>
  );
}
```

---

## Deprecation Strategy

### When to Deprecate a Component

Deprecate when:

1. **Better alternative exists** (replaced by new design system component)
2. **No longer used** (0 imports, dead code)
3. **Security vulnerabilities** (unfixable, requires replacement)
4. **Performance issues** (unsolvable without rewrite)

### Deprecation Process

#### 1. Mark as Deprecated (JSDoc)

```tsx
/**
 * @deprecated Use `ModernPostCard` instead. This component will be removed in v3.0.
 * 
 * Migration guide:
 * ```tsx
 * // Before
 * <PostCard post={post} variant="old" />
 * 
 * // After
 * <ModernPostCard post={post} variant="elevated" />
 * ```
 */
export function PostCard({ post }: PostCardProps) {
  // Implementation
}
```

#### 2. Add Runtime Warning (Development Only)

```tsx
export function PostCard({ post }: PostCardProps) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'PostCard is deprecated. Use ModernPostCard instead. ' +
      'See migration guide: docs/migrations/post-card-to-modern.md'
    );
  }
  
  // Implementation
}
```

#### 3. Create Migration Guide

**File**: `docs/migrations/post-card-to-modern.md`

```markdown
# Migration: PostCard → ModernPostCard

**Deprecated**: v2.5.0  
**Removal**: v3.0.0  
**Replacement**: ModernPostCard

## Breaking Changes

1. `variant="old"` → `variant="elevated"`
2. `compact` prop removed → use `size="compact"`
3. `onLike` callback signature changed

## Migration Steps

1. Find all usages:
   ```bash
   grep -r "PostCard" --include="*.tsx" src/
   ```

2. Replace imports:
   ```tsx
   // Before
   import { PostCard } from '@/components/blog';
   
   // After
   import { ModernPostCard } from '@/components/blog';
   ```

3. Update props:
   ```tsx
   // Before
   <PostCard post={post} variant="old" compact />
   
   // After
   <ModernPostCard post={post} variant="elevated" size="compact" />
   ```

## Automated Migration

```bash
npm run migrate:post-card
```
```

#### 4. Provide Codemod (Optional)

```tsx
// scripts/migrations/post-card-to-modern.ts
import { Project } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.tsx');

for (const sourceFile of project.getSourceFiles()) {
  // Find PostCard imports
  const importDeclarations = sourceFile.getImportDeclarations();
  
  for (const importDecl of importDeclarations) {
    const namedImports = importDecl.getNamedImports();
    
    for (const namedImport of namedImports) {
      if (namedImport.getName() === 'PostCard') {
        // Replace PostCard with ModernPostCard
        namedImport.setName('ModernPostCard');
      }
    }
  }
  
  // Find JSX elements
  const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  
  for (const element of jsxElements) {
    if (element.getTagNameNode().getText() === 'PostCard') {
      // Replace element name
      element.getTagNameNode().replaceWithText('ModernPostCard');
      
      // Update props
      const attributes = element.getAttributes();
      for (const attr of attributes) {
        if (attr.getName() === 'variant') {
          // Replace variant="old" with variant="elevated"
          const initializer = attr.getInitializer();
          if (initializer?.getText() === '"old"') {
            initializer.replaceWithText('"elevated"');
          }
        }
      }
    }
  }
  
  sourceFile.saveSync();
}
```

---

## Component Removal

### When to Remove a Component

Remove when:

1. **Deprecation period elapsed** (1+ major version)
2. **0 usages confirmed** (grep + TypeScript check)
3. **Migration guide provided** (users have path forward)
4. **Major version bump** (breaking change acceptable)

### Removal Checklist

- [ ] Deprecated for 1+ major versions
- [ ] 0 usages in codebase (verified with grep + TypeScript)
- [ ] Migration guide published
- [ ] Release notes updated
- [ ] Changelog entry added
- [ ] Breaking change documented

### Removal Process

```bash
# 1. Verify 0 usages
grep -r "ComponentName" --include="*.tsx" --include="*.ts" src/

# 2. Remove component file
rm src/components/path/component-name.tsx

# 3. Remove from barrel export
# Edit src/components/path/index.ts
# Remove: export { ComponentName } from './component-name';

# 4. Remove tests
rm src/components/path/__tests__/component-name.test.tsx

# 5. Remove Storybook stories
rm src/components/path/component-name.stories.tsx

# 6. Update CHANGELOG.md
# Add to "Breaking Changes" section

# 7. Update migration guide
# Mark as "Removed in v3.0.0"
```

---

## Component Quality Gates

### Pre-Commit Checklist

Before committing any new component:

- [ ] Discovery phase completed (no duplication)
- [ ] Design tokens used (SPACING, TYPOGRAPHY, etc.)
- [ ] TypeScript interfaces defined
- [ ] JSDoc documentation added
- [ ] Unit tests written (90%+ coverage)
- [ ] Accessibility tests passing (axe-core)
- [ ] Visual regression baseline created (Storybook)
- [ ] Performance tested (React Profiler)
- [ ] Reduced motion support (CSS or hook)
- [ ] Barrel export added

### Component Health Metrics

Track these metrics for each component:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Lines of code** | <150 | <200 | ≥200 |
| **Cyclomatic complexity** | <10 | <15 | ≥15 |
| **Test coverage** | ≥90% | ≥75% | <75% |
| **Bundle size** | <5 KB | <10 KB | ≥10 KB |
| **Render time** | <16ms | <50ms | ≥50ms |
| **Accessibility score** | 100% | ≥95% | <95% |

### Automated Quality Checks

```bash
# Run all quality checks
npm run component:check ComponentName

# Individual checks
npm run test -- ComponentName.test.tsx
npm run typecheck
npm run lint
npm run a11y:audit
npm run perf:check
```

---

## Common Patterns

### Container/Presentational Split

**Container (logic)**
```tsx
// post-card-container.tsx
export function PostCardContainer({ postId }: { postId: string }) {
  const post = usePost(postId);
  const { liked, handleLike } = useActivityReactions(postId);
  
  if (!post) return <PostCardSkeleton />;
  
  return <PostCardView post={post} liked={liked} onLike={handleLike} />;
}
```

**Presentational (UI)**
```tsx
// post-card-view.tsx
export function PostCardView({ post, liked, onLike }: PostCardViewProps) {
  return (
    <Card>
      <CardHeader>{post.title}</CardHeader>
      <CardContent>{post.excerpt}</CardContent>
      <CardFooter>
        <Button onClick={onLike}>{liked ? 'Unlike' : 'Like'}</Button>
      </CardFooter>
    </Card>
  );
}
```

### Compound Components

```tsx
// compound-card.tsx
export function CompoundCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border bg-card">{children}</div>;
}

CompoundCard.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-0">{children}</div>;
};

CompoundCard.Content = function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
};

CompoundCard.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pt-0">{children}</div>;
};

// Usage
<CompoundCard>
  <CompoundCard.Header>Title</CompoundCard.Header>
  <CompoundCard.Content>Content</CompoundCard.Content>
  <CompoundCard.Footer>Footer</CompoundCard.Footer>
</CompoundCard>
```

### Polymorphic Components

```tsx
// polymorphic-button.tsx
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends React.ComponentProps<'button'> {
  asChild?: boolean;
}

export function Button({ asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} />;
}

// Usage
<Button>Normal button</Button>
<Button asChild>
  HTML anchorButton as link</a>
</Button>
```

---

## Resources

### Internal
- [Design Tokens](../../src/lib/design-tokens.ts)
- [Component Patterns](./component-patterns.md)
- [Testing Strategy](./testing-strategy.md)

### External
- [React Component Patterns](https://kentcdodds.com/blog/react-component-patterns)
- [Class Variance Authority](https://cva.style/docs)
- [Radix UI Composition](https://www.radix-ui.com/primitives/docs/guides/composition)

---

**Last Updated**: January 15, 2026  
**Next Review**: Q2 2026

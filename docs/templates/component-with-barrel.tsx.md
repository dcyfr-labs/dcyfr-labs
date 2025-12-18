# COMPONENT_WITH_BARREL.tsx Template

Template for creating a new component with barrel export setup.

**Use this when:** Adding a new component to an existing subdirectory (blog/, common/, features/, etc.)

---

## Step 1: Create Component File

```typescript
// src/components/your-subdirectory/your-component.tsx
"use client"; // ONLY if component uses hooks/interactivity

import * as React from "react";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Props for YourComponent
 */
export interface YourComponentProps {
  /**
   * Primary prop with description
   */
  title: string;
  
  /**
   * Optional prop with description
   */
  description?: string;
  
  /**
   * Optional: ClassName override
   */
  className?: string;
}

/**
 * YourComponent
 * 
 * REPLACE: Brief description of what this component does and when to use it.
 * 
 * @component
 * @example
 * ```tsx
 * <YourComponent 
 *   title="Example"
 *   description="This is an example"
 * />
 * ```
 */
export function YourComponent({
  title,
  description,
  className,
}: YourComponentProps) {
  return (
    <div className={cn(`space-y-${SPACING.element}`, className)}>
      <h3 className={TYPOGRAPHY.h3.standard}>{title}</h3>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
```

---

## Step 2: Update Barrel Export

```typescript
// src/components/your-subdirectory/index.ts

// ... existing exports ...

export { YourComponent } from "./your-component";
export type { YourComponentProps } from "./your-component";
```

---

## Step 3: Import and Use

```typescript
// In any page or component
import { YourComponent } from "@/components/your-subdirectory";

<YourComponent title="Example" />
```

---

## Client vs Server Components

### Server Component (Default)

```typescript
// NO "use client" directive
// Can use async/await
// Cannot use hooks (useState, useEffect, etc.)

export async function ServerComponent() {
  const data = await fetchData(); // Async operations OK
  
  return <div>{data}</div>;
}
```

### Client Component

```typescript
"use client"; // Required for hooks

import { useState } from "react";

export function ClientComponent() {
  const [count, setCount] = useState(0); // Hooks OK
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Rule:** Use server components by default. Only add `"use client"` when you need:
- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)

---

## Checklist

- [ ] Component file created in correct subdirectory
- [ ] Added `"use client"` if needed (hooks/interactivity)
- [ ] Defined TypeScript interface for props
- [ ] Used design tokens (SPACING, TYPOGRAPHY)
- [ ] Added component docblock
- [ ] Exported component from barrel file (index.ts)
- [ ] Exported TypeScript interface/types
- [ ] Tested import works (`import { YourComponent } from "@/components/subdirectory"`)
- [ ] Ran linter (`npm run lint`)

---

## Related Templates

- [NEW_PAGE.tsx](./new-page.tsx) - Using components in pages
- TEST_SUITE.test.tsx - Testing components

## Related Docs

- Component Patterns
- Design Tokens

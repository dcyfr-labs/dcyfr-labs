# Error Boundaries

**Status:** ✅ Implemented (October 20, 2025)  
**Location:** `src/components/error-boundary.tsx` and component-specific error boundaries

Error boundaries are React components that catch JavaScript errors in their child component tree, log the errors, and display a fallback UI instead of crashing the entire application.

---

## Quick Reference

### Base Error Boundary
**Import:** `import { ErrorBoundary } from "@/components/error-boundary"`

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Component-Specific Boundaries

#### GitHub Heatmap
```tsx
import { GitHubHeatmapErrorBoundary } from "@/components/github-heatmap-error-boundary"

<GitHubHeatmapErrorBoundary>
  <GitHubHeatmap username="..." />
</GitHubHeatmapErrorBoundary>
```

#### Contact Form
```tsx
import { ContactFormErrorBoundary } from "@/components/contact-form-error-boundary"

<ContactFormErrorBoundary>
  <ContactForm />
</ContactFormErrorBoundary>
```

#### Blog Search
```tsx
import { BlogSearchErrorBoundary } from "@/components/blog-search-error-boundary"

<BlogSearchErrorBoundary>
  <BlogSearchForm />
</BlogSearchErrorBoundary>
```

#### Page-Level
```tsx
import { PageErrorBoundary } from "@/components/page-error-boundary"

<PageErrorBoundary>
  <PageContent />
</PageErrorBoundary>
```

---

## Implementation Details

### Error Boundary Component (`src/components/error-boundary.tsx`)

```typescript
type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};
```

**Features:**
- Catches rendering errors from child components
- Logs error details to console (dev mode)
- Displays user-friendly error message
- Provides "Try again" button for recovery
- Optional custom error handler for analytics/tracking

### Fallback UI

#### Default Fallback
Full-featured error card with:
- User-friendly error message
- Error details (development only)
- "Try again" button
- Styled for consistency with site design

#### Minimal Fallback
Compact inline error with:
- Brief error message
- Inline retry button
- Less disruptive to page layout

#### Custom Fallback
```tsx
import { ErrorBoundary, type ErrorFallbackProps } from "@/components/error-boundary"

function CustomFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="font-semibold text-red-900">Something went wrong</h2>
      <p className="mt-1 text-sm text-red-700">{error.message}</p>
      <button 
        onClick={resetError}
        className="mt-3 rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

<ErrorBoundary fallback={CustomFallback}>
  <YourComponent />
</ErrorBoundary>
```

### Custom Error Handling

Send errors to analytics or error tracking services:

```tsx
import { ErrorBoundary } from "@/components/error-boundary"

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to error tracking service
    console.error("Error caught by boundary:", error);
    console.error("Error info:", errorInfo);
    
    // Example: Send to Sentry
    // Sentry.captureException(error, { contexts: { errorInfo } });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

---

## Currently Protected Components

✅ **GitHub Heatmap** - `/src/app/projects/page.tsx`
- Wrapped with `GitHubHeatmapErrorBoundary`
- Handles API failures gracefully
- Shows fallback UI if data fetch fails

✅ **Contact Form** - `/src/app/contact/page.tsx`
- Wrapped with `ContactFormErrorBoundary`
- Handles submission errors
- Displays error message to user

---

## When to Use

### ✅ Use Error Boundaries For

- Client components with data fetching
- Third-party integrations (API calls, embeds)
- Complex interactive components with state
- Forms and submissions
- Any component that might throw during render

### ❌ Don't Use Error Boundaries For

- Server components (use `error.tsx` instead)
- Event handlers (use try/catch blocks)
- Async code outside rendering (use try/catch)
- Promises in callbacks (handle with .catch())

---

## Key Features

- 🛡️ **Isolated Failures** – Errors don't crash the whole app
- 🔄 **Recovery** – Users can retry failed operations
- 🐛 **Debug Info** – Full error details in development
- 🎨 **Customizable** – Different fallbacks for different contexts
- 📊 **Integration Ready** – Hooks for error tracking services
- ⚡ **Performance** – Minimal overhead, only works on error

---

## Testing Error Boundaries

### Throw Test Error
```tsx
// In any client component
if (process.env.NODE_ENV === 'development' && someCondition) {
  throw new Error("Test error boundary");
}
```

### Simulate API Failure
```tsx
"use client"

import { useEffect } from "react"

export function TestComponent() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Uncomment to test:
      // throw new Error("Simulated error");
    }
  }, [])
  
  return <div>Component content</div>
}
```

### Controlled Test
```tsx
"use client"

import { useState } from "react"

export function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false)
  
  if (shouldError) {
    throw new Error("User-triggered test error");
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  )
}
```

---

## Troubleshooting

### Error Boundary Not Catching Errors

**Issue:** Error is thrown but not caught by boundary

**Causes:**
- Error is in an event handler (use try/catch)
- Error is in a Promise (use .catch())
- Component is a server component (use error.tsx)
- Error is in a useEffect (depends on timing)

**Solution:**
```tsx
// ❌ Won't catch (event handler)
<button onClick={() => throw new Error()}>Click</button>

// ✅ Will catch
<button onClick={() => {
  try {
    // code that might error
  } catch (e) {
    // handle or re-throw for boundary
  }
}}>Click</button>
```

### Fallback Not Displaying

**Issue:** Error boundary doesn't show fallback UI

**Causes:**
- Error is not being caught (see above)
- Fallback component is broken
- CSS is hiding the fallback

**Solution:**
1. Check browser console for errors
2. Verify error is being thrown (add console.error in onError)
3. Test fallback component independently

---

## Files

- **Base:** `src/components/error-boundary.tsx`
- **GitHub Heatmap:** `src/components/github-heatmap-error-boundary.tsx`
- **Contact Form:** `src/components/contact-form-error-boundary.tsx`
- **Blog Search:** `src/components/blog-search-error-boundary.tsx`
- **Page-Level:** `src/components/page-error-boundary.tsx`

---

## Related Documentation

- [Loading States](./loading-states) – Skeleton components for async content
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

---

## Best Practices

1. **Wrap at appropriate levels** – Don't wrap every component; wrap major sections
2. **Provide helpful messages** – Users should understand what went wrong
3. **Include recovery options** – Always provide a "Try again" button
4. **Log for debugging** – Send errors to monitoring service in production
5. **Test error scenarios** – Manually test error boundaries during development
6. **Use specific boundaries** – Component-specific boundaries provide better context
7. **Combine with loading states** – Use with skeletons for complete UX

---

**Last Updated:** October 27, 2025  
**Migrated from:** `/docs/operations/error-boundaries-quick-reference.md` and `error-boundaries-implementation.md`

<!-- TLP:CLEAR -->

# Error Boundaries - Quick Reference

**Status:** ✅ Implemented (October 20, 2025)

## What Are Error Boundaries?

React components that catch JavaScript errors in their child component tree, log the errors, and display a fallback UI instead of crashing the entire application.

## Available Error Boundaries

### 1. Base Error Boundary
**Import:** `import { ErrorBoundary } from "@/components/error-boundary"`

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 2. GitHub Heatmap Error Boundary
**Import:** `import { GitHubHeatmapErrorBoundary } from "@/components/github-heatmap-error-boundary"`

```tsx
<GitHubHeatmapErrorBoundary>
  <GitHubHeatmap username="..." />
</GitHubHeatmapErrorBoundary>
```

### 3. Contact Form Error Boundary
**Import:** `import { ContactFormErrorBoundary } from "@/components/contact-form-error-boundary"`

```tsx
<ContactFormErrorBoundary>
  <ContactForm />
</ContactFormErrorBoundary>
```

### 4. Blog Search Error Boundary
**Import:** `import { BlogSearchErrorBoundary } from "@/components/blog-search-error-boundary"`

```tsx
<BlogSearchErrorBoundary>
  <BlogSearchForm />
</BlogSearchErrorBoundary>
```

### 5. Page Error Boundary
**Import:** `import { PageErrorBoundary } from "@/components/page-error-boundary"`

```tsx
<PageErrorBoundary>
  <PageContent />
</PageErrorBoundary>
```

## Fallback Components

### Default Fallback
Full-featured error card with:
- User-friendly error message
- Error details (dev only)
- "Try again" button

### Minimal Fallback
Compact inline error with:
- Brief error message
- Inline retry button
- Less disruptive to layout

## Custom Error Handling

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error("Custom error handler:", error);
    // Send to analytics, error tracking, etc.
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Custom Fallback UI

```tsx
import { ErrorBoundary, type ErrorFallbackProps } from "@/components/error-boundary";

function CustomFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div>
      <h2>Oops!</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Reset</button>
    </div>
  );
}

<ErrorBoundary fallback={CustomFallback}>
  <YourComponent />
</ErrorBoundary>
```

## Currently Protected Components

✅ **GitHub Heatmap** - `/src/app/projects/page.tsx`  
✅ **Contact Form** - `/src/app/contact/page.tsx`

## Testing

### Throw Test Error
```tsx
// In any client component
throw new Error("Test error boundary");
```

### Simulate API Failure
```tsx
// In useEffect or event handler
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    throw new Error("Simulated error");
  }
}, []);
```

## When to Use

✅ **Use for:**
- Client components with data fetching
- Third-party integrations
- Complex interactive components
- Forms and submissions

❌ **Don't use for:**
- Server components (use `error.tsx`)
- Event handlers (use try/catch)
- Async code outside rendering (use try/catch)

## Key Features

- 🛡️ **Isolated Failures** - Errors don't crash the whole app
- 🔄 **Recovery** - Users can retry failed operations
- 🐛 **Debug Info** - Full error details in development
- 🎨 **Customizable** - Different fallbacks for different contexts
- 📊 **Integration Ready** - Hooks for error tracking services

## See Also

- Full Implementation Guide
- [React Error Boundaries Docs](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

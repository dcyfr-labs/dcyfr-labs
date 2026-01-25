{/* TLP:CLEAR */}

# Error Handling Patterns

**Purpose**: Standardize error boundaries, fallbacks, and error states across the application.

**Last Updated**: January 15, 2026  
**Status**: General Guidance for Future Enhancement

---

## Error Hierarchy

```
Application Errors
├── UI Errors (Component failures, render errors)
├── Data Errors (API failures, validation errors)
├── Network Errors (Connectivity, timeouts)
├── Authentication Errors (Unauthorized, expired sessions)
└── System Errors (Out of memory, browser incompatibility)
```

---

## Error Boundaries

### Global Error Boundary

**File**: `src/components/common/error-boundary.tsx`

```tsx
'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Send to monitoring (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="mt-6 flex gap-4 justify-center">
              <Button onClick={this.reset}>Try again</Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage in App Router

```tsx
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/common/error-boundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Feature-Level Error Boundaries

```tsx
// Wrap specific features with custom error UI
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <p>Unable to load blog posts</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  }
>
  <BlogPostList />
</ErrorBoundary>
```

---

## API Error Handling

### Centralized Error Handler

**File**: `src/lib/api-error-handler.ts`

```typescript
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    throw new APIError(
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.message || response.statusText,
      errorData.details
    );
  }
  
  return response.json();
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): string {
  if (error instanceof APIError) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
}

export function isAuthError(error: unknown): boolean {
  return error instanceof APIError && [401, 403].includes(error.status);
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message === 'Failed to fetch';
}
```

### API Call Pattern

```tsx
import { handleAPIResponse, APIError, getErrorMessage } from '@/lib/api-error-handler';

export async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await fetch('/api/posts');
    return await handleAPIResponse<Post[]>(response);
  } catch (error) {
    // Log error
    console.error('Failed to fetch posts:', error);
    
    // Handle specific error types
    if (error instanceof APIError) {
      if (error.status === 404) {
        return []; // Return empty array for not found
      }
      
      if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    
    // Re-throw for component to handle
    throw error;
  }
}
```

---

## Component Error States

### Loading, Error, Empty States

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PostList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="mt-4 text-lg font-semibold">Failed to load posts</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {getErrorMessage(error)}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Try again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No posts found</p>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-4">
      {data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Reusable Error Component

```tsx
// src/components/common/error-state.tsx
export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  onHome?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  onHome,
}: ErrorStateProps) {
  const errorMessage = message || getErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
      <div className="mt-6 flex gap-4">
        {onRetry && (
          <Button onClick={onRetry}>Try again</Button>
        )}
        {onHome && (
          <Button variant="outline" onClick={onHome}>
            Go home
          </Button>
        )}
      </div>
    </div>
  );
}

// Usage
<ErrorState
  error={error}
  onRetry={() => refetch()}
  onHome={() => router.push('/')}
/>
```

---

## Form Error Handling

### Field-Level Errors

```tsx
import { useFormValidation, validators } from '@/hooks/use-form-validation';

export function ContactForm() {
  const { values, fieldStates, setValue, handleBlur, handleSubmit } = useFormValidation({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validationRules: {
      name: [validators.required(), validators.minLength(2)],
      email: [validators.required(), validators.email()],
      message: [validators.required(), validators.minLength(20)],
    },
    onSubmit: async (values) => {
      try {
        await submitContactForm(values);
        toast.success('Message sent successfully!');
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={values.name}
        onChange={(e) => setValue('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        error={fieldStates.name.error}
        success={fieldStates.name.showSuccess}
      />
      
      {/* Other fields */}
      
      <Button type="submit">Send message</Button>
    </form>
  );
}
```

### Form-Level Errors

```tsx
export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors
    
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (error) {
      if (isAuthError(error)) {
        setFormError('Invalid email or password');
      } else if (isNetworkError(error)) {
        setFormError('Network error. Please check your connection.');
      } else {
        setFormError(getErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive text-destructive">
          <p className="text-sm">{formError}</p>
        </div>
      )}
      
      {/* Form fields */}
    </form>
  );
}
```

---

## Toast Notifications

### Success/Error Toasts

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Post published successfully!');

// Error toast
toast.error('Failed to publish post');

// Custom error toast with action
toast.error('Failed to save draft', {
  action: {
    label: 'Retry',
    onClick: () => saveDraft(),
  },
});

// Promise-based toast
toast.promise(
  savePost(),
  {
    loading: 'Saving post...',
    success: 'Post saved successfully!',
    error: (err) => getErrorMessage(err),
  }
);
```

---

## Network Error Handling

### Retry Logic

```tsx
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return await handleAPIResponse<T>(response);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

### Offline Detection

```tsx
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage
export function App() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="p-4 bg-destructive/10 border-b border-destructive">
        <p className="text-sm text-destructive">
          You are currently offline. Some features may be unavailable.
        </p>
      </div>
    );
  }

  return <>{/* App content */}</>;
}
```

---

## Error Logging & Monitoring

### Error Reporting Service

```typescript
// src/lib/error-reporting.ts

interface ErrorContext {
  user?: {
    id: string;
    email: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export function reportError(error: Error, context?: ErrorContext) {
  // Console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    console.error('Context:', context);
    return;
  }

  // Send to Sentry (production)
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      user: context?.user,
      tags: context?.tags,
      extra: context?.extra,
    });
  }

  // Send to custom logging endpoint
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // Silently fail - don't throw error in error handler
  });
}
```

### Usage in Error Boundary

```tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  reportError(error, {
    tags: {
      component: 'ErrorBoundary',
      boundary: this.constructor.name,
    },
    extra: {
      componentStack: errorInfo.componentStack,
    },
  });
}
```

---

## User-Facing Error Messages

### Error Message Guidelines

**✅ Good Error Messages:**
- Clear and concise
- Action-oriented (what user can do)
- No technical jargon
- Empathetic tone

**❌ Bad Error Messages:**
- Generic ("An error occurred")
- Technical (stack traces, error codes)
- Blaming user ("You entered invalid data")
- No action ("Something went wrong")

### Examples

```tsx
// ✅ Good
"Unable to save your changes. Please try again or contact support if the problem persists."

// ❌ Bad
"Error: ECONNREFUSED at Socket.connect"
```

### Error Message Map

```typescript
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  UNAUTHORIZED: 'Please sign in to continue',
  FORBIDDEN: 'You don\'t have permission to access this resource',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Data errors
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  
  // Server errors
  SERVER_ERROR: 'Server error. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  
  // Default
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export function getUserFriendlyMessage(error: unknown): string {
  const code = getErrorCode(error);
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

---

## Testing Error Scenarios

### Unit Tests

```tsx
describe('ErrorBoundary', () => {
  it('should render error UI when child throws', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText('Test error')).toBeInTheDocument();
  });

  it('should reset error state on retry', () => {
    // Test implementation
  });
});
```

### Integration Tests

```tsx
describe('API Error Handling', () => {
  it('should handle 404 errors', async () => {
    server.use(
      rest.get('/api/posts', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ message: 'Not found' }));
      })
    );

    const { getByText } = render(<PostList />);

    await waitFor(() => {
      expect(getByText('Failed to load posts')).toBeInTheDocument();
    });
  });
});
```

---

## Checklist

### Error Handling Checklist

- [ ] Global error boundary in root layout
- [ ] Feature-level error boundaries for isolated failures
- [ ] API error handler with typed errors
- [ ] Loading states for all async operations
- [ ] Error states with retry functionality
- [ ] Empty states for zero results
- [ ] Form validation with field-level errors
- [ ] Toast notifications for user feedback
- [ ] Network error detection and offline handling
- [ ] Error logging to monitoring service
- [ ] User-friendly error messages
- [ ] Retry logic for transient failures
- [ ] Error tests (unit + integration)

---

## Resources

### Internal
- [Form Validation Hook](../../src/hooks/use-form-validation.ts)
- [Design Tokens](../../src/lib/design-tokens.ts)

### External
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)

---

**Last Updated**: January 15, 2026  
**Next Review**: Q2 2026

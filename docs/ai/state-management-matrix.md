# State Management Decision Matrix

**Purpose**: Guide AI agents on when to use local state, context, Zustand, or server state.

**Last Updated**: January 15, 2026  
**Status**: General Guidance for Future Enhancement

---

## Decision Tree

```
Need to manage state?
  │
  ├─ Data from server (API, database)?
  │  └─ YES → Use Server State (React Query / SWR) ✅
  │     └─ Benefits: Caching, revalidation, optimistic updates, loading states
  │
  ├─ Used in single component only?
  │  └─ YES → Use Local State (useState, useReducer) ✅
  │     └─ Benefits: Simple, no boilerplate, component-scoped
  │
  ├─ Shared by 2-3 nearby components (parent + children)?
  │  └─ YES → Use Props / Composition ✅
  │     └─ Lift state to common ancestor, pass via props
  │
  ├─ Shared by distant components (deep tree)?
  │  └─ YES → Use Context ✅
  │     └─ Benefits: No prop drilling, React-native solution
  │
  ├─ Global state (theme, auth, settings)?
  │  └─ YES → Use Context or Zustand ⚠️
  │     └─ Context: Small, infrequent updates (theme, locale)
  │     └─ Zustand: Complex, frequent updates (cart, filters)
  │
  └─ Complex client state (multi-step forms, wizards)?
     └─ Use Zustand or useReducer ⚠️
        └─ Zustand: Need persistence, devtools, multiple components
        └─ useReducer: Single component, complex logic
```

---

## 1. Local State (useState, useReducer)

### When to Use

**✅ Use local state for:**
- UI state (open/closed, hover, focus)
- Form inputs (controlled components)
- Component-specific data (counters, toggles)
- Temporary state (search queries, filters within component)

**❌ Don't use local state for:**
- Data from server (use React Query)
- Shared state (use Context or Zustand)
- Persistent state (use Zustand with persistence)

### Implementation: useState

```tsx
export function SearchInput() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      />
      {isOpen && <SearchResults query={query} />}
    </div>
  );
}
```

### Implementation: useReducer

**Use useReducer when:**
- Complex state logic (multiple related state variables)
- State transitions based on actions
- Similar to Redux patterns (actions, reducer)

```tsx
interface State {
  step: number;
  formData: Record<string, unknown>;
  errors: Record<string, string>;
}

type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_FIELD'; field: string; value: unknown }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'RESET' };

function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: Math.max(0, state.step - 1) };
    case 'SET_FIELD':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case 'RESET':
      return { step: 0, formData: {}, errors: {} };
    default:
      return state;
  }
}

export function MultiStepForm() {
  const [state, dispatch] = useReducer(formReducer, {
    step: 0,
    formData: {},
    errors: {},
  });

  return (
    <div>
      <FormStep step={state.step} data={state.formData} errors={state.errors} />
      <button onClick={() => dispatch({ type: 'PREV_STEP' })}>Back</button>
      <button onClick={() => dispatch({ type: 'NEXT_STEP' })}>Next</button>
    </div>
  );
}
```

---

## 2. Context (React Context API)

### When to Use

**✅ Use Context for:**
- Theme (light/dark mode)
- Locale (i18n)
- User authentication status
- Feature flags
- Layout state (sidebar open/closed)
- Infrequent updates (changes rarely)

**❌ Don't use Context for:**
- Server data (use React Query)
- Frequent updates (causes re-renders)
- Complex state logic (use Zustand or Redux)

### Implementation

```tsx
// src/contexts/theme-context.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage
export default function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme} mode</button>;
}
```

### Performance Optimization

**Problem**: Context causes all consumers to re-render when value changes.

**Solution**: Split contexts or use composition.

```tsx
// Split into separate contexts
const ThemeContext = createContext<'light' | 'dark'>('light');
const ThemeActionsContext = createContext<{ setTheme: (theme: 'light' | 'dark') => void }>(undefined!);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const actions = useMemo(() => ({ setTheme }), []);

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeActionsContext.Provider value={actions}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeContext.Provider>
  );
}

// Consumers only re-render when their context changes
function ThemeDisplay() {
  const theme = useContext(ThemeContext); // Re-renders on theme change
  return <div>{theme}</div>;
}

function ThemeToggle() {
  const { setTheme } = useContext(ThemeActionsContext); // Never re-renders
  return <button onClick={() => setTheme('dark')}>Set Dark</button>;
}
```

---

## 3. Zustand (Global State Management)

### When to Use

**✅ Use Zustand for:**
- Shopping cart
- Global filters (search, sort, pagination)
- UI state shared across many components
- Persistent state (localStorage sync)
- Frequent updates (many state changes)
- Complex state logic with actions

**❌ Don't use Zustand for:**
- Server data (use React Query)
- Component-local state (use useState)
- Simple context needs (use React Context)

### Installation

```bash
npm install zustand
```

### Implementation

```tsx
// src/stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      total: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);

// Usage in components
export function Cart() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <div>
      <h2>Cart ({items.length} items)</h2>
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
      <p>Total: ${total.toFixed(2)}</p>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button onClick={() => addItem(product)}>
      Add to Cart
    </button>
  );
}
```

### Performance Tips

**Use selectors to prevent unnecessary re-renders:**

```tsx
// ✅ Good - only re-renders when items change
const items = useCartStore((state) => state.items);

// ❌ Bad - re-renders on any store change
const { items } = useCartStore();
```

**Use shallow comparison for object selectors:**

```tsx
import { shallow } from 'zustand/shallow';

// ✅ Good - shallow comparison
const { items, total } = useCartStore(
  (state) => ({ items: state.items, total: state.total() }),
  shallow
);
```

---

## 4. Server State (React Query / SWR)

### When to Use

**✅ Use React Query/SWR for:**
- Data fetching from APIs
- Caching and revalidation
- Optimistic updates
- Pagination and infinite scroll
- Real-time data synchronization
- Loading and error states

**❌ Don't use for:**
- UI state (use local state)
- Global client state (use Zustand)

### Installation

```bash
npm install @tanstack/react-query
```

### Setup

```tsx
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 3,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Basic Usage

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
export function PostList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// Mutations
export function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newPost: NewPost) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title, content });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </form>
  );
}
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['posts', newPost.id] });

    // Snapshot previous value
    const previousPost = queryClient.getQueryData(['posts', newPost.id]);

    // Optimistically update
    queryClient.setQueryData(['posts', newPost.id], newPost);

    // Return context with snapshot
    return { previousPost };
  },
  onError: (err, newPost, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts', newPost.id], context?.previousPost);
  },
  onSettled: (data, error, variables) => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['posts', variables.id] });
  },
});
```

---

## State Management Comparison

| Feature | useState | Context | Zustand | React Query |
|---------|----------|---------|---------|-------------|
| **Complexity** | Simple | Medium | Medium | Complex |
| **Boilerplate** | None | Low | Low | Medium |
| **Performance** | Excellent | Good | Excellent | Excellent |
| **DevTools** | No | No | Yes | Yes |
| **Persistence** | No | No | Yes (plugin) | Yes (cache) |
| **Server Sync** | No | No | No | Yes |
| **Learning Curve** | Easy | Easy | Medium | Medium |
| **Bundle Size** | 0 KB | 0 KB | ~3 KB | ~15 KB |

---

## State Ownership Guidelines

### Component-Local State
- UI toggles (open/closed, hover, focus)
- Form inputs
- Temporary filters/search
- Animation states

### Context
- Theme (light/dark)
- Locale (i18n)
- Authentication status
- Feature flags
- Layout preferences

### Zustand
- Shopping cart
- Global filters
- Multi-step forms
- UI state across features
- Persistent preferences

### React Query
- Server data (posts, users, etc.)
- API responses
- Cached data
- Real-time updates
- Paginated data

---

## Migration Strategies

### From useState to Context

```tsx
// Before: Prop drilling
function App() {
  const [theme, setTheme] = useState('light');
  return <Layout theme={theme} setTheme={setTheme} />;
}

function Layout({ theme, setTheme }) {
  return <Header theme={theme} setTheme={setTheme} />;
}

function Header({ theme, setTheme }) {
  return <ThemeToggle theme={theme} setTheme={setTheme} />;
}

// After: Context
function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}
```

### From Context to Zustand

```tsx
// Before: Context (re-renders all consumers)
const CartContext = createContext<CartContextValue>(undefined!);

export function CartProvider({ children }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // ... complex state logic
  return (
    <CartContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

// After: Zustand (fine-grained subscriptions)
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}));

// Only re-renders when items change
const items = useCartStore((state) => state.items);
```

---

## Testing State Management

### Testing Local State

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

test('should toggle state on click', () => {
  render(<ToggleButton />);
  const button = screen.getByRole('button');
  
  expect(button).toHaveTextContent('Off');
  fireEvent.click(button);
  expect(button).toHaveTextContent('On');
});
```

### Testing Context

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './theme-context';

test('should provide theme value', () => {
  function TestComponent() {
    const { theme } = useTheme();
    return <div>{theme}</div>;
  }

  render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(screen.getByText('light')).toBeInTheDocument();
});
```

### Testing Zustand

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from './cart-store';

test('should add item to cart', () => {
  const { result } = renderHook(() => useCartStore());

  act(() => {
    result.current.addItem({ id: '1', name: 'Product', price: 10 });
  });

  expect(result.current.items).toHaveLength(1);
  expect(result.current.items[0].quantity).toBe(1);
});
```

### Testing React Query

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from './mocks/server';
import { rest } from 'msw';

test('should fetch posts', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useQuery({ queryKey: ['posts'], queryFn: fetchPosts }), {
    wrapper,
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(3);
});
```

---

## Checklist

### State Management Checklist

Before implementing state, verify:

- [ ] Identified correct state type (UI, client, server)
- [ ] Chosen appropriate state solution (local, Context, Zustand, React Query)
- [ ] Minimized re-renders (selectors, memoization)
- [ ] Added TypeScript types
- [ ] Implemented error handling
- [ ] Added loading states
- [ ] Wrote unit tests
- [ ] Considered persistence needs
- [ ] Documented state ownership

---

## Resources

### Internal
- [Form Validation Hook](../../src/hooks/use-form-validation.ts)
- [Error Handling Patterns](./error-handling-patterns.md)

### External
- [React State Management](https://react.dev/learn/managing-state)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Context Best Practices](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

---

**Last Updated**: January 15, 2026  
**Next Review**: Q2 2026

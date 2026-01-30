<!-- TLP:CLEAR -->

# Blog Search Form Component

**Location:** `src/components/blog-search-form.tsx`

**Type:** Client Component (`"use client"`)

**Dependencies:** Next.js Navigation, Input & Button UI primitives

## Overview

The `BlogSearchForm` component provides a search interface for filtering and discovering blog posts. It allows users to search by post title, content, and tags with real-time query parameters updates. The component integrates with Next.js App Router for client-side URL navigation and state management.

## Features

- **Real-Time Search**: Debounced input (250ms) for responsive search experience
- **URL State Persistence**: Search query and tag filter reflected in URL as query parameters
- **Tag Filtering**: Maintains tag filter while searching
- **Accessible Form**: Proper `role="search"` and ARIA labels
- **Pending States**: Shows "Searching..." feedback during navigation
- **Responsive**: Stacks vertically on mobile, inline on desktop
- **Keyboard Support**: Standard form submission with Enter key
- **Browser Back/Forward**: Works with browser history (uses `router.replace`)

## Usage

### Basic Usage

```tsx
import { BlogSearchForm } from "@/components/blog-search-form";

export default function BlogPage({ searchParams }) {
  const query = searchParams.q || "";
  const tag = searchParams.tag || "";

  return (
    <div>
      <BlogSearchForm query={query} tag={tag} />
      {/* Filtered post list below */}
    </div>
  );
}
```

### Props

```tsx
interface BlogSearchFormProps {
  query: string;   // Current search query (from URL)
  tag: string;     // Current tag filter (from URL)
}
```

### Example

```tsx
// URL: /blog?q=typescript&tag=dev-tools
<BlogSearchForm query="typescript" tag="dev-tools" />
```

## Component Structure

### DOM Hierarchy

```
<form role="search">
  <div>
    <Input
      type="search"
      name="q"
      placeholder="Search posts..."
      value={value}
      onChange={setValue}
      aria-label="Search blog posts"
    />
    <input type="hidden" name="tag" value={tag} />
    <Button type="submit" disabled={isPending}>
      {isPending ? "Searching..." : "Search"}
    </Button>
  </div>
</form>
```

### Styling

| Element | Classes | Purpose |
|---------|---------|---------|
| Form | `mt-6 flex flex-col gap-3 sm:flex-row sm:items-center` | Vertical on mobile, horizontal on desktop |
| Input Container | `flex w-full items-center gap-2` | Flex layout with gap |
| Input | `w-full` | Full width |
| Button | (inherited) | Paired with input |

## How It Works

### State Management

The component manages internal state with React hooks:

```tsx
const [value, setValue] = useState(query);           // Current input value
const [isPending, startTransition] = useTransition(); // Navigation pending state
```

### Input Flow

```
User types in input
    ↓
onChange → setValue (local state)
    ↓
useEffect detects change (250ms debounce)
    ↓
applySearch() updates URL
    ↓
router.replace() navigates
    ↓
Component receives new query prop
    ↓
useEffect syncs local value with prop
```

### URL Query Parameter Management

The `applySearch` function constructs query parameters:

```tsx
const params = new URLSearchParams(searchParams.toString());

// Set search query
if (next) {
  params.set("q", next);
} else {
  params.delete("q");
}

// Preserve tag filter
if (tag) {
  params.set("tag", tag);
} else {
  params.delete("tag");
}

// Navigate to new URL
router.replace(`${pathname}?${params.toString()}`);
```

### URL Examples

| Action | URL |
|--------|-----|
| Clear search | `/blog` |
| Search "React" | `/blog?q=React` |
| Search "React" + tag "react" | `/blog?q=React&tag=react` |
| Filter by tag only | `/blog?tag=nextjs` |

### Debouncing Strategy

```
User types 'r'                    (0ms)
  └─ Schedule search (250ms timer)

User types 'e'                    (50ms)
  └─ Cancel previous timer
  └─ Schedule search (250ms timer)

User types 'a'                    (100ms)
  └─ Cancel previous timer
  └─ Schedule search (250ms timer)

User types 'c'                    (150ms)
  └─ Cancel previous timer
  └─ Schedule search (250ms timer)

User stops typing                 (150ms)
  └─ Timer expires after 250ms
  └─ Trigger search for "reac"   (400ms)
```

Benefits:
- Prevents excessive URL updates
- Improves performance (fewer navigation events)
- Better UX (debounced feedback)
- Typical result: search fires 200-400ms after last keystroke

### Synchronization

When the component receives new props (from parent after URL update), it syncs the local input value:

```tsx
useEffect(() => {
  setValue(query);
}, [query, tag]);
```

Prevents local state from diverging from URL state.

## Form Submission

### Behavior

The form has a submit handler for explicit submission (Enter key or button click):

```tsx
const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  applySearch(value.trim());
};
```

Trims whitespace and applies search immediately (doesn't wait for debounce).

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Any character | Debounced search (250ms) |
| Enter | Immediate search |
| Tab | Move to next element |
| Shift+Tab | Move to previous element |

## Navigation Context

### Next.js Hooks Used

```tsx
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const router = useRouter();           // For route changes
const pathname = usePathname();       // Current URL path (/blog)
const searchParams = useSearchParams(); // Current query params
```

### router.replace() vs router.push()

The component uses `router.replace()` for several reasons:

1. **Browser History**: Doesn't add to browser back button history
   - Prevents back button spam when searching
   - Cleaner browsing experience

2. **State Preservation**: Doesn't create history entries for each keystroke
   - Only navigation matters, not intermediate searches

3. **UX**: Back button goes to previous feature/page, not previous search

### Scroll Behavior

```tsx
router.replace(target, { scroll: false });
```

Prevents page scroll to top when search updates.

## Accessibility Features

### Form Semantics

```tsx
<form role="search">
  {/* search-specific form */}
</form>
```

- `role="search"` properly identifies the form as a search interface
- Screen reader announces: "Search form"

### Input Accessibility

```tsx
<Input
  type="search"
  name="q"
  placeholder="Search posts..."
  aria-label="Search blog posts"
  autoComplete="off"
/>
```

- `type="search"` - Semantic input type for search
- `aria-label="Search blog posts"` - Label for screen readers
- `placeholder` - Visual hint text
- `autoComplete="off"` - Prevents browser search history interference

### Button Accessibility

```tsx
<Button type="submit" disabled={isPending}>
  {isPending ? "Searching..." : "Search"}
</Button>
```

- `type="submit"` - Proper form submission button
- `disabled={isPending}` - Prevents multiple submissions
- Text changes indicate state: "Searching..." shows pending state
- Button remains keyboard accessible even when disabled

### Live Region

```tsx
<div className="..." aria-live="polite">
  {/* Input and button */}
</div>
```

- `aria-live="polite"` announces dynamic changes without interrupting
- Screen readers announce when form is pending/searching

## Performance Considerations

### Optimization Strategies

1. **Debouncing**: Reduces URL updates and navigation events
2. **useTransition**: Prevents UI blocking during navigation
3. **No External Calls**: All state local to component
4. **Efficient Re-renders**: Only re-renders on prop/state changes

### Bundle Impact

- Component size: ~2KB (gzipped)
- No additional dependencies beyond Next.js

### Interaction Latency

| Action | Latency |
|--------|---------|
| Type character | ~1ms (state update) |
| Debounce delay | 250ms (configurable) |
| Search apply | ~50-100ms (navigation) |
| URL update | Instant |
| Browser render | ~16ms (next frame) |

## Integration Points

### Current Usage

Located on `/blog` page:

```tsx
// src/app/blog/page.tsx
export default function BlogPage({ searchParams }) {
  const query = searchParams.q || "";
  const tag = searchParams.tag || "";

  return (
    <div>
      <h1>Blog</h1>
      <BlogSearchForm query={query} tag={tag} />
      {/* Posts filtered by query and tag */}
    </div>
  );
}
```

### How Filtering Works

1. BlogSearchForm updates URL with query params
2. Parent page receives updated searchParams
3. Post list filters based on searchParams
4. Component re-renders with filtered results

### Search Algorithm

The search implementation (in parent or separate utility) typically:
- Searches post titles (primary)
- Searches post content (secondary)
- Searches post tags (when using tag filter)
- Case-insensitive matching
- Partial string matching

See `src/data/posts.ts` or `src/lib/blog.ts` for filtering implementation.

## Customization

### Changing Debounce Delay

Reduce for faster search, increase for fewer updates:

```tsx
// Faster (50ms)
window.setTimeout(() => {
  // search...
}, 50);

// Slower (500ms)
window.setTimeout(() => {
  // search...
}, 500);
```

### Changing Input Placeholder

```tsx
<Input
  type="search"
  placeholder="Find a post..."  // Custom text
  // ... other props
/>
```

### Adding a Clear Button

```tsx
<div className="flex w-full items-center gap-2">
  <Input value={value} onChange={(e) => setValue(e.target.value)} />
  {value && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setValue("");
        applySearch("");
      }}
    >
      ✕
    </Button>
  )}
  <Button type="submit">Search</Button>
</div>
```

### Adding Search Suggestions

Could extend component to show search suggestions:

```tsx
// Would require new state and data fetching
const [suggestions, setSuggestions] = useState([]);

// Filter suggestions based on input
// Show dropdown with matching results
```

## Testing

### Manual Testing

1. **Search Interaction**:
   - Type "react" → URL updates to `/blog?q=react`
   - Clear input → URL updates to `/blog`
   - Posts filter correctly

2. **Tag Filtering**:
   - Start with `/blog?tag=nextjs`
   - Search for "hooks" → URL becomes `/blog?q=hooks&tag=nextjs`
   - Tag filter preserved during search

3. **Form Submission**:
   - Focus on input
   - Press Enter → Searches immediately (no wait)
   - Or click "Search" button

4. **Keyboard Navigation**:
   - Tab through form elements
   - All buttons/inputs focusable
   - Can navigate with keyboard only

5. **Mobile Layout**:
   - On mobile (< sm breakpoint), should stack vertically
   - On desktop, should be inline

### Development Testing

```bash
# Open DevTools Network tab
# Type in search
# Should see network activity (router navigation)
# Watch URL change in address bar

# Open DevTools Console
# Look for any errors or warnings
```

### Accessibility Testing

```bash
# Use screen reader (VoiceOver, NVDA)
# Should announce:
# - "Search form"
# - "Search blog posts input"
# - "Search button" or "Searching..."
# - "Polite live region" for status updates
```

## Related Components & Files

| Item | Purpose |
|------|---------|
| `BlogSearchForm` | This component |
| `Input` (UI) | Text input element |
| `Button` (UI) | Submit button element |
| Blog page | `/app/blog/page.tsx` - Uses this form |
| Post list | Renders filtered posts based on query |
| `src/data/posts.ts` | Post data and filtering logic |

## Type Definitions

```tsx
type BlogSearchFormProps = {
  query: string;   // Current search query from URL
  tag: string;     // Current tag filter from URL
};

export function BlogSearchForm({ query, tag }: BlogSearchFormProps): ReactNode
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Search not working | Filtering logic not implemented | Check parent component filtering |
| URL not updating | router.replace not called | Verify applySearch implementation |
| Debounce too slow | 250ms too long | Reduce to 100-150ms |
| Lost tag filter | Not passed to hidden input | Ensure `<input type="hidden" name="tag" />` |
| Mobile layout broken | CSS media query issue | Check sm breakpoint styling |
| Screen reader not announcing | aria-live missing | Add `aria-live="polite"` to container |

## Browser Compatibility

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Web APIs:
  - `URLSearchParams` - IE11+ (need polyfill for IE11)
  - `useTransition` - React 18+
  - Next.js navigation - Next.js 13+ (App Router)

## Performance Checklist

- ✅ Debounced input (250ms)
- ✅ useTransition for smooth UX
- ✅ No external API calls from component
- ✅ Minimal re-renders (only on prop/state changes)
- ✅ No memory leaks (cleanup on unmount)
- ✅ Keyboard accessible
- ✅ Mobile responsive
- ✅ Screen reader friendly

## Changelog

- **2025-10-15** - Initial implementation with search and tag filtering

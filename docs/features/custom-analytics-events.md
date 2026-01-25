{/* TLP:CLEAR */}

# Custom Analytics Events Documentation

Complete reference for all custom analytics events tracked via Vercel Analytics.

## Table of Contents

- [Overview](#overview)
- [Event Categories](#event-categories)
- [Blog Post Events](#blog-post-events)
- [Search and Filter Events](#search-and-filter-events)
- [Navigation Events](#navigation-events)
- [Interaction Events](#interaction-events)
- [Performance Events](#performance-events)
- [Implementation Guide](#implementation-guide)
- [Viewing Analytics Data](#viewing-analytics-data)
- [Privacy and Compliance](#privacy-and-compliance)

## Overview

This site tracks custom user interactions using Vercel Analytics to understand content engagement, user behavior, and site performance. All tracking is:

- **Privacy-respecting**: No PII collected, anonymous by default
- **Type-safe**: Full TypeScript support with strict event schemas
- **Gracefully degrading**: Never blocks functionality if tracking fails
- **Development-friendly**: Console logging in dev mode for debugging

### Key Features

- ✅ Blog post engagement (views, completion, scroll depth)
- ✅ Search and filter analytics
- ✅ Navigation patterns (internal and external)
- ✅ Form submissions and interactions
- ✅ Web Vitals performance metrics (future)

## Event Categories

| Category | Events | Purpose |
|----------|--------|---------|
| **Blog Posts** | 6 events | Track reading behavior and content engagement |
| **Search/Filter** | 4 events | Understand discovery and navigation patterns |
| **Navigation** | 4 events | Track user journey and external referrals |
| **Interactions** | 4 events | Measure conversion and engagement |
| **Performance** | 1 event | Monitor site speed and user experience |

## Blog Post Events

### `blog_post_viewed`

Triggered when a user lands on a blog post page.

**Properties:**
```typescript
{
  slug: string;        // "implementing-csp-with-nextjs"
  title: string;       // "Implementing CSP with Next.js"
  tags: string;        // "nextjs, security, web-dev" (comma-separated)
  readingTime: number; // 5 (in minutes)
}
```

**When:** Page load (once per visit)  
**Purpose:** Track which posts are viewed most often  
**Implementation:** `src/components/blog-analytics-tracker.tsx`

---

### `blog_post_completed`

Triggered when a user spends significant time and scrolls through content.

**Properties:**
```typescript
{
  slug: string;       // "implementing-csp-with-nextjs"
  timeSpent: number;  // 180 (seconds)
  scrollDepth: number; // 85 (percentage 0-100)
}
```

**When:** User has spent 30+ seconds on page AND scrolled 80%+ of content  
**Purpose:** Identify high-quality, engaging content  
**Implementation:** `src/hooks/use-blog-analytics.ts`

**Criteria:**
- Minimum time: 30 seconds of active viewing
- Minimum scroll: 80% of page height
- Tracked only once per visit
- Respects page visibility (doesn't count hidden tabs)

---

### `blog_toc_clicked`

Triggered when a user clicks a heading in the Table of Contents.

**Properties:**
```typescript
{
  slug: string;    // "implementing-csp-with-nextjs"
  heading: string; // "Installation Steps"
  level: number;   // 2 (h2) or 3 (h3)
}
```

**When:** User clicks TOC link to navigate to a heading  
**Purpose:** Understand which sections are most interesting  
**Implementation:** `src/components/table-of-contents.tsx`

---

### `blog_related_post_clicked`

Triggered when a user clicks a related post recommendation.

**Properties:**
```typescript
{
  fromSlug: string; // "implementing-csp-with-nextjs"
  toSlug: string;   // "security-headers-guide"
  position: number; // 0 (0-indexed position in list)
}
```

**When:** User clicks a related post link at bottom of post  
**Purpose:** Measure effectiveness of content recommendations  
**Implementation:** `src/components/related-posts.tsx`

---

### `blog_code_copied`

Triggered when a user copies a code block.

**Properties:**
```typescript
{
  slug: string;     // "implementing-csp-with-nextjs"
  language: string; // "typescript"
}
```

**When:** User clicks copy button on code block  
**Purpose:** Track practical utility of code examples  
**Implementation:** Not yet implemented (future enhancement)

---

### `blog_share_clicked`

Triggered when a user clicks a social share button.

**Properties:**
```typescript
{
  slug: string;    // "implementing-csp-with-nextjs"
  platform: string; // "twitter" | "linkedin" | "facebook" | "reddit" | "copy"
}
```

**When:** User clicks share button  
**Purpose:** Measure social sharing behavior and platform preferences  
**Implementation:** Not yet implemented (future enhancement)

---

## Search and Filter Events

### `blog_search_performed`

Triggered when a user performs a search query.

**Properties:**
```typescript
{
  query: string;       // "nextjs"
  resultsCount: number; // 12
}
```

**When:** User types in search box (250ms debounced)  
**Purpose:** Understand what users are looking for  
**Implementation:** `src/components/blog-search-analytics.tsx`

---

### `blog_tag_filtered`

Triggered when a user filters by tag(s).

**Properties:**
```typescript
{
  tags: string;         // "typescript, react" (comma-separated)
  resultsCount: number; // 8
}
```

**When:** User selects or changes tag filters  
**Purpose:** Track content discovery patterns by topic  
**Implementation:** `src/components/blog-search-analytics.tsx`

---

### `blog_filters_cleared`

Triggered when a user clears all active filters.

**Properties:**
```typescript
{
  hadSearch: boolean; // true
  hadTags: boolean;   // false
}
```

**When:** User removes all search and tag filters  
**Purpose:** Track friction points in content discovery  
**Implementation:** `src/components/blog-search-analytics.tsx`

---

### `project_filtered`

Triggered when a user filters projects by tag.

**Properties:**
```typescript
{
  tags: string;         // "typescript, web" (comma-separated)
  resultsCount: number; // 5
}
```

**When:** User applies filters on /projects page  
**Purpose:** Understand interest in specific project categories  
**Implementation:** Not yet implemented (future enhancement)

---

## Navigation Events

### `external_link_clicked`

Triggered when a user clicks an external link.

**Properties:**
```typescript
{
  url: string;    // "https://nextjs.org/docs"
  source: string; // "blog-post-body" | "footer" | "header"
}
```

**When:** User clicks a link to an external website  
**Purpose:** Track referral behavior and external resources used  
**Implementation:** Not yet implemented (future enhancement)

---

### `project_card_clicked`

Triggered when a user clicks a project card.

**Properties:**
```typescript
{
  projectName: string; // "Task Management App"
  tags: string;        // "react, typescript" (comma-separated)
}
```

**When:** User clicks on a project card  
**Purpose:** Measure interest in portfolio projects  
**Implementation:** Not yet implemented (future enhancement)

---

### `github_heatmap_day_clicked`

Triggered when a user clicks a day in the GitHub contribution heatmap.

**Properties:**
```typescript
{
  date: string;             // "2024-11-11"
  contributionCount: number; // 12
}
```

**When:** User clicks a day cell in the heatmap  
**Purpose:** Track engagement with GitHub activity visualization  
**Implementation:** Not yet implemented (future enhancement)

---

### `theme_toggled`

Triggered when a user changes the site theme.

**Properties:**
```typescript
{
  theme: string; // "light" | "dark" | "system"
}
```

**When:** User clicks theme toggle button  
**Purpose:** Track user preferences for light/dark mode  
**Implementation:** Not yet implemented (future enhancement)

---

## Interaction Events

### `contact_form_submitted`

Triggered when a user successfully submits the contact form.

**Properties:**
```typescript
{
  messageLength: number; // 150 (character count)
  hasGitHub: boolean;    // false (privacy-respecting, always false)
  hasLinkedIn: boolean;  // false (privacy-respecting, always false)
}
```

**When:** Form passes validation and is sent to Inngest  
**Purpose:** Track conversion rate and message characteristics  
**Implementation:** `src/app/api/contact/route.ts` (server-side)

**Privacy Note:** Email and name are NOT tracked in analytics. Only message length is recorded.

---

### `contact_form_error`

Triggered when a contact form submission fails.

**Properties:**
```typescript
{
  error: string; // "Invalid email address"
}
```

**When:** Form validation fails or API returns error  
**Purpose:** Identify UX issues and common mistakes  
**Implementation:** Not yet implemented (future enhancement)

---

### `newsletter_signup_clicked`

Triggered when a user clicks newsletter signup.

**Properties:**
```typescript
{
  source: string; // "footer" | "blog-post" | "homepage"
}
```

**When:** User clicks newsletter CTA  
**Purpose:** Track interest in newsletter and CTA effectiveness  
**Implementation:** Not yet implemented (future enhancement)

---

### `resume_downloaded`

Triggered when a user downloads the resume/CV.

**Properties:**
```typescript
{
  source: string; // "about-page" | "header-menu"
}
```

**When:** User clicks resume download link  
**Purpose:** Track conversion on employment-related CTAs  
**Implementation:** Not yet implemented (future enhancement)

---

## Performance Events

### `performance_metric`

Triggered when Core Web Vitals are measured.

**Properties:**
```typescript
{
  metric: string; // "LCP" | "FID" | "CLS" | "FCP" | "TTFB"
  value: number;  // 1250 (milliseconds or score)
  rating: string; // "good" | "needs-improvement" | "poor"
}
```

**When:** Page load completes and web vitals are calculated  
**Purpose:** Monitor site performance and user experience  
**Implementation:** Not yet implemented (future enhancement)

**Web Vitals Thresholds:**
- **LCP** (Largest Contentful Paint): Good < 2.5s, Poor > 4s
- **FID** (First Input Delay): Good < 100ms, Poor > 300ms
- **CLS** (Cumulative Layout Shift): Good < 0.1, Poor > 0.25
- **FCP** (First Contentful Paint): Good < 1.8s, Poor > 3s
- **TTFB** (Time to First Byte): Good < 800ms, Poor > 1800ms

---

## Implementation Guide

### Adding Analytics to a Component

#### Client-Side Tracking

```typescript
import { trackEvent } from "@/lib/analytics";

function MyComponent() {
  const handleClick = () => {
    trackEvent({
      name: "my_custom_event",
      properties: {
        actionType: "button_click",
        value: 123,
      },
    });
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

#### Server-Side Tracking

```typescript
import { trackServerEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  // Process request...
  
  await trackServerEvent({
    name: "api_action",
    properties: {
      endpoint: "/api/contact",
      success: true,
    },
  });
  
  return Response.json({ success: true });
}
```

### Using Convenience Functions

```typescript
import {
  trackBlogView,
  trackBlogCompleted,
  trackSearch,
  trackTagFilter,
} from "@/lib/analytics";

// Track blog post view
trackBlogView("my-post-slug", "My Post Title", ["react", "typescript"], 5);

// Track search
trackSearch("nextjs", 12);

// Track tag filter
trackTagFilter(["typescript", "web"], 8);
```

### Event Properties Guidelines

1. **Keep property names short and clear**: `slug` not `blogPostSlug`
2. **Use snake_case for event names**: `blog_post_viewed`
3. **Use camelCase for properties**: `readingTime` not `reading_time`
4. **Always include context**: Include enough data to understand the event
5. **Convert arrays to strings**: Vercel Analytics requires string/number/boolean only
6. **No PII**: Never track emails, names, or personal information

---

## Viewing Analytics Data

### Vercel Analytics Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Analytics** tab
4. Click **Custom Events** to see all tracked events

### Available Views

- **Events Overview**: Total count and trend for each event
- **Event Details**: Drill down into specific events with property filters
- **User Paths**: See common navigation patterns
- **Conversion Funnels**: Track multi-step user journeys

### Custom Queries

Filter events by properties:
```
Event: blog_post_viewed
Filter: tags contains "nextjs"
```

### Exporting Data

Export analytics data via Vercel API or dashboard for deeper analysis in tools like Google Sheets, Excel, or BI platforms.

---

## Privacy and Compliance

### Data Collection Principles

1. **No PII**: We never track email addresses, names, or personally identifiable information
2. **Anonymous by default**: All tracking is aggregate and anonymous
3. **Opt-out friendly**: Respects Do Not Track (DNT) browser settings (future)
4. **GDPR compliant**: First-party analytics, minimal data retention
5. **Transparent**: All tracked events documented here

### What We Track

- ✅ Page views and navigation
- ✅ Search queries (no user identification)
- ✅ Content interaction (reading, scrolling)
- ✅ Form submissions (metadata only, not content)

### What We DON'T Track

- ❌ Email addresses
- ❌ Names
- ❌ IP addresses (beyond rate limiting)
- ❌ User agent strings
- ❌ Cookies for tracking
- ❌ Cross-site behavior

### Cookie Policy

Vercel Analytics uses a first-party cookie for basic session tracking. No third-party tracking cookies are used.

---

## Testing Analytics

### Development Mode

All analytics events are logged to console in development:

```bash
npm run dev
```

Look for console messages like:
```
[Analytics] blog_post_viewed { slug: "my-post", title: "...", ... }
```

### Production Testing

To test in production without polluting data:

1. Use incognito/private browsing
2. Check browser DevTools Network tab for requests to `/_vercel/insights`
3. Verify events appear in Vercel dashboard (may take a few minutes)

### Debug Checklist

- [ ] Event appears in browser console (dev mode)
- [ ] Network request to `/_vercel/insights` succeeds
- [ ] Event appears in Vercel dashboard within 5-10 minutes
- [ ] Event properties are correctly formatted
- [ ] No console errors or warnings

---

## Future Enhancements

Planned analytics features:

- [ ] Code block copy tracking
- [ ] Social share button tracking
- [ ] External link click tracking
- [ ] Project card interactions
- [ ] GitHub heatmap interactions
- [ ] Theme toggle tracking
- [ ] Newsletter signup tracking
- [ ] Resume download tracking
- [ ] Web Vitals performance tracking
- [ ] Custom conversion funnels
- [ ] A/B testing framework

---

## Related Documentation

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Custom Events API Reference](https://vercel.com/docs/analytics/custom-events)
- `/src/lib/analytics.ts` - Analytics utility library
- `/src/hooks/use-blog-analytics.ts` - Blog reading analytics hook
- `/docs/operations/environment-variables.md` - Environment setup

---

## Support

For analytics questions or issues:

1. Check this documentation first
2. Review browser console for errors
3. Verify Vercel Analytics is enabled in project settings
4. Check that `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` is set (auto-configured by Vercel)

Last updated: November 11, 2025

{/* TLP:CLEAR */}

# GiscusComments Component Documentation

**Component:** `src/components/giscus-comments.tsx`  
**Type:** Client Component  
**Purpose:** GitHub Discussions-powered commenting system for blog posts

## Overview

The `GiscusComments` component integrates [Giscus](https://giscus.app/) to enable comments on blog posts using GitHub Discussions as the backend. It provides a seamless commenting experience with automatic theme switching, lazy loading, and graceful fallback when not configured.

## Features

- ✅ **GitHub Integration** - Users comment with their GitHub accounts
- ✅ **Theme Synchronization** - Automatically switches between light/dark themes
- ✅ **Lazy Loading** - Loads only when scrolled into view for better performance
- ✅ **Graceful Degradation** - Silently hides when not configured (no errors)
- ✅ **Discussion Syncing** - Comments appear in GitHub Discussions
- ✅ **Reactions & Replies** - Full GitHub Discussions feature set
- ✅ **Moderation Tools** - Manage comments via GitHub's moderation interface

## Usage

### Basic Usage

The component is already integrated into blog post pages and requires no props:

```tsx
import { GiscusComments } from "@/components/giscus-comments";

export default function BlogPost() {
  return (
    <article>
      {/* Your blog post content */}
      
      <GiscusComments />
    </article>
  );
}
```

### Current Implementation

Located in: `src/app/blog/[slug]/page.tsx`

```tsx
{/* Share buttons */}
<div className="mt-12 border-t pt-8">
  <ShareButtons
    url={`${SITE_URL}/blog/${post.slug}`}
    title={post.title}
    tags={post.tags}
  />
</div>

{/* Comments section */}
<GiscusComments />
```

## Configuration

### Environment Variables

Four environment variables are required to enable comments. All must be present or the component will not render.

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GISCUS_REPO` | GitHub repository (owner/repo) | `dcyfr/dcyfr-labs` |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | Repository ID from Giscus | `R_kgDOK...` |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | Discussion category name | `Blog Comments` |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Category ID from Giscus | `DIC_kwDO...` |

### Setup Instructions

#### 1. Enable GitHub Discussions

1. Go to your repository settings: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings`
2. Scroll to "Features" section
3. Check "Discussions"
4. Click "Set up discussions" button

#### 2. Create Discussion Category

1. Go to your repository's Discussions tab
2. Click on "Categories" (gear icon)
3. Create a new category:
   - **Name:** `Blog Comments` (recommended)
   - **Format:** Announcement (only maintainers can create new discussions)
   - **Description:** Comments from blog posts

#### 3. Configure Giscus

1. Visit [giscus.app](https://giscus.app/)
2. Enter your repository name (e.g., `dcyfr/dcyfr-labs`)
3. Verify repository eligibility:
   - Repository is public
   - giscus app is installed
   - Discussions feature is enabled
4. Configure settings:
   - **Page ↔️ Discussions Mapping:** `pathname` ✅
   - **Discussion Category:** Select your created category
   - **Features:** 
     - ✅ Enable reactions
     - ✅ Emit discussion metadata (can leave disabled)
   - **Theme:** Leave as default (we handle this automatically)
   - **Loading:** Lazy (default, optimal for performance)
5. Copy the generated configuration values:
   ```javascript
   data-repo="owner/repo"              // → NEXT_PUBLIC_GISCUS_REPO
   data-repo-id="R_xxxxx"              // → NEXT_PUBLIC_GISCUS_REPO_ID
   data-category="Blog Comments"       // → NEXT_PUBLIC_GISCUS_CATEGORY
   data-category-id="DIC_xxxxx"        // → NEXT_PUBLIC_GISCUS_CATEGORY_ID
   ```

#### 4. Add Environment Variables

**Local Development (`/.env.local`):**
```bash
NEXT_PUBLIC_GISCUS_REPO=dcyfr/dcyfr-labs
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDOK...
NEXT_PUBLIC_GISCUS_CATEGORY=Blog Comments
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDO...
```

**Production (Vercel):**
1. Go to: `Project Settings → Environment Variables`
2. Add all four variables
3. Set scope: `Production`, `Preview`, and `Development` (all)
4. Redeploy to apply changes

## How It Works

### Component Behavior

```tsx
export function GiscusComments() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Check if all required env vars are present
  const isConfigured =
    process.env.NEXT_PUBLIC_GISCUS_REPO &&
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  // Wait for hydration to avoid theme flash
  useEffect(() => {
    setMounted(true);
  }, []);

  // Silent fail: return null if not configured or not mounted
  if (!isConfigured || !mounted) {
    return null;
  }

  // Render Giscus with automatic theme switching
  return (
    <Giscus
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      // ... other props
    />
  );
}
```

### Theme Synchronization

The component uses `next-themes` to detect the current theme and automatically updates Giscus when the user toggles between light and dark modes:

- **Light Mode:** Uses Giscus `light` theme
- **Dark Mode:** Uses Giscus `dark` theme
- **System Preference:** Resolves to light or dark based on OS setting

### Lazy Loading

The `loading="lazy"` prop tells Giscus to load only when the comments section is scrolled into view:

- **Initial Page Load:** Faster, comments widget not loaded
- **Scroll to Comments:** Widget loads dynamically
- **Better Performance:** Reduces initial bundle size and API calls

### Pathname Mapping

Each blog post gets its own discussion based on the URL pathname:

| Blog Post | Discussion Mapping |
|-----------|-------------------|
| `/blog/my-first-post` | Discussion created for `/blog/my-first-post` |
| `/blog/nextjs-tips` | Discussion created for `/blog/nextjs-tips` |

This ensures comments are isolated per post and automatically organized in GitHub Discussions.

## User Experience

### When Configured ✅

1. User scrolls to bottom of blog post
2. Comments section appears with heading "Comments"
3. Giscus widget loads (lazy, only when visible)
4. User can:
   - Sign in with GitHub
   - Leave comments
   - Reply to other comments
   - React with emoji
   - Edit/delete their own comments

### When Not Configured ⚠️

1. User scrolls to bottom of blog post
2. No comments section appears
3. No error messages or broken UI
4. Everything else works normally

## Styling

The component includes minimal styling to integrate with the blog design:

```tsx
<div className="mt-12 border-t pt-8">
  <h2 className="mb-6 text-2xl font-semibold">Comments</h2>
  <Giscus {...props} />
</div>
```

- **Spacing:** `mt-12` (3rem top margin) separates from share buttons
- **Border:** Top border for visual separation
- **Heading:** "Comments" with consistent typography
- **Giscus Styling:** Automatic via Giscus themes (light/dark)

## Troubleshooting

### Comments Not Appearing

**Check environment variables:**
```bash
# Verify all four variables are set
echo $NEXT_PUBLIC_GISCUS_REPO
echo $NEXT_PUBLIC_GISCUS_REPO_ID
echo $NEXT_PUBLIC_GISCUS_CATEGORY
echo $NEXT_PUBLIC_GISCUS_CATEGORY_ID
```

**Common Issues:**
- ❌ Missing one or more environment variables → Component returns null
- ❌ Wrong repository name format → Should be `owner/repo`, not full URL
- ❌ Category not created → Create in GitHub Discussions settings
- ❌ giscus app not installed → Install at [github.com/apps/giscus](https://github.com/apps/giscus)

### Theme Not Switching

**Check theme provider:**
- Ensure `ThemeProvider` wraps the app in `src/app/layout.tsx`
- Verify `next-themes` is installed
- Check browser console for errors

**Force refresh:**
```tsx
// If theme switching is delayed, try:
const { resolvedTheme, systemTheme } = useTheme();
const currentTheme = resolvedTheme || systemTheme || 'light';
```

### Repository Not Eligible

**Requirements:**
1. Repository must be **public**
2. **Discussions** feature must be enabled
3. **giscus app** must be installed: [github.com/apps/giscus](https://github.com/apps/giscus)

**Verify on giscus.app:**
- Enter your repository name
- Check for green checkmarks ✅
- Follow any error messages

### Comments Not Syncing to GitHub

**Check GitHub Discussions:**
1. Go to your repository's Discussions tab
2. Look in the configured category (e.g., "Blog Comments")
3. Each blog post should have its own discussion

**If missing:**
- First comment creates the discussion automatically
- Verify category ID is correct
- Check giscus app permissions in repository settings

### Loading Performance Issues

**Lazy loading is enabled by default**, but if you notice slow loading:

1. Check Network tab in DevTools
2. Verify `loading="lazy"` prop is present
3. Consider adding stricter cache headers

## Security & Privacy

### Content Security Policy (CSP)

The site implements strict nonce-based CSP for security. Giscus requires the following CSP directives (already configured in `src/middleware.ts`):

```typescript
// Required CSP directives for Giscus
const cspDirectives = [
  // Allow Giscus iframe to load
  "frame-src https://vercel.live https://giscus.app https://*.vercel-insights.com",
  
  // Allow GitHub avatars and assets in comments
  "img-src 'self' data: ... https://avatars.githubusercontent.com https://github.githubassets.com ...",
];
```

**Why these are needed:**
- **`frame-src: https://giscus.app`** - Giscus runs in an iframe from this domain
- **`img-src: https://avatars.githubusercontent.com`** - User profile pictures from GitHub
- **`img-src: https://github.githubassets.com`** - GitHub UI icons and assets

Without these directives, the browser will block Giscus from loading due to CSP violations.

**Verification:**
- CSP violations are reported to `/api/csp-report`
- Check browser console for "Content Security Policy" errors
- CSP is automatically configured when Giscus environment variables are set

### Data Storage

- **Comments:** Stored in GitHub Discussions (GitHub's infrastructure)
- **User Data:** Users authenticate with GitHub
- **No Database:** No comments stored in your database or Redis
- **Privacy:** Subject to GitHub's privacy policy

### Moderation

Moderate comments using GitHub's built-in tools:

1. Go to repository → Discussions → Your comment category
2. Click on any discussion
3. Use GitHub's moderation features:
   - Delete comments
   - Lock discussions
   - Hide comments
   - Pin discussions
   - Mark as answered

### Permissions

- **Public Repository:** Anyone with a GitHub account can comment
- **Private Repository:** Not supported (Giscus requires public repos)
- **Organization:** Works with both personal and organization repos

## Advanced Configuration

### Custom Giscus Settings

To customize beyond defaults, edit `src/components/giscus-comments.tsx`:

```tsx
<Giscus
  repo={process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
  repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
  category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY!}
  categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
  mapping="pathname"            // Options: pathname, url, title, etc.
  strict="0"                    // Match discussions strictly
  reactionsEnabled="1"          // Enable reactions (👍 ❤️ 🎉 etc.)
  emitMetadata="0"              // Emit discussion metadata
  inputPosition="top"           // Comment input at top (or "bottom")
  theme={resolvedTheme === "dark" ? "dark" : "light"}
  lang="en"                     // Language (en, es, fr, etc.)
  loading="lazy"                // Lazy load for performance
/>
```

### Multiple Comment Sections

To add comments to other pages (e.g., projects):

```tsx
import { GiscusComments } from "@/components/giscus-comments";

export default function ProjectPage() {
  return (
    <div>
      {/* Project content */}
      <GiscusComments />
    </div>
  );
}
```

Each page will get its own discussion based on pathname.

## References

- **Giscus Official Site:** [giscus.app](https://giscus.app/)
- **Giscus GitHub:** [github.com/giscus/giscus](https://github.com/giscus/giscus)
- **@giscus/react Docs:** [github.com/giscus/giscus-component](https://github.com/giscus/giscus-component)
- **GitHub Discussions:** [docs.github.com/discussions](https://docs.github.com/en/discussions)
- **next-themes:** [github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)

## Related Documentation

- **Environment Variables:** `/docs/platform/environment-variables.md`
- **Blog Architecture:** `/docs/blog/architecture.md`
- **Component JSDoc:** `/docs/components/README.md`

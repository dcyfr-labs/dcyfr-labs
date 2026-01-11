# Social Media Links

Centralized management of social media accounts and profiles across the site with intelligent internal/external link handling.

**Last Updated:** January 8, 2026

## Overview

The social links system provides a single source of truth for all social media and contact information. It intelligently handles both internal links (homepage, contact) and external links (GitHub, LinkedIn, etc.) with appropriate rendering and UX patterns.

## Data File

**Location:** `src/data/socials.ts`

### Structure

```typescript
export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
  icon?: string;
  description?: string;
};
```

### Supported Platforms

- Cal.com (Scheduling)
- Twitter/X (@dcyfr_)
- DEV (@dcyfr)
- LinkedIn
- Peerlist
- Wellfound
- GitHub
- GitHub Sponsors
- Credly (Professional Certifications)
- Goodreads
- ORCID (Researcher Profile)

### Usage

#### Import the social links array

```typescript
import { socialLinks } from "@/data/socials";
```

#### Get all social URLs (for JSON-LD)

```typescript
import { getSocialUrls } from "@/data/socials";

const urls = getSocialUrls(); // Returns array of URLs
```

#### Get a specific social link

```typescript
import { getSocialLink } from "@/data/socials";

const linkedin = getSocialLink("linkedin");
```

## Implementation

### About Page

**Location:** `src/app/about/page.tsx`

The about page displays all social links in a responsive grid with intelligent link handling:

**Internal Links** (use Next.js `Link` component):
- Homepage (`/`)
- Contact page (`/contact`)
- Benefits: Client-side navigation, no page reload, instant routing
- No external link icon

**External Links** (use `<a>` tag):
- All other platforms (GitHub, LinkedIn, Cal.com, etc.)
- Open in new tab (`target="_blank"`)
- Security attributes (`rel="noopener noreferrer"`)
- External link icon shown on hover

**Visual Features:**
- Icon for each platform (from lucide-react)
- Label and description
- Hover effects with border color change
- External link indicator (external links only)
- Accessible markup
- Responsive 2-column grid

**Link Detection Logic:**
```typescript
const isInternalLink = social.url.startsWith('/') || 
  (social.url.includes('www.dcyfr.ai') && (
    social.url.endsWith('/') || 
    social.url.endsWith('/contact')
  ));

const internalPath = social.platform === "homepage" ? "/" 
  : social.platform === "email" ? "/contact" 
  : social.url;
```

### JSON-LD Schema

Social URLs are automatically included in structured data:
- Person schema includes `sameAs` field with all social URLs
- Used on homepage and about page
- Helps search engines understand social profiles

**Location:** `src/lib/json-ld.ts`

## Adding New Platforms

1. Add the platform type to `SocialPlatform` union in `src/data/socials.ts`
2. Add the link object to the `socialLinks` array
3. Map the icon in components (if needed)

Example:

```typescript
{
  platform: "twitter",
  label: "Twitter",
  url: "https://twitter.com/username",
  icon: "twitter",
  description: "Follow me on Twitter"
}
```

## Icon Mapping

The about page uses lucide-react icons:

- `calendar` → `Calendar`
- `twitter` → `Twitter`
- `dev` → `Code` or `Code2`
- `linkedin` → `Linkedin`
- `peerlist` → `Users`
- `wellfound` → `Briefcase`
- `github` → `Github`
- `sponsors` → `Heart`
- `credly` → `Award`
- `goodreads` → `BookOpen`
- `orcid` → `GraduationCap`
- Default → `ExternalLink`

To add a new icon, update the icon mapping logic in the about page component.

## SEO Benefits

- **Structured Data**: Search engines can link social profiles to the main site
- **Social Proof**: Displays professional presence across platforms
- **Discoverability**: Helps users find you on their preferred platform
- **Consistency**: Centralized management ensures URLs are consistent across the site

## Best Practices

1. **Keep URLs updated**: Update `src/data/socials.ts` when social handles change
2. **Add descriptions**: Help users understand what they'll find on each platform
3. **Test links**: Verify all URLs are correct and working
4. **Accessibility**: Ensure descriptions are meaningful for screen readers

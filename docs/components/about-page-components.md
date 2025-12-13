# About Page Components Documentation

## Overview

The about page features five interactive components that enhance the presentation of professional information, plus intelligent internal/external link handling in the "Connect with me" section. All components follow the project's design system (shadcn/ui, Tailwind CSS) and are fully responsive.

**Created:** November 5, 2025  
**Last Updated:** November 9, 2025  
**Components:** AboutAvatar, AboutStats, AboutSkills, AboutCertifications, AboutCurrentlyLearning

---

## Page Structure & Content Strategy

### Content Philosophy
The About page focuses on **personality, values, and overview**, while `/resume` contains the complete work history. This separation prevents duplication and gives each page a clear purpose:

- **About Page**: Who you are, what drives you, current focus, skills overview
- **Resume Page**: Complete chronological work history, detailed responsibilities

### Page Sections (in order)
1. **Hero** - Avatar, name, short summary (`resume.shortSummary`)
2. **Stats Showcase** - Animated achievement counters (`AboutStats`)
3. **What Drives Me** - Personal narrative and values
4. **Current Role** - Detailed view of current position from `resume.experience[0]`
5. **Professional Background** - High-level experience summary with link to full resume
6. **Currently Learning** - Active learning and development (`AboutCurrentlyLearning`)
7. **Skills & Expertise** - Skills grid (`AboutSkills`)
8. **Certifications** - Credential showcase (`AboutCertifications`)
9. **Connect with Me** - Social links with intelligent internal/external link handling

### Internal vs External Link Handling

**Location**: "Connect with me" section at bottom of About page  
**Updated**: November 9, 2025

The social links section intelligently differentiates between internal and external links:

**Internal Links** (use Next.js `Link` component):
- Homepage (`/`)
- Contact page (`/contact`)
- Benefits: Client-side navigation, no page reload, faster UX
- No external icon shown

**External Links** (use `<a>` tag):
- All other platforms (GitHub, LinkedIn, Cal.com, etc.)
- Open in new tab (`target="_blank"`)
- Security attributes (`rel="noopener noreferrer"`)
- Show ExternalLink icon on hover

**Detection Logic:**
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

**Rendering:**
```tsx
// Internal links
{isInternalLink && (social.platform === "homepage" || social.platform === "email") ? (
  <Link href={internalPath} className="group">
    <Card>{/* content */}</Card>
  </Link>
) : (
  // External links
  <a href={social.url} target="_blank" rel="noopener noreferrer">
    <Card>
      {/* content */}
      <ExternalLink className="..." />
    </Card>
  </a>
)}
```

**Data Source**: `src/data/socials.ts` (`socialLinks` array)

---

## Components

### 1. AboutAvatar (`about-avatar.tsx`)

**Purpose:** Displays a circular profile photo with graceful fallback support.

**Features:**
- Responsive sizing (sm/md/lg)
- Automatic fallback to User icon if image fails to load
- Ring border and shadow styling
- Theme-aware appearance

**Props:**
```typescript
{
  src?: string;          // Default: "/images/avatar.jpg"
  alt?: string;          // Default: "Profile photo"
  size?: "sm"|"md"|"lg"; // Default: "md"
}
```

**Usage:**
```tsx
<AboutAvatar size="md" />
```

**Sizes:**
- `sm`: 64px (16rem)
- `md`: 96-112px responsive (24-28rem)
- `lg`: 128-160px responsive (32-40rem)

**Image Requirements:**
- Location: `/public/images/avatar.jpg` (or custom via `src` prop)
- Format: JPG, PNG, WebP
- Recommended: Square aspect ratio, 400x400px minimum
- Will be displayed as circular (border-radius: 50%)

---

### 2. AboutStats (`about-stats.tsx`)

**Purpose:** Animated statistics showcase highlighting key career achievements.

**Features:**
- Animated number counters (0 → target value)
- Easing animation (1.5s duration)
- Icon-based visual indicators
- Responsive grid layout (1-2-3 columns)
- Hover effects on cards

**Client Component:** Yes (uses state and effects for animation)

**Stats Displayed:**
1. Years in Cybersecurity: 5+
2. Vulnerability Reduction: 23%
3. Faster Incident Response: 35%
4. Professional Certifications: 20+
5. Compliance Frameworks: 4+ (ISO 27001, SOC2, TISAX, TPN)

**Animation Details:**
- Duration: 1500ms
- Easing: Quadratic ease-out
- Triggered: On component mount
- Uses `requestAnimationFrame` for smooth performance

**Customization:**
Edit the `stats` array in the component to add/remove/modify statistics:
```typescript
const stats: Stat[] = [
  {
    label: "Your Label",
    value: "Display Value",
    icon: IconComponent,
    description: "Helper text",
    animateNumber: 42,
    suffix: "%",
  },
];
```

**Icons Used:**
- TrendingUp (years)
- Shield (vulnerabilities)
- Zap (response time)
- Award (certifications)
- CheckCircle2 (compliance)

---

### 3. AboutSkills (`about-skills.tsx`)

**Purpose:** Interactive categorized skills display with expand/collapse functionality.

**Features:**
- Pulls data from `resume.skills` array
- Badge-based tag display
- Expandable categories (show 8, expand to show all)
- "Critical Skills" expanded by default
- Hover effects on badges
- Skill count indicators

**Client Component:** Yes (uses state for expand/collapse)

**Data Source:** `src/data/resume.ts` → `resume.skills`

**Categories Displayed:**
1. Critical Skills (expanded by default)
2. Security Knowledge
3. Frameworks & Standards
4. Technologies & Tools
5. Programming & Automation

**Interaction:**
- Click "More" to expand category (shows all skills)
- Click "Less" to collapse back to 8 skills
- Categories with ≤8 skills don't show expand button
- Keyboard accessible (focus states)

**Styling:**
- Secondary badge variant for skills
- Outline badge for "+X more" indicator
- Hover: `bg-primary/10` transition

---

### 4. AboutCertifications (`about-certifications.tsx`)

**Purpose:** Professional certification display grouped by provider with verification links.

**Features:**
- Data from `resume.certifications` array
- Grouped by provider (GIAC, CompTIA, Mile2, ISC2)
- Badge display with monospace font
- External links to Credly profile (where available)
- Certification count per provider
- Hover effects

**Server Component:** Yes (static data)

**Data Source:** `src/data/resume.ts` → `resume.certifications`

**Verification Links:**
Currently configured:
- GIAC → https://www.credly.com/users/dcyfr

To add more providers, edit `getCredlyUrl()`:
```typescript
const credlyLinks: Record<string, string> = {
  "GIAC": "https://www.credly.com/users/dcyfr",
  "CompTIA": "your-comptia-url",
};
```

**Styling:**
- Award icon for each provider
- Monospace font for certification codes
- External link icon for verification
- Responsive "Verify" text (hidden on small screens)

---

### 5. AboutCurrentlyLearning (`about-currently-learning.tsx`)

**Purpose:** Highlights current educational pursuits and learning focus.

**Features:**
- Displays MS degree in progress from SANS
- Animated "In Progress" badge with pulse effect
- Course highlights list
- Accent border and background (primary color)
- Auto-detects current education (contains "Present" or "2024")

**Server Component:** Yes (static data)

**Data Source:** `src/data/resume.ts` → `resume.education[0]`

**Design:**
- Primary color accent (border + background)
- Pulsing indicator on "In Progress" badge
- BookOpen icon for focus areas
- GraduationCap icon in section header

**Highlights Displayed:**
- Defensible Security Architecture & Engineering
- Hacking Techniques & Incident Response
- IT Security Planning, Policy, & Leadership
- Security Essentials

**Fallback:** If no current education found (no "Present" in duration), component returns null.

---

## Integration

### About Page Layout

**Order of sections:**
1. Hero (name + avatar)
2. Stats showcase ← NEW
3. What drives me (text)
4. Currently at (current role)
5. Previously (past roles)
6. Currently Learning ← NEW
7. Skills & Expertise ← NEW
8. Certifications ← NEW
9. Connect with me (social links)

### Spacing

All sections use `space-y-12` between major sections for consistent vertical rhythm.

### Responsive Behavior

**Breakpoints:**
- Mobile (< 640px): Single column, smaller text
- Tablet (640-768px): 2-column grids where appropriate
- Desktop (> 768px): 3-column grids for stats

**Touch Targets:**
- All interactive elements ≥44px (WCAG AA)
- Focus indicators on all buttons/links
- Proper ARIA labels

---

## Data Management

### Update Workflow

**To update stats:**
Edit `src/components/about-stats.tsx` → `stats` array

**To update skills:**
Edit `src/data/resume.ts` → `resume.skills` array

**To update certifications:**
Edit `src/data/resume.ts` → `resume.certifications` array

**To update current education:**
Edit `src/data/resume.ts` → `resume.education` (ensure duration includes "Present")

**To change avatar:**
Replace `/public/images/avatar.jpg` or pass custom `src` prop

---

## Performance

**Bundle Impact:**
- AboutStats: ~2KB (client component with animation)
- Other components: Server-rendered, no JS shipped

**Animation Performance:**
- Uses `requestAnimationFrame` for 60fps animations
- Easing function prevents layout thrashing
- GPU-accelerated where possible

**Image Optimization:**
- Avatar uses Next.js Image component
- Automatic WebP conversion
- Lazy loading with priority flag

---

## Accessibility

**Keyboard Navigation:**
- All expand/collapse buttons focusable
- Proper tab order
- Focus indicators visible

**Screen Readers:**
- Semantic HTML (sections, headings)
- ARIA labels on icon-only buttons
- aria-expanded states on collapsible elements
- Icon elements marked aria-hidden

**Contrast:**
- All text meets WCAG AA standards
- Focus indicators have 3:1 contrast minimum
- Badge colors accessible in both themes

---

## Future Enhancements (Backlog)

**Phase 2 Opportunities:**
- Add skill proficiency levels (beginner/intermediate/expert)
- Filter skills by category
- Search certifications
- Certification expiry dates
- More detailed course descriptions in Currently Learning
- Progress bar for MS degree completion

**Phase 3 Advanced:**
- Interactive skill endorsements
- Certification timeline visualization
- Learning goals tracker
- Course completion milestones

---

## Troubleshooting

**Avatar not showing:**
1. Check `/public/images/avatar.jpg` exists
2. Verify image format (JPG/PNG/WebP)
3. Check browser console for 404 errors
4. Component will fallback to User icon automatically

**Stats not animating:**
1. Ensure component is client-side ("use client")
2. Check browser supports requestAnimationFrame
3. Verify no JS errors in console
4. Animation may be reduced in reduced-motion preference

**Skills not expanding:**
1. Check category has >8 skills
2. Verify button onClick handler
3. Check browser console for errors
4. Ensure useState working (client component)

**Certifications missing Credly link:**
1. Check `getCredlyUrl()` function
2. Add provider to credlyLinks object
3. Verify URL is correct and accessible

---

## Related Documentation

- [About Page Phase 2 & 3 Backlog](/docs/operations/todo#-about-page-enhancements-backlog)
- [Resume Data Schema](/src/data/resume.ts)
- [Design System (shadcn/ui)](/components.json)
- [Component Patterns](/docs/components/)

{/* TLP:CLEAR */}

# MDX Icon Components

**Status:** ✅ Implemented (Nov 9, 2025)

## Overview

Custom icon components are available in MDX content to replace emoji with consistent, theme-aware Lucide React icons. This provides better visual consistency, accessibility, and theme integration.

## Available Icons

### CheckIcon (✅)
Replaces the checkmark emoji with a themed icon component.

**Usage in MDX:**
```mdx
<CheckIcon />
```

**Renders as:** Green check icon (text-green-600 in light mode, text-green-400 in dark mode)

**Use cases:**
- Feature availability tables
- Completed task indicators
- Success states
- Verification marks

### XIcon (❌)
Replaces the cross/X emoji with a themed icon component.

**Usage in MDX:**
```mdx
<XIcon />
```

**Renders as:** Red X icon (text-red-600 in light mode, text-red-400 in dark mode)

**Use cases:**
- Feature unavailability tables
- Error states
- Denied/rejected indicators
- Cancelled items

### ReturnIcon (↩)
Replaces the return arrow emoji with a themed icon component.

**Usage in MDX:**
```mdx
<ReturnIcon />
```

**Renders as:** Muted corner-down-left icon

**Use cases:**
- Return/back actions
- Continuation indicators
- Reply symbols
- Flow indicators

### WarningIcon (⚠️)
Alert triangle icon for warnings and cautions.

**Usage in MDX:**
```mdx
<WarningIcon />
```

**Renders as:** Yellow warning triangle (text-yellow-600 in light mode, text-yellow-400 in dark mode)

**Use cases:**
- Warning messages
- Caution indicators
- Deprecation notices
- Important alerts

### InfoIcon (ℹ️)
Information circle icon for helpful notes.

**Usage in MDX:**
```mdx
<InfoIcon />
```

**Renders as:** Blue info icon (text-blue-600 in light mode, text-blue-400 in dark mode)

**Use cases:**
- Informational notes
- Help text indicators
- Documentation references
- Tips and hints

### IdeaIcon (💡)
Light bulb icon for ideas and insights.

**Usage in MDX:**
```mdx
<IdeaIcon />
```

**Renders as:** Yellow lightbulb icon (text-yellow-600 in light mode, text-yellow-400 in dark mode)

**Use cases:**
- Pro tips
- Insights
- Best practices
- Clever solutions

### ZapIcon (⚡)
Lightning bolt icon for performance and speed.

**Usage in MDX:**
```mdx
<ZapIcon />
```

**Renders as:** Purple lightning icon (text-purple-600 in light mode, text-purple-400 in dark mode)

**Use cases:**
- Performance features
- Speed indicators
- Power features
- Quick actions

### LockIcon (🔒)
Lock icon for security and privacy.

**Usage in MDX:**
```mdx
<LockIcon />
```

**Renders as:** Muted lock icon

**Use cases:**
- Security features
- Private content
- Protected resources
- Authentication required

### RocketIcon (🚀)
Rocket icon for launches and deployment.

**Usage in MDX:**
```mdx
<RocketIcon />
```

**Renders as:** Blue rocket icon (text-blue-600 in light mode, text-blue-400 in dark mode)

**Use cases:**
- Launch announcements
- Deployment features
- New releases
- Getting started

## Example Usage

### In Tables

```mdx
| Feature | Free | Pro |
|---------|:----:|:---:|
| Custom Domain | <XIcon /> | <CheckIcon /> |
| API Access | <XIcon /> | <CheckIcon /> |
| Support | Email | 24/7 |
```

### In Lists

```mdx
- <CheckIcon /> Feature implemented
- <XIcon /> Not yet available
- <ReturnIcon /> See documentation for details
```

### In Paragraphs

```mdx
This feature is <CheckIcon /> available in all plans.
```

## Technical Details

**Component Location:** `/src/components/mdx.tsx`

**Icon Library:** Lucide React

**Styling:**
- Inline-block display
- 16px × 16px (w-4 h-4)
- Theme-aware colors
- Accessible aria-labels
- Vertical alignment optimized for inline text

**Accessibility:**
- All icons include aria-label attributes
- Screen readers announce meaningful text
- Color contrast meets WCAG AA standards

## Adding New Icons

To add a new icon component:

1. Import the icon from Lucide React in `/src/components/mdx.tsx`:
   ```tsx
   import { IconName } from "lucide-react";
   ```

2. Add to the components mapping:
   ```tsx
   IconNameComponent: () => (
     <IconName 
       className="inline-block w-4 h-4 text-[color]" 
       aria-label="Icon Name" 
     />
   ),
   ```

3. Document the new icon in this guide

4. Update the markdown demo if relevant

## Migration from Emoji

When migrating existing content:

1. **Find emoji:** Search for `✅`, `❌`, `↩` in MDX files
2. **Replace with components:** Use `<CheckIcon />`, `<XIcon />`, `<ReturnIcon />`
3. **Test rendering:** Verify icons appear correctly in both themes
4. **Check accessibility:** Ensure screen readers announce correctly

## Design Rationale

**Why icons over emoji?**
- Consistent styling across operating systems and browsers
- Better theme integration (automatic dark/light mode)
- More control over size and spacing
- Better accessibility with aria-labels
- Professional appearance
- Reduced Unicode rendering issues

**Color choices:**
- Green for success/completion aligns with industry standards
- Red for errors/denial follows conventional UI patterns
- Muted colors for neutral icons prevent visual distraction
- Dark mode variants maintain readability

## Related Documentation

- [MDX Processing Pipeline](/docs/blog/mdx-processing)
- [Component Documentation](/docs/components/)
- [Design System](/docs/design/)

# Varying Depth Styling System

**Implementation Guide for Progressive Content Depth and Font Contrast**

This document explains the new varying depth styling system inspired by the about page patterns, now available across the entire site through standardized design tokens and components.

---

## 🎯 What This Solves

The varying depth system addresses three key design challenges:

1. **Visual Hierarchy**: Creates depth through progressive text treatments
2. **Content Flow**: Guides readers through long-form content with varying emphasis
3. **Typography Contrast**: Establishes clear contrast between light base fonts and bold weights

Based on patterns observed in our about page, this system provides:
- Dynamic muted text based on paragraph length and position
- Font weight contrast with thinner base fonts against bold elements
- Consistent content hierarchy across all components

---

## 🛠️ Design Tokens

### Core Depth Hierarchy

```typescript
import { TYPOGRAPHY } from "@/lib/design-tokens";

// Basic depth levels
TYPOGRAPHY.depth.primary    // font-medium text-foreground (full emphasis)
TYPOGRAPHY.depth.secondary  // font-normal text-foreground/90 (slight reduction)
TYPOGRAPHY.depth.tertiary   // font-normal text-muted-foreground (muted)
TYPOGRAPHY.depth.accent     // font-semibold text-foreground (highlighted)
TYPOGRAPHY.depth.subtle     // font-light text-muted-foreground/70 (minimal)
```

### Content Block Patterns

```typescript
import { CONTENT_HIERARCHY } from "@/lib/design-tokens";

// Organized content blocks (like About page sections)
CONTENT_HIERARCHY.primary.title      // font-medium text-foreground
CONTENT_HIERARCHY.primary.content    // text-foreground leading-relaxed
CONTENT_HIERARCHY.primary.container  // space-y-3

CONTENT_HIERARCHY.supporting.title   // font-medium text-foreground/90
CONTENT_HIERARCHY.supporting.content // text-muted-foreground leading-relaxed
CONTENT_HIERARCHY.supporting.container // space-y-2 mt-1
```

### Progressive Text System

```typescript
import { PROGRESSIVE_TEXT } from "@/lib/design-tokens";

// Dynamic paragraph styling based on position/length
PROGRESSIVE_TEXT.opening     // text-foreground font-normal leading-relaxed text-lg
PROGRESSIVE_TEXT.body        // text-foreground leading-relaxed
PROGRESSIVE_TEXT.extended    // text-foreground/95 leading-relaxed text-[15px] (long content)
PROGRESSIVE_TEXT.closing     // text-foreground/90 leading-relaxed
PROGRESSIVE_TEXT.contextual  // text-muted-foreground leading-relaxed text-sm
```

### Font Contrast System

```typescript
import { FONT_CONTRAST } from "@/lib/design-tokens";

// Light base fonts with strong contrast against bold elements
FONT_CONTRAST.base       // font-light text-foreground leading-relaxed
FONT_CONTRAST.medium     // font-normal text-foreground leading-relaxed
FONT_CONTRAST.emphasis   // font-semibold text-foreground
FONT_CONTRAST.bold       // font-bold text-foreground
FONT_CONTRAST.heading    // font-medium text-foreground
```

---

## 🎨 Components

### ProgressiveParagraph

Automatically applies depth styling based on content characteristics:

```tsx
import { ProgressiveParagraph } from "@/components/common";

// Basic usage - automatically analyzes content
<ProgressiveParagraph>
  This paragraph gets automatically styled based on length and position.
</ProgressiveParagraph>

// Explicit position control
<ProgressiveParagraph position="opening">
  First paragraph gets full emphasis and larger text.
</ProgressiveParagraph>

<ProgressiveParagraph position="closing">
  Final paragraphs get subtle reduction in emphasis.
</ProgressiveParagraph>

// Contextual information
<ProgressiveParagraph isContextual>
  Supporting information gets muted treatment.
</ProgressiveParagraph>

// Font contrast system
<ProgressiveParagraph useFontContrast>
  Uses lighter base font for better contrast against bold elements.
</ProgressiveParagraph>
```

### ContentBlock

Organized content sections with consistent hierarchy:

```tsx
import { ContentBlock } from "@/components/common";

<ContentBlock variant="primary" title="Main Section">
  <p>Primary content with full emphasis and proper spacing.</p>
</ContentBlock>

<ContentBlock variant="supporting" title="Supporting Info">
  <p>Secondary information with muted treatment.</p>
</ContentBlock>

<ContentBlock variant="accent" title="Highlighted Info">
  <p>Important information with enhanced emphasis.</p>
</ContentBlock>

<ContentBlock variant="subtle" title="Background Details">
  <p>Contextual information with minimal emphasis.</p>
</ContentBlock>
```

### ContrastText

Font contrast system with sub-components:

```tsx
import { ContrastText } from "@/components/common";

<ContrastText>
  Light base text with <ContrastText.Bold>strong contrast</ContrastText.Bold>
</ContrastText>

<ContrastText.Medium>Medium weight text</ContrastText.Medium>
<ContrastText.Emphasis>Emphasized text</ContrastText.Emphasis>
<ContrastText.Heading as="h3">Heading with optimal contrast</ContrastText.Heading>
```

---

## 📝 Usage Examples

### About Page Pattern

```tsx
// Convert existing about page sections
<div className={CONTENT_HIERARCHY.primary.container}>
  <p className={CONTENT_HIERARCHY.primary.title}>Development & Architecture</p>
  <p className={CONTENT_HIERARCHY.supporting.content}>
    Production-grade architecture decisions...
  </p>
</div>
```

### Blog Post Enhancement

```tsx
// MDX components automatically apply progressive styling
<MDX source={content} useFontContrast={true} />

// Manual control for specific content
<ProgressiveParagraph position="opening">
  Opening paragraph with enhanced emphasis...
</ProgressiveParagraph>
```

### Custom Component Integration

```tsx
import { getContentDepthClass, analyzeContentDepth } from "@/lib/design-tokens";

function CustomArticleSection({ content }) {
  const analysis = analyzeContentDepth(content);
  const depthClass = getContentDepthClass({
    length: content.length,
    position: analysis.suggestedPosition,
    isContextual: false,
  });
  
  return <p className={depthClass}>{content}</p>;
}
```

---

## 🔧 Utility Functions

### Dynamic Content Analysis

```typescript
import { getContentDepthClass, analyzeContentDepth } from "@/lib/design-tokens";

// Analyze content and get suggestions
const analysis = analyzeContentDepth("Your content here...");
console.log(analysis);
// {
//   suggestedPosition: 'body',
//   suggestedVariant: 'primary',
//   isLongContent: false,
//   characterCount: 20
// }

// Get appropriate styling classes
const depthClass = getContentDepthClass({
  length: 250,
  position: 'body',
  isContextual: false,
  useFontContrast: true
});
// Returns: "font-light text-foreground leading-relaxed"
```

### Content Block Helpers

```typescript
import { getContentBlockStyles } from "@/lib/design-tokens";

const styles = getContentBlockStyles('primary');
console.log(styles);
// {
//   title: "font-medium text-foreground",
//   content: "text-foreground leading-relaxed", 
//   container: "space-y-3"
// }
```

---

## 📊 Implementation Strategy

### Current Status

✅ **Completed:**
- Design tokens defined and documented
- Progressive paragraph component created
- MDX component enhanced with dynamic styling
- About page updated to use new tokens
- Font contrast system implemented
- Content hierarchy patterns established

### Rollout Plan

1. **Phase 1: Core Components** ✅
   - Design tokens implementation
   - Progressive paragraph component
   - Enhanced MDX processing

2. **Phase 2: Site-wide Application** (Next)
   - Update all prose content areas
   - Apply to card descriptions and supporting text
   - Implement in project detail pages

3. **Phase 3: Advanced Features** (Future)
   - AI-driven content analysis for automatic depth assignment
   - User preference for depth intensity
   - A/B testing framework for depth variations

### Usage Guidelines

**Do:**
- Use progressive paragraphs for long-form content
- Apply font contrast in content-heavy pages
- Leverage content blocks for organized information
- Test depth variations with different content types

**Don't:**
- Override depth styling without design system approval
- Mix depth systems inconsistently
- Apply aggressive muting to critical information
- Ignore accessibility contrast ratios

---

## 🎯 Design Philosophy

### Progressive Enhancement

The varying depth system follows progressive enhancement principles:

1. **Base Experience**: All text remains readable and accessible
2. **Enhanced Experience**: Depth creates visual hierarchy and flow
3. **Advanced Features**: Dynamic analysis improves content presentation

### Consistency with Brand

- Maintains DCYFR Labs' focus on practical, human-centric design
- Preserves readability while enhancing visual hierarchy
- Supports both light and dark mode preferences
- Scales across different content types and lengths

### Performance Considerations

- All styling is CSS-based (no JavaScript for core functionality)
- Progressive enhancement doesn't impact initial page load
- Dynamic analysis happens during component render (not on every re-render)
- Design tokens are tree-shakable and compile-time optimized

---

## 🔍 Examples in Action

### Before (Traditional)

```tsx
<div>
  <p className="font-medium text-foreground">Development & Architecture</p>
  <p className="text-muted-foreground mt-1">Production-grade architecture...</p>
</div>
```

### After (Varying Depth)

```tsx
<ContentBlock variant="primary" title="Development & Architecture">
  <ProgressiveParagraph position="body">
    Production-grade architecture decisions with automatic depth styling...
  </ProgressiveParagraph>
</ContentBlock>
```

### Result

- **Visual Hierarchy**: Clear distinction between titles and content
- **Progressive Flow**: Reader attention guided through content naturally
- **Font Contrast**: Light base text with strong contrast on emphasis
- **Consistency**: Same patterns applied across all content types

---

This system transforms static content into visually dynamic, reader-friendly experiences while maintaining the design system's consistency and accessibility standards.
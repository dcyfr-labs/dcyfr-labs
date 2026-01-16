# RIVET Component Analytics Setup

**Date**: January 16, 2026  
**Status**: ✅ Event tracking added | ⏳ Component integration pending  
**Purpose**: Track engagement metrics for RIVET P1 components

---

## Summary

Added comprehensive analytics tracking for all RIVET P1 components to measure engagement impact and validate design decisions. Events track component views, interactions, and conversions.

---

## Analytics Events Added

### 1. KeyTakeaway Component

**Event**: `rivet_key_takeaway_viewed`  
**Trigger**: Intersection Observer (50% visibility)  
**Properties**:
- `slug` (string) - Blog post slug
- `variant` ("insight" | "security" | "warning" | "tip") - Component variant
- `title` (string | null) - Optional title text
- `position` (number) - 1-indexed position in post

**Success Metric**: 80%+ view rate (users scroll to KeyTakeaway boxes)

---

### 2. RoleBasedCTA Component

**Event 1**: `rivet_role_based_cta_viewed`  
**Trigger**: Intersection Observer (50% visibility)  
**Properties**:
- `slug` (string) - Blog post slug
- `role` ("executive" | "developer" | "security") - Persona type
- `title` (string) - CTA card title
- `position` (number) - 1-indexed position in post

**Event 2**: `rivet_role_based_cta_clicked`  
**Trigger**: Button click  
**Properties**:
- `slug` (string) - Blog post slug
- `role` ("executive" | "developer" | "security") - Persona type
- `title` (string) - CTA card title
- `buttonText` (string) - Button label
- `buttonHref` (string) - Target URL
- `position` (number) - 1-indexed position in post

**Success Metrics**:
- **View rate**: 70%+ (users scroll to CTAs)
- **Click rate**: 5-8% of viewers (conversion metric)

---

### 3. CollapsibleSection Component

**Event**: `rivet_collapsible_section_toggled`  
**Trigger**: Expand/collapse button click  
**Properties**:
- `slug` (string) - Blog post slug
- `sectionId` (string) - Unique section identifier
- `title` (string) - Section title
- `action` ("expanded" | "collapsed") - User action
- `position` (number) - 1-indexed position in post

**Success Metrics**:
- **Expand rate**: 30%+ (users explore deep-dive content)
- **Engagement signal**: Expanded sections indicate high interest

---

### 4. GlossaryTooltip Component

**Event**: `rivet_glossary_tooltip_viewed`  
**Trigger**: Hover or click (tooltip open)  
**Properties**:
- `slug` (string) - Blog post slug
- `term` (string) - Technical term
- `position` (number) - 1-indexed position in post

**Success Metric**: 40%+ interaction rate (users look up definitions)

---

### 5. SectionShare Component

**Event**: `rivet_section_share_clicked`  
**Trigger**: Share button click  
**Properties**:
- `slug` (string) - Blog post slug
- `sectionId` (string) - Section identifier
- `sectionTitle` (string) - Section title
- `platform` ("linkedin" | "twitter" | "copy") - Share destination
- `position` (number) - 1-indexed position in post

**Success Metric**: 2-5% share rate (social amplification)

---

## Implementation Guide

### Step 1: Add Intersection Observer to Components

**For KeyTakeaway and RoleBasedCTA** (view tracking):

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { trackKeyTakeawayView } from '@/lib/analytics';

export function KeyTakeaway({ variant, title, children }: KeyTakeawayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            
            // Get slug from URL
            const slug = window.location.pathname.split('/').pop() || '';
            
            // Calculate position (count previous KeyTakeaway components)
            const allKeyTakeaways = document.querySelectorAll('[data-rivet-component="key-takeaway"]');
            const position = Array.from(allKeyTakeaways).indexOf(element) + 1;
            
            trackKeyTakeawayView(slug, variant, title || null, position);
          }
        });
      },
      { threshold: 0.5 } // 50% visibility
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [variant, title]);

  return (
    <div ref={ref} data-rivet-component="key-takeaway" className="...">
      {children}
    </div>
  );
}
```

### Step 2: Add Click Tracking to Interactive Components

**For RoleBasedCTA button clicks**:

```tsx
import { trackRoleBasedCTAClick } from '@/lib/analytics';

export function RoleBasedCTA({ role, title, buttonText, buttonHref }: RoleBasedCTAProps) {
  const handleClick = () => {
    const slug = window.location.pathname.split('/').pop() || '';
    const position = /* calculate position */;
    
    trackRoleBasedCTAClick(slug, role, title, buttonText, buttonHref, position);
  };

  return (
    <Link href={buttonHref} onClick={handleClick}>
      {buttonText}
    </Link>
  );
}
```

**For CollapsibleSection toggle**:

```tsx
import { trackCollapsibleSectionToggle } from '@/lib/analytics';

export function CollapsibleSection({ id, title }: CollapsibleSectionProps) {
  const handleToggle = (expanded: boolean) => {
    const slug = window.location.pathname.split('/').pop() || '';
    const position = /* calculate position */;
    
    trackCollapsibleSectionToggle(
      slug, 
      id, 
      title, 
      expanded ? 'expanded' : 'collapsed',
      position
    );
  };

  return <Collapsible onOpenChange={handleToggle}>...</Collapsible>;
}
```

---

## Analytics Dashboard (Vercel Analytics)

### Viewing RIVET Component Events

**Navigate to**: Vercel Dashboard → Your Project → Analytics → Events

**Filter by Event Name**:
- `rivet_key_takeaway_viewed`
- `rivet_role_based_cta_viewed`
- `rivet_role_based_cta_clicked`
- `rivet_collapsible_section_toggled`
- `rivet_glossary_tooltip_viewed`
- `rivet_section_share_clicked`

### Key Metrics to Track

#### Engagement Funnel
1. **Blog Post Views** (`blog_post_viewed`)
2. **KeyTakeaway Views** (`rivet_key_takeaway_viewed`) → 80% target
3. **CTA Views** (`rivet_role_based_cta_viewed`) → 70% target
4. **CTA Clicks** (`rivet_role_based_cta_clicked`) → 5-8% target

#### Component Performance
- **KeyTakeaway View Rate** = `rivet_key_takeaway_viewed` / `blog_post_viewed`
- **CTA Conversion Rate** = `rivet_role_based_cta_clicked` / `rivet_role_based_cta_viewed`
- **Expand Rate** = `rivet_collapsible_section_toggled (expanded)` / `blog_post_viewed`
- **Share Rate** = `rivet_section_share_clicked` / `blog_post_viewed`

#### Variant Analysis
- **Which KeyTakeaway variants perform best?** (insight vs security vs warning vs tip)
- **Which CTA roles convert better?** (executive vs developer vs security)
- **Which sections get expanded most?** (by sectionId/title)

---

## Success Criteria (7-Day Measurement)

### Overall Engagement
- ✅ **Time on page**: +15-20% (compared to posts without RIVET)
- ✅ **Scroll depth**: 80%+ (users reach bottom)
- ✅ **Bounce rate**: <40% (down from estimated 50%)

### RIVET Component Metrics
| Component | Target Metric | Success Threshold |
|-----------|---------------|-------------------|
| **KeyTakeaway** | View rate | ≥80% of post views |
| **RoleBasedCTA** | View rate | ≥70% of post views |
| **RoleBasedCTA** | Click rate | 5-8% of CTA views |
| **CollapsibleSection** | Expand rate | ≥30% of post views |
| **GlossaryTooltip** | Interaction rate | ≥40% of post views |
| **SectionShare** | Share rate | 2-5% of post views |

### Post-Specific Goals
| Post | Baseline | Target | Measurement |
|------|----------|--------|-------------|
| **CVE-2025-55182** | TBD | +20% time on page | 7 days |
| **Hardening Portfolio** | TBD | +15% time on page | 7 days |
| **Overall RIVET Posts** | TBD | 5-8% CTA clicks | 7 days |

---

## Implementation Checklist

### Analytics Setup ✅
- [x] Add RIVET event types to `src/lib/analytics.ts`
- [x] Add convenience functions for each component type
- [x] Export new tracking functions

### Component Integration ⏳
- [ ] Add Intersection Observer to `KeyTakeaway` component
- [ ] Add Intersection Observer to `RoleBasedCTA` component
- [ ] Add click tracking to `RoleBasedCTA` button
- [ ] Add toggle tracking to `CollapsibleSection` component
- [ ] Add hover/click tracking to `GlossaryTooltip` component
- [ ] Add click tracking to `SectionShare` buttons

### Testing ⏳
- [ ] Test event firing in development (console.warn logs)
- [ ] Verify events appear in Vercel Analytics dashboard
- [ ] Test with `prefers-reduced-motion` (ensure tracking still works)
- [ ] Verify position calculation accuracy

### Deployment ⏳
- [ ] Deploy to production
- [ ] Monitor event volume (first 24 hours)
- [ ] Set up 7-day measurement period
- [ ] Create analytics review document

---

## Technical Implementation Notes

### Position Calculation Strategy

**Approach**: Use `data-rivet-component` attributes to count positions

```tsx
// Get all KeyTakeaway components before current one
const allKeyTakeaways = document.querySelectorAll('[data-rivet-component="key-takeaway"]');
const position = Array.from(allKeyTakeaways).indexOf(element) + 1;
```

**Why this approach**:
- ✅ Automatic (no manual position props)
- ✅ Always accurate
- ✅ Works with dynamic content
- ✅ Consistent across all components

### Intersection Observer Best Practices

**Threshold**: 50% visibility (ensures user actually sees the component)
**Track once**: Use `hasTracked.current` ref to prevent duplicate events
**Cleanup**: Disconnect observer on unmount

### Privacy Considerations

**No PII Collection**:
- ✅ No user identifiers
- ✅ No personal information
- ✅ Only content-level metrics
- ✅ Aggregated data only

**Respects Do Not Track**:
- Vercel Analytics respects DNT header
- Events only fire in production
- No tracking in development (console logs only)

---

## Monitoring & Iteration

### Week 1 (Days 1-7)
- **Monitor**: Event volume, error rates
- **Validate**: Events firing correctly
- **Check**: Position accuracy

### Week 2 (Days 8-14)
- **Analyze**: Engagement metrics (view rates, click rates)
- **Compare**: Posts with RIVET vs posts without
- **Identify**: Best-performing variants/roles

### Week 3 (Days 15-21)
- **Iterate**: Adjust component placement based on data
- **Optimize**: Tweak CTA copy for low-performing roles
- **Document**: Findings in analytics review report

### Month 1 (30 days)
- **Comprehensive review**: Full analytics report
- **ROI analysis**: Engagement uplift vs implementation cost
- **Roadmap update**: RIVET P2 components prioritization
- **Rollout plan**: Apply to 5-10 more posts based on success

---

## Example Queries (Vercel Analytics Dashboard)

### Top Performing KeyTakeaway Variants
```
Event: rivet_key_takeaway_viewed
Group by: variant
Sort by: Count (DESC)
```

### CTA Conversion Funnel
```
1. Event: rivet_role_based_cta_viewed
2. Event: rivet_role_based_cta_clicked
Conversion rate by: role
```

### Most Expanded Sections
```
Event: rivet_collapsible_section_toggled
Filter: action = "expanded"
Group by: sectionId
Sort by: Count (DESC)
```

### Share Platform Breakdown
```
Event: rivet_section_share_clicked
Group by: platform
Percentage distribution
```

---

## Next Steps

### Immediate (Next Session)
1. **Integrate analytics into RIVET components**
   - Add Intersection Observer to KeyTakeaway
   - Add Intersection Observer to RoleBasedCTA
   - Add click tracking to all interactive components
   - Test event firing in development

2. **Deploy to production**
   - Verify Vercel Analytics is enabled
   - Monitor first 24 hours of events
   - Check for errors in Vercel logs

3. **Start 7-day measurement period**
   - Baseline metrics for CVE + Hardening posts
   - Daily check-ins on event volume
   - Flag any tracking issues

### Short-term (This Week)
1. **Create analytics review template**
   - Weekly snapshot format
   - Key metrics dashboard
   - Comparison tables (RIVET vs non-RIVET)

2. **Apply to 1 more post (OWASP Top 10)**
   - Validate tracking works across posts
   - Expand sample size
   - Test different content types

### Medium-term (Next 2 Weeks)
1. **Comprehensive analytics report**
   - 14-day data summary
   - Component performance analysis
   - Recommendations for optimization

2. **Iterate based on data**
   - Adjust component placement
   - Refine CTA copy
   - Add/remove components based on performance

---

## Related Documentation

- `src/lib/analytics.ts` - Analytics tracking library (updated with RIVET events)
- `docs/content/rivet-component-library.md` - RIVET component documentation
- `SESSION-COMPLETE-SUMMARY.md` - Phase 1-5 completion summary
- `RIVET-P1-CVE-POST-COMPLETE.md` - CVE post RIVET application
- `RIVET-P1-HARDENING-POST-COMPLETE.md` - Hardening post RIVET application

---

**Status**: Analytics events defined ✅ | Component integration pending ⏳  
**Next**: Integrate Intersection Observer into RIVET components  
**Timeline**: Deploy within 1-2 hours, measure for 7 days

---

**End of Analytics Setup Documentation**

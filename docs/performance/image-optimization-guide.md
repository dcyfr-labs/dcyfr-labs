# Image Optimization Guide

**Created**: January 15, 2026  
**Status**: Implementation in Progress  
**Goal**: Achieve LCP <2.5s across all pages

---

## Current State Analysis

### Image Component Usage Audit

**Total Image Components**: 26 files using Next.js Image component

**Priority Loading Status** (Above-the-fold images):
- ✅ **PostHeroImage**: `priority={true}` by default
- ✅ **FeaturedPostHero**: `priority={true}` 
- ✅ **ArchiveHero**: `priority={true}`
- ✅ **ModernPostCard**: `priority={index === 0}` (first card only)
- ✅ **ModernProjectCard**: `priority={index === 0}` (first card only)
- ⚠️ **ArticleHeader**: `priority={backgroundImage.priority || false}` (conditional, needs review)
- ❌ **FlippableAvatar**: `priority={false}` by default (if used above fold)
- ❌ **ProfileAvatar**: `priority={false}` by default
- ❌ **PhotoGrid**: `priority={index < 6}` (first 6 images, needs verification)

**Sizes Attribute Status** (Responsive loading):
- ✅ Most images have proper `sizes` attributes
- ✅ Good responsive breakpoints: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`
- ✅ Fixed size images use pixel values: `"48px"`, `"64px"`, `"192px"`

---

## Industry Best Practices

### 1. Priority Loading Strategy

**Above-the-fold images (priority={true}):**
- Hero images on landing pages
- Featured post images on homepage
- Archive header images
- First image in card lists (implemented ✅)
- Logo images above 600px viewport

**Below-the-fold images (priority={false}, lazy loading):**
- Images in scrollable lists (after first item)
- Sidebar images
- Footer images
- Modal/dialog images
- Images in collapsed sections

### 2. Responsive Sizes Attribute

**Purpose**: Tell browser which image size to download based on viewport

**Best practices:**
```tsx
// Full-width images
sizes="100vw"

// Sidebar content (~1/3 width)
sizes="(max-width: 768px) 100vw, 33vw"

// Grid items (3 columns on desktop, 2 on tablet, 1 on mobile)
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

// Fixed size images (avatars, icons)
sizes="48px"

// Variable width with max-width
sizes="(max-width: 768px) 100vw, 1200px"
```

### 3. Image Format Optimization

**Next.js Automatic Optimization**:
- Next.js automatically converts images to WebP/AVIF (if browser supports)
- Serves optimized sizes based on `sizes` attribute
- Generates srcset for responsive images
- Applies lazy loading by default (unless `priority={true}`)

**Manual Optimizations**:
```tsx
// Reduce quality for non-critical images
<Image
  src="/image.jpg"
  quality={75}  // Default is 75, reduce to 60-70 for backgrounds
  priority={false}
/>

// Use blur placeholder for better UX
<Image
  src="/image.jpg"
  placeholder="blur"
  blurDataURL={IMAGE_PLACEHOLDER.blur}
/>
```

---

## Implementation Checklist

### Phase 1: Priority Loading Audit ✅

- [x] Audit all Image components for priority attribute
- [x] Verify PostHeroImage has priority (✅ default true)
- [x] Verify FeaturedPostHero has priority (✅ true)
- [x] Verify ArchiveHero has priority (✅ true)
- [x] Verify first items in lists have priority (✅ implemented)

### Phase 2: Sizes Attribute Verification ✅

- [x] Audit all Image components for sizes attribute
- [x] Verify responsive sizes follow best practices (✅ good coverage)
- [x] Verify fixed-size images use pixel values (✅ avatars, badges)

### Phase 3: Performance Testing (In Progress)

- [ ] Run Lighthouse audit on key pages
- [ ] Measure LCP before optimizations
- [ ] Identify largest contentful paint elements
- [ ] Test on slow 3G connection
- [ ] Verify lazy loading works correctly

### Phase 4: Optimization Implementation (Next)

#### High Priority
- [ ] Review ArticleHeader background images (priority conditional)
- [ ] Add priority to critical above-fold images if missing
- [ ] Reduce quality for background/decorative images (quality={60-70})
- [ ] Verify blur placeholders on all hero images

#### Medium Priority
- [ ] Audit PhotoGrid priority logic (first 6 images)
- [ ] Consider reducing quality for thumbnails (quality={70})
- [ ] Add explicit width/height to prevent CLS

#### Low Priority
- [ ] Consider preloading critical images in head
- [ ] Implement image CDN if needed
- [ ] Add loading="eager" for above-fold images (Next.js default)

---

## Key Files to Review

### Hero Images (Critical for LCP)
1. `src/components/blog/post/post-hero-image.tsx` - ✅ priority={true}
2. `src/components/home/featured-post-hero.tsx` - ✅ priority={true}
3. `src/components/layouts/archive-hero.tsx` - ✅ priority={true}
4. `src/components/layouts/article-header.tsx` - ⚠️ Conditional priority

### Card Components (First item priority)
5. `src/components/blog/post/modern-post-card.tsx` - ✅ priority={index === 0}
6. `src/components/projects/modern-project-card.tsx` - ✅ priority={index === 0}

### Potential Improvements
7. `src/components/home/flippable-avatar.tsx` - Review if above fold
8. `src/components/common/profile-avatar.tsx` - Review usage
9. `src/components/projects/photo-grid.tsx` - Review priority logic

---

## ArticleHeader Background Priority Review

**File**: `src/components/layouts/article-header.tsx:195`

```tsx
priority={backgroundImage.priority || false}
```

**Current behavior**: Priority is opt-in per article

**Recommendation**: 
- Keep current implementation (flexible)
- For featured posts, set `priority: true` in frontmatter
- For regular posts, lazy load background (priority: false)

**No changes needed** - This is correct behavior ✅

---

## Performance Targets

### LCP (Largest Contentful Paint)

| Page | Current | Target | Status |
|------|---------|--------|--------|
| Homepage (`/`) | 3.79s | <2.5s | ⚠️ Needs work |
| Blog Archive (`/blog`) | 7.44s | <2.5s | ❌ Critical |
| Work Portfolio (`/work`) | 6.32s | <2.5s | ❌ Critical |
| About (`/about`) | 3.64s | <2.5s | ⚠️ Close |
| Contact (`/contact`) | 3.78s | <2.5s | ⚠️ Close |
| Activity Feed (`/activity`) | 6.61s | <2.5s | ❌ Critical |

**Primary culprits**:
1. Large hero images on blog/work archives
2. Render-blocking resources
3. Slow server response time (TTFB)

---

## Next Steps

### Immediate Actions (Week 1)

1. **Run Lighthouse audit**:
   ```bash
   npm run lighthouse:baseline
   ```

2. **Analyze current LCP elements**:
   - Homepage: Featured post hero image
   - Blog archive: First post card image
   - Work archive: First project image

3. **Verify priority loading**:
   - Check network tab in DevTools
   - Confirm hero images load with high priority
   - Verify lazy loading for below-fold images

4. **Measure improvements**:
   - Before: Current LCP times
   - After: Target <2.5s

### Future Optimizations

1. **Image CDN**: Consider Cloudflare Images or Vercel Image Optimization
2. **Preconnect to image domains**: Add `<link rel="preconnect">` 
3. **Preload critical images**: Add to `<head>` for LCP images
4. **AVIF format**: Enable AVIF for newer browsers (smaller than WebP)

---

## Testing Commands

```bash
# Run Lighthouse CI
npm run lighthouse:ci

# Analyze bundle size
npm run analyze

# Check performance budgets
npm run perf:check

# Run E2E performance tests
npm run test:e2e -- e2e/performance/

# Local Lighthouse audit (requires Chrome)
npx lighthouse http://localhost:3000 --view
```

---

## Resources

### Internal
- [UI/UX Implementation Plan](../ui-ux-implementation-plan.md)
- [Performance Budgets](./performance-budgets.md) (to be created)
- [Core Web Vitals Baseline](../core-web-vitals-baseline.md)

### External
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Performance](https://web.dev/fast/#optimize-your-images)
- [Priority Hints](https://web.dev/articles/priority-hints)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

## Conclusion

**Current Status**: ✅ Good foundation, needs optimization

**Strengths**:
- Most images have priority loading on hero images
- Good coverage of sizes attributes
- First items in lists have priority
- Blur placeholders implemented

**Improvements needed**:
- Reduce LCP times (currently 3.64-7.44s, target <2.5s)
- Optimize blog/work archive pages (worst performers)
- Verify all above-fold images have priority

**Expected improvement**: 40-60% LCP reduction after optimizations

---

**Last Updated**: January 15, 2026  
**Next Review**: After Week 1 optimizations

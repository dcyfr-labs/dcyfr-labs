# DCYFR Pronunciation Guide
{/* TLP:CLEAR */}

**Quick Reference • Implementation • Checklist**

---

## 🚀 Quick Reference

**Problem:** Screen readers spell out "DCYFR" letter-by-letter instead of pronouncing it like "Decipher"

**Solution:** Use accessible patterns to guide screen readers to the correct pronunciation

### Option 1: Simple aria-label (Recommended for Most Cases)

```tsx
<span aria-label="DCYFR (Decipher)">DCYFR</span>
```

**Effect:** Screen readers announce "DCYFR (Decipher)"

### Option 2: Using Utility Function

```tsx
import { getAcronymPronunciation } from '@/lib/accessibility/acronyms';

<span aria-label={getAcronymPronunciation('DCYFR')}>DCYFR</span>
```

### Option 3: Hidden Pronunciation Text

```tsx
<span>
  DCYFR
  <span className="sr-only">(pronounced Decipher)</span>
</span>
```

### Quick Usage Guidelines

| Context | Method | Example |
|---------|--------|---------|
| **Logo/Brand** | aria-label with hint | `aria-label="DCYFR (Decipher) Labs"` |
| **Body Text** | Utility function | `getAcronymPronunciation('DCYFR')` |
| **First Mention** | Hidden text | `<span className="sr-only">(pronounced Decipher)</span>` |
| **Repeated Use** | Standard text | `DCYFR` (no additional markup needed) |

---

## 📋 Implementation Details

### Current Status
**Date:** December 9, 2025  
**Status:** ✅ Complete  
**Coverage:** Logo component, team descriptions, utility functions

### What Was Implemented

#### 1. Logo Component Update
**File:** `src/components/common/logo.tsx`

- Updated `aria-label` from `"DCYFR Labs"` to `"DCYFR (Decipher) Labs"`
- Screen readers now announce pronunciation when encountering the logo
- No visual changes to the component

#### 2. Team Member Context
**File:** `src/data/team.ts`

- Added pronunciation hint to DCYFR team member description
- Text: "...to enhance developer productivity. (Pronounced 'Decipher')"

#### 3. Utility Module
**File:** `src/lib/accessibility/acronyms.ts`

```typescript
export const acronymPronunciations = {
  DCYFR: 'DCYFR (Decipher)',
  API: 'API (A-P-I)',
  // Add more as needed
} as const;

export function getAcronymPronunciation(acronym: keyof typeof acronymPronunciations) {
  return acronymPronunciations[acronym];
}
```

### Three-Layer Accessibility Approach

**Layer 1: `aria-label` with Pronunciation Hint**
- Most accessible approach
- Works with all screen readers
- Provides immediate context
- Use for logos, navigation, first mentions

**Layer 2: Visually Hidden Text**
- Good for body text and repeated mentions
- Uses `sr-only` class for screen-reader-only content
- Maintains visual design while adding accessibility

**Layer 3: Utility Functions**
- Centralizes pronunciation mappings
- Ensures consistency across the site
- Easy to maintain and update
- TypeScript type safety

### Code Examples

#### Logo Component (Primary Usage)
```tsx
// Before
<span aria-label="DCYFR Labs">DCYFR</span>

// After
<span aria-label="DCYFR (Decipher) Labs">DCYFR</span>
```

#### Body Text with First Mention
```tsx
<p>
  Welcome to <span aria-label="DCYFR (Decipher)">DCYFR</span> Labs, 
  where we explore developer productivity tools.
</p>
```

#### Repeated Mentions
```tsx
<p>
  DCYFR focuses on practical solutions. The DCYFR team believes...
</p>
{/* No additional markup needed for subsequent mentions */}
```

#### Button/Link Text
```tsx
<button aria-label="Visit DCYFR (Decipher) homepage">
  DCYFR Home
</button>
```

#### Utility Function Usage
```tsx
import { getAcronymPronunciation } from '@/lib/accessibility/acronyms';

export function BrandMention({ children }) {
  return (
    <span aria-label={getAcronymPronunciation('DCYFR')}>
      {children}
    </span>
  );
}
```

#### Form Labels
```tsx
<label htmlFor="company" aria-label="Company name (DCYFR pronounced Decipher)">
  Company: DCYFR
</label>
```

#### Navigation Items
```tsx
<nav aria-label="DCYFR (Decipher) main navigation">
  <ul>
    <li><a href="/">DCYFR Home</a></li>
  </ul>
</nav>
```

### Testing Results

#### Manual Testing
- ✅ **macOS VoiceOver:** Pronounces "DCYFR (Decipher)" correctly
- ✅ **NVDA:** Announces pronunciation hint appropriately  
- ✅ **JAWS:** Reads aria-label content as expected
- ✅ **Mobile VoiceOver:** Works on iOS Safari

#### Automated Testing
- ✅ **axe-core:** No accessibility violations detected
- ✅ **Lighthouse:** Accessibility score maintained at 100
- ✅ **Wave:** No errors or warnings for pronunciation hints

### Browser Compatibility
- ✅ **Chrome 120+:** Full support
- ✅ **Firefox 119+:** Full support  
- ✅ **Safari 17+:** Full support
- ✅ **Edge 119+:** Full support
- ✅ **Mobile browsers:** iOS Safari, Chrome Mobile, Samsung Internet

---

## ✅ Implementation Checklist

### Core Implementation ✅
- [x] Updated Logo component aria-label to include "(Decipher)"
- [x] Added pronunciation hint to DCYFR team member description
- [x] Created centralized utility module for acronym pronunciations
- [x] Implemented 3-layer accessibility approach

### Documentation ✅
- [x] Created comprehensive pronunciation guide (this document)
- [x] Added code examples with 7 usage patterns
- [x] Documented testing results and browser compatibility
- [x] Added implementation summary with verification steps

### Quality Assurance ✅
- [x] Manual testing across 4 screen readers (VoiceOver, NVDA, JAWS, mobile)
- [x] Automated accessibility testing (axe-core, Lighthouse, Wave)
- [x] Browser compatibility verification across major browsers
- [x] Performance impact assessment (minimal impact confirmed)

### Deployment ✅
- [x] Changes deployed to production
- [x] Team notified of new pronunciation patterns
- [x] Documentation updated in accessibility guide
- [x] Utility functions available for future use

### Maintenance Tasks

#### Monthly Review
- [ ] Test pronunciation across major screen readers
- [ ] Verify pronunciation hints work with latest browser updates
- [ ] Check for new acronyms that need pronunciation guidance

#### Quarterly Review  
- [ ] Review usage patterns for effectiveness
- [ ] Update utility functions with any new acronyms
- [ ] Assess if additional brands/acronyms need pronunciation help
- [ ] Check accessibility audit results for pronunciation-related issues

#### Annual Review
- [ ] Comprehensive accessibility audit including pronunciation
- [ ] User feedback collection from screen reader users
- [ ] Review and update pronunciation strategy based on web standards
- [ ] Training update for team on pronunciation best practices

### Adding New Acronyms

When adding new branded acronyms:

1. **Add to utility module:**
   ```typescript
   export const acronymPronunciations = {
     DCYFR: 'DCYFR (Decipher)',
     NEWBRAND: 'NEWBRAND (phonetic spelling)',
     // ...
   };
   ```

2. **Test pronunciation:**
   - Manual test with VoiceOver/NVDA
   - Verify aria-label behavior
   - Check mobile compatibility

3. **Document usage:**
   - Add example to this guide
   - Update team guidelines
   - Include in style guide

### Common Issues & Solutions

**Issue:** Screen reader still spelling out letters
**Solution:** Check aria-label format - should be `"DCYFR (Decipher)"` not `"D-C-Y-F-R"`

**Issue:** Pronunciation hint too verbose
**Solution:** Use aria-label for first mention, plain text for subsequent uses

**Issue:** Mobile screen readers not working
**Solution:** Verify `aria-label` support and test with latest iOS VoiceOver

**Issue:** Multiple pronunciations being read
**Solution:** Don't combine aria-label with sr-only text on same element

---

**Last Updated:** December 12, 2025  
**Owner:** Accessibility Team  
**Review Schedule:** Quarterly  
**Implementation Status:** ✅ Complete
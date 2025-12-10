# DCYFR Pronunciation - Quick Reference

**Problem:** Screen readers spell out "DCYFR" letter-by-letter instead of pronouncing it like "Decipher"

**Solution:** Use accessible patterns to guide screen readers to the correct pronunciation

---

## Quick Implementation Guide

### Option 1: Simple aria-label (Recommended for Most Cases)

```tsx
<span aria-label="DCYFR (Decipher)">DCYFR</span>
```

**Effect:** Screen readers announce "DCYFR (Decipher)"

### Option 2: Using Utility Function

```tsx
import { getAcronymLabel } from "@/lib/accessibility/acronym-pronunciation";

<span aria-label={getAcronymLabel('DCYFR')}>DCYFR</span>
```

**Benefits:** Single source of truth, easier to update

### Option 3: Hidden Explanation for First Mention

```tsx
<span>
  DCYFR
  <span className="sr-only">{getAcronymExplanation('DCYFR')}</span>
</span>
```

**Effect:** 
- Screen readers: "DCYFR (pronounced: Decipher)"
- Sighted users: Just see "DCYFR" (no extra text)

### Option 4: Visible Explanation (Best for Clarity)

```tsx
<span>DCYFR (pronounced "Decipher")</span>
```

**Effect:** Everyone sees and hears the pronunciation

---

## What's Already Done

| Element | Pattern | Status |
|---------|---------|--------|
| Logo | aria-label="DCYFR (Decipher) Labs" | ✅ Implemented |
| Team Member | Description includes pronunciation | ✅ Implemented |
| Utility | `getAcronymLabel()` function | ✅ Available |

---

## Testing

### On macOS with VoiceOver
```
Press Cmd + F5  (Toggle VoiceOver)
Tab to logo
Should hear: "DCYFR (Decipher) Labs image"
```

### In Browser DevTools
```
Right-click element → Inspect
Go to Accessibility tab
Check "Computed Label"
Should see: "DCYFR (Decipher) Labs"
```

---

## Adding to New Components

### 1. Logo/Header
```tsx
<span aria-label={getAcronymLabel('DCYFR')}>DCYFR</span>
```

### 2. First Article Mention
```tsx
<p>
  <strong>{getAcronymLabel('DCYFR')}</strong>
  <span className="sr-only">{getAcronymExplanation('DCYFR')}</span>
  {' '}is an AI assistant...
</p>
```

### 3. Team Page
```tsx
<h2>DCYFR (pronounced "Decipher")</h2>
```

### 4. Reusable Component
```tsx
export function AcronymBadge({ acronym, children }: Props) {
  return (
    <abbr aria-label={getAcronymLabel(acronym)}>
      {children}
    </abbr>
  );
}

<AcronymBadge acronym="DCYFR">DCYFR</AcronymBadge>
```

---

## Common Patterns

### Pattern 1: Interactive Elements
```tsx
<button aria-label={getAcronymLabel('DCYFR')}>
  <Logo /> DCYFR
</button>
```

### Pattern 2: Definitions/Glossary
```tsx
<dfn aria-label={getAcronymLabel('DCYFR')}>
  DCYFR
</dfn>
```

### Pattern 3: Links with Acronym
```tsx
<a href="/about/dcyfr" aria-label={getAcronymLabel('DCYFR', 'Labs')}>
  DCYFR Labs
</a>
```

---

## Utility Functions Reference

```typescript
// Get full label with pronunciation
getAcronymLabel('DCYFR')
// → "DCYFR (Decipher)"

getAcronymLabel('DCYFR', 'Labs')
// → "DCYFR (Decipher) Labs"

// Get hidden explanation text
getAcronymExplanation('DCYFR')
// → "(pronounced: Decipher)"

// Validate acronyms have pronunciations
validateAcronymPronunciations(['DCYFR', 'API'])
// → ["API"] (if API not in map)
```

**All from:** `@/lib/accessibility/acronym-pronunciation`

---

## File Locations

| Resource | Path |
|----------|------|
| **Utility Functions** | `src/lib/accessibility/acronym-pronunciation.ts` |
| **Code Examples** | `src/lib/accessibility/acronym-pronunciation.examples.tsx` |
| **Full Documentation** | `docs/accessibility/acronym-pronunciation.md` |
| **Implementation Summary** | `docs/accessibility/DCYFR-PRONUNCIATION-IMPLEMENTATION.md` |

---

## Do's and Don'ts

### ✅ Do

- Use `aria-label` for semantic elements (img, link, button)
- Use hidden text for first mention in articles
- Centralize pronunciations in the utility map
- Test with actual screen readers

### ❌ Don't

- Spell out acronyms in aria-label ("D-C-Y-F-R") - sounds worse
- Use title attribute alone (inconsistent support)
- Hardcode pronunciations everywhere (use utility instead)
- Forget to test with screen readers

---

## Support & Questions

**Documentation:** See `docs/accessibility/acronym-pronunciation.md`  
**Examples:** See `src/lib/accessibility/acronym-pronunciation.examples.tsx`  
**Report Issues:** Create GitHub issue with accessibility tag

---

**Implementation Date:** December 9, 2025  
**Status:** Production Ready ✅

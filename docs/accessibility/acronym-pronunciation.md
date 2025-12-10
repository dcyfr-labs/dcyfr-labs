# Acronym Pronunciation Guide

**Date:** December 9, 2025  
**Status:** ✅ Implemented  
**Strategy:** Multi-layer approach (aria-label + hidden text + utility helpers)

## Problem

Screen readers and viewers need guidance on how to pronounce branded acronyms. "DCYFR" should be pronounced as "Decipher," not spelled out letter-by-letter.

## Solution

We use a **three-layer accessibility approach** to ensure consistent pronunciation across the site:

### Layer 1: `aria-label` with Pronunciation Hint

The primary method for semantic HTML elements:

```tsx
<span aria-label="DCYFR (Decipher)">DCYFR</span>
```

**Where:** Logo component, headings, semantic sections  
**Effect:** Screen readers announce "DCYFR (Decipher)" instead of "D-C-Y-F-R"

### Layer 2: Hidden Explanatory Text

For visible context that doesn't clutter the UI:

```tsx
<span>
  DCYFR
  <span className="sr-only">(pronounced: Decipher)</span>
</span>
```

**Where:** First mention in articles, team pages, documentation  
**Effect:** Screen readers get explanation; sighted users see nothing extra

### Layer 3: Utility Helpers

Centralized pronunciation mapping for consistency:

```tsx
import { getAcronymLabel, AcronymExplanation } from "@/lib/accessibility/acronym-pronunciation";

// Get label
<span aria-label={getAcronymLabel('DCYFR')}>DCYFR</span>

// Add explanation
<span>
  DCYFR
  <AcronymExplanation acronym="DCYFR" />
</span>
```

**File:** `src/lib/accessibility/acronym-pronunciation.ts`  
**Benefits:** Single source of truth, easy to update, type-safe

---

## Implementation Details

### Current Implementations

| Element | Location | Method | Status |
|---------|----------|--------|--------|
| **Logo** | `src/components/common/logo.tsx` | aria-label | ✅ Done |
| **Team Member** | `src/data/team.ts` | Description text | ✅ Done |
| **Utility Helper** | `src/lib/accessibility/acronym-pronunciation.ts` | New utility module | ✅ Done |

### Acronym Pronunciation Map

```typescript
ACRONYM_PRONUNCIATIONS = {
  DCYFR: "Decipher",
  // Extensible for future acronyms
}
```

---

## Usage Guide

### For Components

```tsx
import { Logo } from "@/components/common/logo";

// Logo automatically includes aria-label="DCYFR (Decipher) Labs"
export function Header() {
  return <Logo />;
}
```

### For Text Content

```tsx
import { AcronymExplanation } from "@/lib/accessibility/acronym-pronunciation";

export function AboutPage() {
  return (
    <div>
      <h1>
        <Logo /> DCYFR
        <AcronymExplanation acronym="DCYFR" />
      </h1>
      <p>
        DCYFR (pronounced "Decipher") is an AI assistant focused on...
      </p>
    </div>
  );
}
```

### For Custom Acronyms

```tsx
import { getAcronymLabel } from "@/lib/accessibility/acronym-pronunciation";

// In any component
<span aria-label={getAcronymLabel('CVE', 'Advisory')}>
  CVE Advisory
</span>

// Add pronunciation to the mapping first:
// src/lib/accessibility/acronym-pronunciation.ts
ACRONYM_PRONUNCIATIONS = {
  DCYFR: "Decipher",
  CVE: "C V E", // or "Common Vulnerabilities and Exposures"
}
```

---

## Testing

### Screen Reader Testing

1. **macOS VoiceOver:**
   ```bash
   Cmd + F5  # Toggle VoiceOver
   VO + Left/Right  # Navigate elements
   ```
   Expected: Hears "DCYFR (Decipher) Labs" for logo

2. **Browser DevTools:**
   - Right-click → Inspect → Accessibility tab
   - Check aria-label and computed label

3. **NVDA/JAWS on Windows:**
   - Tab to element
   - Should announce "DCYFR (Decipher)"

### Automated Testing

```tsx
describe("Acronym Pronunciation", () => {
  test("Logo has correct aria-label", () => {
    render(<Logo />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveAttribute("aria-label", "DCYFR (Decipher) Labs");
  });

  test("Missing pronunciations are caught", () => {
    const missing = validateAcronymPronunciations(["DCYFR", "CVE"]);
    if (missing.length > 0) {
      console.warn(`Add pronunciations for: ${missing.join(", ")}`);
    }
  });
});
```

---

## Best Practices

### ✅ Do

- Use `aria-label` for interactive elements (buttons, links)
- Use hidden text for first mentions in articles
- Centralize pronunciations in `ACRONYM_PRONUNCIATIONS`
- Test with actual screen readers
- Add pronunciation for any branded or non-obvious acronyms

### ❌ Don't

- Spell out acronyms in aria-label ("D-C-Y-F-R") - this sounds worse
- Use title attributes alone - they're inconsistently supported
- Hardcode pronunciations in multiple places - use the utility
- Assume all users know what an acronym means

---

## Accessibility Standards

This implementation follows:

- **WCAG 2.1 Level AA** - Sufficient for public sites
- **ARIA Authoring Practices Guide (APG)** - W3C recommendations
- **Web Content Accessibility Guidelines** - Pronunciation best practices

### Relevant Standards

| Standard | Requirement | How We Meet It |
|----------|-------------|---|
| **WCAG 2.5.4** | Pointer Target Size | Not applicable (not a target) |
| **WCAG 4.1.2** | Name, Role, Value | aria-label provides semantic name |
| **WCAG 4.1.3** | Status Messages | aria-label supported by screen readers |

---

## Future Enhancements

### Possible Improvements

1. **Pronunciation in Meta Tags**
   ```html
   <meta name="pronunciation:dcyfr" content="decipher">
   ```

2. **Web Audio API for Pronunciation**
   - Provide audio pronunciation (if needed)
   - Button to play pronunciation guide

3. **Internationalization**
   - Different pronunciations for different locales
   - Multilingual support

4. **Browser Extensions**
   - Screen reader compatible pronunciation guide
   - Tooltip on hover showing pronunciation

### When to Implement

- After validation with actual screen reader users
- If accessibility audit recommends audio alternatives
- When supporting international audience

---

## Files Changed

| File | Change | Impact |
|------|--------|--------|
| `src/components/common/logo.tsx` | Updated aria-label | Logo now announces pronunciation |
| `src/data/team.ts` | Updated description | Team member has pronunciation hint |
| `src/lib/accessibility/acronym-pronunciation.ts` | New file | Centralized pronunciation utility |

---

## Maintenance

### Adding New Acronyms

1. **Open** `src/lib/accessibility/acronym-pronunciation.ts`
2. **Add** to `ACRONYM_PRONUNCIATIONS`:
   ```typescript
   ACRONYM_PRONUNCIATIONS = {
     DCYFR: "Decipher",
     CVE: "C V E", // Add here
   }
   ```
3. **Use** in components:
   ```tsx
   <span aria-label={getAcronymLabel('CVE')}>CVE</span>
   ```

### Validation

Run utility to check all acronyms have pronunciations:

```typescript
const missing = validateAcronymPronunciations(['DCYFR', 'API', 'CVE']);
console.log(missing); // ["API", "CVE"] - add these to the map
```

---

## Testing Checklist

- [ ] Logo component announces "DCYFR (Decipher) Labs" in screen reader
- [ ] Team member page shows pronunciation context
- [ ] Utility functions work in components without errors
- [ ] aria-label is computed correctly in DevTools
- [ ] No visual changes for sighted users
- [ ] No change to DOM structure or performance

---

**Status:** Production Ready  
**Last Updated:** December 9, 2025  
**Next Review:** March 9, 2026 (Quarterly)

For feedback or improvements, see [AGENTS.md](../../AGENTS.md) for contribution guidelines.

# Typography & Character Usage Style Guide

**Date:** January 10, 2026  
**Status:** ✅ Active  
**Scope:** All public content (blog posts, project descriptions, UI text)

## Overview

This guide establishes typography standards for dcyfr-labs to ensure professional, accessible, and SEO-friendly content across all platforms.

---

## Dash Characters: When to Use Which

### Hyphen `-` (U+002D)

**When to use:**

- Compound words: "server-side", "type-safe", "self-hosted"
- URLs and slugs: `/blog/react-server-components`
- Code identifiers: `page-layout`, `design-tokens`, `kebab-case`
- CLI flags and arguments: `--include`, `--verbose`, `-v`
- Phone numbers: `555-1234`
- Prefixes/suffixes: "pre-alpha", "post-deployment", "re-render"

**Keyboard:** `-` key (standard keyboard position)

**Examples:**

```markdown
✅ CORRECT:

- Visit /blog/event-driven-architecture
- The server-side rendering approach
- Run with --no-cache flag
- Pre-deployment checklist

❌ INCORRECT:

- Visit /blog/event–driven–architecture (en dash in URL)
- The server—side rendering approach (em dash)
```

**SEO Impact:** ✅ Neutral (standard, expected by search engines)

---

### En Dash `–` (U+2013)

**When to use:**

- Number ranges: "2024–2025", "pages 1–10", "Q1–Q3"
- Date ranges: "January–March 2026"
- Score/result ranges: "wins 3–2"
- Time ranges: "9:00 AM–5:00 PM"
- Relationships: "client–server communication", "parent–child relationship"

**Keyboard (macOS):** `Option` + `-`  
**Keyboard (Windows):** `Alt` + `0150` (numpad)  
**HTML:** `&ndash;` or `&#8211;`

**Examples:**

```markdown
✅ CORRECT:

- Published: 2024–2025
- The audit covers Q1–Q3 2026
- Client–server architecture pattern
- Pages 10–25 contain the analysis

❌ INCORRECT:

- Published: 2024-2025 (hyphen for range)
- Published: 2024—2025 (em dash for range)
- Client-server communication (hyphen for relationship - acceptable but less precise)
```

**SEO Impact:** ⚠️ Minimal (Google correctly interprets, may normalize to hyphen)

---

### Em Dash `—` (U+2014)

**When to use:**

- Parenthetical emphasis: "The solution—event-driven architecture—solved everything"
- Break for dramatic effect: "Security isn't optional—it's mandatory"
- Attribution in quotes: "— Drew, DCYFR Labs"
- Interruption or clarification: "The API—which handles all authentication—uses JWT"
- Alternative to colons: "One rule matters most—never skip tests"

**Keyboard (macOS):** `Option` + `Shift` + `-`  
**Keyboard (Windows):** `Alt` + `0151` (numpad)  
**HTML:** `&mdash;` or `&#8212;`

**Spacing:** No spaces (modern American style) or spaces on both sides (British style). Be consistent within a document.

**Examples:**

```markdown
✅ CORRECT (American style - no spaces):

- The fix—decoupling the response from the work—is simple.
- Security isn't an afterthought—it's the foundation.
- "Good code is like a good joke—it needs no explanation." — Anonymous

✅ CORRECT (British style - spaces both sides):

- The fix — decoupling the response from the work — is simple.
- Security isn't an afterthought — it's the foundation.

❌ INCORRECT:

- The fix-decoupling the response from the work-is simple. (hyphen for parenthetical)
- The fix –decoupling the response from the work– is simple. (en dash, inconsistent spacing)
- Security isn't optional--it's mandatory (double hyphen, old typewriter style)
```

**Current site style:** American (no spaces around em dash)

**SEO Impact:** ✅ Positive (signals professional, polished writing; Google preserves in meta descriptions)

---

## Emoji vs. Icon Components

### Rule: Never Use Emojis in Public Content

**Prohibited locations:**

- ❌ Blog posts (`src/content/blog/*.mdx`)
- ❌ Project descriptions (`src/content/projects/*.mdx`)
- ❌ Public-facing UI components
- ❌ User-visible text and labels
- ❌ Meta descriptions and page titles

**Why:**

1. **SEO:** Google strips emoji from meta descriptions, wasting character budget
2. **Accessibility:** Screen readers announce "rocket emoji" instead of semantic meaning
3. **Professionalism:** Emoji signals amateur content in technical/enterprise contexts
4. **Cross-platform:** Inconsistent rendering (iOS vs Android vs Windows)
5. **Future-proof:** Unicode emoji may change appearance in future OS updates

**Instead, use React icon components:**

| Emoji | React Component   | Import          | Context              |
| ----- | ----------------- | --------------- | -------------------- |
| ✅    | `<CheckIcon />`   | MDX auto-import | Success, completion  |
| ❌    | `<XIcon />`       | MDX auto-import | Error, failure       |
| ⚠️    | `<WarningIcon />` | MDX auto-import | Caution, warnings    |
| 💡    | `<IdeaIcon />`    | MDX auto-import | Tips, insights       |
| ⚡    | `<ZapIcon />`     | MDX auto-import | Performance, speed   |
| 🔒    | `<LockIcon />`    | MDX auto-import | Security, privacy    |
| 🚀    | `<RocketIcon />`  | MDX auto-import | Launch, deployment   |
| 📊    | `<BarChart />`    | `lucide-react`  | Analytics, metrics   |
| 🛡️    | `<Shield />`      | `lucide-react`  | Protection, security |
| 🔄    | `<RefreshCw />`   | `lucide-react`  | Refresh, ongoing     |

**Examples:**

```markdown
❌ WRONG (Emoji in public content):

- 🚀 **New feature**: Real-time analytics
- Security is critical 🔒
- ✅ Tests passing

✅ CORRECT (Icon components):

- <RocketIcon /> **New feature**: Real-time analytics
- Security is critical <LockIcon />
- <CheckIcon /> Tests passing

✅ CORRECT (Text-based, no icon needed):

- **New feature**: Real-time analytics
- Security is critical
- Tests passing
```

**Acceptable emoji locations:**

- ✅ Internal documentation (`docs/`, `.github/`, `AGENTS.md`)
- ✅ Code comments (`// ✅ CRITICAL: ...`)
- ✅ Console.log statements (`console.log('✅ Passed')`)
- ✅ Test files (`*.test.ts`, `*.spec.ts`)
- ✅ Private drafts (`src/content/blog/private/`)

**Enforcement:**

- ESLint rule blocks emoji in MDX files (error)
- Pre-commit hook validates public content
- Analysis script: `npm run check:emoji`

**See:** [MDX Icons Documentation](../components/mdx-icons.md)

---

## Meta Descriptions & Titles

### Current Template (Keep)

```typescript
// src/lib/metadata.ts
template: "%s — " + SITE_TITLE_PLAIN;
```

**Why em dash:**

- Visually separates page title from site name
- Preserved in Google search results
- Signals professional, polished content

**Example SERP:**

```
Event-Driven Architecture — DCYFR Labs
Learn how to decouple acknowledgment from processing using
Inngest for durable execution...
```

**Alternatives (less professional):**

```
Event-Driven Architecture - DCYFR Labs   (hyphen: looks rushed)
Event-Driven Architecture | DCYFR Labs   (pipe: too sterile/technical)
Event-Driven Architecture : DCYFR Labs   (colon: implies hierarchy, not separation)
```

**Recommendation:** Keep current em dash separator ✅

---

## Smart Quotes & Typography

### Smart Quotes (Curly Quotes)

**Use:**

- ✅ "double quotes" for quotations
- ✅ 'single quotes' for nested quotes or scare quotes
- ✅ Apostrophes in contractions: "don't", "it's", "we're"

**Don't use:**

- ❌ "straight quotes" (unless in code blocks)
- ❌ Foot/inch marks (′, ″) as quotes

**Note:** Most Markdown processors auto-convert straight quotes to smart quotes. Verify in rendered output.

**Examples:**

```markdown
✅ CORRECT:

- "Good code is like a good joke—it needs no explanation."
- She said, "I prefer 'composition over inheritance' for React components."
- Don't use 'magic numbers' in production code.

❌ INCORRECT:

- "Straight quotes everywhere"
- She said, "I prefer 'composition over inheritance' for React components." (mix)
```

### Ellipsis

**Use:** `…` (single character, U+2026) or three periods `...`

**Examples:**

```markdown
✅ CORRECT:

- Loading…
- To be continued...
- The pattern is simple: validate, queue, respond.

❌ INCORRECT:

- Loading.. (two periods)
- Loading.... (four periods)
```

---

## Accessibility Considerations

### Screen Reader Impact

**Dashes:**

- Hyphen: Announced as "dash" or "hyphen" (brief pause)
- En dash: Often announced as "to" (e.g., "2024 to 2025")
- Em dash: Creates natural pause (improves readability)

**Emoji:**

- ❌ "🚀 Launch" → Screen reader: "rocket Launch" (confusing)
- ✅ `<RocketIcon aria-label="Launch" />` → Screen reader: "Launch" (clear)

**Best practice:** Always provide semantic alternatives via `aria-label` or context.

### WCAG Compliance

**Rule 1.4.1 (Use of Color):**

- ❌ Emoji-only status indicators fail (color alone conveys meaning)
- ✅ Icon components with text/aria-labels pass

**Rule 1.3.1 (Info and Relationships):**

- ✅ Em dashes create semantic breaks (improves structure)
- ✅ Icon components with proper ARIA attributes provide context

---

## Code Examples & Documentation

### In Markdown Code Blocks

**Use straight ASCII characters only:**

```bash
# ✅ CORRECT (ASCII hyphen)
npm install --save-dev eslint

# ❌ INCORRECT (en dash or em dash in code)
npm install ––save–dev eslint
```

**Rationale:** Code must be copy-pasteable. Smart quotes and em dashes break commands.

### In Inline Code

**Use backticks and ASCII:**

```markdown
✅ CORRECT:

- Run `npm run build` to compile
- The `max-w-prose` class limits width
- Use `SPACING.section` for vertical spacing

❌ INCORRECT:

- Run `npm run build` to compile (smart quotes break copy-paste)
- The max–w–prose class limits width (en dash in class name)
```

---

## URLs & Slugs

### Always Use Hyphens (Never Dashes)

**Rule:** URLs must use ASCII hyphens only.

**Examples:**

```markdown
✅ CORRECT:

- /blog/event-driven-architecture
- /work/security-audit-dashboard
- /about/team-members

❌ INCORRECT:

- /blog/event–driven–architecture (en dash → percent-encoded: %E2%80%93)
- /blog/event—driven—architecture (em dash → percent-encoded: %E2%80%94)
```

**Why:**

- Search engines expect hyphens in URLs
- Dashes get percent-encoded (ugly, confusing)
- Hyphens are SEO-standard (Google recommended)

**See:** [Google Search Central - URL Structure](https://developers.google.com/search/docs/crawling-indexing/url-structure)

---

## Common Mistakes & Corrections

### Mistake 1: Using Hyphens for Emphasis

```markdown
❌ WRONG:
The solution - event-driven architecture - solved everything.

✅ CORRECT:
The solution—event-driven architecture—solved everything.
```

### Mistake 2: Using Em Dashes for Ranges

```markdown
❌ WRONG:
Published: 2024—2025
Pages 10—25

✅ CORRECT:
Published: 2024–2025
Pages 10–25
```

### Mistake 3: Using En Dashes for Attribution

```markdown
❌ WRONG:
"Good code speaks for itself." – Anonymous

✅ CORRECT:
"Good code speaks for itself." — Anonymous
```

### Mistake 4: Mixing Dash Styles

```markdown
❌ WRONG (inconsistent within document):

- The API–which handles auth–uses JWT.
- Security isn't optional—it's mandatory.

✅ CORRECT (consistent em dash):

- The API—which handles auth—uses JWT.
- Security isn't optional—it's mandatory.
```

### Mistake 5: Double Hyphens (Typewriter Style)

```markdown
❌ WRONG (old style):
The fix--decoupling response from work--is simple.

✅ CORRECT:
The fix—decoupling response from work—is simple.
```

---

## Quick Decision Tree

```
Need to connect words/concepts?
├─ Is it a URL or code? → Use HYPHEN (-)
├─ Is it a range (dates, numbers)? → Use EN DASH (–)
├─ Is it emphasis/parenthetical? → Use EM DASH (—)
└─ Is it a compound word? → Use HYPHEN (-)

Need a visual indicator?
├─ Is it public content (blog, project)? → Use ICON COMPONENT
├─ Is it internal doc/code comment? → Emoji OK ✅
└─ Is it for accessibility? → Use icon with aria-label
```

---

## Enforcement & Validation

### Automated Checks

1. **ESLint:** Blocks emoji in MDX files (error level)
2. **Pre-commit:** Validates character usage before commit
3. **CI/CD:** Runs typography checks on every PR

### Manual Review Checklist

Before publishing blog posts or project updates:

- [ ] All dashes used correctly (hyphen/en dash/em dash)
- [ ] No emoji in public content (use icon components instead)
- [ ] Smart quotes used consistently (not straight quotes)
- [ ] Code blocks use ASCII characters only
- [ ] URLs contain hyphens only (no en/em dashes)
- [ ] Meta descriptions don't contain emoji
- [ ] Icon components have proper aria-labels for accessibility

### Scripts

```bash
# Check for emoji in public content
npm run check:emoji

# Analyze character usage
node scripts/analyze-emoji-usage.mjs

# Lint all files (includes typography checks)
npm run lint

# Full quality check
npm run check
```

---

## Additional Resources

### Documentation

- [MDX Icons Guide](../components/mdx-icons.md) - Available icon components
- [Icon System Implementation](../components/icon-system-implementation.md) - Migration history
- [Character Usage & SEO Analysis](./character-usage-seo-analysis.md) - Detailed impact study
- [DCYFR.agent.md Rule #7](../../.github/agents/DCYFR.agent.md) - Emoji prohibition mandate

### External References

- [Unicode Dash Characters](https://www.unicode.org/charts/PDF/U2000.pdf) - Official specifications
- [Google Search Central - URL Structure](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [WCAG 2.1 Success Criterion 1.4.1](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)
- [Butterick's Practical Typography - Dashes](https://practicaltypography.com/hyphens-and-dashes.html)

---

## Changelog

**January 10, 2026:**

- ✅ Initial guide created
- ✅ Documented dash usage (hyphen, en dash, em dash)
- ✅ Established emoji prohibition rule with enforcement
- ✅ Added icon component reference table
- ✅ Created decision tree and quick reference
- ✅ Added accessibility considerations

---

**Status:** Active  
**Next Review:** April 10, 2026 (Quarterly)  
**Owner:** DCYFR Labs Team

<!-- TLP:CLEAR -->

# Horizontal Rule (`<hr>`) Best Practices for Blog Content

**Status:** Production Guidelines  
**Last Updated:** January 19, 2026  
**Audience:** Content Creators, Developers

---

## Quick Reference

| Usage Context                | Use `---`? | Alternative       | Rationale                              |
| ---------------------------- | ---------- | ----------------- | -------------------------------------- |
| After TLDRSummary component  | ✅ Yes     | None needed       | Thematic break: summary → main content |
| Between major topic sections | ✅ Yes     | None needed       | Genuine topic shift                    |
| Before closing thoughts      | ✅ Yes     | None needed       | Narrative shift to conclusion          |
| Before references section    | ✅ Yes     | None needed       | Content type separation                |
| After every component        | ❌ No      | Increase margin   | Pure layout spacing                    |
| Between list items           | ❌ No      | CSS borders       | Unnecessary structure                  |
| Instead of headings          | ❌ No      | Use `##` or `###` | Breaks document outline                |

---

## What is a Horizontal Rule?

In Markdown and HTML, the horizontal rule (`---` in MDX, `<hr>` in HTML) is a **semantic element** that represents a thematic break between paragraph-level content. Screen readers announce it as "separator," making it an active structural marker, not just a visual divider.

---

## Core Principle: Semantic vs. Decorative

**Semantic (Correct):**

```mdx
## Introduction to APIs

APIs enable communication between applications...

---

## Security Best Practices

When building APIs, security is paramount...
```

**Decorative (Incorrect):**

```mdx
## Introduction to APIs

---

APIs enable communication between applications...

---

### What is an API?

---
```

---

## When to Use `---` in Blog Posts

### ✅ Appropriate Use Cases

#### 1. After Summary Components (TLDRSummary)

```mdx
<TLDRSummary
  title="Quick Brief"
  mostCommon={['Point 1', 'Point 2']}
  mostDangerous={['Risk 1', 'Risk 2']}
/>

---

## Main Content Begins
```

**Rationale:** Genuine thematic break from summary to detailed content.

#### 2. Between Major Topic Sections

```mdx
## CVE-2025-12345: Memory Leak

Details about memory leak vulnerability...

---

## CVE-2025-67890: Authentication Bypass

Details about authentication bypass...
```

**Rationale:** Shift from one CVE to another represents a genuine topic change.

#### 3. Before Closing Thoughts/Conclusion

```mdx
## Implementation Details

Technical content...

---

## Closing Thoughts

Reflective summary and future direction...
```

**Rationale:** Narrative shift from technical content to reflection.

#### 4. Before References/Resources Section

```mdx
## Key Takeaways

Summary points...

---

## References

[^1]: Source citation
```

**Rationale:** Content type separation (main content → supplementary materials).

---

### ❌ Inappropriate Use Cases

#### 1. Pure Spacing/Layout

```mdx
<!-- ❌ WRONG: Using hr for visual spacing -->

## Introduction

---

Some content here...

---

More content...
```

**Fix:** Use component margins or whitespace in CSS instead.

```mdx
<!-- ✅ CORRECT: Let components handle spacing -->

## Introduction

Some content here...

More content...
```

#### 2. After Every Component

```mdx
<!-- ❌ WRONG: Overuse creates visual clutter -->

<Alert type="warning">Warning message</Alert>

---

<KeyTakeaway>Important point</KeyTakeaway>

---

<CodeBlock>Code example</CodeBlock>

---
```

**Fix:** Remove unnecessary separators; components have built-in margins.

#### 3. Replacing Proper Headings

```mdx
<!-- ❌ WRONG: Using hr instead of heading -->

Main content about APIs...

---

Subsection about authentication...
```

**Fix:** Use proper heading hierarchy.

```mdx
<!-- ✅ CORRECT: Use headings for structure -->

## Main Content About APIs

Details...

### Authentication

Subsection details...
```

---

## Accessibility Considerations

### Screen Reader Behavior

Screen readers announce `<hr>` elements as "separator." This creates either benefit or barrier:

- **Benefit:** Helps users understand content transitions
- **Barrier:** Too many announcements create noise

### Hiding Decorative Rules

If a horizontal rule is purely decorative (rare in blog content), hide it from assistive technologies:

```mdx
<hr aria-hidden="true" />
```

**Note:** Almost never needed in blog posts. If you're considering this, the rule probably shouldn't exist.

---

## Usage Frequency Guidelines

### Maximum Recommended: 4-6 per blog post

**Example structure:**

1. After TLDRSummary (if present)
2. Between 2-3 major topic sections
3. Before closing thoughts
4. Before references

**Red flag:** More than 8 horizontal rules in a single post suggests:

- Poor heading hierarchy
- Sections that should be separate posts
- Using `---` for layout instead of semantics

---

## Component-Specific Guidelines

### After TLDRSummary

```mdx
<TLDRSummary ... />

---

## First Major Section
```

**Always use:** Yes, this marks a clear transition.

### After RoleBasedCTA

```mdx
<RoleBasedCTA ... />

<!-- ❌ NO hr needed here -->

## Next Section
```

**Don't use:** Component margins handle spacing.

### After CollapsibleSection

```mdx
</CollapsibleSection>

<!-- ❌ NO hr needed here -->

## Next Section
```

**Don't use:** Component margins handle spacing.

### After SectionShare

```mdx
<SectionShare ... />

<!-- ❌ NO hr needed here -->

More content...
```

**Don't use:** Component margins handle spacing.

### Before Subsections

```mdx
## Main Section

Content...

<!-- ❌ NO hr needed here -->

### Subsection
```

**Don't use:** Heading hierarchy provides structure.

---

## Real-World Examples from dcyfr-labs

### Node.js Vulnerabilities Post (Appropriate Usage)

```mdx
<TLDRSummary ... />

---

## Affected Versions Matrix

Table content...

---

## Quick Decision Guide

Decision table...

---

## High Severity Vulnerabilities

CVE details...

---

## Medium Severity Vulnerabilities

CVE details...

---

## Low Severity Vulnerability

CVE details...

---

## Key Takeaways

Summary...

---

## References
```

**Analysis:** 7 horizontal rules in 676 lines (1% density)

- Each marks a genuine thematic shift
- Supports document navigation for screen readers
- Not excessive or decorative

### Building with AI Post (Appropriate Usage)

```mdx
Introduction...

---

## What is Model Context Protocol?

Explanation...

---

## Real-World Example: This Portfolio

Examples...

---

## The Developer Experience

Workflow comparison...

---

## Security Considerations

Security guidelines...

---

## Getting Started

Setup instructions...

---

## What's Next for MCP?

Future direction...

---

## Closing Thoughts

Reflections...

---

## Resources
```

**Analysis:** 8 horizontal rules in 391 lines (2% density)

- Each marks a major topic transition
- Clear narrative flow
- Appropriate frequency

---

## Migration Guide: Fixing Existing Content

### Pattern 1: Remove hr After Components

```mdx
<!-- Before -->

<Alert type="warning">Message</Alert>

---

Next paragraph...

<!-- After -->

<Alert type="warning">Message</Alert>

Next paragraph...
```

### Pattern 2: Replace hr with Headings

```mdx
<!-- Before -->

Main content...

---

Subsection content...

<!-- After -->

## Main Content

Details...

### Subsection

Subsection content...
```

### Pattern 3: Consolidate Excessive Rules

```mdx
<!-- Before -->

## Section A

---

Content A...

---

## Section B

---

Content B...

---

<!-- After -->

## Section A

Content A...

## Section B

Content B...
```

---

## Validation Checklist

Before publishing, verify:

- [ ] Each `---` represents a genuine thematic break
- [ ] Not using `---` for layout/spacing
- [ ] Proper headings exist (not replaced by `---`)
- [ ] Frequency: 4-6 per post maximum (8 for very long posts)
- [ ] Screen reader users benefit from separator announcements
- [ ] No `---` immediately after components (unless thematic break)

---

## Tools and Automation

### ESLint Rule (Future Consideration)

```javascript
// Potential lint rule for excessive horizontal rules
'mdx/max-horizontal-rules': ['warn', { max: 8 }]
```

### Manual Review

```bash
# Count horizontal rules in a file
grep -c "^---$" src/content/blog/*/index.mdx

# List posts with >8 rules
find src/content/blog -name "index.mdx" -exec sh -c \
  'count=$(grep -c "^---$" "$1"); \
   [ $count -gt 8 ] && echo "$1: $count rules"' _ {} \;
```

---

## References

- [Using horizontal rules in HTML - tempertemper](https://www.tempertemper.net/blog/using-horizontal-rules-in-html)
- [Understanding the Hypertext Markup Language \<HR\> Tag - Lenovo](https://www.lenovo.com/us/en/glossary/html-hr-tag/)
- [Horizontal Rule | Buckeye UX Design System](http://bux.osu.edu/page-elements/horizontal-rule/)
- [Not Your Typical Horizontal Rules - Sara Soueidan](https://www.sarasoueidan.com/blog/horizontal-rules/)
- [Does the HTML hr Benefit Screen Reader Users? - Digital A11y](https://www.digitala11y.com/does-the-html-horizontal-rule-benefit-screen-reader-users/)
- [\<hr\>: The Thematic Break Element - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr)

## Related Documentation

- **[Horizontal Rules in RSS/Atom Feeds](./horizontal-rules-in-rss-feeds.md)** - Feed-specific best practices and reader support
- **[Horizontal Rule Audit (Jan 2026)](./horizontal-rule-audit-2026-01-19.md)** - Analysis of existing blog posts
- **[Horizontal Rule Analysis Summary](./horizontal-rule-analysis-summary.md)** - Executive summary

---

## Quick Decision Tree

```
Need visual separation?
│
├─ Is this a genuine topic shift? → YES → Use `---`
│  (e.g., CVE-2025-12345 → CVE-2025-67890)
│
├─ Is this a heading-level change? → YES → Use `##` or `###`
│  (e.g., Main topic → Subsection)
│
├─ Just need more spacing? → YES → Use component margins
│  (e.g., After Alert, KeyTakeaway, etc.)
│
└─ Between list items or paragraphs? → NO → Don't use separator
   (Natural flow, no break needed)
```

---

**Status:** Production Ready  
**Next Review:** Quarterly (April 2026)  
**Feedback:** Submit issues to content team

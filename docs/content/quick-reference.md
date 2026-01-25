{/* TLP:CLEAR */}

# Markdown Guardrails - Quick Reference

## TL;DR

| Aspect | Rule | Status |
|--------|------|--------|
| **Horizontal lines max** | 6 per post | ✅ Enforced |
| **Horizontal lines placement** | Only major topic transitions | ✅ Enforced |
| **Before subsections** | Use `###`, not `---` | ✅ Enforced |
| **Frontmatter fields** | All required | ✅ Validated |
| **Heading nesting** | Max depth: `####` | ✅ Validated |
| **File naming** | kebab-case | ✅ Validated |

## Validation Command

```bash
npm run validate:content
```

**Result:**
- ✅ Pass: Post follows all standards
- ❌ Error: Too many horizontal lines (must fix)
- ⚠️ Warn: Minor issues (should fix)

## Horizontal Line Rules

```markdown
✅ DO THIS:
---
After introduction
Intro text.

---
## Major Section 1
Content...

### Subsection (no --- needed!)
Content...

## Major Section 2
Content...

---
## Conclusion

❌ DON'T DO THIS:
---
## Section 1
---
### Subsection
---
Content
---
```

## Quick Post Template

```markdown
---
title: "Title: With Subtitle"
summary: "Hook sentence under 100 chars."
publishedAt: "YYYY-MM-DD"
category: "Web"
tags: ["Tag1", "Tag2", "Tag3"]
featured: false
image:
  url: "/blog/images/default/minimal.svg"
  alt: "Descriptive alt text"
  width: 1200
  height: 630
---

Intro paragraph.

---

## Section 1
Content...

### Subsection
Details...

---

## Section 2
Content...

---

## Conclusion
Wrap up...
```

## Before Publishing

- [ ] Run `npm run validate:content`
- [ ] Post shows ✅ PASS
- [ ] Horizontal lines: 3-6 total
- [ ] All frontmatter fields filled
- [ ] Headings properly nested

## Documentation

| File | Purpose |
|------|---------|
| `docs/content/MARKDOWN_STANDARDS.md` | Complete standards reference |
| `docs/content/AI_CONTRIBUTION_GUIDE.md` | AI assistant guidelines |
| `scripts/validate-markdown-content.mjs` | Validation enforcement |
| `docs/content/IMPLEMENTATION_SUMMARY.md` | What changed and why |

## Common Issues & Fixes

### "Too many horizontal lines: X (max: 6)"
**Fix**: Remove `---` lines between subsections. Use `###` heading instead.

### "Multiple h1 headings found"
**Fix**: Only one `# Title` per post. Content starts at `##`.

### "Heading hierarchy jump"
**Fix**: Don't skip heading levels. Go `##` → `###`, not `##` → `####`.

---

**Last Updated**: Nov 30, 2025
**Current Status**: 1/4 non-demo posts passing (hardening-developer-portfolio.mdx) ✅

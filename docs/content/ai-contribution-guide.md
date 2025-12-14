# Content Contribution Guide for AI Assistants

This guide helps AI coding assistants maintain content quality and markdown standards when working on blog posts.

## Quick Rules

**Horizontal Lines (---)**
- ✅ Use 3-5 per post maximum
- ✅ Only at major topic transitions
- ✅ After introduction, between major sections, before conclusion
- ❌ Never between subsections (use `###` instead)
- ❌ Never for visual spacing

**Example Structure:**
```markdown
---
title: "Post Title"
---

Introduction paragraph.

---  ✅ After intro

## Part 1: Foundation
Content...

### Subsection (no --- before this!)
Content...

## Part 2: Implementation
Content...

---  ✅ Major section break

## Takeaways
Content...
```

## Before Editing Any Post

1. **Read standards first**: Check `docs/content/MARKDOWN_STANDARDS.md`
2. **Understand current state**: Run `npm run validate:content` to see baseline
3. **Preserve structure**: Don't add horizontal lines unless replacing a removed section
4. **Validate after changes**: Run `npm run validate:content` before committing

## Adding New Blog Posts

**Create file**: `src/content/blog/post-slug.mdx`

**Template:**
```markdown
---
title: "Clear Title: With Descriptive Subtitle"
summary: "One sentence summary, under 100 characters, with a hook."
publishedAt: "YYYY-MM-DD"
category: "Web" # or DevSecOps, AI, etc.
tags: ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"]
featured: false
image:
  url: "/blog/images/default/minimal.svg"
  alt: "Descriptive alternative text for image"
  caption: "Optional image caption"
  width: 1200
  height: 630
---

Brief introduction (1-2 sentences) setting up the problem.

---

## Problem Statement

Why this matters...

---

## Solution: Approach 1

How you approached it...

### Subsection
Details without --- separators.

## Solution: Approach 2

Another approach...

---

## Results & Impact

Metrics and outcomes...

---

## Key Takeaways

- Point 1
- Point 2
- Point 3

---

## Next Steps (optional)

Future improvements...
```

**Validation:**
```bash
npm run validate:content
```

Must show your post in the passing section before merging.

## Common Mistakes to Avoid

### ❌ Adding Horizontal Lines Between Every Subsection

```markdown
## Major Section
---  ← WRONG

### Subsection
---  ← WRONG

Content...
```

**Fix**: Remove `---` lines, they're unnecessary when using `###` headings.

### ❌ Using Horizontal Lines for Visual Spacing

```markdown
Paragraph about topic A.

---  ← WRONG (visual spacing, not semantic)

Paragraph about topic B.
```

**Fix**: Let heading hierarchy provide structure instead.

### ❌ Mixing Different Horizontal Line Styles

```markdown
---
Content...
___  ← Different style (inconsistent)
Content...
***  ← Another style (inconsistent)
```

**Fix**: Use `---` consistently throughout.

## Editing Existing Posts

**If adding a new section:**
- ✅ Add `---` only if introducing a major topic transition
- ❌ Don't add `---` before subsections
- Run `npm run validate:content` to confirm it still passes

**If removing a section:**
- ✅ Remove any adjacent `---` lines if they become orphaned
- Check validation after removing content

**If reorganizing sections:**
- Count horizontal lines: should be 3-6 total
- Keep lines only at major topic transitions
- Use `##` and `###` for structural hierarchy

## Running Validation

```bash
# Check all non-demo posts
npm run validate:content

# Output shows:
# ✅ PASS - Post follows standards
# ❌ ERROR - Too many horizontal lines (fix required)
# ⚠️  WARN - Minor issues (fix recommended)
```

**Exit codes:**
- `0` - All posts pass ✅
- `1` - Errors found (must fix) ❌

## Standards Reference

| Standard | Rule | Why |
|----------|------|-----|
| **Horizontal lines** | 3-6 per post, only major transitions | Maintains visual hierarchy; semantic meaning |
| **Frontmatter** | All required fields complete | Enables metadata-driven features (SEO, social sharing) |
| **Headings** | One h1, logical h2/h3/h4 nesting | Proper document structure; accessibility |
| **File naming** | kebab-case | Consistency; clean URLs |

For complete standards, see: `docs/content/MARKDOWN_STANDARDS.md`

## Examples

### ✅ Well-Formatted Post (4 horizontal lines)

```markdown
---
title: "Learning React: Hooks, State, and Effects"
summary: "Deep dive into React fundamentals with practical examples."
publishedAt: "2025-11-30"
category: "Web"
tags: ["React", "JavaScript", "Frontend", "Tutorial"]
featured: true
image:
  url: "/blog/images/default/minimal.svg"
  alt: "React logo with component hierarchy"
  width: 1200
  height: 630
---

React has transformed how we build user interfaces. Understanding hooks
is essential for modern React development.

---

## Understanding Hooks

Hooks were introduced in React 16.8 and changed everything.

### useState Hook

Store component state...

### useEffect Hook

Handle side effects...

---

## Building Real Applications

Now let's apply these concepts...

### Example: Todo App

A practical implementation...

---

## Key Takeaways

- Hooks simplify state management
- Understanding useEffect prevents bugs
- Compose hooks for complex logic
```

**Validation**: ✅ PASS (4 horizontal lines, proper structure)

### ❌ Over-Formatted Post (9 horizontal lines)

```markdown
---
title: "..."
---

Intro.

---  ← 1

## Section 1
---  ← 2 (unnecessary!)

### Subsection
---  ← 3 (unnecessary!)

Content...

---  ← 4

## Section 2
---  ← 5 (unnecessary!)

### Subsection
---  ← 6 (unnecessary!)

Content...

---  ← 7

## Conclusion
```

**Validation**: ❌ ERROR - Too many horizontal lines (9 max: 6)

**Fix**: Remove the 5 unnecessary lines before `###` headings.

## Questions?

For markdown standards questions:
- Check: `docs/content/MARKDOWN_STANDARDS.md`
- Check: `docs/ai/BEST_PRACTICES.md`

For validation script questions:
- See: `scripts/validate-markdown-content.mjs` (well-commented)
- Run: `npm run validate:content --help` (if implemented)

---

**Remember**: Consistency and clarity matter. These standards keep our content quality high and make maintenance easier for everyone.

# Markdown Standards & Best Practices

Comprehensive guidelines for writing and maintaining blog posts and content in this portfolio.

## Table of Contents

- [Frontmatter & Metadata](#frontmatter--metadata)
- [Structure & Hierarchy](#structure--hierarchy)
- [Horizontal Lines](#horizontal-lines)
- [Content Elements](#content-elements)
- [Code & Syntax](#code--syntax)
- [Mathematical Expressions](#mathematical-expressions)
- [Links & References](#links--references)
- [Checklists](#checklists)

---

## Frontmatter & Metadata

All blog posts **must** include YAML frontmatter at the top with the following schema:

```yaml
---
title: "Post Title: Clear, Descriptive Subtitle"
summary: "One-sentence summary for listing pages and social sharing"
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD" # Optional, include if post was revised
category: "CategoryName" # Web, DevSecOps, AI, etc.
tags: ["Tag1", "Tag2", "Tag3"]
featured: false # Set to true for homepage feature
previousSlugs:
  - "old-slug-if-renamed"
image:
  url: "/blog/images/default/minimal.svg"
  alt: "Descriptive alt text for accessibility"
  caption: "Optional image caption"
  width: 1200
  height: 630
---
```

### Frontmatter Rules

- **title**: Use sentence case with descriptive subtitle. Avoid clickbait.
- **summary**: ~100 characters max, conversational tone, no spoilers
- **publishedAt**: Commit date (use ISO 8601: YYYY-MM-DD)
- **updatedAt**: Only include if you significantly revised after initial publish
- **category**: One category, capitalize properly
- **tags**: 3-5 relevant tags, capitalize first letter
- **featured**: Only set to `true` for posts you want on homepage
- **image**: Always include for social sharing (1200×630 recommended)

---

## Structure & Hierarchy

### Heading Hierarchy

Use **one `# Title`** per post (used in `<h1>` by layout component). Use `##`, `###`, etc. for content sections.

```markdown
---
title: "Post Title Goes Here"
---

## Major Section (h2)

Content introduction paragraph.

### Subsection (h3)

More specific content.

#### Minor Point (h4)

Avoid going deeper than h4 in most posts.
```

### Section Organization

**Recommended structure for technical posts:**

1. **Opening context** (1-2 paragraphs) - Set expectations
2. **Problem statement** (1 section) - Define the challenge
3. **Solution/approach** (2-3 sections) - Deep dive with examples
4. **Results/impact** (1 section) - Outcomes and metrics
5. **Takeaways** (1 section) - Key learnings
6. **Next steps** (optional) - Future improvements

---

## Horizontal Lines

### ⚠️ Critical Rule

**Use horizontal lines ONLY for major topic transitions, never for subsection spacing.**

Per [CommonMark specification](https://spec.commonmark.org/0.30/#thematic-breaks), a thematic break (`---`, `___`, or `***`) represents a **semantic topic change**, not visual spacing.

### When to Use `---`

✅ **Use after introductory paragraphs** (before first major section):

```markdown
Introduction paragraph explaining the post's context.

---

## First Major Section
```

✅ **Use between major multi-part sections**:

```markdown
## Part 1: Foundation
Content about part 1...

---

## Part 2: Implementation
Content about part 2...
```

✅ **Use before conclusion** (if thematically distinct):

```markdown
## Technical Details
...

---

## Conclusion
```

### When NOT to Use `---`

❌ **Don't use before subsections** (use `###` instead):

```markdown
## Major Section
Content...

❌ WRONG:
---
### Subsection
```

```markdown
## Major Section
Content...

✅ CORRECT:
### Subsection
```

❌ **Don't use for visual spacing between paragraphs**:

```markdown
Paragraph 1.

❌ WRONG:
---
Paragraph 2.
```

❌ **Don't use multiple in sequence** (indicates poor organization):

```markdown
Content...
---
---
---
More content...
```

### Optimal Horizontal Line Count

- **Minimum**: 1 (after introduction, before first section)
- **Target range**: 3-5 per post
- **Maximum**: 6 (only for highly structured multi-part posts)

**Rationale**: Horizontal lines are visual anchors for major ideas. Too many dilutes their impact; too few reduces helpful structure.

---

## Content Elements

### Blockquotes

Use blockquotes for:
- Important warnings or notes
- Context from other sources
- Highlighted takeaways

```markdown
> **Note:** This approach requires Node.js 18+.

> This is a longer blockquote that spans
> multiple lines with important context.
```

### Lists

#### Unordered Lists

Use for non-sequential items:

```markdown
**Key features:**
- Feature one
- Feature two
  - Nested detail
  - Another detail
- Feature three
```

#### Ordered Lists

Use for sequential steps or ranked items:

```markdown
**Setup steps:**
1. Install dependencies
2. Configure environment variables
3. Run migrations
4. Start dev server
```

#### Task Lists

Use for checklists and progress tracking:

```markdown
**Checklist:**
- [x] Completed task
- [ ] Pending task
- [x] Another completed task
```

### Tables

Use tables for comparison or structured data:

```markdown
| Feature | Free | Pro | Enterprise |
|---------|:----:|:---:|:----------:|
| Users | 1 | 10 | Unlimited |
| Support | Email | Priority | 24/7 |
| Custom Domain | ✗ | ✓ | ✓ |
```

**Rules:**
- Align columns semantically (`:` on right for right-align, both for center)
- Keep tables focused (3-5 rows max before splitting)
- Always include a header row

---

## Code & Syntax

### Inline Code

Use backticks for:
- Function names: `calculateTotal()`
- Variable names: `USER_AGENT`
- File paths: `src/lib/utils.ts`
- Short code snippets: `const x = 5`

```markdown
The `buildId` function in `src/lib/build.ts` handles...
```

### Code Blocks

Use fenced code blocks with language specification:

```markdown
```typescript
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```
```

**Supported languages**: JavaScript, TypeScript, Python, JSX, TSX, Bash, JSON, etc.

### Code Highlighting

Highlight important lines with comments:

```markdown
```typescript
export function greet(name: string): string {
  // ← Important: Always validate input
  if (!name) throw new Error('Name required');
  return `Hello, ${name}!`;
}
```
```

**Special markers:**
- `// ✅ Correct approach`
- `// ❌ Wrong approach`
- `// ← Important note`

---

## Mathematical Expressions

This site supports **KaTeX** for rendering mathematical expressions through the `remark-math` and `rehype-katex` plugins.

### Inline Math

Use single `$` delimiters for math inline with text:

```markdown
Einstein's famous equation is $E = mc^2$, relating energy to mass.

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

Pythagorean theorem: $a^2 + b^2 = c^2$
```

**Inline Math Best Practices:**
- ✅ Keep expressions simple and readable (~60 characters max)
- ✅ Introduce the concept before showing the math
- ✅ Add context: "The equation $v = d/t$ shows..."
- ✅ Use display mode (below) for complex expressions
- ❌ Don't nest multiple fractions: avoid `$\frac{a}{\frac{b}{c}}$`
- ❌ Don't use display mode for trivial expressions

### Display Math (Block Equations)

Use double `$$` delimiters for centered, standalone equations:

```markdown
The Gaussian integral is fundamental in probability:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**Display Math Best Practices:**
- ✅ Use for complex expressions requiring vertical space
- ✅ Use for multi-line equations with alignment
- ✅ Provide context before and after the equation
- ✅ Add interpretation: "This equals..." after complex results
- ❌ Don't use for single-variable expressions

### Common LaTeX Symbols

| Category | Examples | Markdown |
|----------|----------|----------|
| **Greek** | $\alpha, \beta, \gamma, \delta, \theta, \lambda, \pi$ | `\alpha, \beta, \gamma, ...` |
| **Relations** | $\leq, \geq, \neq, \approx, \equiv$ | `\leq, \geq, \neq, ...` |
| **Operators** | $\times, \div, \pm, \mp$ | `\times, \div, \pm, ...` |
| **Logic** | $\forall, \exists, \Rightarrow, \Leftrightarrow$ | `\forall, \exists, ...` |
| **Sets** | $\in, \notin, \subset, \cup, \cap$ | `\in, \notin, \subset, ...` |

### LaTeX Environments

| Environment | Use Case | Example |
|------------|----------|---------|
| `aligned` | Multi-line equations | `\begin{aligned}x + y &= 5 \\ 2x - y &= 1\end{aligned}` |
| `bmatrix` | Matrices with brackets | `\begin{bmatrix}a & b \\ c & d\end{bmatrix}` |
| `cases` | Piecewise functions | `\begin{cases}x & \text{if } x > 0 \\ -x & \text{otherwise}\end{cases}` |

### Typography & Readability

**Complex Inline Math:**
```markdown
✅ GOOD: Display mode for fractions
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

❌ AVOID: Cramped inline fractions
$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
```

**Spacing Around Math:**
```markdown
✅ GOOD: Natural spacing
Einstein showed that $E = mc^2$ relates energy and mass.

❌ AVOID: No space before/after
Einstein showed that$E = mc^2$relates energy and mass.
```

**Multi-Line Equations:**
```markdown
✅ GOOD: Use aligned environment
$$
\begin{aligned}
f(x) &= x^2 + 2x + 1 \\
&= (x + 1)^2
\end{aligned}
$$

❌ AVOID: Multiple inline equations
$f(x) = x^2 + 2x + 1$ $= (x + 1)^2$
```

### Examples

**Example 1: Physics Concept**
```markdown
Newton's second law, $\mathbf{F} = m\mathbf{a}$, forms the foundation
of classical mechanics. The force on an object equals its mass times
acceleration.

For a falling object near Earth's surface:

$$
F = mg \approx 9.8m \text{ (Newtons)}
$$
```

**Example 2: Statistical Formula**
```markdown
The normal distribution (Gaussian) describes many natural phenomena:

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

Where $\mu$ is the mean and $\sigma$ is the standard deviation.
```

**Example 3: Calculus**
```markdown
To find the area under the curve $y = x^2$ from 0 to 3, we use integration:

$$
\int_{0}^{3} x^2 \, dx = \left[\frac{x^3}{3}\right]_0^3 = 9
$$

The area is 9 square units.
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Math doesn't render | Check `$...$` syntax and escaping |
| Baseline misalignment | Use display mode `$$...$$` for better spacing |
| Complex expression too cramped | Move to display mode or split into steps |
| Greek letters not showing | Use backslash: `\alpha` not `α` |

---

## Links & References

### Internal Links

Link to other blog posts with relative paths:

```markdown
See Shipping a Portfolio for setup details.
```

### External Links

Include full URLs:

```markdown
Read more on [MDN Web Docs](https://developer.mozilla.org/en-US/docs/web/).
```

### Footnotes

Use footnotes for citations or elaborations:

```markdown
This approach is recommended[^1] for production use.

[^1]: See the CommonMark spec at https://spec.commonmark.org/
```

---

## Common Mistakes

### ❌ Problem: Over-dividing Sections

```markdown
## Part 1
---  ← Unnecessary
### Subsection A
---  ← Unnecessary
Content...
---  ← Unnecessary
### Subsection B
```

### ✅ Solution: Trust Heading Hierarchy

```markdown
## Part 1

### Subsection A
Content...

### Subsection B
```

### ❌ Problem: Inconsistent Formatting

```markdown
**Bold** vs. ***bold italic*** vs. `code` used randomly
```

### ✅ Solution: Use Semantic Formatting

- `**bold**` for emphasis
- `*italic*` for subtle emphasis
- `` `code` `` for technical terms
- `***bold italic***` rarely needed

### ❌ Problem: Long Introductions

```markdown
---
...frontmatter...
---

This is a 5-paragraph introduction explaining
everything about the topic with lots of context
and background information before finally...

---

## The Actual Content
```

### ✅ Solution: Concise Opening

```markdown
---
...frontmatter...
---

Context sentence or two setting up the problem.

---

## The Actual Content
```

---

## Validation Checklist

Before publishing a blog post:

- [ ] **Frontmatter complete**: All required fields filled
- [ ] **One `<h1>`**: Only one `# Title` (rest are `##` and deeper)
- [ ] **Horizontal lines**: 3-6 total, only at major transitions
- [ ] **Structure clear**: Logical flow from problem → solution → takeaways
- [ ] **Code examples**: Include comments explaining key lines
- [ ] **Links tested**: All internal and external links work
- [ ] **Formatting consistent**: Consistent use of bold, code, lists
- [ ] **Spellcheck**: Run spell check before commit
- [ ] **Summary compelling**: Summary sentence hooks readers

---

## Examples

### ✅ Well-Structured Post

```markdown
---
title: "Building Fast APIs: Performance Patterns and Pitfalls"
summary: "Learn optimization techniques that reduced API latency by 65%."
publishedAt: "2025-11-30"
category: "Web"
tags: ["Performance", "API", "Optimization"]
---

This post covers practical optimization patterns I discovered while
rebuilding our API infrastructure.

---

## The Challenge

We were experiencing 2-3 second response times on critical endpoints.

---

## Identifying Bottlenecks

### Database Queries

### Caching Strategy

---

## Results

80% of requests now respond in &lt;100ms.

---

## Next Steps

Future improvements include...
```

---

## Questions?

For questions about content standards, refer to:
- **Design system**: `docs/ai/DESIGN_SYSTEM.md`
- **Best practices**: `docs/ai/BEST_PRACTICES.md`
- **CommonMark spec**: https://spec.commonmark.org/

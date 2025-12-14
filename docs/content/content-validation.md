# Content Validation Guardrails System

> **Last Updated**: Nov 30, 2025 | Status: Production-Ready

## Overview

The content validation system ensures all blog posts and diagrams follow established standards through automated checks and clear documentation.

## Available Validators

### 1. Markdown Content Validation

```bash
npm run validate:content
```

**What it checks:**
- ✅ Horizontal line count (3-5 target, 6 max)
- ✅ Frontmatter completeness (title, summary, publishedAt, category)
- ✅ Heading hierarchy (no jumps like h1 → h3)
- ✅ File naming (kebab-case)

**Output:**
```
ai-development-workflow.mdx (PASSES)
passing-comptia-security-plus.mdx (ERROR: 11 lines, max 6)
shipping-developer-portfolio.mdx (ERROR: 7 lines, max 6)
```

**Documentation:** `/docs/content/MARKDOWN_STANDARDS.md`

### 2. Mermaid Diagram Validation

```bash
npm run lint:mermaid
```

**What it checks:**
- ❌ Hardcoded colors (`fill:#abc`, `stroke:#123`)
- ❌ Style directives (`style A fill:`)
- ❌ Custom theme config (`themeVariables`)
- ❌ Wrong component syntax (`<Mermaid>` in posts)

**Output:**
```
ai-development-workflow.mdx
  ❌ HARDCODED_COLOR:43: fill:#1f2937
  
⚠️  Found 3 issue(s)
```

**Documentation:** `/docs/content/MERMAID_BEST_PRACTICES.md`

### 3. TypeScript & ESLint

```bash
npm run lint        # Check all files
npm run lint:fix    # Auto-fix issues
```

### 4. Type Checking

```bash
npm run typecheck
```

### 5. Combined Pre-Commit Check

```bash
npm run check       # Runs: lint + typecheck
```

## Pre-Commit Workflow

1. **Write your content** (markdown or component)
2. **Validate before committing:**
   ```bash
   npm run validate:content   # Markdown structure
   npm run lint:mermaid       # Diagram colors
   npm run check              # TypeScript + ESLint
   ```
3. **Fix any errors** using the documentation
4. **Commit once all pass** ✅

## Common Issues & Fixes

### Markdown Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Too many horizontal lines" | 7+ `---` dividers | Remove subsection dividers, keep major section breaks |
| "Multiple h1 headings" | Wrong frontmatter parsing | Check frontmatter structure in blog post |
| "Missing required field" | Incomplete metadata | Add missing field to frontmatter (title, category, etc) |

**Reference:** `/docs/content/MARKDOWN_STANDARDS.md`

### Diagram Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Hardcoded colors | `fill:#abc`, `stroke:#xyz` | Remove all color definitions, use automatic theming |
| Wrong component | `<Mermaid>{...}</Mermaid>` in post | Use markdown code fence: ` ```mermaid ` |
| Invisible in dark mode | Light-colored hardcoded fill | Let "dark" theme handle colors |

**Reference:** `/docs/content/MERMAID_BEST_PRACTICES.md`

## Adding New Validators

To add a new validation rule:

1. **Update the checker script:**
   - For markdown: Edit `scripts/validate-markdown-content.mjs`
   - For diagrams: Edit `scripts/lint-mermaid-diagrams.mjs`

2. **Add npm script** to `package.json` if creating new validator

3. **Document in appropriate guide:**
   - Markdown: `/docs/content/MARKDOWN_STANDARDS.md`
   - Diagrams: `/docs/content/MERMAID_BEST_PRACTICES.md`

4. **Update this file** with new validator info

## CI/CD Integration (Future)

### GitHub Actions Integration

```yaml
- name: Validate Content
  run: npm run validate:content

- name: Lint Diagrams
  run: npm run lint:mermaid

- name: Type Check
  run: npm run typecheck
```

### Pre-Commit Hook (Future)

```bash
#!/bin/sh
npm run validate:content && npm run lint:mermaid
if [ $? -ne 0 ]; then
  echo "Content validation failed. Commit blocked."
  exit 1
fi
```

## Current Status

### Validation Rules Implemented

✅ Markdown content structure (horizontal lines, headings, frontmatter)
✅ Mermaid diagram colors (no hardcoding)
✅ TypeScript type checking
✅ ESLint code style
✅ Design token usage

### Posts Status

| Post | Markdown | Diagrams | Notes |
|------|----------|----------|-------|
| ai-development-workflow | ✅ PASS | ✅ PASS | Fixed |
| demo-diagrams | ✅ PASS | ✅ PASS | All 5 examples |
| demo-markdown | ✅ PASS | ✅ PASS | Fixed |
| demo-math | ✅ PASS | N/A | Math examples |
| passing-comptia-security-plus | ❌ FAIL (11 lines) | N/A | Needs -5 lines |
| shipping-developer-portfolio | ❌ FAIL (7 lines) | N/A | Needs -1 line |

### Test Results

```
1/4 posts pass markdown validation
3/3 posts pass diagram validation (where applicable)
All diagrams use automatic theming
```

## Documentation Structure

```
docs/content/
├── MARKDOWN_STANDARDS.md        # Markdown rules & examples
├── MERMAID_BEST_PRACTICES.md    # Diagram theming & syntax
├── AI_CONTRIBUTION_GUIDE.md     # AI-specific guidelines
├── QUICK_REFERENCE.md           # One-page cheat sheet
└── IMPLEMENTATION_SUMMARY.md    # What changed & why
```

## Scripts Reference

```bash
# Content validation
npm run validate:content           # Check markdown structure
npm run lint:mermaid              # Check diagram colors

# Code quality
npm run lint                       # ESLint check
npm run lint:fix                  # Auto-fix linting issues
npm run typecheck                 # TypeScript validation
npm run check                      # All checks (lint + typecheck)

# Combined
npm run check && npm run validate:content && npm run lint:mermaid
```

## Best Practices

### Before Writing Content

1. Read the appropriate guide:
   - Posts: `/docs/content/MARKDOWN_STANDARDS.md`
   - Diagrams: `/docs/content/MERMAID_BEST_PRACTICES.md`

2. Follow the examples in demo posts

3. Use provided templates

### Before Committing

1. Run all validators:
   ```bash
   npm run validate:content
   npm run lint:mermaid
   npm run check
   ```

2. Fix any errors using the guides

3. Test manually:
   - `npm run dev` for visual inspection
   - Toggle theme to verify diagrams adapt

### Code Review Checklist

- [ ] All validators pass (`npm run check`)
- [ ] Content validation passes (`npm run validate:content`)
- [ ] Diagram validation passes (`npm run lint:mermaid`)
- [ ] Diagrams tested in light + dark mode
- [ ] No hardcoded colors in diagrams
- [ ] Markdown structure follows standards
- [ ] Frontmatter complete

## Troubleshooting

### "Command not found: npm run validate:content"

**Fix:** Make sure you're in the project root directory and dependencies are installed:
```bash
cd /path/to/dcyfr-labs
npm install
npm run validate:content
```

### "All mermaid diagrams pass but diagram looks wrong"

**Debug steps:**
1. Check console for errors: `npm run dev` then open browser DevTools
2. Verify markdown syntax at https://mermaid.js.org
3. Check if using old `<Mermaid>` component syntax (should be ` ```mermaid `)
4. Ensure no inline `style` or `fill` directives

### "Markdown validation fails but content looks correct"

**Common causes:**
- Too many horizontal lines (7+)
- Missing frontmatter field
- Heading hierarchy jump (h1 → h3)
- Wrong file naming (not kebab-case)

**Fix:** See `/docs/content/MARKDOWN_STANDARDS.md` for specific issue

## Quick Start for New Contributors

1. **Read**: `/docs/content/MARKDOWN_STANDARDS.md`
2. **Read**: `/docs/content/MERMAID_BEST_PRACTICES.md`
3. **Copy**: Template from `/src/content/blog/demo-*.mdx`
4. **Write**: Your content
5. **Validate**: `npm run validate:content && npm run lint:mermaid`
6. **Test**: `npm run dev` (light + dark mode)
7. **Commit**: Once all pass

## Support

- **Documentation**: See `/docs/content/` directory
- **Examples**: Check `demo-*.mdx` blog posts
- **Issues**: Check console output for specific error messages
- **Questions**: Refer to copilot-instructions.md or CONTRIBUTING.md

---

**Maintained by**: Content & Design Systems Team
**Last Updated**: Nov 30, 2025
**Status**: Production-Ready ✅

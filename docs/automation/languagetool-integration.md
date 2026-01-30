{/_ TLP:CLEAR _/}

# LanguageTool Integration Guide

**Status:** ✅ Implemented (Phase 1)
**Last Updated:** January 29, 2026
**Related:** [Content Creation](../blog/content-creation.md) · [Automation Guide](./AUTOMATED_UPDATES.md)

---

## Summary

LanguageTool Pro integration provides automated grammar, spelling, and style checking for MDX blog posts. The system extracts prose from MDX files (removing code blocks, components, and markup) and validates content quality before publication.

**Key Benefits:**

- Catch grammar/spelling errors before code review
- Enforce consistent writing style across technical content
- Reduce manual proofreading time (~2.5 hours/year)
- Professional content quality with automated checks

---

## Quick Start

### 1. Setup Credentials

Get your API credentials from [LanguageTool Settings](https://languagetool.org/editor/settings/access-tokens).

Add to `.env.local`:

```bash
LANGUAGETOOL_USERNAME=your-email@example.com
LANGUAGETOOL_API_KEY=your-api-key-here
```

### 2. Setup Custom Dictionary

Add technical terms to reduce false positives:

```bash
npm run prose:setup-dictionary
```

**Preview without changes:**

```bash
npm run prose:setup-dictionary -- --dry-run
```

**View current dictionary:**

```bash
npm run prose:list-dictionary
```

### 3. Check Blog Posts

**Check all blog posts:**

```bash
npm run prose:check
```

**Check specific file:**

```bash
npm run prose:check:file -- src/content/blog/my-post.mdx
```

**Check staged files (pre-commit):**

```bash
npm run prose:check:staged
```

**Strict mode (exit 1 on issues):**

```bash
npm run prose:check:strict
```

**Picky mode (additional style rules):**

```bash
npm run prose:check:picky
```

---

## How It Works

### Architecture

```
MDX File
  ↓
Prose Extractor (strips code, components, markup)
  ↓
LanguageTool API (checks grammar, spelling, style)
  ↓
Formatted Results (console output with suggestions)
```

### Prose Extraction

The system intelligently removes non-prose content:

**Removed:**

- ✅ Frontmatter (YAML metadata)
- ✅ Code blocks (``` fenced code)
- ✅ Inline code (`backticks`)
- ✅ JSX/React components (`<Component>`)
- ✅ HTML tags
- ✅ Image URLs (keeps alt text)
- ✅ Link URLs (keeps link text)

**Preserved:**

- ✅ Headings (text only, markers removed)
- ✅ Lists (text only, markers removed)
- ✅ Blockquotes (text only, markers removed)
- ✅ Paragraphs and inline formatting

**Example:**

````mdx
---
title: 'My Post'
---

## Introduction

Check out this `code example`:

```typescript
const x = 42;
```
````

<KeyTakeaway>This is important</KeyTakeaway>

Visit [Next.js](https://nextjs.org) for more info.

```

**Extracted prose:**
```

Introduction

Check out this code example:

This is important

Visit Next.js for more info.

````

### Default Configuration

**Disabled Rules (Common False Positives):**
- `WHITESPACE_RULE` - Extra whitespace common in code examples
- `EN_QUOTES` - Quote style varies in technical writing
- `DASH_RULE` - Em dash vs en dash preference
- `WORD_CONTAINS_UNDERSCORE` - Code identifiers in prose
- `UPPERCASE_SENTENCE_START` - Code examples may not capitalize
- `SENTENCE_FRAGMENT` - List items may be fragments

**Disabled Categories:**
- `REDUNDANCY` - Technical writing repeats for clarity

**Levels:**
- `default` - Standard checking (grammar, spelling, basic style)
- `picky` - Additional formal writing rules

---

## Usage Examples

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run prose:check:staged
````

### CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Validate Prose Quality
  run: npm run prose:check
  continue-on-error: true # Warning only
  env:
    LANGUAGETOOL_USERNAME: ${{ secrets.LANGUAGETOOL_USERNAME }}
    LANGUAGETOOL_API_KEY: ${{ secrets.LANGUAGETOOL_API_KEY }}
```

### VS Code Task

Add to `.vscode/tasks.json`:

```json
{
  "label": "Check Prose Quality",
  "type": "shell",
  "command": "npm run prose:check:file -- ${file}",
  "problemMatcher": [],
  "presentation": {
    "reveal": "always",
    "panel": "new"
  }
}
```

Bind to keyboard shortcut in `.vscode/keybindings.json`:

```json
{
  "key": "cmd+shift+p",
  "command": "workbench.action.tasks.runTask",
  "args": "Check Prose Quality"
}
```

---

## Custom Dictionary Management

### Technical Terms

The setup script adds 70+ technical terms by default:

**Frameworks:** Next.js, TypeScript, React, Node.js, Tailwind, shadcn
**Tools:** Redis, Inngest, Sentry, GitHub, ESLint, Vitest
**Formats:** API, CLI, JSON, YAML, MDX, CSV
**Security:** auth, JWT, CORS, CSRF, XSS, CVE, OWASP

### Adding Custom Terms

Edit `scripts/setup-languagetool-dictionary.mjs`:

```javascript
const TECHNICAL_TERMS = [
  // ... existing terms ...
  'YourCustomTerm',
  'AnotherTerm',
];
```

Re-run setup:

```bash
npm run prose:setup-dictionary
```

### Viewing Dictionary

```bash
npm run prose:list-dictionary
```

Output:

```
📖 Current Dictionary Contents:

  - API
  - CLI
  - CORS
  - CSS
  - ...

  Total: 73 words
```

---

## API Rate Limits

**LanguageTool Pro:**

- **80 requests/minute** (vs 20 free)
- **300,000 characters/minute** (vs 75,000 free)
- **60,000 characters/request** (vs 20,000 free)

**Current Usage (30 blog posts):**

- Average post: ~4,000 characters
- Total: ~120,000 characters
- Requests: ~30 (1 per post)
- **Time to check all:** <30 seconds

**Safe for:**

- ✅ Pre-commit checks (1-5 files)
- ✅ CI/CD full validation (30 files)
- ✅ Batch processing (100+ files)

---

## Output Format

### Success

```
🔍 LanguageTool Prose Validation

Checking 3 files...
Level: default

✅ src/content/blog/my-post.mdx: No issues found
✅ src/content/blog/another-post.mdx: No issues found
✅ src/content/blog/third-post.mdx: No issues found

============================================================
SUMMARY
============================================================

Files checked: 3
Files with issues: 0
Total issues: 0

✅ All files passed prose validation!
```

### Issues Found

```
❌ src/content/blog/my-post.mdx: 2 issues

  Misspelling (MORFOLOGIK_RULE_EN_US): Possible spelling mistake found.
    Context: "This is a spelling eror in the text"
     → Suggestion: "error"

  Grammar (WERE_VBB): Did you mean "was"?
    Context: "The server were running fine"
     → Suggestion: "was"

============================================================
SUMMARY
============================================================

Files checked: 1
Files with issues: 1
Total issues: 2

⚠️  Issues found (warnings only)
```

---

## Troubleshooting

### Missing Credentials

**Error:**

```
❌ Missing LanguageTool credentials
```

**Solution:**
Add credentials to `.env.local`:

```bash
LANGUAGETOOL_USERNAME=your-email@example.com
LANGUAGETOOL_API_KEY=your-api-key
```

### API Rate Limit Exceeded

**Error:**

```
LanguageTool API error (429): Too Many Requests
```

**Solution:**
Wait 60 seconds or reduce batch size:

```bash
# Check files one at a time
npm run prose:check:file -- src/content/blog/post1.mdx
npm run prose:check:file -- src/content/blog/post2.mdx
```

### Too Many False Positives

**Solution 1: Add to custom dictionary**

```bash
# Add term manually
npm run prose:setup-dictionary
```

**Solution 2: Disable specific rules**

Edit `scripts/validate-prose.mjs`:

```javascript
const DEFAULT_DISABLED_RULES = [
  // ... existing rules ...
  'YOUR_PROBLEMATIC_RULE_ID',
].join(',');
```

**Solution 3: Use default level instead of picky**

```bash
npm run prose:check  # Uses 'default' level
```

### No Prose Found

**Warning:**

```
⚠️  my-post.mdx: No prose content found
```

**Cause:** File is all code/components, no readable text

**Solution:** This is expected for demo files (e.g., `demo-code.mdx`)

---

## Best Practices

### When to Check

**✅ DO check:**

- Before committing new blog posts
- After significant content edits
- Before publishing (final review)
- In CI/CD for all posts

**❌ DON'T check:**

- Every keystroke (too slow)
- Code-heavy demo pages
- Auto-generated content

### Handling Results

**Grammar/Spelling Errors:**

- Fix immediately (these are real issues)

**Style Suggestions:**

- Review context before changing
- Technical writing may intentionally break "rules"
- Fragments in lists are acceptable

**False Positives:**

- Add technical terms to custom dictionary
- Disable overly strict rules
- Use `default` level for general writing

### Performance Tips

**For large content sets:**

```bash
# Check only changed files
npm run prose:check:staged

# Check specific file during editing
npm run prose:check:file -- src/content/blog/my-post.mdx
```

**For CI/CD:**

```bash
# Full check (warnings only)
npm run prose:check

# Strict mode (fails build)
npm run prose:check:strict
```

---

## Implementation Details

### File Structure

```
scripts/
├── validate-prose.mjs              # Main validation script
├── setup-languagetool-dictionary.mjs  # Dictionary setup
└── lib/
    ├── languagetool-client.mjs     # API client
    └── mdx-prose-extractor.mjs     # MDX parsing
```

### Key Functions

**`checkText(text, options)`** - Check text with LanguageTool API
**`extractProseAsText(filePath)`** - Extract plain prose from MDX
**`getProseStats(filePath)`** - Get file statistics
**`addWord(word)`** - Add word to custom dictionary
**`listWords()`** - List dictionary contents

### Environment Variables

| Variable                | Required | Description                     |
| ----------------------- | -------- | ------------------------------- |
| `LANGUAGETOOL_USERNAME` | Yes      | Your LanguageTool account email |
| `LANGUAGETOOL_API_KEY`  | Yes      | API key from account settings   |

---

## Future Enhancements

**Planned:**

- [ ] GitHub Actions workflow (auto-comment on PRs)
- [ ] Severity levels (error vs warning)
- [ ] Ignore comments in MDX (e.g., `{/* languagetool-disable */}`)
- [ ] HTML report generation
- [ ] Integration with Vale for custom style guides

**Backlog:**

- [ ] Real-time checking in VS Code extension
- [ ] Caching results for unchanged files
- [ ] Parallel checking for performance
- [ ] Support for other content types (docs, README)

---

## Related Documentation

- [Content Creation Guide](../blog/content-creation.md) - Writing blog posts
- [Automation Guide](./AUTOMATED_UPDATES.md) - CI/CD automation
- [LanguageTool API Docs](https://languagetool.org/http-api/) - Official API reference

---

## Support

**Issues:**

- Check troubleshooting section above
- Verify credentials are correct
- Test API key at [LanguageTool website](https://languagetool.org)

**Questions:**

- See LanguageTool [documentation](https://languagetool.org/http-api/)
- Check [support forum](https://forum.languagetool.org/)

---

**Last Updated:** January 29, 2026
**Maintained By:** DCYFR Labs Team
**Status:** ✅ Phase 1 Complete (POC)

# LanguageTool Integration - Quick Start

## Setup (5 minutes)

1. **Get API credentials** from [LanguageTool Settings](https://languagetool.org/editor/settings/access-tokens)

2. **Add to `.env.local`** (automatically loaded by scripts):

   ```bash
   LANGUAGETOOL_USERNAME=your-email@example.com
   LANGUAGETOOL_API_KEY=your-api-key-here
   ```

3. **Setup custom dictionary:**

   ```bash
   npm run prose:setup-dictionary
   ```

   This adds 92 technical terms (Next.js, TypeScript, Redis, WAF, etc.)

## Current Status

**✅ Phase 1 Complete (January 29, 2026)**

- 72% reduction in false positives (702 → 193 issues)
- 2 files now pass with zero issues
- Enhanced MDX component handling
- 92 terms in custom dictionary

See `docs/automation/.private/languagetool-phase1-implementation-2026-01-29.md` for details.

## Usage

### Check all blog posts

```bash
npm run prose:check
```

### Check specific file

```bash
npm run prose:check:file -- src/content/blog/my-post.mdx
```

### Check before commit

```bash
npm run prose:check:staged
```

### Strict mode (fail on issues)

```bash
npm run prose:check:strict
```

### Picky mode (formal writing)

```bash
npm run prose:check:picky
```

## What It Does

- ✅ Extracts prose from MDX (removes code blocks, components, markup)
- ✅ Checks grammar, spelling, and style with LanguageTool Pro API
- ✅ Provides suggestions for improvements
- ✅ Custom dictionary for technical terms (Next.js, TypeScript, etc.)
- ✅ Smart filtering of false positives

## Example Output

```
🔍 LanguageTool Prose Validation

Checking 1 file...
Level: default

❌ src/content/blog/my-post.mdx: 2 issues

  Misspelling: Possible spelling mistake found.
    Context: "This is a spelling eror"
     → Suggestion: "error"

  Grammar: Did you mean "was"?
    Context: "The server were running"
     → Suggestion: "was"

============================================================
SUMMARY
============================================================

Files checked: 1
Files with issues: 1
Total issues: 2

⚠️  Issues found (warnings only)
```

## Documentation

Full guide: `docs/automation/languagetool-integration.md`

## Pro Edition Benefits (Already Included)

- 80 requests/minute (vs 20 free)
- 300K chars/minute (vs 75K free)
- 60K chars/request (vs 20K free)
- Custom dictionaries
- Premium grammar/style rules

---

**Status:** ✅ Phase 1 Complete (POC)
**Last Updated:** January 29, 2026

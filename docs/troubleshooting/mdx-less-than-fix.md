# MDX Less-Than Character Fix

**Issue:** MDX compilation errors with "Unexpected character" when `<` appears before numbers in markdown files.

**Root Cause:** MDX interprets `<` as the start of a JSX/HTML tag. Patterns like `<5`, `<100ms`, or `<30s` cause compilation errors because JSX tag names cannot start with numbers.

## Solution

Replace all instances of `<` followed by digits with the HTML entity `&lt;`.

### Examples

| Before | After | Context |
|--------|-------|---------|
| `<5%` | `&lt;5%` | "Error rate <5%" |
| `<100ms` | `&lt;100ms` | "Response time <100ms" |
| `<30s` | `&lt;30s` | "Build time <30s" |
| `<10` | `&lt;10` | "Target <10 warnings" |

## Automated Fix

Run the fix script to automatically update all markdown files:

```bash
npm run fix:mdx
```

This script:
1. Scans all `docs/**/*.md` files
2. Finds patterns matching ` <[digit]` or `^<[digit]`
3. Replaces `<` with `&lt;`
4. Reports number of fixes per file

## Manual Fix

If adding new documentation with comparison operators:

```markdown
❌ Wrong: Target <5 errors
✅ Right: Target &lt;5 errors

❌ Wrong: Response time <100ms
✅ Right: Response time &lt;100ms
```

## Verification

After running the fix:

```bash
npm run build  # Should complete without MDX errors
npm run dev    # Dev server should start successfully
```

## Related

- **Script:** `scripts/fix-mdx-less-than.mjs`
- **Command:** `npm run fix:mdx`
- **Affected:** 144 instances across 58 files (as of Dec 21, 2025)

## Prevention

When writing documentation:
- Use `&lt;` for less-than comparisons followed by numbers
- Use backticks for code: `` `<Component>` ``
- Tables and code blocks are safe contexts for `<`

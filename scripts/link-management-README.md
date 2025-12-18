# Link Management Scripts

This directory contains scripts for identifying and managing broken links in documentation.

## Scripts

### 1. Cleanup Broken Links (`cleanup-broken-links.mjs`)

**Purpose:** Identifies and removes broken internal links from documentation files.

**Usage:**
```bash
# Report broken links only (safe)
npm run cleanup:links

# Fix/remove broken links
npm run cleanup:links -- --fix

# Detailed output during scan
npm run cleanup:links -- --verbose

# Preview changes without applying
npm run cleanup:links -- --fix --dry-run
```

**What it does:**
- Scans all `.md` and `.mdx` files in `docs/` directory
- Extracts Markdown links `[text](url)` and HTML anchors `<a href="url">`
- Validates internal links by checking file existence
- Skips external links (http/https/mailto/tel)
- Attempts to fix broken links by adding extensions (`.md`, `.mdx`)
- Removes unfixable links but preserves link text
- Generates detailed report in `reports/broken-links-report.json`

### 2. Verify Links (`verify-links.mjs`)

**Purpose:** Validates that key documentation links are working correctly.

**Usage:**
```bash
npm run verify:links
```

**What it does:**
- Checks core documentation files for link validity
- Reports statistics on working vs. broken links
- Useful for validation after cleanup

## Reports

Generated reports are saved in the `reports/` directory:

- `broken-links-report.json` - Detailed JSON report with broken link details
- Includes timestamps, statistics, and file-by-file breakdown

## Examples

### Typical Workflow

1. **Check for broken links:**
   ```bash
   npm run cleanup:links
   ```

2. **Review the report:**
   ```bash
   cat reports/broken-links-report.json | jq .stats
   ```

3. **Fix broken links:**
   ```bash
   npm run cleanup:links -- --fix
   ```

4. **Verify the fixes:**
   ```bash
   npm run verify:links
   ```

### Sample Output

```
📊 Link Check Report
══════════════════════════════════════════════════
📄 Files scanned: 423
🔗 Links found: 1775
❌ Broken links: 564
🔧 Links fixed: 15
🗑️  Links removed: 549
```

### Common Fixes

1. **Missing extensions:**
   ```markdown
   # Before
   [Guide](./api/guide)
   
   # After
   [Guide](./api/guide.md)
   ```

2. **Broken links removed:**
   ```markdown
   # Before
   Check out this [broken link](./missing/file.md) for more info.
   
   # After
   Check out this broken link for more info.
   ```

## Integration

### Pre-commit Hook
Add to `.husky/pre-commit`:
```bash
npm run cleanup:links
```

### CI/CD Pipeline
Add to GitHub Actions:
```yaml
- name: Check documentation links
  run: npm run cleanup:links
```

### Monthly Maintenance
Schedule automated cleanup:
```bash
npm run cleanup:links -- --fix
```

## Configuration

The scripts are configured in `package.json`:

```json
{
  "scripts": {
    "cleanup:links": "node scripts/cleanup-broken-links.mjs",
    "verify:links": "node scripts/verify-links.mjs"
  }
}
```

## Safety

- **Non-destructive by default** - Reports only without `--fix` flag
- **Preserves content** - Removes links but keeps text
- **Git-tracked** - All changes visible in version control
- **Reversible** - Git history preserves original state
- **Conservative** - Only fixes obvious issues

## Testing

Run the test suite:
```bash
npm run test:scripts -- cleanup-broken-links
```

Tests cover:
- Broken link detection
- Link fixing logic
- External link handling
- HTML anchor processing
- Statistics generation
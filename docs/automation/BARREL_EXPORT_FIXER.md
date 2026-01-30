<!-- TLP:CLEAR -->

# Automated Barrel Export Fixer

## Purpose

This script automatically discovers and fixes missing barrel exports in TypeScript/React projects that enforce a barrel export pattern via ESLint.

## Problem Solved

When migrating to barrel exports (central `index.ts` files that re-export all public APIs), it's easy to:
1. Update imports to use barrel paths (`@/lib/activity`)
2. But forget to add those exports to the barrel file

This causes build errors like:
```
Export getRelatedTopics doesn't exist in target module
```

## How It Works

1. **Scans all source files** for imports from barrel directories:
   - `@/lib/activity`
   - `@/lib/search`
   - `@/components/*`

2. **Extracts what's being imported** from each file

3. **Checks if those exports exist** in the respective barrel `index.ts`

4. **Reports missing exports** or auto-fixes them with `--fix`

## Usage

### Check for missing exports (dry run)
```bash
npm run fix:barrels
```

### Auto-fix all missing exports
```bash
npm run fix:barrels:auto
```

### Direct usage
```bash
node scripts/fix-barrel-exports.mjs          # Check only
node scripts/fix-barrel-exports.mjs --fix    # Auto-fix
```

## Example Output

```
🔍 Scanning for missing barrel exports...

❌ Found missing exports in 2 barrel(s):

📦 src/lib/activity/index.ts
────────────────────────────────────────────────────────────

  From topics.ts:
    - getRelatedTopics
      Used in: src/components/activity/RelatedTopics.tsx
    - TopicCooccurrence
      Used in: src/components/activity/RelatedTopics.tsx

  From search.ts:
    - createSearchIndex
      Used in: src/app/activity/activity-client.tsx (+2 more)
    - searchActivities
      Used in: src/app/activity/activity-client.tsx (+2 more)

────────────────────────────────────────────────────────────

Total missing exports: 4

💡 Run with --fix to automatically add these exports:
   npm run fix:barrels --fix
```

## Integration

### Pre-commit Hook

The script is integrated into the pre-commit workflow via Husky. If barrel exports are missing, the commit is blocked with a helpful error message.

### CI/CD

Add to your CI pipeline to catch missing exports before deployment:

```yaml
- name: Check barrel exports
  run: npm run fix:barrels
```

## Barrel Directories Scanned

- `src/lib/activity`
- `src/lib/search`
- `src/lib/engagement`
- `src/components/activity`
- `src/components/blog`
- `src/components/common`
- `src/components/home`
- `src/components/layouts`
- `src/components/navigation`
- `src/components/ui`

## How It Adds Exports

When fixing, the script:

1. Checks if the source file already has an export line in the barrel
2. If yes, adds the missing export to that line
3. If no, creates a new export line at the end of the file

Example:

```typescript
// Before (missing getRelatedTopics)
export {
  extractTopics,
  buildCooccurrenceMatrix,
  type Topic,
} from "./topics";

// After auto-fix
export {
  extractTopics,
  buildCooccurrenceMatrix,
  getRelatedTopics,  // ← Added
  type Topic,
} from "./topics";
```

## Configuration

To add more barrel directories, edit `BARREL_DIRS` in the script:

```javascript
const BARREL_DIRS = [
  "src/lib/activity",
  "src/lib/your-new-dir",  // Add here
  // ...
];
```

## Limitations

- Only detects named imports: `import { X } from "@/lib/activity"`
- Does not detect default imports: `import X from "@/lib/activity"`
- Does not detect namespace imports: `import * as activity from "@/lib/activity"`
- Wildcard exports (`export * from "./file"`) prevent detection (assumed complete)

## Troubleshooting

### "No missing exports found" but build still fails

1. Check if you're importing from a non-barrel path:
   ```typescript
   // ❌ Direct import (bypasses barrel)
   import { X } from "@/lib/activity/topics";
   
   // ✅ Barrel import (detected by script)
   import { X } from "@/lib/activity";
   ```

2. Check if the export exists in the source file:
   ```bash
   grep -n "export.*X" src/lib/activity/*.ts
   ```

3. Verify the source file is in a scanned directory

### Script adds exports incorrectly

The script uses regex to find exports. If your export syntax is non-standard, it might miss them. File an issue with the specific case.

## Related Documentation

- [ESLint no-restricted-imports rule](../eslint.config.mjs)
- [Barrel Export Pattern](../docs/ai/component-patterns.md#barrel-exports)
- [Design System Enforcement](../docs/ai/enforcement-rules.md)

## Maintenance

Run the script after:
- Large refactoring of import paths
- Adding new barrel directories
- Migrating legacy direct imports to barrel patterns

## Performance

- Scans ~300 files in < 1 second
- Auto-fix for 10 missing exports in < 100ms

## License

MIT (same as project)

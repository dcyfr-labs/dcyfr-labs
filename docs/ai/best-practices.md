<!-- TLP:CLEAR -->

# Claude Code Best Practices

Comprehensive workflow guidelines for using Claude Code effectively on this project.

## Starting a Session

### 1. Check Current State

**Read priorities:**
```bash
cat docs/operations/todo.md  # Current Phase 4 priorities
git log --oneline -5          # Recent commit context
```

**Check test status:**
```bash
npm run test                  # Verify baseline (should be 94%+ pass rate)
```

**Review git status:**
```bash
git status                    # Understand working tree state
git diff                      # See uncommitted changes
```

### 2. Plan Before Acting

**For Phase 4 tasks:**
- Outline approach first (use TodoWrite or plan file)
- Identify all files that need changes
- Consider backward compatibility
- Plan for test coverage
- Estimate token budget (see `docs/ai/OPTIMIZATION_STRATEGY.md`)

**For new features:**
- Search for existing patterns first (use Grep/Glob)
- Review relevant docs (architecture, design system)
- Check for similar implementations
- Design before implementing

**For bug fixes:**
- Reproduce the issue first
- Read relevant test files
- Understand root cause before fixing
- Add test coverage for the fix

### 3. Use TodoWrite Tool

**Break complex tasks into subtasks:**
```typescript
// Example: Phase 4.1 Component Reorganization
[
  { content: "Audit current component structure", status: "pending" },
  { content: "Create new directory structure", status: "pending" },
  { content: "Move blog components to components/blog/", status: "pending" },
  { content: "Update imports across codebase", status: "pending" },
  { content: "Add barrel exports", status: "pending" },
  { content: "Run TypeScript compilation", status: "pending" },
  { content: "Run full test suite", status: "pending" }
]
```

**Mark progress as you work:**
- ONE task in_progress at a time
- Mark completed IMMEDIATELY after finishing
- Update persistent `todo.md` on completion

## During Implementation

### 1. Maintain Test Coverage

**Run relevant tests after each change:**
```bash
npm run test                  # Unit tests
npm run test:integration      # Integration tests
npm run test -- path/to/file  # Specific test file
```

**Add new tests for new functionality:**
- Follow existing test patterns
- Use descriptive test names
- Cover edge cases
- Maintain ≥94% pass rate

**Update existing tests if behavior changes:**
- Don't delete tests without understanding why they exist
- Update assertions to match new behavior
- Document breaking changes in commit message

### 2. Preserve Architecture

**Follow existing patterns:**
- Use PageLayout, PageHero for new pages
- Import from `@/lib/design-tokens` for spacing/typography
- Use shadcn/ui components from `@/components/ui/*`
- Follow naming conventions (kebab-case for files)

**Use design tokens, not hardcoded values:**
```typescript
// ✅ CORRECT
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
<div className={SPACING.content}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
</div>

// ❌ WRONG
<div className="space-y-8">
  <h1 className="text-3xl font-semibold">Title</h1>
</div>
```

**Maintain import conventions:**
```typescript
// ✅ CORRECT: Always use @ alias
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/metadata";

// ❌ WRONG: Relative paths
import { Button } from "../../components/ui/button";
import { createPageMetadata } from "../lib/metadata";
```

**Respect file organization:**
- Components in feature-based directories (Phase 4 goal)
- Utilities in `/lib` with clear naming
- Types colocated with implementation
- Tests adjacent to source files

### 3. Document as You Go

**Update JSDoc for modified functions:**
```typescript
/**
 * Fetches blog posts with optional filtering
 *
 * @param filters - Optional filters (tags, search, category)
 * @returns Filtered and sorted blog posts
 * @throws {Error} If MDX parsing fails
 */
export async function getBlogPosts(filters?: PostFilters): Promise<Post[]> {
  // ...
}
```

**Add inline comments for complex logic:**
```typescript
// Calculate reading time based on 200 words per minute average
const readingTime = Math.ceil(wordCount / 200);

// Use exponential backoff for retries to avoid overwhelming the API
const delay = Math.pow(2, retryCount) * 1000;
```

**Update README if user-facing changes:**
- New features: Add to features section
- Breaking changes: Update setup instructions
- New environment variables: Document in .env.example

**Note breaking changes clearly:**
```typescript
/**
 * @deprecated Use createPageMetadata() instead. Will be removed in v2.0.
 */
export function generateMetadata() { ... }
```

## Completing Work

### 1. Validation Checklist

Run all checks before considering work complete:

```bash
# TypeScript compilation
npm run typecheck                # Must pass with 0 errors

# Linting
npm run lint                     # Must pass with 0 errors

# Tests
npm run test                     # Must maintain ≥94% pass rate
npm run test:integration         # All integration tests must pass

# Build
npm run build                    # Must succeed without errors
```

**Design token usage verification:**
```bash
# Search for prohibited patterns
grep -r "space-y-[5-9]" src/     # Should return nothing
grep -r "gap-[5-9]" src/         # Should return nothing
grep -r 'className="text-[0-9]xl' src/  # Check for inline typography
```

**No hardcoded values where tokens exist:**
- Check new components import from `@/lib/design-tokens`
- Verify spacing uses SPACING constants
- Verify typography uses TYPOGRAPHY constants

**Barrel exports added where appropriate:**
```typescript
// components/blog/index.ts
export { BlogFilters } from "./blog-filters";
export { BlogSidebar } from "./blog-sidebar";
export { BlogPostList } from "./post-list";
```

**Documentation updated:**
- [ ] JSDoc comments added/updated
- [ ] README updated if user-facing changes
- [ ] Architecture docs updated if patterns changed
- [ ] todo.md updated with completion status

### 2. Update Tracking

**Mark task complete in `docs/operations/todo.md`:**
```markdown
## Phase 4: Code Organization & Structural Improvements

### 4.1 Component Directory Reorganization
- [x] Audit current component structure (80 components identified)
- [x] Move blog components to components/blog/
- [ ] Move project components to components/projects/
```

**Add session summary to `docs/operations/done.md`:**
```markdown
## 2025-11-25: Component Reorganization - Blog Components

**Completion**: Phase 4.1 (partial)
**Effort**: Estimated 2h, Actual 1.5h
**Pass Rate**: 94.2% → 94.5% (improved)

### Accomplishments
- Moved 14 blog components to `components/blog/` directory
- Created barrel export at `components/blog/index.ts`
- Updated 47 import statements across codebase
- All tests passing after reorganization

### Files Changed
- Created: `src/components/blog/` directory structure
- Modified: 47 files with import updates
- Added: `src/components/blog/index.ts` barrel export

### Learnings
- Used regex find/replace for efficient import updates: `from "@/components/blog-` → `from "@/components/blog/blog-`
- Barrel exports significantly improve import ergonomics
- TypeScript compilation caught all import errors immediately

### Impact
- Improved component organization (80 → 66 components in root)
- Better import DX with barrel exports
- Foundation for remaining Phase 4.1 work
```

**Include key metrics:**
- Completion date
- Effort estimation accuracy
- Test pass rate before/after
- Key accomplishments
- Files changed count
- Learnings and gotchas
- Impact assessment

### 3. Communicate Results

**Summarize what was done:**
- List completed tasks from todo list
- Highlight key changes
- Note test results
- Confirm all checks passing

**Note any deviations from plan:**
- Explain why approach changed
- Document alternative solutions considered
- Justify decision with reasoning

**Highlight important decisions:**
- Architectural choices made
- Patterns established
- Trade-offs accepted

**Recommend next steps:**
- Obvious follow-up tasks
- Related improvements identified
- Technical debt to address
- Next Phase 4 priority to tackle

## Token Budget Best Practices

**See `docs/ai/OPTIMIZATION_STRATEGY.md` for comprehensive guidelines**

**Quick tips:**
- Use Grep instead of Read for searching
- Read files in parallel when possible
- Avoid re-reading files to verify changes
- Load detailed docs only when needed
- Use agents judiciously (prefer direct tool use)

**Typical token budgets:**
- Quick fix: &lt;20k tokens
- Feature addition: &lt;50k tokens
- Major refactoring: &lt;100k tokens

## Common Workflows

### Adding a New Page

1. **Search for similar pages** (use Grep)
2. **Read design tokens** (`src/lib/design-tokens.ts`)
3. **Create page file** using PageLayout
4. **Generate metadata** using createPageMetadata
5. **Update sitemap** if dynamic route
6. **Add tests** for new page
7. **Run checks** (typecheck, lint, test, build)

### Fixing a Bug

1. **Reproduce the issue** (read error, check logs)
2. **Locate the source** (use Grep for error messages)
3. **Read relevant files** (only what you need to fix)
4. **Write failing test** (TDD approach)
5. **Implement fix** (minimal change)
6. **Verify fix** (run test, manual check)
7. **Run full test suite** (ensure no regressions)

### Refactoring Code

1. **Read current implementation**
2. **Identify patterns** (duplication, violations)
3. **Design new structure** (plan before changing)
4. **Run tests** (establish baseline)
5. **Make changes** (incremental, verify frequently)
6. **Update tests** (if behavior changed)
7. **Update docs** (JSDoc, architecture docs)
8. **Verify everything** (typecheck, lint, test, build)

## Anti-Patterns to Avoid

### Don't Over-Engineer

❌ **Wrong:**
```typescript
// Adding configuration for simple one-time use
const CONFIG = {
  BUTTON_VARIANTS: ['primary', 'secondary'],
  SIZES: ['sm', 'md', 'lg'],
  // ... extensive config for single use
};
```

✅ **Right:**
```typescript
// Direct implementation for current need
<Button variant="primary">Submit</Button>
```

### Don't Add Unnecessary Abstractions

❌ **Wrong:**
```typescript
// Creating helper for three lines of code used once
function getFormattedDate(date: Date) {
  return new Intl.DateTimeFormat('en-US').format(date);
}
```

✅ **Right:**
```typescript
// Inline where used once
new Intl.DateTimeFormat('en-US').format(date)
```

### Don't Preemptively Add Features

❌ **Wrong:**
```typescript
// Adding feature flags for hypothetical future use
if (featureFlags.darkMode && featureFlags.customThemes) {
  // ...
}
```

✅ **Right:**
```typescript
// Implement what's needed now
if (theme === 'dark') {
  // ...
}
```

### Don't Add Backward Compatibility Hacks

❌ **Wrong:**
```typescript
// Keeping unused exports "just in case"
export const oldFunction = newFunction;  // @deprecated
export type OldType = NewType;          // @deprecated
```

✅ **Right:**
```typescript
// Remove unused code completely
export { newFunction };
export type { NewType };
```

## Error Handling Guidelines

**Validate at boundaries:**
```typescript
// ✅ Validate user input
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.email || !body.message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // ...
}
```

**Trust internal code:**
```typescript
// ✅ No need to validate internal function params
function formatPost(post: Post) {
  // Trust that post is valid (TypeScript guarantees it)
  return post.title.toLowerCase();
}
```

**Handle external APIs:**
```typescript
// ✅ Wrap external calls in try/catch
try {
  const response = await fetch(externalAPI);
  const data = await response.json();
} catch (error) {
  logger.error('External API failed', error);
  return fallbackData;
}
```

## Final Reminders

- **Read todo.md before starting** each session
- **Use TodoWrite for multi-step tasks** consistently
- **Run tests after every change** to catch regressions early
- **Follow design system rules** strictly (see `docs/ai/DESIGN_SYSTEM.md`)
- **Update done.md with learnings** after completing work
- **Be token-conscious** (see `docs/ai/OPTIMIZATION_STRATEGY.md`)
- **Keep it simple** - don't over-engineer solutions

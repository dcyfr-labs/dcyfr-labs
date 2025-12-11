# Claude Code Integration Guide

This document provides guidance on integrating Claude Code into the dcyfr-labs project for optimal development quality and efficiency.

**Last Updated:** November 24, 2025

---

## Overview

Claude Code is configured as the primary AI development assistant for complex, multi-file refactoring and architectural work. It complements GitHub Copilot, which remains useful for inline suggestions and simple edits.

**Primary Instructions:** [`.github/claude-instructions.md`](../../.github/claude-instructions.md)

---

## Why Claude Code?

### Advantages Over Copilot

1. **Deep Codebase Understanding**
   - Analyzes entire project structure before making changes
   - Detects architectural patterns and maintains consistency
   - Identifies code duplication across multiple files
   - Maps dependencies and import relationships

2. **Complex Refactoring Capabilities**
   - Multi-file refactoring with automatic import updates
   - Component reorganization (Phase 4.1)
   - Code deduplication across 4+ files (Phase 4.2)
   - Library decomposition while maintaining APIs (Phase 4.4)

3. **Comprehensive Testing Integration**
   - Runs full test suite after changes
   - Identifies test failures and fixes them
   - Maintains test coverage standards
   - Creates new tests for new functionality

4. **Documentation Sync**
   - Updates documentation alongside code changes
   - Maintains todo.md and done.md consistency
   - Generates comprehensive session summaries
   - Creates architectural decision records

5. **Project Context Awareness**
   - Understands Phase 4 priorities from todo.md
   - Respects design system constraints
   - Follows established patterns automatically
   - Maintains backward compatibility

---

## When to Use Each Tool

### Use Claude Code For:

- ✅ **Phase 4 Refactoring Tasks**
  - Component directory reorganization (80 files)
  - Filter logic extraction (700+ lines duplication)
  - Library file decomposition (500+ line files)
  - Barrel export creation across features

- ✅ **Architectural Analysis**
  - Structural audits and code organization reviews
  - Circular dependency detection
  - Import pattern analysis
  - Code duplication identification

- ✅ **Complex Feature Implementation**
  - Features touching 5+ files
  - Security-critical changes (CSP, rate limiting)
  - Performance optimizations requiring measurement
  - New API routes with full validation

- ✅ **Investigation & Debugging**
  - Root cause analysis for complex bugs
  - Test failure diagnosis across multiple files
  - Performance bottleneck identification
  - Security vulnerability assessment

- ✅ **Documentation & Planning**
  - Architectural documentation updates
  - Session summary generation for done.md
  - Technical specification creation
  - Migration guide authoring

### Use GitHub Copilot For:

- ✅ **Inline Code Completion**
  - Function implementations
  - Type definitions
  - Simple component creation
  - JSDoc comments

- ✅ **Single-File Edits**
  - Bug fixes in one file
  - Adding new function to existing file
  - Updating component props
  - CSS/styling tweaks

- ✅ **Quick Suggestions**
  - Import statement completion
  - Variable naming
  - Boilerplate generation
  - Simple refactoring within one file

---

## Configuration

### MCP Servers

Claude Code has access to these Model Context Protocol servers (configured in `.vscode/mcp.json`):

```json
{
  "Memory": "Context preservation across sessions",
  "Thinking": "Complex planning and reasoning",
  "Context7": "Library documentation lookup",
  "Filesystem": "Blog content, docs, data files",
  "GitHub": "Repository operations, PR management",
  "Vercel": "Deployment status, preview URLs",
  "Sentry": "Error monitoring, issue tracking"
}
```

**Key Capabilities:**

- **Memory Server**: Remembers project context between sessions
- **Thinking Server**: Performs multi-step reasoning for complex tasks
- **Filesystem Server**: Direct access to blog posts, documentation, data files
- **GitHub Server**: Can check PR status, review code, manage issues
- **Vercel Server**: Monitor deployments, check preview URLs
- **Sentry Server**: Analyze error reports, track issue resolution

### VS Code Integration

Claude Code works seamlessly in VS Code through the native extension. Configuration is in `.vscode/mcp.json`.

**Recommended Extensions** (`.vscode/extensions.json`):

- `vitest.explorer` - Test runner integration
- `ms-playwright.playwright` - E2E test runner
- `usernamehw.errorlens` - Inline error display
- `dbaeumer.vscode-eslint` - Linting
- `esbenp.prettier-vscode` - Formatting

---

## Phase 4 Integration

Claude Code is specifically configured to handle Phase 4: Code Organization & Structural Improvements.

### Current Phase 4 Tasks

From [`docs/operations/todo.md`](../operations/todo.md):

1. **Phase 4.1**: Component directory reorganization (4-6 hours)
   - Move 80 components from root to feature-based directories
   - Update all import paths across codebase
   - Add barrel exports

2. **Phase 4.2**: Extract common filter logic (3-4 hours)
   - Eliminate 700+ lines of duplicated code
   - Create reusable filter composition system
   - Refactor 4 filter components

3. **Phase 4.3**: Add barrel exports (1-2 hours)
   - Create index.ts for all feature directories
   - Update imports to use barrel exports

4. **Phase 4.4**: Decompose large lib files (3-5 hours)
   - Split analytics.ts (558 lines) into subdirectory
   - Split metadata.ts (496 lines) into subdirectory
   - Maintain existing APIs

5. **Phase 4.5**: Consolidate error boundaries (1-2 hours)
   - Create base error boundary class
   - DRY error handling

6. **Phase 4.6**: Consolidate CSS files (30 minutes)
   - Move all CSS to src/styles/

7. **Phase 4.7**: Remove backup/disabled files (15 minutes)
   - Clean up source tree

### Example: Starting Phase 4.1 with Claude Code

**User Request:**
```
Start Phase 4.1: Component directory reorganization
```

**Claude Code Process:**

1. ✅ Reads `docs/operations/todo.md` to understand task
2. ✅ Analyzes current component structure (87 files)
3. ✅ Creates feature-based directory plan
4. ✅ Creates new directories (blog/, projects/, resume/, etc.)
5. ✅ Moves components to appropriate locations
6. ✅ Updates all import paths using Grep + Edit tools
7. ✅ Creates barrel exports (index.ts) for each directory
8. ✅ Runs TypeScript compilation to verify
9. ✅ Runs full test suite (verifies 94%+ pass rate)
10. ✅ Updates component documentation
11. ✅ Marks task complete in todo.md
12. ✅ Adds session summary to done.md with metrics

**Result:** Complete reorganization with zero breaking changes, all tests passing, documentation updated.

---

## Local CLI: Claude Code Requirements & Troubleshooting

If you use the `claude` CLI (for local agent runs like `claude /agents`) the CLI requires a stable Node LTS runtime. On macOS we recommend Node 20 (LTS) for compatibility. Node 25+ can cause runtime issues with some installed CLI bundles.

Quick steps to prepare environment (macOS / Homebrew):

1. Install Node 20 (keg-only):

```bash
brew install node@20
```

2. Add Node 20 to your PATH (idempotent):

```bash
# Add this to ~/.zshrc (only if you use zsh)
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
source ~/.zshrc
```

3. Reinstall the `claude` CLI using Node 20’s npm to ensure the package is built for the correct runtime:

```bash
# Optional: uninstall any previous global installation
npm uninstall -g @anthropic-ai/claude-code || true

# Use the Node 20 installation's npm
/opt/homebrew/opt/node@20/bin/npm install -g @anthropic-ai/claude-code
```

4. Confirm the CLI is functional:

```bash
claude --version
claude agents --help
```

Alternative approaches:

- Use a version manager (nvm, volta, asdf) and switch to Node 20 for the repository.
- If you prefer not to change PATH, run the CLI directly with Node 20:
   ```bash
   /opt/homebrew/opt/node@20/bin/node /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/cli.js --version
   ```

Troubleshooting:

- If the CLI throws a TypeError about `prototype` or crashes, it is usually a Node runtime mismatch. Use Node 20 as above.
- If the CLI fails after switching to Node 20, reinstall the package under that Node version.
- If you continue to see runtime errors after these updates, file a bug report with the `claude` CLI maintainers and include Node version, CLI version, and the stack trace.


---

## Best Practices

### Starting a Session

1. **Set Context**
   ```
   I'm working on Phase 4.1: component reorganization
   ```

2. **Claude Code Will:**
   - Read todo.md for current priorities
   - Analyze relevant code sections
   - Plan approach before making changes
   - Use TodoWrite tool to track progress

### During Implementation

1. **Trust the Process**
   - Claude Code explores thoroughly before acting
   - It will read multiple files to understand patterns
   - It runs tests automatically after changes
   - It validates against design system rules

2. **Provide Feedback**
   - If approach seems wrong, say so early
   - Ask for clarification on complex decisions
   - Request explanations for architectural choices

3. **Review Changes**
   - Claude Code will summarize what it did
   - Review import path updates
   - Verify test results
   - Check documentation updates

### Completing Work

1. **Validation Happens Automatically**
   - TypeScript compilation check
   - Test suite execution
   - Lint verification
   - Design token usage validation

2. **Documentation Updates**
   - todo.md marked complete
   - done.md updated with session summary
   - Component docs updated if needed
   - Architecture docs updated if patterns changed

3. **Clear Summary Provided**
   - What was accomplished
   - Files changed
   - Test results
   - Any deviations from plan
   - Recommended next steps

---

## Design System Enforcement

Claude Code automatically enforces design system rules from [`docs/design/ENFORCEMENT.md`](../design/ENFORCEMENT.md).

**Automatic Checks:**

- ❌ **Prohibits**: Hardcoded spacing (space-y-6, gap-5, p-7)
- ❌ **Prohibits**: Inline typography (text-xl font-semibold)
- ❌ **Prohibits**: Hardcoded colors (bg-white, text-gray-600)
- ❌ **Prohibits**: Component duplication
- ✅ **Requires**: SPACING tokens from design-tokens.ts
- ✅ **Requires**: TYPOGRAPHY tokens from design-tokens.ts
- ✅ **Requires**: Semantic color variables (bg-card, text-foreground)
- ✅ **Requires**: Existing layout components (PageLayout, PageHero)

**Example Enforcement:**

```typescript
// ❌ Claude Code will reject this:
<div className="space-y-6">
  <h1 className="text-3xl font-bold">Title</h1>
</div>

// ✅ Claude Code will suggest this:
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

<div className={SPACING.content}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
</div>
```

---

## Testing Integration

Claude Code maintains test quality standards automatically.

**Current Test Status:**
- 986/1049 tests passing (94.0% pass rate)
- 198 integration tests (100% pass rate)
- Coverage targets: 80%+ for critical paths

**Automatic Test Workflow:**

1. **Before Making Changes**
   - Identifies existing test files
   - Reads relevant test coverage

2. **During Implementation**
   - Runs affected tests after each change
   - Fixes test failures immediately
   - Adds new tests for new functionality

3. **After Completion**
   - Runs full test suite
   - Verifies pass rate ≥94%
   - Reports any failures with diagnosis

**Test Commands:**
```bash
npm run test              # Unit tests
npm run test:coverage     # Coverage report
npm run test:integration  # Integration tests
npm run test:e2e         # E2E tests
npm run check            # Lint + typecheck
```

---

## Performance Budgets

Claude Code respects performance budgets from Lighthouse CI:

- Lighthouse Performance ≥ 90%
- Lighthouse Accessibility ≥ 95%
- First Load JS < 150 kB
- Main bundle < 100 kB
- Page bundles < 50 kB

**Automatic Checks:**
- Warns if changes increase bundle size significantly
- Suggests code splitting for large imports
- Recommends dynamic imports for heavy components
- Verifies image optimization

---

## Common Workflows

### 1. Component Reorganization

**Request:**
```
Move blog components to organized structure
```

**Claude Code:**
- Creates components/blog/ directory
- Moves 14 blog-related components
- Updates all imports across codebase
- Creates barrel export (index.ts)
- Runs tests
- Updates documentation

### 2. Code Deduplication

**Request:**
```
Extract common filter logic from duplicated components
```

**Claude Code:**
- Analyzes all 4 filter components
- Identifies 90%+ duplication
- Designs composable filter system
- Creates components/common/filters/
- Extracts shared logic
- Refactors all 4 components
- Verifies functionality maintained
- Removes duplicated code
- Updates tests

### 3. Library Decomposition

**Request:**
```
Split lib/analytics.ts into logical modules
```

**Claude Code:**
- Analyzes 558 lines, 22 exports
- Groups functions by responsibility
- Creates lib/analytics/ subdirectory
- Splits into fetching, aggregations, transformations
- Maintains existing API via barrel export
- Updates all imports
- Runs tests
- Updates JSDoc

### 4. Debugging Complex Issue

**Request:**
```
Why are integration tests failing in CI but passing locally?
```

**Claude Code:**
- Reads test files
- Analyzes CI workflow
- Checks environment differences
- Reviews test setup/teardown
- Identifies timing issues or env vars
- Proposes fix
- Verifies in both environments

---

## Troubleshooting

### Claude Code Not Responding as Expected

**Issue**: Claude Code makes changes without understanding context

**Solution**:
1. Be more specific: "Read todo.md first, then start Phase 4.1"
2. Ask for plan: "What's your approach before we start?"
3. Request exploration: "Analyze the codebase structure first"

### Changes Breaking Tests

**Issue**: Tests fail after Claude Code refactoring

**Solution**:
- Claude Code automatically reruns tests and fixes them
- If it doesn't, point it out: "Tests are failing, please fix"
- It will diagnose failures and correct the issue

### Import Paths Not Updated

**Issue**: Some import paths missed during refactoring

**Solution**:
- Claude Code uses comprehensive Grep to find all imports
- If some are missed, ask: "Search for any remaining old imports"
- It will find and update them

### Documentation Out of Sync

**Issue**: Code changed but docs not updated

**Solution**:
- Remind Claude Code: "Update the documentation to reflect these changes"
- It will update relevant docs, JSDoc, and todo.md/done.md

---

## Comparison with Copilot

| Feature | Claude Code | GitHub Copilot |
|---------|-------------|----------------|
| **Multi-file refactoring** | ✅ Excellent | ❌ Limited |
| **Architectural analysis** | ✅ Deep understanding | ❌ Surface level |
| **Test integration** | ✅ Automatic | ⚠️ Manual |
| **Documentation sync** | ✅ Automatic | ❌ Manual |
| **Design system enforcement** | ✅ Automatic | ❌ No enforcement |
| **Code duplication detection** | ✅ Cross-file | ❌ Single file |
| **Import path updates** | ✅ Automatic | ❌ Manual |
| **Context window** | 200K tokens | ~8K tokens |
| **Planning capability** | ✅ Multi-step | ❌ Single step |
| **Inline suggestions** | ⚠️ Available | ✅ Excellent |
| **Quick completions** | ⚠️ Slower | ✅ Fast |

**Recommendation**: Use both tools complementarily
- **Claude Code**: Complex tasks, refactoring, Phase 4 work
- **Copilot**: Quick edits, inline suggestions, boilerplate

---

## Next Steps

1. **Familiarize with Instructions**
   - Read [`.github/claude-instructions.md`](../../.github/claude-instructions.md)
   - Review Phase 4 tasks in [`docs/operations/todo.md`](../operations/todo.md)

2. **Start with Phase 4.1**
   - Component reorganization is highest priority
   - Clear scope: move 80 components to feature directories
   - Measurable outcome: better organization, all tests passing

3. **Build Confidence**
   - Start with smaller Phase 4 tasks (4.6, 4.7)
   - Progress to more complex tasks (4.1, 4.2)
   - Review results and adjust approach

4. **Provide Feedback**
   - Note what works well
   - Identify areas for improvement
   - Update claude-instructions.md as needed

---

## Resources

- **Primary Instructions**: [`.github/claude-instructions.md`](../../.github/claude-instructions.md)
- **Current Priorities**: [`docs/operations/todo.md`](../operations/todo.md)
- **Completed Work**: [`docs/operations/done.md`](../operations/done.md)
- **Design System**: [`docs/design/ENFORCEMENT.md`](../design/ENFORCEMENT.md)
- **Architecture**: [`docs/architecture/`](../architecture/)
- **Testing Guide**: [`docs/testing/`](../testing/)

---

**Last Updated:** November 24, 2025
**Status:** Claude Code integration complete, ready for Phase 4 refactoring

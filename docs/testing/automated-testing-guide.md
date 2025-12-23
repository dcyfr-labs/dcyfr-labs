# Automated Testing Guide for AI Agents

**Last Updated:** December 23, 2025

## Problem

Vitest runs in **watch mode** by default, which hangs waiting for file changes and requires CTRL+C to exit. This blocks automated workflows in AI agent conversations.

## Solution

Use the `--run` flag to make tests exit after completion.

---

## Quick Reference for Copilot Chats

### ❌ DON'T Use (Watch Mode)

```bash
# These hang and wait for user input:
npm test
npm test some-test.test.ts
vitest
```

### ✅ DO Use (Run Once & Exit)

```bash
# Run all tests once:
npm run test:run

# Run specific test file:
npm run test:run unified-search.test.ts

# Or use vitest directly:
vitest run unified-search.test.ts

# Run with coverage:
npm run test:coverage
```

---

## Available Test Scripts

| Command | Behavior | Use Case |
|---------|----------|----------|
| `npm test` | ❌ **Watch mode** (hangs) | Local development only |
| `npm run test:run` | ✅ **Runs once** | Automated workflows, AI agents |
| `npm run test:unit` | ✅ **Runs once** | Unit tests only |
| `npm run test:integration` | ✅ **Runs once** | Integration tests only |
| `npm run test:coverage` | ✅ **Runs once** | With coverage report |
| `npm run test:watch` | ❌ **Watch mode** (hangs) | Local development only |
| `npm run test:ci` | ✅ **Runs once** | CI/CD pipelines |

---

## For AI Agents (Copilot, Claude, etc.)

### Testing New Features

```bash
# Test specific file (recommended)
vitest run path/to/test-file.test.ts

# Or with npm script
npm run test:run path/to/test-file.test.ts
```

### Full Test Suite

```bash
# All tests
npm run test:run

# With coverage
npm run test:coverage

# CI mode (tests + e2e)
npm run test:ci
```

### Viewing Results

```bash
# Get summary only
npm run test:run 2>&1 | grep -E "(Test Files|Tests)"

# See failures
npm run test:run 2>&1 | grep -A 10 "FAIL"

# Count passing tests
npm run test:run 2>&1 | grep "✓" | wc -l
```

---

## Terminal Command Best Practices

### Pattern for Test Execution

```bash
# ✅ Correct pattern for agents:
vitest run <test-file> 2>&1 | <processing>

# Examples:
vitest run unified-search.test.ts 2>&1 | tail -20
vitest run unified-search.test.ts 2>&1 | grep "Test Files"
npm run test:run 2>&1 | head -50
```

### Pattern for Interactive Commands

For commands that require interaction, set `isBackground: false` but ensure they exit:

```typescript
run_in_terminal({
  command: "vitest run test-file.test.ts 2>&1 | tail -30",
  explanation: "Run tests and show last 30 lines",
  isBackground: false  // Will wait for completion
});
```

---

## Vitest Configuration

The project uses two Vitest configs:

1. **Default** (`vitest.config.ts`) - For app tests
2. **Scripts** (`vitest.scripts.config.ts`) - For script tests

Both support `--run` flag for one-time execution.

---

## Common Pitfalls

### ❌ Pitfall 1: Using base `npm test`

```bash
# This will hang:
npm test unified-search.test.ts
```

**Solution:**
```bash
# Use test:run instead:
npm run test:run unified-search.test.ts
```

### ❌ Pitfall 2: Using `vitest` without `run`

```bash
# This will hang:
vitest unified-search.test.ts
```

**Solution:**
```bash
# Add 'run' flag:
vitest run unified-search.test.ts
```

### ❌ Pitfall 3: Forgetting to pipe output

```bash
# This returns too much output:
vitest run all-tests.test.ts
```

**Solution:**
```bash
# Pipe to filter:
vitest run all-tests.test.ts 2>&1 | tail -50
vitest run all-tests.test.ts 2>&1 | grep "FAIL"
```

---

## CI/CD Configuration

For GitHub Actions and automated workflows, always use run mode:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:run

- name: Run tests with coverage
  run: npm run test:coverage
```

---

## Summary

**For Automated Workflows (AI Agents, CI/CD):**
- ✅ Use `vitest run` or `npm run test:run`
- ✅ Pipe output to filter results
- ✅ Use specific test file paths when possible

**For Local Development:**
- Use `npm test` or `vitest` (watch mode)
- Use `npm run test:watch` for explicit watch mode
- Use `npm run test:ui` for UI-based testing

---

## Related Documentation

- [Testing Patterns](../ai/TESTING_PATTERNS.md)
- [CI/CD Documentation](../operations/ci-cd.md)
- [Vitest Documentation](https://vitest.dev/)

---

**Need Help?** If tests hang in an agent conversation, press CTRL+C and use `vitest run` instead of `vitest`.

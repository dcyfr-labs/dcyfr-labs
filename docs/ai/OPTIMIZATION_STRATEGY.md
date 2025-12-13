# Claude Code Token Optimization Strategy

## Context Window Management

**Limits** (from [Claude Support](https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits)):
- Context window: 200,000 tokens (~680k characters, ~150k words)
- Conversations accumulate tokens over time
- Each file read, agent spawn, and tool use adds to context

**Current Usage**:
- CLAUDE.md: ~3,500 tokens (auto-loaded every conversation)
- Additional context from file reads, tool outputs, conversation history

## Tiered Documentation Approach

### Tier 1: Auto-Loaded (CLAUDE.md - Target: \<1,500 tokens)

**Essential quick reference only:**
- Project type and stack (1-2 sentences)
- Current phase/priorities (bullet list)
- Critical patterns (layout components, metadata helpers)
- Design system rules (condensed checklist)
- Key constraints (bullet list)
- Where to find detailed docs (links only)

**What to REMOVE from CLAUDE.md:**
- Detailed code examples (move to `/docs/design/`)
- Comprehensive Phase 4 workflows (move to `/docs/operations/`)
- Extensive feature descriptions (move to `/docs/features/`)
- Best practices sections (move to `/docs/ai/`)
- Example workflows (move to phase-specific docs)

### Tier 2: On-Demand Detailed Guides (<5,000 tokens each)

**Load only when needed:**

- `docs/ai/BEST_PRACTICES.md` - Claude Code workflow best practices
- `docs/ai/DESIGN_SYSTEM.md` - Complete design system validation
- `docs/operations/PHASE_4_GUIDE.md` - Comprehensive Phase 4 workflows
- `docs/architecture/PATTERNS.md` - Architectural patterns and examples

### Tier 3: Domain-Specific Documentation

**Already well-organized:**
- `/docs/design/ENFORCEMENT.md` - Design token enforcement
- `/docs/testing/` - Test infrastructure
- `/docs/features/` - Feature-specific guides
- `/docs/security/` - Security patterns

## Smart Context Loading Guidelines

### When to Use Each Tool

**Grep (preferred for search):**
- ✅ Finding specific patterns across files
- ✅ Locating function/component definitions
- ✅ Checking for design token usage violations
- ❌ Don't: Read entire files when you only need to search

**Read (use strategically):**
- ✅ Reading specific files you need to edit
- ✅ Understanding implementation details
- ✅ Use with offset/limit for large files (>500 lines)
- ❌ Don't: Read files speculatively "just in case"

**Task/Explore Agent (use judiciously):**
- ✅ Complex codebase exploration (multi-file analysis)
- ✅ When multiple search attempts would exceed agent cost
- ✅ Architectural analysis across many files
- ❌ Don't: Use for simple file searches (use Glob/Grep directly)

### Context-Conscious Workflow

**Before starting:**
1. Check CLAUDE.md for quick reference
2. Only load detailed docs if needed for current task
3. Use Grep to locate files before reading

**During implementation:**
1. Read only files you'll modify
2. Use Grep for verification instead of reading
3. Avoid reading test files unless debugging tests

**Completing work:**
1. Don't re-read files to verify (trust tool outputs)
2. Use TypeScript/lint errors to guide fixes
3. Only run tests once after all changes

## Token Budget Best Practices

### For Short Tasks (Quick fixes, single file edits)

**Target: <20k tokens total**
- Minimal file reading (1-3 files max)
- No agent spawning
- Direct edits based on error messages

### For Medium Tasks (Feature additions, multi-file changes)

**Target: <50k tokens total**
- Strategic file reading (5-10 files)
- Use Grep to locate before reading
- One agent spawn if needed for exploration

### For Large Tasks (Phase 4 refactoring, architectural changes)

**Target: <100k tokens total**
- Plan before reading (identify exact files needed)
- Use agents for complex exploration
- Load detailed docs only for relevant domains
- Consider breaking into multiple sessions if >100k

## Optimization Techniques

### 1. Lazy Loading Documentation

```markdown
Instead of: [Including full examples in CLAUDE.md]
Use: "See docs/design/ENFORCEMENT.md for detailed examples"
```

### 2. Reference Don't Duplicate

```markdown
Instead of: [Repeating same pattern in multiple docs]
Use: [Single source of truth + links]
```

### 3. Smart File Reading

```markdown
# ❌ Inefficient
Read entire file → Search for pattern → Read related files

# ✅ Efficient
Grep for pattern → Read only matched files → Make targeted changes
```

### 4. Batch Operations

```markdown
# ❌ Inefficient
Read file 1 → Edit → Read file 2 → Edit → Read file 3 → Edit

# ✅ Efficient
Grep to locate all files → Read all in parallel → Edit all → Verify once
```

## Monitoring Token Usage

**Signs you're using too many tokens:**
- Reading same file multiple times
- Spawning multiple agents sequentially
- Re-reading files to verify changes
- Loading entire docs when only need a reference
- Exploratory reading without clear purpose

**Recovery strategies:**
- Start fresh session for new tasks
- Use Grep instead of Read for verification
- Trust tool outputs and error messages
- Reference docs by link rather than loading

## CLAUDE.md Size Target

**Current**: 560 lines, ~3,500 tokens
**Target**: 200 lines, ~1,500 tokens (57% reduction)

**Move to separate docs:**
- Phase 4 detailed workflows → `docs/operations/PHASE_4_GUIDE.md`
- Best practices sections → `docs/ai/BEST_PRACTICES.md`
- Design system validation → `docs/ai/DESIGN_SYSTEM.md`
- Example workflows → Phase-specific docs
- CI/CD details → `docs/platform/CI_CD.md`

## Implementation Plan

1. **Create new documentation structure**
   - `docs/ai/BEST_PRACTICES.md`
   - `docs/ai/DESIGN_SYSTEM.md`
   - `docs/operations/PHASE_4_GUIDE.md`

2. **Slim down CLAUDE.md**
   - Keep only essential quick reference
   - Replace detailed sections with links
   - Maintain critical patterns and constraints

3. **Add context-loading guidelines**
   - Document when to load detailed guides
   - Provide token budget estimates
   - Include optimization examples

4. **Update existing docs**
   - Add token estimates to large docs
   - Cross-reference related docs
   - Eliminate duplication

## Expected Outcomes

- **57% reduction** in auto-loaded tokens (3,500 → 1,500)
- **Faster session starts** (less context to process)
- **More room for implementation** (preserve tokens for actual work)
- **Scalable guidance** (can add detailed docs without bloating CLAUDE.md)
- **Better organization** (clear separation: quick ref vs deep dive)

## Next Steps

1. Create detailed guide files
2. Refactor CLAUDE.md to slim version
3. Test token usage in typical workflows
4. Document actual token costs for common operations
5. Iterate based on real usage patterns

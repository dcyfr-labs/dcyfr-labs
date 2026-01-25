{/* TLP:CLEAR */}

# Agent Documentation Enforcement Policy

**Version:** 1.0.0  
**Date:** January 14, 2026  
**Purpose:** Ensure all AI agents (Claude Code, GitHub Copilot, OpenCode) ONLY generate documentation in the `docs/` folder structure

---

## 🎯 Core Rule

**ALL DOCUMENTATION MUST BE IN `/docs` FOLDER**

```
✅ ALLOWED PATHS:
docs/README.md
docs/ai/COMPONENT_PATTERNS.md
docs/architecture/ADR-001.md
docs/operations/private/STATUS.md
docs/security/private/FINDINGS.md

❌ NOT ALLOWED PATHS:
CONTRIBUTING.md (should be docs/CONTRIBUTING.md)
API_REFERENCE.md (should be docs/api/REFERENCE.md)
ANALYSIS.md (should be docs/analysis/ANALYSIS.md)
./README.md (root level)
TROUBLESHOOTING.md (should be docs/troubleshooting/GUIDE.md)
CI_CD_REPORT.md (should be docs/automation/private/CI_CD_REPORT.md)
FAILURE_ANALYSIS_72HR.md (should be docs/analysis/private/FAILURES.md)
```

---

## 📋 Enforcement Mechanisms

### 1. Pre-Commit Hook Enhancement

**File:** `.husky/pre-commit`

Added check to prevent root-level or non-docs documentation:

```bash
# Check 10: Documentation location validation
echo -n "  Checking documentation placement... "
ROOT_DOCS=$(git diff --cached --name-only 2>/dev/null | grep -E "^[A-Z_].*\.(md|txt)$" | grep -v "^(README|CONTRIBUTING|CHANGELOG|LICENSE|SECURITY)" || true)

if [ -n "$ROOT_DOCS" ]; then
  echo -e "${RED}FAIL${NC}"
  echo -e "${RED}❌ ERROR: Documentation files found outside /docs folder${NC}"
  echo "   Move to appropriate /docs subdirectory:"
  echo "$ROOT_DOCS" | sed 's/^/      /'
  ERRORS=$((ERRORS+1))
else
  echo -e "${GREEN}PASS${NC}"
fi
```

### 2. Agent Instructions (Claude Code, Copilot, OpenCode)

**Added to all agent instruction files:**

```
## 📁 Documentation Location Rule (MANDATORY)

**ALL documentation must be created in the `/docs` folder.**

✅ REQUIRED:
- docs/README.md
- docs/[category]/FILENAME.md
- docs/[category]/private/SENSITIVE.md

❌ FORBIDDEN:
- Root-level .md files (except LICENSE, CONTRIBUTING, CHANGELOG)
- AI-generated .md files outside docs/
- Analysis/reports outside docs/

If you need to create documentation:
1. Determine the category (architecture, api, analysis, operations, etc.)
2. Create in docs/[category]/[filename].md
3. If sensitive, use docs/[category]/private/[filename].md
4. Update docs/README.md index if needed

Violation = Commit rejection + enforcement action
```

### 3. CI/CD Validation Workflow

**File:** `.github/workflows/documentation-enforcement.yml`

```yaml
name: Documentation Enforcement

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, preview]

jobs:
  check-doc-placement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check documentation placement
        run: |
          # Find all markdown/doc files NOT in docs/ folder
          ROOT_DOCS=$(find . -maxdepth 1 -type f \
            -name "*.md" \
            ! -name "README.md" \
            ! -name "CONTRIBUTING.md" \
            ! -name "CHANGELOG.md" \
            ! -name "LICENSE.md" \
            2>/dev/null)
          
          if [ -n "$ROOT_DOCS" ]; then
            echo "❌ Documentation files found outside /docs:"
            echo "$ROOT_DOCS" | sed 's/^/  /'
            echo ""
            echo "📋 Guidelines:"
            echo "  1. Move all .md files to docs/ folder"
            echo "  2. Organize by category: docs/[category]/FILENAME.md"
            echo "  3. Sensitive docs: docs/[category]/private/FILENAME.md"
            echo ""
            echo "See docs/governance/AGENT_DOCUMENTATION_ENFORCEMENT.md"
            exit 1
          fi

      - name: Validate docs structure
        run: |
          # Validate all docs follow naming conventions
          node scripts/ci/validate-docs-structure.mjs

      - name: Comment on PR if violations found
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `❌ **Documentation Placement Violation**

All documentation must be in the \`docs/\` folder.

**Found files outside docs/:**
See check logs for details.

**Resolution:**
1. Move .md files to appropriate \`docs/[category]/\` subdirectory
2. If sensitive, use \`docs/[category]/private/\` subfolder
3. Update docs/README.md if adding new section
4. Push fixes and re-run check

**Reference:** [Agent Documentation Enforcement Policy](docs/governance/AGENT_DOCUMENTATION_ENFORCEMENT.md)`
            })
```

### 4. Documentation Structure Validation Script

**File:** `scripts/ci/validate-docs-structure.mjs`

```javascript
#!/usr/bin/env node

/**
 * Validates that all documentation is properly placed in docs/ folder
 * Enforces naming conventions and structure requirements
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../../');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

// Allowed root-level markdown files (exceptions)
const ALLOWED_ROOT_DOCS = [
  'README.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'LICENSE.md',
  'SECURITY.md'
];

// Valid documentation categories
const VALID_CATEGORIES = [
  'ai',
  'api',
  'architecture',
  'automation',
  'components',
  'design-system',
  'governance',
  'operations',
  'security',
  'templates',
  'testing',
  'troubleshooting',
  'analysis',
  'research'
];

async function main() {
  console.log('📋 Validating documentation structure...\n');

  let violations = 0;

  // Check 1: No markdown files in root (except allowed)
  console.log('✓ Check 1: Root-level documentation placement');
  const rootFiles = await fs.readdir(PROJECT_ROOT);
  for (const file of rootFiles) {
    if (file.endsWith('.md') && !ALLOWED_ROOT_DOCS.includes(file)) {
      console.error(`  ❌ Found disallowed root doc: ${file}`);
      console.error(`     Move to: docs/[category]/${file}`);
      violations++;
    }
  }
  if (violations === 0) console.log('  ✅ No violations found\n');

  // Check 2: Validate docs/ structure
  console.log('✓ Check 2: Documentation category structure');
  const docsEntries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
  for (const entry of docsEntries) {
    if (entry.isDirectory()) {
      const category = entry.name;
      
      // Skip private and archive folders
      if (category === 'private' || category === 'archive') continue;
      
      if (!VALID_CATEGORIES.includes(category) && category !== 'README.md') {
        console.error(`  ❌ Unknown category: docs/${category}/`);
        console.error(`     Valid categories: ${VALID_CATEGORIES.join(', ')}`);
        violations++;
      }
    }
  }
  if (violations === 0) console.log('  ✅ All categories valid\n');

  // Check 3: Validate private subfolder structure
  console.log('✓ Check 3: Private documentation placement');
  for (const category of VALID_CATEGORIES) {
    const categoryPath = path.join(DOCS_DIR, category);
    const privateDir = path.join(categoryPath, 'private');
    
    if (fs.existsSync(privateDir)) {
      const privateFiles = await fs.readdir(privateDir);
      // Just validate it exists and is readable
      console.log(`  ✅ ${category}/private/ - ${privateFiles.length} files`);
    }
  }
  console.log('');

  // Check 4: Report summary
  if (violations > 0) {
    console.error(`\n❌ Found ${violations} structural violation(s)`);
    console.error('\nResolution:');
    console.error('  1. Move all .md files to docs/ folder');
    console.error('  2. Use appropriate category subfolder');
    console.error('  3. Sensitive docs → docs/[category]/private/');
    console.error('  4. Run again to verify');
    process.exit(1);
  } else {
    console.log('✅ All documentation properly placed in docs/ folder\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('❌ Validation error:', err.message);
  process.exit(1);
});
```

### 5. Agent Instruction Updates

**For Claude Code** (`.claude/agents/DCYFR.md`):

```markdown
## 📁 Documentation Rule (MANDATORY)

**ALL documentation must go in `/docs` folder.**

When creating documentation:
- Determine category: ai, api, architecture, operations, security, analysis, etc.
- Create in: `docs/[category]/FILENAME.md`
- If sensitive: `docs/[category]/private/FILENAME.md`

❌ NEVER create:
- Root-level .md files (analysis.md, report.md, etc.)
- Documentation outside /docs folder
- Unstructured docs without category

✅ ALWAYS:
- Put docs in appropriate /docs subfolder
- Use private/ subfolder for sensitive content
- Update docs/README.md index
```

**For GitHub Copilot** (`.github/copilot-instructions.md`):

```markdown
## 📁 Documentation Placement

**Documentation goes in `/docs` folder only.**

Quick patterns:
- Analysis → `docs/analysis/[name].md`
- Reports → `docs/[category]/private/[name].md`
- Guides → `docs/[category]/[name].md`
- Sensitive → Always use `private/` subfolder

Never create docs in root directory.
```

**For OpenCode** (`.opencode/DCYFR.opencode.md`):

```markdown
## 📁 Documentation Location Rule

All documentation must be in `/docs` folder structure.

✅ Correct:
- docs/analysis/REPORT.md
- docs/security/private/FINDINGS.md

❌ Incorrect:
- ANALYSIS.md (root)
- ./report.md (root)
- REPORT_2026.md (root)

When creating docs:
1. Choose category (analysis, security, architecture, etc.)
2. Create in docs/[category]/
3. If sensitive, use docs/[category]/private/
```

---

## 📊 Enforcement Summary

| Layer | Mechanism | Timing | Action |
|-------|-----------|--------|--------|
| **Pre-Commit** | Husky hook | Before commit | Reject commit |
| **Instruction** | Agent guidelines | During generation | Prevent violation |
| **CI/CD** | GitHub Actions | On PR/push | Block merge + comment |
| **Script** | Validation tool | Manual/CI | Report violations |
| **Documentation** | This policy | Always | Reference standard |

---

## 🚀 Implementation Checklist

- [ ] Update `.husky/pre-commit` with Check 10 (root doc validation)
- [ ] Create `.github/workflows/documentation-enforcement.yml`
- [ ] Create `scripts/ci/validate-docs-structure.mjs`
- [ ] Update `.claude/agents/DCYFR.md` with documentation rule
- [ ] Update `.github/copilot-instructions.md` with documentation rule
- [ ] Update `.opencode/DCYFR.opencode.md` with documentation rule
- [ ] Add to docs/governance/AGENT_DOCUMENTATION_ENFORCEMENT.md
- [ ] Test enforcement: create test .md file in root, verify rejection
- [ ] Update all agent prompts to reference this policy
- [ ] Add to onboarding/training materials

---

## ✅ Verification Steps

### Test 1: Pre-Commit Hook
```bash
# Create test file in root
echo "# Test Doc" > TEST_DOC.md

# Try to commit
git add TEST_DOC.md
git commit -m "test: doc placement" 

# Should see: ❌ ERROR: Documentation files found outside /docs folder
# Should reject commit

# Clean up
rm TEST_DOC.md
git reset HEAD TEST_DOC.md
```

### Test 2: CI/CD Validation
```bash
# Push a PR with root .md file
# Should see GitHub Actions workflow failure
# Should see comment on PR about placement violation
```

### Test 3: Agent Compliance
```bash
# Ask Claude Code to create documentation
# Should create in docs/[category]/
# Should never create in root
```

---

## 📝 Future Enhancements

1. **Automatic folder creation**
   - Script auto-creates appropriate folder if missing
   - Suggests correct location to agent

2. **AI-aware validation**
   - Detect when agents generate docs outside /docs
   - Auto-move with explanation PR comment

3. **Documentation indexing**
   - Auto-update docs/README.md
   - Generate navigation based on structure

4. **Format validation**
   - Ensure proper markdown frontmatter
   - Validate headers and structure

---

## 📚 Related Documentation

- [DOCS_GOVERNANCE.md](./DOCS_GOVERNANCE.md) - Full documentation policy
- [AGENTS.md](../../AGENTS.md) - AI agent selection guide
- [.claude/agents/DCYFR.md](./.claude/agents/DCYFR.md) - Claude Code instructions
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Copilot instructions

---

**Status:** Active Enforcement Policy  
**Last Updated:** January 14, 2026  
**Enforcement Level:** MANDATORY (blocks commits & PRs)


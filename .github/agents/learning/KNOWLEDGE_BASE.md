# Knowledge Base & Cross-Session Memory

**Purpose:** Maintain accumulated wisdom from past sessions, enable agents to learn from history, transfer knowledge between instances
**Last Updated:** December 10, 2025
**Target Audience:** AI agents, developers, team leads

---

## 🧠 What is the Knowledge Base?

The knowledge base is the **persistent memory of the DCYFR system**.

It contains:
- **Design Patterns** - Proven approaches for common decisions
- **Common Mistakes** - Anti-patterns and what to do instead
- **Optimizations** - Techniques that reduce cost/time/complexity
- **Metadata** - Confidence scores, validation history, evolution tracking

**Key Difference from Learnings:**
- **Learnings** = Raw observations from sessions (in learnings.json)
- **Knowledge** = Validated, structured, high-confidence information (in knowledge-base.json)

When a learning becomes confident and useful, it graduates to the knowledge base.

---

## 📊 Knowledge Base Structure

### 1. Design Patterns

Proven architectural and design approaches.

```json
{
  "knowledgeBase": {
    "designPatterns": {
      "layoutSelection": {
        "rule": "90% of pages use PageLayout",
        "description": "PageLayout is the default for standard pages. ArticleLayout for blog posts, ArchiveLayout for collections.",
        "confidence": 0.92,
        "evidenceBased": true,
        "instances": 42,
        "exceptions": [
          {
            "rule": "ArticleLayout for blog posts",
            "reason": "Blog posts have unique metadata and styling",
            "examples": ["src/app/blog/[slug]/page.tsx"]
          },
          {
            "rule": "ArchiveLayout for filterable lists",
            "reason": "Archive pages need filtering UI",
            "examples": ["src/app/blog/page.tsx", "src/app/work/page.tsx"]
          }
        ],
        "lastValidated": "2025-12-10",
        "applicableTo": ["page.tsx", "app router"]
      },

      "componentImports": {
        "rule": "Always use barrel exports, never relative imports",
        "description": "Import components from @/components/domain, never direct from files",
        "confidence": 0.95,
        "evidenceBased": true,
        "instances": 156,
        "exceptions": "None identified",
        "autoFixable": true,
        "examples": {
          "correct": "import { PostCard } from '@/components/blog';",
          "incorrect": "import PostCard from '../../components/blog/post-card';"
        },
        "enforcedBy": ["ESLint", "TypeScript imports rule"],
        "lastValidated": "2025-12-10"
      },

      "designTokens": {
        "rule": "All styling must use design tokens from @/lib/design-tokens",
        "description": "Never hardcode spacing, colors, or typography. Always import from centralized token library.",
        "confidence": 0.98,
        "evidenceBased": true,
        "instances": 423,
        "categories": [
          {
            "name": "SPACING",
            "tokens": ["xs", "sm", "md", "lg", "xl", "content", "section"],
            "usage": "Margins, padding, gaps",
            "importance": "critical"
          },
          {
            "name": "TYPOGRAPHY",
            "tokens": ["h1", "h2", "h3", "body", "caption"],
            "usage": "Font size, weight, line-height",
            "importance": "critical"
          },
          {
            "name": "CONTAINER_WIDTHS",
            "tokens": ["narrow", "standard", "wide", "full"],
            "usage": "Page/section widths",
            "importance": "critical"
          }
        ],
        "enforcedBy": ["ESLint design-tokens plugin", "Pre-commit checks"],
        "complianceScore": 0.94,
        "lastValidated": "2025-12-10"
      },

      "apiPattern": {
        "rule": "All API routes follow Validate→Queue→Respond pattern",
        "description": "API endpoint receives request, validates data, queues async job (Inngest), returns immediately",
        "confidence": 0.89,
        "evidenceBased": true,
        "instances": 12,
        "steps": [
          {
            "step": 1,
            "name": "Validate",
            "description": "Parse and validate request data",
            "example": "const data = await request.json(); validateData(data);"
          },
          {
            "step": 2,
            "name": "Queue",
            "description": "Send async job to Inngest",
            "example": "await inngest.send({ name: 'event/name', data });"
          },
          {
            "step": 3,
            "name": "Respond",
            "description": "Return success immediately",
            "example": "return NextResponse.json({ success: true });"
          }
        ],
        "benefits": ["Fast response times", "Scalable processing", "Reliable delivery"],
        "lastValidated": "2025-12-10"
      }
    }
  }
}
```

### 2. Common Mistakes

Anti-patterns to avoid.

```json
{
  "commonMistakes": [
    {
      "id": "mistake-hardcoded-spacing",
      "title": "Hardcoding Spacing Values",
      "description": "Using class names like 'mt-8', 'gap-4', 'p-6' instead of design tokens",
      "severity": "high",
      "frequency": 12,
      "lastSeen": "2025-12-09",
      "wrongWay": "className=\"mt-8 mb-4 gap-6\"",
      "rightWay": "className={`mt-${SPACING.lg} mb-${SPACING.md} gap-${SPACING.content}`}",
      "whyItMatters": "Design system consistency, centralized updates",
      "autoFixable": true,
      "fixScript": "scripts/auto-fix-spacing-tokens.mjs",
      "enforcedBy": ["ESLint", "Pre-commit checks"]
    },

    {
      "id": "mistake-logging-credentials",
      "title": "Logging Credentials or API Keys",
      "description": "Logging sensitive data (API keys, passwords, tokens) in clear text",
      "severity": "critical",
      "frequency": 8,
      "lastSeen": "2025-12-08",
      "wrongWay": "console.log('API Key:', credentials.apiKey);",
      "rightWay": "console.log('API Key:', maskCredential(credentials.apiKey));",
      "whyItMatters": "Security vulnerability, credential exposure",
      "autoFixable": true,
      "fixScript": "scripts/security/mask-credentials.mjs",
      "enforcedBy": ["Pre-commit hooks", "Security audit"],
      "affectedFiles": ["src/__tests__/api/**"]
    },

    {
      "id": "mistake-relative-imports",
      "title": "Using Relative Imports Instead of @ Alias",
      "description": "Importing with '../../../' instead of '@/' alias",
      "severity": "medium",
      "frequency": 15,
      "lastSeen": "2025-12-09",
      "wrongWay": "import { Button } from '../../../../components/ui';",
      "rightWay": "import { Button } from '@/components/ui';",
      "whyItMatters": "Maintainability, readability, refactoring ease",
      "autoFixable": true,
      "fixScript": "scripts/auto-fix-imports.mjs",
      "enforcedBy": ["ESLint", "TypeScript import rule"]
    }
  ]
}
```

### 3. Optimizations

Techniques that improve performance, reduce cost, or speed up tasks.

```json
{
  "optimizations": [
    {
      "id": "opt-grep-before-read",
      "title": "Use Grep Before Read",
      "description": "Search for code with Grep first, then Read only relevant lines",
      "speedup": "10x faster",
      "applicableWhen": "Searching for specific code patterns",
      "example": {
        "step1": "results = await grep('formatDate', 'src/**/*.ts')",
        "step2": "content = await read(results[0].file, { offset: 42, limit: 15 })",
        "savings": "500 lines → 15 lines = 97% token reduction"
      },
      "adoptionRate": 0.87,
      "evidenceCount": 45,
      "lastValidated": "2025-12-10"
    },

    {
      "id": "opt-batch-operations",
      "title": "Batch Independent Operations",
      "description": "Execute multiple independent Glob/Grep calls in parallel",
      "speedup": "3x faster",
      "applicableWhen": "Multiple file searches needed",
      "example": {
        "sequential": "[comp, test, docs] = await glob1(); glob2(); glob3();",
        "parallel": "[comp, test, docs] = await Promise.all([glob1(), glob2(), glob3()]);",
        "savings": "60% reduction in execution time"
      },
      "adoptionRate": 0.71,
      "evidenceCount": 32,
      "lastValidated": "2025-12-10"
    },

    {
      "id": "opt-knowledge-query-first",
      "title": "Query Knowledge Base Before Investigation",
      "description": "Search knowledge base for existing patterns before exploring codebase",
      "speedup": "2-5x faster",
      "applicableWhen": "Before starting any task investigation",
      "example": {
        "before": "Search entire codebase to understand PageLayout rule",
        "after": "Query knowledge base → get rule immediately → validate without searching"
      },
      "adoptionRate": 0.62,
      "evidenceCount": 28,
      "lastValidated": "2025-12-10",
      "growsWithTime": true,
      "note": "Adoption increases as knowledge base grows"
    }
  ]
}
```

### 4. Metadata

Tracking and versioning information.

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-12-10T10:30:00Z",
    "totalPatterns": 8,
    "totalMistakes": 12,
    "totalOptimizations": 6,
    "averageConfidence": 0.91,
    "lastQarterGrowth": {
      "patterns": "+3",
      "mistakes": "+5",
      "optimizations": "+2"
    },
    "nextReview": "2025-12-17"
  }
}
```

---

## 🔍 Querying the Knowledge Base

Agents should query the knowledge base at the start of tasks.

### Command: Query Knowledge Base

```bash
npm run learning:query [options]

Options:
  --agent <name>        Filter by agent (design-specialist, security-specialist, etc)
  --search <term>       Search patterns, mistakes, or optimizations
  --category <type>     pattern | mistake | optimization
  --confidence <score>  Return items with confidence >= score (0-100)
  --limit <num>         Limit results (default: 10)
```

### Usage Examples

**Example 1: Before validating design tokens**
```bash
npm run learning:query --search "design tokens" --category pattern

Results:
✓ Pattern: Design Tokens (confidence: 98%)
  Rule: All styling must use design tokens from @/lib/design-tokens
  Categories: SPACING, TYPOGRAPHY, CONTAINER_WIDTHS
  Compliance: 94%
```

**Example 2: Before creating API endpoint**
```bash
npm run learning:query --search "API" --category pattern

Results:
✓ Pattern: API Pattern (confidence: 89%)
  Rule: Validate→Queue→Respond
  Steps: Validate data, queue Inngest job, respond immediately
  Examples: 12 implementations
```

**Example 3: Check for common mistakes in security**
```bash
npm run learning:query --agent security-specialist --category mistake

Results:
✓ Mistake: Logging Credentials (severity: critical)
  Problem: Logging API keys in clear text
  Fix: Use maskCredential() utility
  Auto-fixable: Yes

✓ Mistake: Relative Imports (severity: medium)
  Problem: Using '../../../' instead of '@/'
  Fix: Use @ alias
  Auto-fixable: Yes
```

**Example 4: Find optimization techniques**
```bash
npm run learning:query --category optimization --confidence 85

Results:
✓ Optimization: Grep Before Read (speedup: 10x, adoption: 87%)
✓ Optimization: Batch Operations (speedup: 3x, adoption: 71%)
✓ Optimization: Knowledge Query First (speedup: 2-5x, adoption: 62%)
```

---

## 🔄 How Learnings Become Knowledge

### Process: Validation → Integration → Knowledge

```
learnings.json (Raw observations)
    ↓
Weekly Review (Automated + Manual)
    ├─ Is confidence >0.85?
    ├─ Is evidence from >3 sessions?
    ├─ Is it actionable?
    └─ Should it become practice?
    ↓
Approved Learnings
    ↓
Integration into knowledge-base.json
    ├─ Add to relevant category
    ├─ Set confidence score
    ├─ Link to enforcement mechanism
    └─ Assign to agent responsibility
    ↓
knowledge-base.json (Validated wisdom)
    ↓
Agents Query Knowledge Base
    ↓
Improved Future Performance
```

### Timeline for Graduation

| Phase | Duration | Action | Example |
|-------|----------|--------|---------|
| **Observation** | 1-7 days | Capture in learnings.json | Agent spots design token issue |
| **Validation** | 7-14 days | Collect evidence from multiple sessions | See issue in 5+ tasks |
| **Review** | 1-2 days | Team review for approval | Is pattern consistent? Is it actionable? |
| **Integration** | 1 day | Add to knowledge-base.json | Promoted to design pattern |
| **Enforcement** | 1-7 days | Implement checks/rules | Add ESLint rule, pre-commit check |
| **Practice** | Ongoing | Agents use in daily work | All agents validate design tokens |

---

## 👥 Session Handoff Protocol

When one agent finishes and another starts (or same agent in new session):

### Step 1: Query Current Knowledge Base
```bash
npm run learning:query --agent [my-agent] --limit 20
```
Get all high-confidence patterns relevant to current work

### Step 2: Load Relevant Patterns Into Context
If planning to work with design, load design pattern knowledge
If planning security audit, load security-related mistakes

### Step 3: Apply Knowledge Throughout Task
- Validate against known patterns
- Avoid known mistakes
- Use known optimizations
- Document any new learnings

### Step 4: Contribute Back to Knowledge Base
If new pattern discovered:
```bash
npm run learning:add \
  --category pattern \
  --title "New Pattern Title" \
  --description "..."
```

---

## 📈 Knowledge Base Evolution

The knowledge base grows and evolves over time.

### Quarter 1 (Dec-Feb 2025)
- **Target:** 12-15 patterns, 15-20 mistakes, 8-10 optimizations
- **Focus:** Establish baseline knowledge from existing practices
- **Metrics:** Confidence >0.80 for 80% of entries

### Quarter 2 (Mar-May 2026)
- **Target:** 20-25 patterns, 25-30 mistakes, 15-20 optimizations
- **Focus:** Validation and refinement, increase confidence scores
- **Metrics:** Confidence >0.90 for 70% of entries

### Quarter 3+ (Jun+ 2026)
- **Target:** Continuous growth, become comprehensive system
- **Focus:** Pattern stabilization, optimization evolution
- **Metrics:** Agents use knowledge base in >80% of tasks

---

## 🚀 Getting Started

### Day 1: Seed with Current Patterns
1. Capture PageLayout 90% rule
2. Capture design token rule
3. Capture API pattern rule
4. Capture test pass rate target

```bash
npm run learning:add --category pattern --title "PageLayout 90% Rule"
# ... repeat for others
```

### Week 1: Collect Initial Mistakes
1. Capture 5-10 known mistakes from code review comments
2. Add common anti-patterns observed
3. Document fixes for each

### Week 2: Document Optimizations
1. Capture grep-before-read technique
2. Capture batch operations optimization
3. Add knowledge-query-first pattern

### Week 3+: Continuous Learning
- Agents query knowledge base at task start
- Capture new learnings throughout week
- Weekly review and integration

---

## 📚 Related Documentation

- [CONTINUOUS_LEARNING.md](./CONTINUOUS_LEARNING.md) - How learnings are captured
- [PERFORMANCE_METRICS.md](./PERFORMANCE_METRICS.md) - Tracking effectiveness
- [AGENTS.md](../../AGENTS.md) - Agent overview and responsibilities
- [docs/ai/ENFORCEMENT_RULES.md](../../docs/ai/ENFORCEMENT_RULES.md) - How patterns become rules

---

## 💾 Storage & Maintenance

**Location:** `.github/agents/learning-data/knowledge-base.json`

**Size:** Currently <100KB, targeting <500KB per year

**Archival Strategy:** Older patterns <0.70 confidence archived annually

**Backup:** Committed to git, version controlled, queryable via git history

---

**Status:** Active
**Maintained By:** DCYFR Labs Team
**Last Review:** December 10, 2025
**Next Review:** Monthly (ongoing)
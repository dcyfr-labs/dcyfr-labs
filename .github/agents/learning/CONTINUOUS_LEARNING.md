# Continuous Learning & Improvement

**Purpose:** Enable DCYFR agents to learn from experience, capture improvements, and evolve patterns
**Last Updated:** December 10, 2025
**Target Audience:** AI agents, developers, team leads

---

## 🎓 What is Continuous Learning?

Continuous learning enables agents to:
1. **Recognize patterns** in completed tasks
2. **Capture corrections** when mistakes are identified
3. **Document improvements** for future reference
4. **Share wisdom** across sessions and agents
5. **Evolve patterns** based on accumulated evidence

This document defines HOW agents learn and WHAT they learn.

---

## 📚 Learning Categories

All learnings fall into one of four categories:

### 1. **Pattern** (Most Common)

A recurring pattern recognized across multiple similar tasks.

**Characteristics:**
- Observed in 3+ tasks
- Increases consistency
- Reduces decision-making
- Should become an approval gate or enforcement rule

**Examples:**
- "90% of pages use PageLayout, except blog posts (ArticleLayout) and archives (ArchiveLayout)"
- "Design token validation must run before file modification"
- "API routes always follow Validate→Queue→Respond pattern"

**Learning Entry:**
```json
{
  "id": "learning-pattern-001",
  "timestamp": "2025-12-10T10:30:00Z",
  "agent": "design-specialist",
  "category": "pattern",
  "title": "Design Token Shortcuts Accelerate Adoption",
  "description": "VS Code snippet 'dt' + Tab dramatically reduces time to insert correct tokens. Observed in 12 sessions.",
  "impact": "high",
  "example": {
    "snippet": "dt + Tab → expands to import { SPACING } from '@/lib/design-tokens'",
    "adoption": "Increases token usage by 40% when developers know about shortcut"
  },
  "confidence": 0.85,
  "relatedFiles": [".vscode/snippets/*.json"]
}
```

**When to Capture:**
- Agent validates same pattern in 3+ tasks
- Pattern reduces cognitive load
- Pattern increases consistency

**Impact on Practice:**
- Becomes part of agent instructions
- Gets added to decision trees
- May trigger new approval gates

---

### 2. **Mistake** (High Priority)

An error or anti-pattern to avoid.

**Characteristics:**
- Causes failures or rework
- Commonly made by agents or humans
- Has clear fix or workaround
- Suggests need for additional validation

**Examples:**
- "Logging API keys in test output exposes credentials"
- "Hardcoding spacing values creates design system debt"
- "Missing error handling in async functions causes silent failures"

**Learning Entry:**
```json
{
  "id": "learning-mistake-001",
  "timestamp": "2025-12-10T09:15:00Z",
  "agent": "security-specialist",
  "category": "mistake",
  "title": "Never Log Full Credentials in Tests",
  "description": "Found test suite logging full API keys and passwords. Pattern: mask credentials before logging.",
  "impact": "high",
  "example": {
    "before": "console.log('API Key:', credentials.apiKey);",
    "after": "console.log('API Key:', maskCredential(credentials.apiKey));"
  },
  "rootCause": "Test authors unaware of security implications",
  "solution": "Implement credential masking utility, add pre-commit check",
  "autoFixable": true,
  "fixScript": "scripts/security/mask-credentials.mjs",
  "affectedFiles": 8,
  "occurrences": 12
}
```

**When to Capture:**
- Agent encounters error and corrects it
- Human points out mistake in agent work
- Same mistake appears in 2+ sessions

**Impact on Practice:**
- Added to ESLint rules or validation scripts
- Becomes automated check in CI/CD
- Agent learns to validate before this mistake occurs

---

### 3. **Improvement** (Medium Priority)

Enhancement to existing patterns or workflows.

**Characteristics:**
- Makes good practice better
- Reduces effort or cognitive load
- Incremental (not fundamental change)
- Backed by evidence from multiple sessions

**Examples:**
- "Using `Glob` before `Grep` cuts search time in half"
- "Batching independent API calls reduces latency by 60%"
- "Querying knowledge base first prevents reinvestigation"

**Learning Entry:**
```json
{
  "id": "learning-improvement-001",
  "timestamp": "2025-12-10T08:45:00Z",
  "agent": "architecture-reviewer",
  "category": "improvement",
  "title": "Batch Parallel Operations for Faster Results",
  "description": "Running 3 independent Glob/Grep operations in parallel instead of sequentially reduces execution time from 12s to 4s.",
  "impact": "medium",
  "example": {
    "technique": "Use Promise.all() for independent operations",
    "speedup": "3x faster",
    "applicableWhen": "Multiple independent file searches needed"
  },
  "evidence": {
    "tasksBefore": 8,
    "avgTimeBefore": 12000,
    "tasksAfter": 12,
    "avgTimeAfter": 4000,
    "improvementPercent": 67
  },
  "adoptionRate": 0.82
}
```

**When to Capture:**
- Agent discovers faster way to accomplish task
- Technique validated in 3+ sessions
- Improvement reduces resource usage

**Impact on Practice:**
- Becomes standard operating procedure
- Gets added to agent instructions
- Shared in sync with other agents/Copilot

---

### 4. **Discovery** (Lower Priority)

New capability, tool, or approach not previously known.

**Characteristics:**
- Expands agent capabilities
- Opens new possibilities
- Interesting but not immediately actionable
- Requires further validation

**Examples:**
- "Next.js server components can reduce bundle size by 40%"
- "Redis cache hits reduce API latency by 80%"
- "Tailwind v4 CSS variables enable dynamic theming"

**Learning Entry:**
```json
{
  "id": "learning-discovery-001",
  "timestamp": "2025-12-10T10:00:00Z",
  "agent": "performance-specialist",
  "category": "discovery",
  "title": "CSS Variables Enable Runtime Theme Switching",
  "description": "Tailwind v4 CSS variables allow theme changes at runtime without rebuild. Previously required recompilation.",
  "impact": "medium",
  "example": {
    "capability": "Dark mode toggle without page reload",
    "resource": "https://tailwindcss.com/docs/customizing-with-css-variables",
    "estimated_value": "Enables 10+ feature requests from backlog"
  },
  "maturity": "proven",
  "nextSteps": ["Evaluate for dark mode feature", "Prototype implementation", "Cost-benefit analysis"]
}
```

**When to Capture:**
- Agent learns about new tool or technique
- Capability relevant to project goals
- Worth investigating further

**Impact on Practice:**
- Added to knowledge base for future reference
- May trigger research or proof-of-concept
- Can become new agent capability

---

## 🔄 Learning Collection Process

### How Learnings Happen

```
Agent completes task
    ↓
Identifies new pattern / discovers mistake / finds improvement
    ↓
Records learning to learnings.json
    ↓
Learning reviewed (automated + manual)
    ↓
Integrated into knowledge base or agent patterns
    ↓
Shared in monthly sync cycle
```

### Manual Learning Capture

When agents (or humans) identify something worth learning:

```bash
# Interactive prompt to capture learning
npm run learning:add

# Prompts:
# 1. Category: pattern / mistake / improvement / discovery
# 2. Title: One-line summary
# 3. Description: Detailed explanation
# 4. Example: Code or scenario showing the learning
# 5. Impact: high / medium / low
# 6. Agent: Which agent encountered this?
# 7. Related files: Files involved
# 8. Confidence: 0-100% (how sure about this learning?)

# Output: Added to .github/agents/learning-data/learnings.json
```

### Automatic Learning Triggers

Agents should flag learnings when:

1. **Validation repeats** - Same rule checked 3+ times → might need automation
2. **Pattern consistency** - Same pattern observed in 5+ files → might need enforcement
3. **Mistake recurrence** - Same mistake fixed 2+ times → needs warning
4. **Performance regression** - Token usage increases → needs optimization

---

## 🎯 Feedback Loops

Feedback loops ensure learnings lead to improvement.

### Loop 1: Pattern Recognition → Enforcement

```
Agent recognizes pattern
    ↓
Documents in learnings.json with high confidence
    ↓
Pattern review (monthly)
    ↓
If valid: Add to APPROVAL_GATES.md
    ↓
Next month: Agent enforces pattern automatically
```

**Example:** PageLayout 90% rule → Added to agent instructions → Agent validates every page layout

### Loop 2: Mistake → Prevention

```
Agent makes or corrects mistake
    ↓
Records as "mistake" learning
    ↓
Root cause analysis
    ↓
Implement prevention (ESLint rule, pre-commit check, validation script)
    ↓
Mistake becomes impossible, learning archived
```

**Example:** Credential logging → Implement masking utility → Pre-commit checks → Problem solved

### Loop 3: Improvement → Adoption

```
Agent discovers faster technique
    ↓
Documents in learnings.json with evidence
    ↓
Technique review with metrics
    ↓
If validated: Add to agent instructions
    ↓
Next sessions: All agents use improvement
```

**Example:** Grep before Read technique → 10x speedup → Added to all agents → Overall token savings

### Loop 4: Discovery → Investigation

```
Agent discovers new capability
    ↓
Records as "discovery" learning
    ↓
Evaluation: Does it solve existing problems?
    ↓
If yes: Create research task
    ↓
Proof of concept or full implementation
```

**Example:** CSS variables for theming → Evaluate for dark mode → Implement if valuable

---

## 📊 Learning Metrics

Track learning system health and effectiveness.

### Metrics to Monitor

**Learning Capture Rate**
- Target: >20 learnings per month
- Tracks: How actively agents are learning
- Formula: Learnings recorded / 30 days

**Learning Implementation Rate**
- Target: >60% of learnings become patterns/improvements
- Tracks: Are learnings actually improving practice?
- Formula: Implemented learnings / Total learnings

**Pattern Confidence**
- Target: >90% average confidence
- Tracks: Quality of documented patterns
- Formula: Average confidence score of all patterns

**Feedback Loop Closure**
- Target: >80% of mistakes resolve within 30 days
- Tracks: How quickly mistakes are fixed
- Formula: Resolved mistakes / Total mistake learnings

**Knowledge Base Growth**
- Target: +30% patterns per quarter
- Tracks: Expansion of accumulated knowledge
- Formula: Patterns this quarter / Patterns last quarter

---

## 🤖 Agent Learning Responsibilities

### design-specialist
**Primary Learning Focus:**
- Design token patterns and exceptions
- Component layout decisions
- Hardcoding anti-patterns
- Tailwind/shadcn/ui discoveries

**Reporting:**
```bash
npm run learning:add --agent design-specialist
```

### security-specialist
**Primary Learning Focus:**
- OWASP vulnerability patterns
- Credential handling mistakes
- Logging security issues
- Authentication patterns

**Reporting:**
```bash
npm run learning:add --agent security-specialist
```

### test-specialist
**Primary Learning Focus:**
- Test coverage patterns
- Common testing mistakes
- Optimization techniques
- E2E testing discoveries

**Reporting:**
```bash
npm run learning:add --agent test-specialist
```

### performance-specialist
**Primary Learning Focus:**
- Optimization techniques
- Bundle size patterns
- Performance regressions
- Technical discoveries

**Reporting:**
```bash
npm run learning:add --agent performance-specialist
```

### Other Agents
Similar responsibilities for their domains. All agents should contribute learnings.

---

## 🔗 Integration with Knowledge Base

Learnings feed directly into the knowledge base:

```
learnings.json → Review & Validation → knowledge-base.json
  ↓                                          ↓
Mistakes with        Patterns with          Optimizations with
solutions            confidence >0.90       evidence
  ↓                        ↓                     ↓
Become ESLint          Become               Become standard
rules & tests          enforcement          practice
```

**See:** [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) for how to query and use learnings

---

## 🚀 Getting Started with Learning

### For Agents

1. **At task start:** `npm run learning:query --agent [your-name]`
2. **During task:** Note patterns, mistakes, discoveries
3. **At task end:** Consider what was learned
4. **If significant:** `npm run learning:add --agent [your-name]`

### For Humans (Code Reviewers)

When reviewing agent work:

1. **Spot mistakes:** Suggest learning capture
2. **Notice patterns:** Recommend learning record
3. **See improvements:** Point out technique worth documenting
4. **Validate discoveries:** Confirm learning validity

### For Project Leads

1. **Monthly review:** Check learnings.json for insights
2. **Trend analysis:** What is the team learning most about?
3. **Improvement prioritization:** Which learnings have highest impact?
4. **Knowledge sharing:** Communicate top learnings to team

---

## 📈 Success Indicators

The learning system is working when:

✅ Agents capture >20 learnings per month
✅ >60% of learnings become patterns/improvements
✅ Mistake recurrence drops by 50%
✅ Token efficiency improves month-over-month
✅ Team actively uses knowledge base
✅ New patterns emerge and get validated
✅ Agent decisions become more consistent
✅ Code quality metrics improve

---

## 📚 Related Documentation

- [PERFORMANCE_METRICS.md](./PERFORMANCE_METRICS.md) - How to measure agent performance
- [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) - Querying and using accumulated knowledge
- [docs/ai/ENFORCEMENT_RULES.md](../../docs/ai/ENFORCEMENT_RULES.md) - How patterns become rules
- [AGENTS.md](../../AGENTS.md) - Agent overview and responsibilities

---

**Status:** Active
**Maintained By:** DCYFR Labs Team
**Last Review:** December 10, 2025
**Next Review:** Monthly (ongoing)
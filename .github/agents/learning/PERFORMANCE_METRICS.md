# Performance Metrics & Optimization

**Purpose:** Establish token budgets, efficiency targets, and performance dashboards for DCYFR agents
**Last Updated:** December 10, 2025
**Target Audience:** AI agents, developers, project leads

---

## 🎯 Token Budget Guidelines

Token usage directly impacts cost, speed, and efficiency. DCYFR agents operate within defined budgets to balance quality with resource constraints.

### Budget Tiers (Per Task)

| Task Type | Budget | Typical Usage | Target | Notes |
|-----------|--------|---------------|--------|-------|
| **Quick Fix** | <15k | Code cleanup, linting fixes, minor refactors | 8k-12k | Fast, focused tasks only |
| **Small Feature** | <25k | Single-file features, small bug fixes | 15k-20k | Bounded scope, clear requirements |
| **Standard Feature** | <40k | Multi-file features, API endpoints, components | 25k-35k | Moderate complexity, clear patterns |
| **Complex Feature** | <80k | Significant refactors, new systems, testing | 50k-70k | Largest budget, strategic decisions |
| **Architecture Review** | <100k | Major design decisions, multiple systems | 60k-90k | Rare, high-impact work |

### Budget Allocation By Agent

**Fast Agents (Haiku):**
- quick-fix: <15k per task
- performance-specialist: <20k for analysis
- dependency-manager: <15k for audit

**Standard Agents (Sonnet):**
- design-specialist: <30k for validation
- security-specialist: <35k for audit
- seo-specialist: <25k for optimization
- content-editor: <20k for prose review
- architecture-reviewer: <50k for review

**Production Agents (Sonnet):**
- DCYFR.md: <80k for full feature implementation
- test-specialist: <40k for test coverage
- content-creator: <50k for blog posts

### Budget Overruns

**Yellow Flag** (>120% of budget):
- Log session data with `npm run learning:collect --flag yellow`
- Investigate unnecessary tool calls or context re-reads
- Consider splitting task into smaller pieces

**Red Flag** (>150% of budget):
- Session recorded as partial/failure
- Root cause analysis required
- Task escalation or redesign needed

---

## ⚡ Efficiency Optimization Techniques

These techniques consistently reduce token usage by 50-80% while maintaining quality.

### 1. Grep Before Read (10x Faster)

**Pattern:** Use Grep to locate code, Read only the relevant lines

**❌ Inefficient:**
```javascript
// Reads entire 500-line file to find one function
const content = await read('/src/utils/helpers.ts');
const match = content.match(/function formatDate.*?^}/m);
```

**✅ Efficient:**
```javascript
// Grep first: find the exact location
const results = await grep('formatDate', 'src/utils/**/*.ts');
// Then read only those lines
const lines = await read(results[0].file, { offset: 42, limit: 15 });
```

**Token Savings:** 500 lines → 15 lines = 97% reduction
**Adoption Target:** >90% of tasks

---

### 2. Batch Independent Operations (3x Faster)

**Pattern:** Execute parallel Glob/Grep calls in single message instead of sequential

**❌ Sequential (slower):**
```javascript
// Call 1: Find components
const components = await glob('src/components/**/*.tsx');
// Call 2: Find tests (must wait for Call 1)
const tests = await glob('src/__tests__/**/*.test.tsx');
// Call 3: Find docs (must wait for Call 2)
const docs = await glob('docs/**/*.md');
```

**✅ Batched (3x faster):**
```javascript
// All 3 operations in parallel
const [components, tests, docs] = await Promise.all([
  glob('src/components/**/*.tsx'),
  glob('src/__tests__/**/*.test.tsx'),
  glob('docs/**/*.md')
]);
```

**Token Savings:** Reduced by 60% due to faster execution
**Adoption Target:** >80% of multi-operation tasks

---

### 3. Target Line Ranges (5x Faster)

**Pattern:** Read specific lines instead of entire files

**❌ Full File:**
```javascript
const content = await read('src/lib/metadata.ts'); // 300 lines, 12k tokens
```

**✅ Targeted:**
```javascript
const content = await read('src/lib/metadata.ts', { offset: 150, limit: 50 }); // 50 lines, 2k tokens
```

**Token Savings:** 300 lines → 50 lines = 83% reduction
**When to Use:** When line numbers are known from Grep results

**Adoption Target:** >85% of Read operations

---

### 4. Use Specific Glob Patterns (2x Faster)

**Pattern:** Narrow glob results before processing

**❌ Broad:**
```javascript
const files = await glob('src/**/*.ts'); // May match 100+ files
```

**✅ Specific:**
```javascript
const files = await glob('src/components/blog/**/*.tsx'); // Matches exactly what you need
```

**Token Savings:** 100 files → 8 files = 92% reduction
**Adoption Target:** >90% of Glob operations

---

### 5. Cache Common Searches (5x Faster)

**Pattern:** Store frequently-searched patterns in memory during session

**❌ Repeated Searches:**
```javascript
// First time: Search for PageLayout usage
const usage1 = await grep('PageLayout', 'src/**/*.tsx');
// Later: Same search again (wasted tokens)
const usage2 = await grep('PageLayout', 'src/**/*.tsx');
```

**✅ Cached:**
```javascript
const pageLayoutUsage = await grep('PageLayout', 'src/**/*.tsx');
// Store for later reuse
const patterns = { pageLayout: pageLayoutUsage };
// Later: Use cached results
console.log(patterns.pageLayout);
```

**Token Savings:** Eliminates 50% of redundant searches
**Adoption Target:** >75% of agents

---

### 6. Leverage Existing Knowledge (2-3x Faster)

**Pattern:** Query knowledge base before investigating

**❌ Reinvestigation:**
```javascript
// Agent doesn't know about PageLayout rule
// Searches entire codebase to understand pattern
```

**✅ Knowledge Query:**
```javascript
// Query knowledge base first
const knowledge = await queryKnowledge('PageLayout');
// Already knows: "90% of pages use PageLayout, exceptions: ArticleLayout, ArchiveLayout"
// Can validate immediately without searching
```

**Token Savings:** Skip entire investigation = 70-80% reduction
**Adoption Target:** >60% of agents (growing as knowledge base expands)

---

## 📊 Success Metrics

Track these metrics to measure agent performance and identify optimization opportunities.

### Primary Metrics

**Token Efficiency (per task)**
```json
{
  "metric": "tokens_per_task",
  "target": "Within budget tier (see Token Budget Guidelines)",
  "current": "15,200 average",
  "trend": "Improving ▼ (was 16,000 last month)",
  "formula": "Sum of tokens in session / Number of tasks"
}
```

**Success Rate (per agent)**
```json
{
  "metric": "success_rate",
  "target": ">95%",
  "current": "96%",
  "formula": "Successful outcomes / Total outcomes",
  "categories": {
    "success": "Task completed as requested",
    "partial": "Task mostly complete, minor issues",
    "failure": "Task not completed successfully"
  }
}
```

**Execution Time**
```json
{
  "metric": "execution_time_ms",
  "target": "<5000ms average",
  "current": "3,500ms",
  "formula": "Total session time from start to finish",
  "note": "Faster execution = faster feedback loops"
}
```

### Secondary Metrics

**Tool Efficiency**
```json
{
  "metric": "tokens_per_tool_call",
  "target": "<2000 tokens per call",
  "formula": "Total tokens / Number of tool calls",
  "insight": "Lower = more efficient tool usage"
}
```

**File Modification Accuracy**
```json
{
  "metric": "files_modified_successfully",
  "target": ">98%",
  "formula": "Successful modifications / Attempted modifications",
  "note": "Prevent syntax errors, mismatched edits"
}
```

**Knowledge Base Usage**
```json
{
  "metric": "knowledge_queries",
  "target": ">50% of tasks query knowledge base",
  "formula": "Tasks with knowledge queries / Total tasks",
  "insight": "Higher = better pattern reuse, lower investigation costs"
}
```

### Anti-Metrics (Track to Minimize)

| Anti-Metric | Why Bad | Target |
|------------|---------|--------|
| Redundant Searches | Wastes tokens, slows down | <10% of tasks |
| Budget Overruns | Cost and efficiency concern | <5% of tasks |
| Failed Edits | Quality issues, requires retry | <2% of tasks |
| Incomplete Tasks | User dissatisfaction | <3% of tasks |
| Off-Topic Exploration | Time wasted, budget burned | <5% of tasks |

---

## 📈 Performance Dashboards

### Weekly Performance Dashboard

```markdown
# DCYFR Weekly Performance Report

**Week:** Dec 4-10, 2025

## Metrics Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Avg Tokens/Task | 35k | 32,400 | ✅ Good |
| Success Rate | >95% | 96.2% | ✅ Excellent |
| Avg Execution Time | <5s | 3.2s | ✅ Excellent |
| Budget Overruns | <5% | 3.1% | ✅ Good |
| Knowledge Queries | >50% | 58% | ✅ Excellent |

## By Agent

**design-specialist**
- Sessions: 18
- Avg Tokens: 28,000 (▼8% from last week)
- Success Rate: 98%
- Top Pattern: Design token validation

**security-specialist**
- Sessions: 12
- Avg Tokens: 35,200 (→ stable)
- Success Rate: 94%
- Top Pattern: OWASP vulnerability scanning

[... more agents ...]

## Optimization Opportunities

1. **Test Specialist** - Avg tokens increasing, consider pattern review
2. **Dependency Manager** - Excellent efficiency (18k avg), use as template
3. **Architecture Reviewer** - Budget overruns (15% over), refine decision trees

## Trends

- **Overall Token Efficiency:** ▼5% (Good trend)
- **Knowledge Query Adoption:** ▲7% (Exceeding target)
- **Budget Overruns:** ▼1% (Improving)
- **Success Rate:** Stable at 96%
```

### Monthly Performance Report

**Content:**
- Summary of all metrics for the month
- Agent-by-agent breakdown
- Optimization recommendations
- Comparison to previous month
- Trend analysis and forecasts

**Location:** `.github/agents/learning-data/monthly-reports/2025-12.md`

---

## 🔧 Integration Points

### Collecting Metrics

```bash
# Automatic collection after task completion
npm run learning:collect \
  --agent security-specialist \
  --tokens 28500 \
  --time 4200 \
  --outcome success \
  --files-modified 2

# Query recent metrics
npm run learning:query --search "security-specialist" --metric tokens

# Generate weekly report
npm run learning:report --period weekly --agent all
```

### Using Metrics for Optimization

1. **Identify inefficient agents** - Monthly report shows highest token usage
2. **Review patterns** - Inefficient agents → review their patterns
3. **Update knowledge base** - Capture optimization learnings
4. **Share with team** - Weekly dashboard shared for awareness
5. **Set quarterly goals** - Adjust budgets based on trends

---

## 🎯 Optimization Roadmap

### Q4 2025 (This Month)
- ✅ Establish baseline metrics
- ✅ Train agents on optimization techniques
- ✅ Capture 10+ optimization patterns
- Target: Reduce avg tokens/task by 5%

### Q1 2026
- ⏳ Implement automatic metric collection
- ⏳ Build predictive budgeting (tasks auto-route to optimal agent)
- ⏳ 20% improvement in token efficiency
- ⏳ Agents automatically query knowledge base before tasks

### Q2 2026
- ⏳ AI-driven performance optimization (pattern suggestions)
- ⏳ Cross-agent coordination for complex tasks
- ⏳ 30% overall token efficiency improvement
- ⏳ Automatic budget adjustment based on task complexity

---

## 📚 Related Documentation

- [CONTINUOUS_LEARNING.md](./CONTINUOUS_LEARNING.md) - How agents learn and improve
- [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) - Accessing accumulated knowledge
- [docs/ai/AGENT_SYNC_STRATEGY.md](../../docs/ai/AGENT_SYNC_STRATEGY.md) - How learnings feed into sync
- [AGENTS.md](../../AGENTS.md) - Agent overview and selection

---

**Status:** Active
**Maintained By:** DCYFR Labs Team
**Last Review:** December 10, 2025
**Next Review:** Monthly (ongoing)
# DCYFR Agent Synchronization Strategy (Primary → Secondary Model)

**Purpose:** Maintain single source of truth while optimizing Claude Code (primary) and auto-syncing Copilot (secondary)
**Last Updated:** December 10, 2025
**Strategy:** Primary development on Claude Code agents, automated monthly sync to Copilot
**Rationale:** See [`docs/ai/AGENT_UNIFICATION_ANALYSIS.md`](./agent-unification-analysis)

---

## 🎯 Synchronization Principles

### 1. Single Source of Truth

`.github/agents/` (modular documentation) serves as the canonical source for all agent implementations.

### 2. Tool-Specific Optimization

Each implementation optimized for its specific use case while maintaining content consistency.

### 3. Automated Sync Triggers

Changes to core patterns trigger updates across all agent implementations.

---

## 🔄 Content Flow Strategy

```
Source of Truth (.github/agents/)
├── patterns/ → Core architectural patterns
├── enforcement/ → Quality gates and validation rules
├── learning/ → Optimization and metrics
└── DCYFR.agent.md → Hub coordination

    ↓ Syncs to ↓

🔴 PRIMARY Development Target:
.claude/agents/ → Task-specific agents with auto-delegation

    ↓ Transforms to ↓

🟡 SECONDARY Maintenance:
.github/copilot-instructions.md → 80/20 quick reference

Supporting:
VS Code mode → Full modular validation system
```

---

## 📊 Sync Matrix

| Content | Source | Copilot Transform | Claude Code Transform | VS Code Transform |
|---------|--------|---|---|---|
| **Design Tokens** | `enforcement/DESIGN_TOKENS.md` | ✅ Essential rules + examples | ✅ Enforcement per agent | ✅ Full reference |
| **Layout Patterns** | `patterns/COMPONENT_PATTERNS.md` | ✅ 90% PageLayout rule | ✅ Quick vs. full validation | ✅ Complete decision trees |
| **API Patterns** | `patterns/API_PATTERNS.md` | ✅ Basic Inngest template | ✅ Production agent only | ✅ Full validation workflow |
| **Testing Strategy** | `patterns/TESTING_PATTERNS.md` | ✅ When to test rules | ✅ Test specialist agent | ✅ Complete coverage strategy |
| **Quality Gates** | `enforcement/APPROVAL_GATES.md` | ✅ Breaking change alerts | ✅ Production agent gates | ✅ Full approval workflow |

---

## 🛠️ Implementation Plan (Primary → Secondary Model)

### Phase 1: Establish Primary/Secondary Strategy (Complete)

- [x] Mark Claude Code as primary development target
- [x] Update AGENTS.md with new strategy
- [x] Document unification analysis and rationale
- [x] Create sync strategy documentation

### Phase 2: Complete Sync Infrastructure (In Progress)

- [ ] Finalize `scripts/sync-agents.mjs` implementation
- [ ] Add GitHub Actions workflow for monthly sync
- [ ] Set up content validation between implementations
- [ ] Create automated sync reports

### Phase 3: Optimize Primary (Claude Code)

- [ ] Enhance proactive trigger patterns
- [ ] Improve auto-delegation accuracy
- [ ] Add advanced validation gates
- [ ] Build cross-session memory system

### Phase 4: Automate Secondary (Copilot)

- [ ] Configure monthly automated sync
- [ ] Validate 80/20 pattern coverage
- [ ] Monitor sync consistency
- [ ] Generate sync metrics

---

## 🔧 Sync Script Specification

### Input Sources

```javascript
const sources = {
  patterns: '.github/agents/patterns/',
  enforcement: '.github/agents/enforcement/',
  learning: '.github/agents/learning/',
  hub: '.github/agents/DCYFR.agent.md'
};
```

### Transform Targets

```javascript
const targets = {
  primary: {
    directory: '.claude/agents/',
    transform: 'splitByAgent',
    format: 'yaml-frontmatter'
  },
  copilot: {
    file: '.github/copilot-instructions.md',
    transform: 'extractEssentials',
    format: 'quick-reference'
  },
  vscode: {
    file: '.github/agents/DCYFR.agent.md',
    transform: 'modularHub',
    format: 'conversation-mode'
  }
};
```

### Validation Rules

- **Content consistency**: Core rules match across all implementations
- **Format compliance**: Each target meets toolset specifications
- **Completeness check**: Essential patterns present in all implementations
- **Update tracking**: Version numbers and timestamps synchronized

---

## 📋 Sync Frequency & Procedures

### Monthly Automated Sync (Copilot ← Claude Code)

The `ai-instructions-sync` GitHub Actions workflow automatically:

- [ ] Extracts Claude Code patterns (`.claude/agents/`)
- [ ] Transforms to 80/20 reference (`.github/copilot-instructions.md`)
- [ ] Validates sync completeness
- [ ] Generates sync report

### Quarterly Manual Review

- [ ] Review Claude Code agents for new capabilities
- [ ] Check if new patterns should be added to sync
- [ ] Verify Copilot quick reference covers 80% of use cases
- [ ] Review decision trees against implementation
- [ ] Check docs/ai/ for missing references
- [ ] Validate cross-implementation consistency
- [ ] Confirm GitHub Actions workflows are running

### Pre-Sync Analysis

- [ ] Review `.github/agents/` for changes since last sync
- [ ] Identify new patterns or enforcement rules
- [ ] Check for deprecated or changed patterns
- [ ] Validate current implementation consistency

### Sync Execution

- [ ] Run automated sync script (or GitHub Actions)
- [ ] Review generated changes for accuracy
- [ ] Test each implementation in its target environment
- [ ] Validate cross-implementation consistency

### Post-Sync Validation

- [ ] Update version numbers and timestamps
- [ ] Run quality checks (ESLint, TypeScript, format validation)
- [ ] Test agent behavior in each environment
- [ ] Update AGENTS.md with sync completion

### Documentation Updates

- [ ] Update sync strategy if process evolved
- [ ] Document any new transformation rules
- [ ] Record lessons learned for future syncs
- [ ] Update maintenance schedules

---

## 🎯 Success Metrics

### Consistency Metrics

- **Pattern Alignment**: 100% core rules consistent across implementations
- **Update Lag**: <48 hours from source change to primary implementation
- **Validation Pass Rate**: 100% automated validation checks pass
- **Sync Timeliness**: Monthly Copilot syncs complete on schedule

### Optimization Metrics

- **Copilot Efficiency**: <2 second pattern lookup time
- **Claude Code Delegation**: >90% automatic agent selection accuracy
- **VS Code Validation**: <2 minute complete quality gate execution

### Maintenance Metrics

- **Sync Success Rate**: 100% monthly syncs complete without manual intervention
- **Change Propagation**: 100% source changes reach all implementations
- **Tool Compliance**: 100% implementations pass toolset-specific validation

---

## 🚨 Sync Failure Recovery

### Common Failures

1. **Format Breaking Changes**: Source patterns incompatible with target format
2. **Missing Dependencies**: Target references source content that moved
3. **Validation Failures**: Generated content fails toolset validation
4. **Sync Timing**: Monthly sync misses window

### Recovery Procedures

1. **Rollback**: Restore last known good implementation
2. **Manual Sync**: Complete sync manually with change documentation
3. **Pattern Update**: Modify source patterns to maintain compatibility
4. **Tool Upgrade**: Update transformation logic for new toolset requirements
5. **Escalate**: Create issue in GitHub if patterns incompatible with Copilot

---

## 📖 Related Documentation

- [AGENTS.md](../../agents) - Complete agent ecosystem overview
- [AGENT_UNIFICATION_ANALYSIS.md](./agent-unification-analysis) - Feasibility analysis
- [docs/ai/QUICK_REFERENCE.md](./quick-reference) - Pattern reference
- [.github/workflows/](../../.github/workflows/) - Automation workflows
- [scripts/](../../scripts/) - Maintenance and sync scripts

---

**Status:** In Implementation (Phase 2)
**Next Milestone:** Complete sync infrastructure and GitHub Actions workflow
**Maintained By:** DCYFR Labs Team
**Review Frequency:** Quarterly + triggered updates

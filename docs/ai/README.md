<!-- TLP:CLEAR -->

# AI Development Documentation

**Last Updated:** January 21, 2026
**Purpose:** Comprehensive guides for AI-assisted development in dcyfr-labs

This directory contains 40+ guides organized by category to help AI agents and developers build consistent, high-quality features while following established patterns and best practices.

---

## 📚 Table of Contents

### 🚀 Getting Started

**New to AI development? Start here:**

| Document                                   | Purpose                         | Use When          |
| ------------------------------------------ | ------------------------------- | ----------------- |
| [quick-reference.md](./quick-reference.md) | Essential commands and patterns | Daily development |
| [best-practices.md](./best-practices.md)   | Core development workflows      | Building features |
| [decision-trees.md](./decision-trees.md)   | Visual decision guides          | Choosing patterns |

---

### 🎨 Design System

**Mandatory token enforcement and component patterns:**

| Document                                                   | Purpose                          | Use When              |
| ---------------------------------------------------------- | -------------------------------- | --------------------- |
| [design-system.md](./design-system.md)                     | Complete validation checklist    | Creating/modifying UI |
| [design-system-quick-ref.md](./design-system-quick-ref.md) | Quick pattern reference          | Daily UI development  |
| [component-patterns.md](./component-patterns.md)           | Layout selection, imports        | Building pages        |
| [enforcement-rules.md](./enforcement-rules.md)             | Approval gates, breaking changes | Major changes         |

---

### 🏗️ Development Patterns

**Component architecture and implementation guides:**

| Document                                                                 | Purpose                          | Use When          |
| ------------------------------------------------------------------------ | -------------------------------- | ----------------- |
| [component-lifecycle.md](./component-lifecycle.md)                       | Component creation workflow      | New components    |
| [skeleton-consolidation-pattern.md](./skeleton-consolidation-pattern.md) | Loading state patterns           | Adding skeletons  |
| [form-validation-pattern.md](./form-validation-pattern.md)               | Form validation approach         | Building forms    |
| [error-handling-patterns.md](./error-handling-patterns.md)               | Error handling strategies        | Error boundaries  |
| [state-management-matrix.md](./state-management-matrix.md)               | When to use which state solution | State decisions   |
| [animation-decision-matrix.md](./animation-decision-matrix.md)           | Animation choices                | Adding animations |

---

### 🧪 Testing & Quality

**Testing strategies and security practices:**

| Document                                     | Purpose                 | Use When               |
| -------------------------------------------- | ----------------------- | ---------------------- |
| [testing-strategy.md](./testing-strategy.md) | Test coverage approach  | Writing tests          |
| [logging-security.md](./logging-security.md) | Secure logging patterns | Logging sensitive data |

---

### ⚡ Performance & Optimization

**Performance patterns and standards:**

| Document                                                 | Purpose            | Use When            |
| -------------------------------------------------------- | ------------------ | ------------------- |
| [modern-ui-ux-standards.md](./modern-ui-ux-standards.md) | Modern UX patterns | UI design decisions |

---

### 🤖 AI Agent Integration

**Guides for AI agent configuration and usage:**

| Document                                                               | Purpose                 | Use When                |
| ---------------------------------------------------------------------- | ----------------------- | ----------------------- |
| [claude-code-integration.md](./claude-code-integration.md)             | Claude Code setup       | Configuring Claude Code |
| [claude-code-validation-report.md](./claude-code-validation-report.md) | Validation results      | Reviewing Claude Code   |
| [claude-code-enhancements.md](./claude-code-enhancements.md)           | Enhancement suggestions | Improving Claude Code   |
| [aitmpl-integration-summary.md](./aitmpl-integration-summary.md)       | AITMPL.com integration  | Using template agents   |
| [aitmpl-enhancement-plan.md](./aitmpl-enhancement-plan.md)             | Enhancement roadmap     | Planning improvements   |
| [superpowers-integration.md](./superpowers-integration.md)             | Superpowers skills      | TDD workflows           |
| [universal-agent-configuration.md](./universal-agent-configuration.md) | Agent config standards  | Multi-tool setup        |

---

### 🔧 Tools & Infrastructure

**MCP servers, external services, and cost tracking:**

#### MCP Servers

| Document                                                   | Purpose                  | Use When        |
| ---------------------------------------------------------- | ------------------------ | --------------- |
| [mcp-checks.md](./mcp-checks.md)                           | MCP server health checks | Debugging MCP   |
| [mcp-sentry-axiom-access.md](./mcp-sentry-axiom-access.md) | Sentry/Axiom MCP access  | Error tracking  |
| [arxiv-mcp-server.md](./arxiv-mcp-server.md)               | arXiv research server    | Research papers |

#### OpenCode & Fallback Systems

| Document                                                                         | Purpose                 | Use When               |
| -------------------------------------------------------------------------------- | ----------------------- | ---------------------- |
| [opencode-fallback-architecture.md](./opencode-fallback-architecture.md)         | OpenCode AI fallback    | Token exhaustion       |
| [opencode-usage-guide.md](./opencode-usage-guide.md)                             | When to use OpenCode    | Tool selection         |
| [opencode-gap-analysis.md](./opencode-gap-analysis.md)                           | OpenCode vs Claude Code | Comparing capabilities |
| [opencode-validation-final-report.md](./opencode-validation-final-report.md)     | Validation results      | Reviewing setup        |
| [opencode-configuration-fix-summary.md](./opencode-configuration-fix-summary.md) | Configuration fixes     | Troubleshooting        |

#### Cost Tracking & Analytics

| Document                                                                             | Purpose                 | Use When             |
| ------------------------------------------------------------------------------------ | ----------------------- | -------------------- |
| [AI_COST_TRACKING_PROGRESS.md](./AI_COST_TRACKING_PROGRESS.md)                       | Cost tracking progress  | Monitoring costs     |
| [UNIFIED_AI_COST_DASHBOARD.md](./UNIFIED_AI_COST_DASHBOARD.md)                       | Cost dashboard overview | Viewing metrics      |
| [UNIFIED_AI_COST_DASHBOARD_QUICKSTART.md](./UNIFIED_AI_COST_DASHBOARD_QUICKSTART.md) | Quick start guide       | Setting up dashboard |

---

### 📖 Documentation & Alignment

**Instruction files and alignment guides:**

| Document                                                               | Purpose                | Use When           |
| ---------------------------------------------------------------------- | ---------------------- | ------------------ |
| [INSTRUCTION_ALIGNMENT_INDEX.md](./INSTRUCTION_ALIGNMENT_INDEX.md)     | Instruction file index | Finding guidance   |
| [INSTRUCTION_ALIGNMENT_SUMMARY.md](./INSTRUCTION_ALIGNMENT_SUMMARY.md) | Alignment summary      | Understanding sync |

---

### 📝 Session Summaries

**Historical session notes and implementation summaries:**

| Document                                                                   | Purpose                 | Use When              |
| -------------------------------------------------------------------------- | ----------------------- | --------------------- |
| [session-summary-trending-badges.md](./session-summary-trending-badges.md) | Trending badges session | Reviewing badges work |

---

### 🔒 Private Documentation

**Sensitive AI implementation details:**

- **Location:** [private/](./private/)
- **Access:** Internal team only
- **Content:** Performance metrics, operational data, sensitive configurations

---

## 🎯 Quick Navigation by Task

### "I need to..."

**Build a new page:**

1. Start: [decision-trees.md#layout-selection](./decision-trees.md)
2. Reference: [component-patterns.md](./component-patterns.md)
3. Validate: [design-system.md](./design-system.md)

**Create a component:**

1. Start: [component-lifecycle.md](./component-lifecycle.md)
2. Reference: [design-system-quick-ref.md](./design-system-quick-ref.md)
3. Test: [testing-strategy.md](./testing-strategy.md)

**Fix a bug:**

1. Start: [best-practices.md](./best-practices.md)
2. Error handling: [error-handling-patterns.md](./error-handling-patterns.md)
3. Validate: [testing-strategy.md](./testing-strategy.md)

**Choose a pattern:**

1. Start: [decision-trees.md](./decision-trees.md)
2. State: [state-management-matrix.md](./state-management-matrix.md)
3. Animation: [animation-decision-matrix.md](./animation-decision-matrix.md)

**Set up AI tools:**

1. Claude Code: [claude-code-integration.md](./claude-code-integration.md)
2. OpenCode: [opencode-usage-guide.md](./opencode-usage-guide.md)
3. MCP: [mcp-checks.md](./mcp-checks.md)

---

## 🔗 Related Documentation

### Other Documentation Directories

- **[/docs/features/](../features/)** - Feature implementation guides (Inngest, MCP, GitHub)
- **[/docs/design/](../design/)** - Design system catalog and specifications
- **[/docs/testing/](../testing/)** - Testing infrastructure and coverage
- **[/docs/operations/](../operations/)** - Project management and maintenance

### Root Documentation

- **[AGENTS.md](../../AGENTS.md)** - AI agent selection and routing
- **[CLAUDE.md](../../CLAUDE.md)** - Project context for Claude AI
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - Quick command reference

---

## 📊 Documentation Statistics

- **Total Guides:** 40+
- **Categories:** 8
- **Last Updated:** January 21, 2026
- **Maintainers:** DCYFR Labs Team

---

## 💡 Contributing

**Found an issue or want to improve documentation?**

1. Check existing guides for similar content
2. Follow [DOCS_GOVERNANCE.md](../DOCS_GOVERNANCE.md) for structure
3. Submit PR with clear description
4. See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines

---

**Last Updated:** January 21, 2026
**Status:** Production-ready documentation ✅

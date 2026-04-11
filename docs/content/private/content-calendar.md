<!-- TLP:AMBER - Internal Use Only -->

# Content Calendar — dcyfr.ai

**Last Updated:** 2026-04-06  
**Status:** Active  
**Maintainer:** Drew / Rei  
**Related:** [Content Creation Guide](../blog/content-creation.md) · [Blog Architecture](../blog/architecture.md)

---

## Publishing Cadence

Target: **1 post every 2–3 weeks**. Current cadence (Sep 2025 – Mar 2026): roughly monthly, occasionally 2/month in Dec and Jan.

**Current gap:** Last post March 15, 2026 (`ai-assistants-as-development-partners`). April is unplanned.

---

## Q2 2026 Pipeline

### Immediately Ready (Research Complete)

| Slug (proposed) | Title | Source Material | Category | Target |
|-----------------|-------|-----------------|----------|--------|
| `agi-primitives-in-a-box` | AGI Primitives in a Box: What OpenClaw Gets Right | `knowledge-base/obsidian-vault/00-Inbox/research-1.md` + `research-2.md` (workbench) | AI/Engineering | April 2026 |
| `mcp-security-threat-model` | MCP Security: The Attack Surface Nobody's Talking About | `ai-agent-security-research-priority-topics` (P0, workbench) | Security | May 2026 |
| `zero-trust-for-ai-agents` | Zero-Trust for Non-Human Identities | `ai-agent-security-research-priority-topics` (P0, workbench) | Security | May/Jun 2026 |

### In Development (Research Underway)

| Slug (proposed) | Title | Source Material | Category | Target |
|-----------------|-------|-----------------|----------|--------|
| `ddia-agent-architecture` | DDIA Applied: Building Data-Intensive AI Agents | `design-intensive-apps-distillation` (7 specialist sessions, Apr 2026, workbench) | Architecture | Jun 2026 |
| `regulatory-ai-design-patterns` | EU AI Act + ISO 42001: Design Patterns That Ship | `ai-agent-security-research-priority-topics` (P0, workbench) | Security/Compliance | Jun 2026 |

### Planned (P1 Security Track)

| Slug (proposed) | Title | Source | Category | Target |
|-----------------|-------|--------|----------|--------|
| `adversarial-agentic-ai` | Adversarial Attacks Against Agentic AI Systems | `ai-agent-security-research-priority-topics` P1 | Security | Q3 2026 |
| `memory-poisoning-goal-drift` | Memory Poisoning and Long-Horizon Goal Drift | `ai-agent-security-research-priority-topics` P1 | Security | Q3 2026 |
| `secure-soc-orchestration` | Secure Orchestration for AI-Driven SOC Automation | `ai-agent-security-research-priority-topics` P1 | Security | Q3 2026 |

---

## Post Drafts In Progress

None. No `draft: true` MDX files exist in `src/content/blog/`. The pipeline is empty.

---

## Source Material Index

### Obsidian Inbox (workbench: `knowledge-base/obsidian-vault/00-Inbox/`)

| File | Topic | Status | Action |
|------|-------|--------|--------|
| `research-1.md` | OpenClaw 4-layer architecture, AGI primitives, memory systems, MCP standard | Complete, cited | Convert to `agi-primitives-in-a-box` |
| `research-2.md` | `@dcyfr/ai` vs OpenClaw gap analysis, phased build plan | Complete | Include in `agi-primitives-in-a-box` or publish as companion post |

### OpenSpec Research (workbench: `openspec/changes/deferred/ai-agent-security-research-priority-topics/`)

P0 topics with full templates defined (Threat Model, Reference Architecture, Validation Playbook, Adoption Map):

1. **MCP Security** — Highest immediate exploit surface, highest workspace leverage
2. **Zero-Trust for Non-Human Identities** — Hardens agent privilege boundaries
3. **Regulatory-Driven Design Patterns (EU AI Act + ISO 42001)** — Converts controls to auditable patterns

P1 topics (next wave): Secure SOC Orchestration, Adversarial Attacks, Memory Poisoning & Goal Drift  
P2 topics (specialist): Autonomous Red Teaming, LLM Vuln Discovery, Side-Channel Risks

### DDIA Distillation (workbench: `nexus/patterns/DDIA-SESSION-LOGS/`, `docs/audits/DCYFR-DDIA-ARCHITECTURE-AUDIT.md`)

Completed specialist review sessions:
- @security-engineer (2026-04-02): Byzantine failure, idempotency key crypto, audit trail integrity
- @test-engineer (2026-04-03): Distributed property testing, idempotency, failure mode strategies

Architecture audit result: 62% DDIA alignment score. Key gaps: delivery semantics (50%), crash recovery (43%), schema evolution (50%).

Planned sessions: @architecture-reviewer (x2), @database-architect (x2), @devops-engineer — scheduled in README index.

---

## Platform Work Affecting Content

| Change | Status | Content Impact |
|--------|--------|----------------|
| `dcyfr-labs-visual-explainer-mdx` | Deferred (target was Mar 28, overdue) | Fixes 500ms+ diagram lag + dark/light mode bug in blog posts |
| `x64-ghost-to-vercel-replatform` | Active proposal (Mar 31) | Migrates dcyfr.tech Ghost blog → Next.js/Vercel; unlocks DDIA whitepapers for publication |
| `dcyfr-content-distribution` | Deferred | Automated Substack ingestion + Dev.to/Peerlist publishing; enables distribution at scale |
| `substack-writer-ai-plugin` | Deferred | `@dcyfr/ai` plugin for content optimization; mission alignment 9/10 |

---

## Content Autopilot Status

**OpenSpec autopilot** (`dcyfr-openspec-autopilot.service`): Running on workbench. Reporting "No eligible OpenSpec changes with pending tasks" — content-predraft-automation tasks are unassigned, so the autopilot skips them.

**Content predraft automation**: Smoke test ran 2026-03-14 → `manual intervention required`. Stalled; no follow-up. The automation attempted to pre-draft content but could not complete without manual unblocking.

---

## Blocked Items

- **`dcyfr-delegation-health`** service on workbench: FAILING — 1Password item `[REDACTED]` deleted/archived in vault `[REDACTED]`. Credential must be restored in 1Password for the service to recover. This affects any workspace automation that depends on delegated credentials.

---

## Featured Posts Policy

Currently featured posts (if any): check `src/content/blog/*/index.mdx` for `featured: true`.  
Target: 2–5 featured posts, rotate quarterly. Last review: not documented.

---

## Tags in Use

Primary categories active in the blog:

| Tag | Post Count |
|-----|-----------|
| Security | 4 (CVE, OWASP, Node.js, Hardening) |
| AI | 3 (Building with AI, AI Assistants, OWASP) |
| Engineering | 3 (Inngest, RIVET, Portfolio) |
| Next.js | 2 |
| Portfolio | 2 |

Q2 target: maintain security/AI parity; add **Architecture** tag for DDIA-derived posts.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-06 | Created this document | No content calendar existed; pipeline was running by inertia |
| 2026-03-23 | `agi-primitives-in-a-box` OpenSpec archived | Research complete but post never written; research still in Obsidian inbox |
| 2026-03-22 | `dcyfr-content-distribution` deferred | Consolidated from 3 separate proposals; 40–55h estimate; deprioritized |

---

*Sourced from cross-workspace analysis of dcyfr-labs, dcyfr-workspace (local + workbench), and OpenSpec change history.*

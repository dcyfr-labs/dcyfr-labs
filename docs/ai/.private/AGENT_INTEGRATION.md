{/* TLP:CLEAR */}

# Agent Integration Guide

**Updated:** January 29, 2026

This guide explains how to use the new tiered agent architecture in dcyfr-labs.

---

## Overview

The DCYFR agent system now uses a three-tier architecture:

```
PROJECT (dcyfr-labs .claude/agents)
  ↓
PRIVATE (@dcyfr/agents - DCYFR-specific)
  ↓
PUBLIC (@dcyfr/ai - Generic framework)
```

Agent resolution follows tier priority: **project > private > public**

---

## Quick Start

### 1. Route Tasks to Agents

```typescript
import { routeTask } from '@/lib/agents';

// Automatic agent routing based on task context
const result = await routeTask({
  description: 'Fix design token violations in header component',
  filesInProgress: ['src/components/header.tsx'],
  requiresDesignTokens: true,
  phase: 'implementation',
});

console.log(`Routed to: ${result.agent.manifest.name}`);
console.log(`Tier: ${result.tier}`);
console.log(`Reasoning: ${result.reasoning}`);
// Output: "Routed to: design-specialist (private)"
```

### 2. Get Specific Agents

```typescript
import { getAgent } from '@/lib/agents';

// Get a specific agent by name
const dcyfr = await getAgent('dcyfr');
if (dcyfr) {
  console.log(dcyfr.manifest.description);
  console.log(`Tools: ${dcyfr.manifest.tools.join(', ')}`);
  console.log(`Delegates to: ${dcyfr.manifest.delegatesTo?.join(', ')}`);
}
```

### 3. List Available Agents

```typescript
import { listDcyfrAgents, listGenericAgents } from '@/lib/agents';

// List DCYFR-specific agents (private + project tiers)
const dcyfrAgents = await listDcyfrAgents();
console.log(`DCYFR Agents: ${dcyfrAgents.length}`);

// List generic agents (public tier)
const genericAgents = await listGenericAgents();
console.log(`Generic Agents: ${genericAgents.length}`);
```

### 4. Validate Design Tokens

```typescript
import { validateDesignTokens } from '@/lib/agents';

// Validate design token compliance
const result = await validateDesignTokens([
  'src/components/header.tsx',
  'src/components/footer.tsx',
]);

console.log(`Compliance: ${result.compliance}%`);
if (result.compliance < 90) {
  console.error('Violations:', result.violations);
  console.log('Suggestions:', result.suggestions);
}
```

### 5. Check Approval Requirements

```typescript
import { requiresApproval } from '@/lib/agents';

// Check if a change requires manual approval
const needsApproval = await requiresApproval({
  type: 'breaking',
  scope: 'api',
  files: ['src/app/api/users/route.ts'],
});

if (needsApproval) {
  console.log('⚠️  This change requires manual approval');
}
```

---

## Agent Tiers Explained

### PROJECT Tier (Highest Priority)

**Location:** `.claude/agents/`, `.github/agents/`
**Purpose:** Project-specific overrides and customizations
**Access:** Local to dcyfr-labs

Agents at the project level take precedence over all other tiers. Use this for:
- Overriding behavior of private/public agents
- Project-specific experimental agents
- One-off specialized agents for this project

### PRIVATE Tier (DCYFR-Specific)

**Location:** `@dcyfr/agents` package (git+ssh)
**Purpose:** DCYFR-proprietary agents and patterns
**Access:** Private git repository

17 specialized agents for DCYFR workflows:
- `dcyfr` - Main production enforcement agent
- `quick-fix` - Fast pattern-compliant fixes
- `design-specialist` - Design token compliance
- `content-creator` - SEO-optimized MDX content
- `nextjs-expert` - App Router and Server Components
- And 12 more specialized agents

### PUBLIC Tier (Generic Framework)

**Location:** `@dcyfr/ai` package (npm)
**Purpose:** Generic, reusable agents
**Access:** Public npm package

15 generic agents for common tasks:
- `fullstack-developer` - General development
- `frontend-developer` - React/Next.js work
- `backend-architect` - API design
- `test-engineer` - Testing strategies
- `security-engineer` - Security audits
- And 10 more generic agents

---

## Usage Patterns

### Pattern 1: Automatic Routing

Let the system choose the best agent:

```typescript
import { routeTask } from '@/lib/agents';

async function handleTask(description: string, files: string[]) {
  const result = await routeTask({
    description,
    filesInProgress: files,
    phase: 'implementation',
  });

  console.log(`Task routed to ${result.agent.manifest.name}`);

  // Agent can delegate to specialists
  if (result.delegationChain) {
    console.log(`Will delegate to: ${result.delegationChain.join(' → ')}`);
  }

  return result;
}
```

### Pattern 2: Explicit Agent Selection

When you know exactly which agent you need:

```typescript
import { getAgent } from '@/lib/agents';

async function fixDesignTokens(files: string[]) {
  const designAgent = await getAgent('design-specialist');

  if (!designAgent) {
    throw new Error('Design specialist agent not found');
  }

  console.log(`Using: ${designAgent.manifest.name}`);
  console.log(`Model: ${designAgent.manifest.model}`);

  // Validate with design token enforcement
  const validation = await validateDesignTokens(files);

  return {
    agent: designAgent,
    validation,
  };
}
```

### Pattern 3: Quality Gate Enforcement

Use quality gates to ensure standards:

```typescript
import { routeTask, validateDesignTokens } from '@/lib/agents';

async function implementFeature(description: string, files: string[]) {
  // Route to appropriate agent
  const result = await routeTask({
    description,
    filesInProgress: files,
    requiresDcyfrPatterns: true,
  });

  // Check quality gates from agent manifest
  const gates = result.agent.manifest.qualityGates;

  for (const gate of gates || []) {
    if (gate.name === 'design_tokens') {
      const validation = await validateDesignTokens(files);

      if (validation.compliance < gate.threshold) {
        if (gate.failureMode === 'error') {
          throw new Error(
            `Design token compliance ${validation.compliance}% below threshold ${gate.threshold}%`
          );
        } else {
          console.warn(
            `⚠️  Design token compliance ${validation.compliance}% below threshold ${gate.threshold}%`
          );
        }
      }
    }
  }

  return result;
}
```

---

## Integration with Existing Systems

### Inngest Functions

Design token validation is integrated with Inngest:

```typescript
// src/inngest/functions/design-token-validation.ts
import { validateDesignTokens } from '@/lib/ai-compat';

export const validateDesignTokens = inngest.createFunction(
  { id: "validate-design-tokens" },
  { event: "github/design-tokens.validate" },
  async ({ event }) => {
    const result = await validateDesignTokens(event.data.changedFiles);

    return {
      compliance: result.compliance,
      violations: result.violations.length,
      status: result.compliance >= 90 ? 'passed' : 'failed',
    };
  }
);
```

### Validation Scripts

Scripts now use the new enforcement layer:

```bash
# Design token validation
npm run validate:tokens

# DCYFR pattern validation
npm run validate:patterns
```

---

## Migration Guide

### Migrating Existing Agent Code

**Before:**
```typescript
// Old approach - direct script execution
import { exec } from 'child_process';

const { stdout } = await exec('npm run find:token-violations');
const violations = parseViolations(stdout);
```

**After:**
```typescript
// New approach - use compatibility layer
import { validateDesignTokens } from '@/lib/agents';

const result = await validateDesignTokens(files);
console.log(`Compliance: ${result.compliance}%`);
```

### Migrating Agent Selection

**Before:**
```typescript
// Manual agent selection logic
const agent = determineAgent(task);
```

**After:**
```typescript
// Automatic routing with tier priority
import { routeTask } from '@/lib/agents';

const result = await routeTask({
  description: task.description,
  filesInProgress: task.files,
});

const agent = result.agent;
```

---

## Available Agents

### DCYFR-Specific Agents (Private Tier)

| Agent | Model | Use For |
|-------|-------|---------|
| dcyfr | sonnet | Production code with design tokens |
| quick-fix | haiku | Fast pattern-compliant fixes |
| test-specialist | sonnet | Test coverage maintenance (99% pass rate) |
| security-specialist | sonnet | OWASP compliance, vulnerability scanning |
| performance-specialist | sonnet | Core Web Vitals optimization |
| react-performance | sonnet | React memoization, Server Components |
| content-creator | opus | SEO-optimized MDX content |
| content-editor | sonnet | Content review and style |
| seo-specialist | sonnet | Technical SEO optimization |
| content-marketer | opus | Marketing campaigns |
| design-specialist | sonnet | Design token compliance |
| ui-ux-designer | opus | Interface design |
| accessibility-specialist | sonnet | WCAG 2.1 AA compliance |
| nextjs-expert | sonnet | App Router, Server Components |
| mcp-expert | sonnet | MCP configuration |
| mcp-server-architect | opus | Custom MCP server development |
| prompt-engineer | opus | AI prompt optimization |

### Generic Agents (Public Tier)

| Agent | Model | Use For |
|-------|-------|---------|
| fullstack-developer | opus | General full-stack development |
| frontend-developer | sonnet | React/Next.js development |
| backend-architect | opus | API design and architecture |
| typescript-pro | sonnet | Advanced TypeScript work |
| test-engineer | sonnet | Test strategies and coverage |
| debugger | sonnet | Bug investigation |
| security-engineer | opus | Security audits |
| architecture-reviewer | opus | Code organization and patterns |
| database-architect | opus | Database design |
| cloud-architect | opus | Cloud infrastructure |
| performance-profiler | sonnet | Performance optimization |
| devops-engineer | sonnet | CI/CD and deployment |
| data-scientist | opus | ML and data analysis |
| technical-writer | sonnet | Documentation |
| research-orchestrator | sonnet | Codebase exploration |

---

## Best Practices

1. **Use Automatic Routing**: Let `routeTask()` choose the best agent based on context
2. **Respect Tier Priority**: Project overrides > Private > Public
3. **Check Quality Gates**: Always validate against agent quality gates
4. **Handle Delegation**: Agents can delegate to specialists - be aware of delegation chains
5. **Fallback Gracefully**: Compatibility layer provides fallbacks if new system unavailable

---

## Troubleshooting

### Agent Not Found

```typescript
const agent = await getAgent('unknown-agent');
if (!agent) {
  console.error('Agent not found - check tier availability');
  // Fallback to generic agent
  const fallback = await getAgent('fullstack-developer');
}
```

### Compliance Below Threshold

```typescript
const result = await validateDesignTokens(files);
if (result.compliance < 90) {
  console.error('Violations:');
  result.violations.forEach((v, i) => {
    console.error(`  ${i + 1}. ${v}`);
    console.log(`     Fix: ${result.suggestions[i]}`);
  });
}
```

### Agent Registry Not Initialized

```typescript
import { getAgentRegistry } from '@/lib/agents';

const registry = getAgentRegistry();
await registry.initialize(); // Explicitly initialize if needed
```

---

## Resources

- **Agent Catalog**: .ai/agents/CATALOG.md
- **Skills Documentation**: .ai/skills/README.md
- **MCP Registry**: .ai/mcp/REGISTRY.md
- **Plan Document**: See original architecture plan for full details

---

**Last Updated:** January 29, 2026
**Status:** Phase 5 Integration Complete

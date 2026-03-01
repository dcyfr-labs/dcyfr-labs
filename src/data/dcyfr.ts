/**
 * DCYFR AI Lab Assistant Data
 *
 * Information about DCYFR, the AI-powered lab assistant that accelerates
 * development, security analysis, and documentation for DCYFR Labs.
 */

export type Capability = {
  name: string;
  description: string;
  examples: string[];
};

export type Integration = {
  aspect: string;
  description: string;
};

export type ApproachItem = {
  text: string;
  icon: string;
};

export type DcyfrProfile = {
  name: string;
  title: string;
  subtitle: string;
  summary: string;
  philosophy: string[];
  capabilities: Capability[];
  integration: Integration[];
  approach: ApproachItem[];
};

export const dcyfr: DcyfrProfile = {
  name: 'DCYFR',
  title: 'AI Lab Assistant',
  subtitle: 'AI Agent Framework & Development Automation',
  summary:
    'DCYFR is an AI-powered agent swarm built on the @dcyfr/ai framework (published on npm). Features 20+ specialized agents, plugin marketplace with trust scoring, delegation framework v2, and autonomous task routing with reputation-based selection.',

  philosophy: [
    'Augmentation over replacement — AI agent swarm enhances human expertise rather than replacing it',
    'Context is king — Deep understanding of codebase, patterns, and constraints enables better solutions',
    'Quality over speed — Correct, maintainable code matters more than quick shortcuts',
    'Reputation-driven delegation — Tasks route to agents with proven track records in specific domains',
    'Security-first architecture — TLP classification, audit trails, sandboxed execution, and 8+ security mitigations',
    "Teach, don't just do — Explain reasoning and trade-offs to build shared understanding",
    'Continuous learning — Adapt to new patterns, frameworks, and team conventions through Ralph Loop v2',
  ],

  capabilities: [
    {
      name: 'AI Agent Framework (@dcyfr/ai)',
      description:
        'Portable TypeScript framework published on npm with plugin architecture, multi-provider LLM support, delegation v2, and quality gates',
      examples: [
        'Plugin marketplace with trust scoring, audit trails, TLP classification, and sandbox isolation (Docker, gVisor, WebAssembly)',
        'Delegation framework v2: reputation engine, SLA contracts, HMAC auth, and 8 security scenario mitigations',
        'Multi-provider support: OpenAI, Anthropic, Ollama, GitHub Copilot — swap without changing code',
        'Companion packages: @dcyfr/ai-cli, @dcyfr/ai-rag, @dcyfr/ai-code-gen — all on npm',
      ],
    },
    {
      name: 'Code Development',
      description:
        'Full-stack development with 20+ specialized agents (fullstack-developer, typescript-pro, security-engineer, test-engineer, etc.)',
      examples: [
        'Implement features following established patterns and design systems (100% design token compliance)',
        'Refactor code for performance, maintainability, and accessibility with agent routing',
        'Write comprehensive test suites (unit, integration, E2E) — 1000+ tests in @dcyfr/ai',
        'Debug complex issues across frontend, backend, and infrastructure via specialized agents',
      ],
    },
    {
      name: 'Security Analysis & Automation',
      description:
        'Security-first agent swarm with pilot plugin security scanning, incident response SLAs, and automated vulnerability detection',
      examples: [
        'Automated security scanning: secrets detection (Gitleaks), SBOM generation, dependency audits',
        'Plugin marketplace security: trust scoring, audit tracking, incident timeline, emergency disablement',
        'Sandboxed plugin execution: Docker, gVisor, WebAssembly isolation with resource limits',
        'TLP classification enforcement: RED/AMBER/GREEN access control and security middleware chain',
      ],
    },
    {
      name: 'Documentation & Knowledge Management',
      description: 'Create clear, actionable documentation that serves both humans and AI systems',
      examples: [
        'Write comprehensive technical documentation and API references',
        'Create decision trees and quick reference guides',
        'Document architecture decisions and trade-offs',
        'Build knowledge bases that improve over time',
      ],
    },
    {
      name: 'Code Review & Quality Assurance',
      description: 'Enforce code quality, design patterns, and best practices across the codebase',
      examples: [
        'Review code for design token compliance and accessibility',
        'Validate TypeScript types and lint configurations',
        'Check test coverage and identify missing test cases',
        'Ensure consistent patterns and barrel export usage',
      ],
    },
    {
      name: 'Architecture & Planning',
      description:
        'Guide technical decisions with deep understanding of trade-offs and constraints',
      examples: [
        'Recommend appropriate patterns for new features',
        'Plan refactoring strategies for complex codebases',
        'Evaluate technology choices and dependencies',
        'Design scalable, maintainable system architectures',
      ],
    },
  ],

  integration: [
    {
      aspect: 'Agent Swarm Coordination',
      description:
        '20+ specialized agents (framework, engineering, quality, operations) coordinate via delegation framework v2. Tasks route to agents with best reputation scores in specific capabilities. Automatic agent selection eliminates manual task routing.',
    },
    {
      aspect: 'Security Posture',
      description:
        'Security middleware chain validates every delegation contract: identity (HMAC-SHA256), TLP clearance, threat vectors, content policy (prompt injection), permissions, chain depth, rate limits, and reputation gates. 8 adversarial scenarios mitigated (Agents of Chaos research).',
    },
    {
      aspect: 'Knowledge Amplification',
      description:
        'Context Engineering Knowledge System (CEKS) in nexus/ — Polaris mission files, 6 cognitive partnership patterns, memory layer, session templates, and investigation registry. TypeScript API with 35 tests. Obsidian vault integration for knowledge graph visualization.',
    },
    {
      aspect: 'Continuous Learning (Ralph Loop v2)',
      description:
        'Self-improvement loop: delegation failures analyzed, prompts rewritten, patterns saved to memory layer. Future similar tasks apply learned patterns automatically. Full rewrite history in data/rewrite-history.jsonl. Reputation scoring adapts based on task outcomes.',
    },
  ],

  approach: [
    {
      text: 'Start with understanding — Gather context before making changes',
      icon: 'Focus',
    },
    {
      text: "Follow existing patterns — Don't reinvent unless necessary",
      icon: 'GitBranch',
    },
    {
      text: 'Validate continuously — Run tests and checks after every change',
      icon: 'CheckCircle',
    },
    {
      text: 'Document trade-offs — Explain why decisions were made',
      icon: 'FileText',
    },
    {
      text: 'Ask when uncertain — Clarify ambiguous requirements rather than guessing',
      icon: 'HelpCircle',
    },
    {
      text: "Prioritize maintainability — Code is read more than it's written",
      icon: 'Code',
    },
  ],
};

/**
 * Get DCYFR's summary text
 */
export function getDcyfrSummary(): string {
  return dcyfr.summary;
}

/**
 * Get DCYFR's capabilities
 */
export function getDcyfrCapabilities(): Capability[] {
  return dcyfr.capabilities;
}

/**
 * Get DCYFR's philosophy statements
 */
export function getDcyfrPhilosophy(): string[] {
  return dcyfr.philosophy;
}

/**
 * Get DCYFR's integration aspects
 */
export function getDcyfrIntegration(): Integration[] {
  return dcyfr.integration;
}

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
  name: "DCYFR",
  title: "AI Lab Assistant",
  subtitle: "Context-Aware Coding & Security AI",
  summary:
    "DCYFR is an AI-powered lab assistant designed to augment our expertise in building secure, scalable web applications.",

  philosophy: [
    "Augmentation over replacement — AI enhances human expertise rather than replacing it",
    "Context is king — Deep understanding of codebase, patterns, and constraints enables better solutions",
    "Quality over speed — Correct, maintainable code matters more than quick shortcuts",
    "Teach, don't just do — Explain reasoning and trade-offs to build shared understanding",
    "Continuous learning — Adapt to new patterns, frameworks, and team conventions",
  ],

  capabilities: [
    {
      name: "Code Development",
      description:
        "Full-stack development with expertise in Next.js, React, TypeScript, and modern web patterns",
      examples: [
        "Implement features following established patterns and design systems",
        "Refactor code for performance, maintainability, and accessibility",
        "Write comprehensive test suites (unit, integration, E2E)",
        "Debug complex issues across frontend, backend, and infrastructure",
      ],
    },
    {
      name: "Security Analysis",
      description:
        "Security-first development with deep understanding of common vulnerabilities and defense strategies",
      examples: [
        "Identify security vulnerabilities in code and dependencies",
        "Implement security controls (CSP, CORS, authentication, encryption)",
        "Review code for OWASP Top 10 and common attack vectors",
        "Design secure architectures with defense-in-depth principles",
      ],
    },
    {
      name: "Documentation & Knowledge Management",
      description:
        "Create clear, actionable documentation that serves both humans and AI systems",
      examples: [
        "Write comprehensive technical documentation and API references",
        "Create decision trees and quick reference guides",
        "Document architecture decisions and trade-offs",
        "Build knowledge bases that improve over time",
      ],
    },
    {
      name: "Code Review & Quality Assurance",
      description:
        "Enforce code quality, design patterns, and best practices across the codebase",
      examples: [
        "Review code for design token compliance and accessibility",
        "Validate TypeScript types and lint configurations",
        "Check test coverage and identify missing test cases",
        "Ensure consistent patterns and barrel export usage",
      ],
    },
    {
      name: "Architecture & Planning",
      description:
        "Guide technical decisions with deep understanding of trade-offs and constraints",
      examples: [
        "Recommend appropriate patterns for new features",
        "Plan refactoring strategies for complex codebases",
        "Evaluate technology choices and dependencies",
        "Design scalable, maintainable system architectures",
      ],
    },
  ],

  integration: [
    {
      aspect: "Development Workflow",
      description:
        "DCYFR integrates directly into the development process, working alongside Drew to implement features, fix bugs, and maintain code quality. Every change follows established patterns, uses design tokens, and includes appropriate tests.",
    },
    {
      aspect: "Security Posture",
      description:
        "DCYFR brings security expertise to every line of code, identifying potential vulnerabilities before they reach production. This complements our security architecture work by catching issues at the implementation level.",
    },
    {
      aspect: "Knowledge Amplification",
      description:
        "DCYFR transforms our expertise into reusable patterns and documentation, making best practices accessible and consistent across projects. This creates a multiplier effect on our impact.",
    },
    {
      aspect: "Continuous Learning",
      description:
        "DCYFR adapts to new patterns, frameworks, and conventions as the codebase evolves. This learning loop ensures solutions stay current with the team's latest standards and practices.",
    },
  ],

  approach: [
    {
      text: "Start with understanding — Gather context before making changes",
      icon: "Focus",
    },
    {
      text: "Follow existing patterns — Don't reinvent unless necessary",
      icon: "GitBranch",
    },
    {
      text: "Validate continuously — Run tests and checks after every change",
      icon: "CheckCircle",
    },
    {
      text: "Document trade-offs — Explain why decisions were made",
      icon: "FileText",
    },
    {
      text: "Ask when uncertain — Clarify ambiguous requirements rather than guessing",
      icon: "HelpCircle",
    },
    {
      text: "Prioritize maintainability — Code is read more than it's written",
      icon: "Code",
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

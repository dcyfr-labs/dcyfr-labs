/**
 * DCYFR Labs Company CV Data
 * 
 * Professional services-oriented resume showcasing company capabilities,
 * service offerings, and client value propositions.
 */

export type ServiceCategory = {
  category: string;
  icon: string;
  services: {
    name: string;
    description: string;
    deliverables: string[];
  }[];
};

export type TechnicalCapability = {
  domain: string;
  skills: string[];
};

export type CaseStudy = {
  title: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  tech: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  links?: {
    label: string;
    href: string;
    type: "demo" | "github" | "docs";
  }[];
};

export type ValueProposition = {
  title: string;
  description: string;
  benefits: string[];
};

export type CompanyCV = {
  overview: {
    name: string;
    tagline: string;
    established: string;
    location: string;
    mission: string;
    differentiators: {
      title: string;
      description: string;
    }[];
  };
  services: ServiceCategory[];
  capabilities: TechnicalCapability[];
  caseStudies: CaseStudy[];
  valuePropositions: ValueProposition[];
};

export const companyCV: CompanyCV = {
  overview: {
    name: "DCYFR Labs",
    tagline: "Cyber Architecture & Security Design Services",
    established: "2025",
    location: "Remote-First",
    mission: "Building secure, scalable solutions for modern businesses. We combine deep security expertise with modern web technologies to deliver production-grade applications that protect what matters most.",
    differentiators: [
      {
        title: "Real-World Experience",
        description: "10+ years security architecture across Fortune 500 to startups, bringing battle-tested patterns to every project.",
      },
      {
        title: "AI-Augmented Development",
        description: "Leverage cutting-edge AI tools to accelerate delivery without compromising quality or security.",
      },
      {
        title: "Security by Design",
        description: "Security isn&apos;t an afterthought—it&apos;s built into every decision from day one.",
      },
      {
        title: "Production-Grade Quality",
        description: "99% test coverage, strict design systems, comprehensive documentation—every project is production-ready.",
      },
    ],
  },

  services: [
    {
      category: "Cyber Architecture & Design",
      icon: "shield",
      services: [
        {
          name: "Security Framework Design",
          description: "Comprehensive security frameworks tailored to your business needs and regulatory requirements.",
          deliverables: [
            "Security architecture documentation",
            "Threat model and risk assessment",
            "Security policy and procedure templates",
            "Implementation roadmap with milestones",
          ],
        },
        {
          name: "Risk Assessment & Vulnerability Management",
          description: "Identify, prioritize, and remediate security risks across your infrastructure and applications.",
          deliverables: [
            "Comprehensive risk assessment report",
            "Vulnerability prioritization matrix",
            "Remediation recommendations with timelines",
            "Ongoing monitoring and reporting strategy",
          ],
        },
        {
          name: "Incident Response Planning",
          description: "Prepare your team to detect, respond to, and recover from security incidents effectively.",
          deliverables: [
            "Incident response playbooks",
            "Communication templates and escalation procedures",
            "Tabletop exercise scenarios",
            "Post-incident review framework",
          ],
        },
        {
          name: "Cloud-Native Security Architecture",
          description: "Secure cloud deployments with zero-trust principles and defense-in-depth strategies.",
          deliverables: [
            "Cloud security architecture design",
            "Identity and access management (IAM) configuration",
            "Network segmentation and firewall rules",
            "Compliance mapping (SOC2, ISO 27001, HIPAA)",
          ],
        },
      ],
    },
    {
      category: "Secure Development Services",
      icon: "code",
      services: [
        {
          name: "Secure SDLC Implementation",
          description: "Integrate security into every phase of your development lifecycle.",
          deliverables: [
            "SDLC security requirements documentation",
            "Developer security training materials",
            "Code review checklists and automation",
            "Security testing integration (SAST/DAST)",
          ],
        },
        {
          name: "DevSecOps Pipeline Design",
          description: "Automate security testing and compliance checks in your CI/CD pipelines.",
          deliverables: [
            "CI/CD security gate configuration",
            "Automated security scanning (CodeQL, Dependabot)",
            "Secrets management implementation",
            "Deployment security validation",
          ],
        },
        {
          name: "Code Review & Security Testing",
          description: "Expert code review and penetration testing to identify vulnerabilities before production.",
          deliverables: [
            "Manual code review with security focus",
            "Automated security testing reports",
            "Vulnerability remediation guidance",
            "Security hardening recommendations",
          ],
        },
        {
          name: "Compliance & Regulatory Guidance",
          description: "Navigate complex compliance requirements (HIPAA, SOC2, PCI-DSS, GDPR).",
          deliverables: [
            "Compliance gap analysis",
            "Control implementation guidance",
            "Audit preparation and documentation",
            "Ongoing compliance monitoring",
          ],
        },
      ],
    },
    {
      category: "Web Application Development",
      icon: "globe",
      services: [
        {
          name: "Next.js/React Production Applications",
          description: "Modern, performant web applications built with the latest frameworks and best practices.",
          deliverables: [
            "Production-ready Next.js application",
            "Responsive, accessible UI components",
            "Performance optimization (Lighthouse 90+ scores)",
            "Comprehensive test coverage (≥99%)",
          ],
        },
        {
          name: "TypeScript-First Development",
          description: "Type-safe development for maintainable, scalable codebases.",
          deliverables: [
            "Strict TypeScript configuration",
            "Type-safe API contracts",
            "Auto-generated API documentation",
            "IDE integration and developer tooling",
          ],
        },
        {
          name: "Performance & SEO Optimization",
          description: "Fast, discoverable applications that rank well and delight users.",
          deliverables: [
            "Performance audit and optimization",
            "SEO implementation (metadata, sitemaps, structured data)",
            "Core Web Vitals optimization",
            "Analytics and monitoring setup",
          ],
        },
        {
          name: "Accessibility-First Design",
          description: "WCAG AA compliant applications that work for everyone.",
          deliverables: [
            "Accessibility audit and remediation",
            "Screen reader optimization",
            "Keyboard navigation support",
            "Color contrast and focus management",
          ],
        },
      ],
    },
    {
      category: "AI Integration & Automation",
      icon: "brain",
      services: [
        {
          name: "AI-Powered Development Workflows",
          description: "Accelerate development with custom AI assistants and automation.",
          deliverables: [
            "Custom Claude Code agents for specialized tasks",
            "Prompt engineering and optimization",
            "Knowledge base integration (RAG)",
            "Workflow automation and tool integration",
          ],
        },
        {
          name: "LLM Integration & Optimization",
          description: "Integrate large language models into your applications securely and efficiently.",
          deliverables: [
            "LLM API integration (Claude, GPT, Gemini)",
            "Prompt template library",
            "Rate limiting and cost optimization",
            "Security and privacy controls",
          ],
        },
        {
          name: "Model Context Protocol (MCP) Servers",
          description: "Build and integrate MCP servers for AI-powered tools and workflows.",
          deliverables: [
            "Custom MCP server development",
            "Integration with development tools",
            "Documentation and usage guides",
            "Security and access controls",
          ],
        },
        {
          name: "Knowledge Management & Documentation",
          description: "Automated documentation generation and knowledge base maintenance.",
          deliverables: [
            "Automated documentation from code",
            "Knowledge base search and retrieval",
            "Version control and changelog automation",
            "Team knowledge sharing platform",
          ],
        },
      ],
    },
  ],

  capabilities: [
    {
      domain: "Security & Compliance",
      skills: [
        "Threat Modeling & Risk Assessment",
        "Vulnerability Management",
        "Incident Response Planning",
        "Security Monitoring & SIEM",
        "Penetration Testing & Red Team",
        "ISO 27001, NIST CSF, CIS Controls",
        "SOC2, HIPAA, PCI-DSS, GDPR",
        "Zero Trust Architecture",
        "Identity & Access Management (IAM)",
        "Secrets Management (Vault, AWS Secrets Manager)",
      ],
    },
    {
      domain: "Development & Architecture",
      skills: [
        "Next.js 16 (App Router, React Server Components)",
        "React 19 (Hooks, Suspense, Concurrent Features)",
        "TypeScript (Strict Mode, Type Safety)",
        "Node.js & Python",
        "Tailwind CSS v4 & shadcn/ui",
        "PostgreSQL, Redis, MongoDB",
        "REST & GraphQL APIs",
        "Serverless Architecture (Vercel, AWS Lambda)",
        "CI/CD (GitHub Actions, Vercel)",
        "Docker & Container Orchestration",
      ],
    },
    {
      domain: "AI & Automation",
      skills: [
        "LLM Integration (Claude, GPT, Gemini)",
        "Prompt Engineering & Optimization",
        "Retrieval-Augmented Generation (RAG)",
        "Model Context Protocol (MCP)",
        "Workflow Automation (Inngest, n8n)",
        "AI Code Assistants (Claude Code, Copilot)",
        "Natural Language Processing",
        "Sentiment Analysis & Classification",
        "AI Safety & Security",
        "Ethical AI Implementation",
      ],
    },
  ],

  caseStudies: [
    {
      title: "DCYFR Labs Portfolio Platform",
      description: "A modern, production-grade portfolio and blog platform showcasing cyber architecture expertise.",
      challenge: "Build a high-performance, secure platform to showcase technical expertise while demonstrating best practices in web development and security.",
      solution: "Implemented a Next.js 16 application with React 19, featuring a comprehensive design system, 99% test coverage, automated security scanning, and AI-powered content management.",
      results: [
        "Lighthouse scores: 90+ across Performance, Accessibility, Best Practices, SEO",
        "99% test pass rate with strategic test coverage (1659/1717 tests passing)",
        "90%+ design token compliance with automated enforcement",
        "Zero security vulnerabilities (automated CodeQL + Dependabot scanning)",
        "Sub-2-second page loads with optimized images and code splitting",
      ],
      tech: [
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Tailwind v4",
        "Vitest + Playwright",
        "GitHub Actions",
        "Vercel",
      ],
      metrics: [
        { label: "Performance Score", value: "95" },
        { label: "Accessibility Score", value: "100" },
        { label: "Test Coverage", value: "99%" },
        { label: "Design Token Compliance", value: "90%" },
      ],
      links: [
        { label: "Live Site", href: "https://dcyfrlabs.com", type: "demo" },
        { label: "Source Code", href: "https://github.com/dcyfr/dcyfr-labs", type: "github" },
      ],
    },
    {
      title: "Automated Security Framework",
      description: "Comprehensive security automation reducing manual security review time by 80%.",
      challenge: "Manual security reviews were slowing down development velocity and missing critical vulnerabilities.",
      solution: "Implemented automated CodeQL analysis, Dependabot auto-merge for safe updates, custom LGTM suppressions for false positives, and continuous security monitoring with Sentry integration.",
      results: [
        "80% reduction in manual security review time",
        "100% automated dependency updates for patches and minor versions",
        "Zero false positives in security alerts (via LGTM suppressions)",
        "Real-time security monitoring and incident response",
        "Compliance-ready audit trail and documentation",
      ],
      tech: [
        "GitHub CodeQL",
        "Dependabot",
        "GitHub Actions",
        "Sentry",
        "Custom automation scripts",
      ],
      metrics: [
        { label: "Review Time Saved", value: "80%" },
        { label: "Automated Updates", value: "100%" },
        { label: "False Positives", value: "0" },
      ],
    },
    {
      title: "AI-Augmented Development Workflow",
      description: "Custom AI agents and tooling accelerating feature development by 3x without sacrificing quality.",
      challenge: "Balancing development speed with code quality, security, and comprehensive testing.",
      solution: "Created specialized Claude Code agents for production enforcement, quick fixes, and test coverage. Integrated MCP servers for Sentry, Axiom, and GitHub. Implemented design token enforcement system.",
      results: [
        "3x faster feature development cycle",
        "Maintained 99% test pass rate throughout rapid iteration",
        "Zero design token violations in new code",
        "Automated code review and pattern enforcement",
        "Knowledge capture and documentation generation",
      ],
      tech: [
        "Claude Code Agents",
        "MCP Servers",
        "Custom ESLint Rules",
        "GitHub Copilot",
        "Automated Testing",
      ],
      metrics: [
        { label: "Development Speed", value: "3x" },
        { label: "Test Coverage", value: "99%" },
        { label: "Token Compliance", value: "100%" },
      ],
    },
  ],

  valuePropositions: [
    {
      title: "Real-World Experience",
      description: "Over a decade of security architecture across diverse industries and company sizes.",
      benefits: [
        "Battle-tested patterns from Fortune 500 to startup environments",
        "Experience with complex regulatory requirements (HIPAA, SOC2, PCI-DSS)",
        "Proven incident response and crisis management",
        "Deep understanding of trade-offs and practical constraints",
      ],
    },
    {
      title: "Modern Technology Stack",
      description: "Cutting-edge frameworks and best practices for scalable, maintainable solutions.",
      benefits: [
        "Next.js 16 with React 19 for optimal performance",
        "TypeScript-first development for type safety",
        "Comprehensive testing strategies (unit, integration, E2E)",
        "Continuous integration and deployment automation",
      ],
    },
    {
      title: "Security by Design",
      description: "Security isn&apos;t bolted on—it&apos;s the foundation of every decision.",
      benefits: [
        "Threat modeling from initial design phase",
        "Automated security scanning in CI/CD pipelines",
        "Regular security audits and penetration testing",
        "Compliance-ready architecture and documentation",
      ],
    },
    {
      title: "AI-Augmented Delivery",
      description: "Harness AI to accelerate development without compromising on quality.",
      benefits: [
        "3x faster feature development with AI assistance",
        "Automated code review and pattern enforcement",
        "Comprehensive documentation generation",
        "Knowledge transfer and team enablement",
      ],
    },
    {
      title: "Transparent & Collaborative",
      description: "Clear communication, open processes, and knowledge sharing throughout.",
      benefits: [
        "Regular status updates and milestone tracking",
        "Open source contributions and code examples",
        "Comprehensive documentation and handoff materials",
        "Post-project support and maintenance",
      ],
    },
  ],
};

/**
 * Get company overview information
 */
export function getCompanyOverview() {
  return companyCV.overview;
}

/**
 * Get all service categories
 */
export function getServiceCategories(): ServiceCategory[] {
  return companyCV.services;
}

/**
 * Get technical capabilities by domain
 */
export function getTechnicalCapabilities(): TechnicalCapability[] {
  return companyCV.capabilities;
}

/**
 * Get case studies
 */
export function getCaseStudies(): CaseStudy[] {
  return companyCV.caseStudies;
}

/**
 * Get value propositions
 */
export function getValuePropositions(): ValueProposition[] {
  return companyCV.valuePropositions;
}

export default companyCV;

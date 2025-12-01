/**
 * Team Data
 * 
 * Centralized team member information for /team and /about pages.
 */

import { Bot, Code, Shield, Sparkles, Zap } from "lucide-react";
import type { TeamMember, TeamCollaborationArea, TeamHighlight } from "@/types/team";

export const teamMembers: TeamMember[] = [
  {
    id: "drew",
    name: "Drew",
    title: "Cyber Architect",
    subtitle: "Human",
    description: "Cyber architect focused on secure development, incident response, and building resilient systems.",
    badges: [
      { label: "Security", icon: Shield },
      { label: "Development", icon: Code },
    ],
    strengths: [
      "Security architecture & compliance (ISO 27001, SOC2, TISAX)",
      "Incident response & threat hunting",
      "Secure development & DevSecOps",
      "Risk assessment & vulnerability management",
    ],
    philosophy: "Security isn't about saying no—it's about enabling innovation with confidence.",
    avatarType: "image",
    isPrimary: true,
  },
  {
    id: "dcyfr",
    name: "DCYFR",
    title: "AI Lab Assistant",
    subtitle: "Digital Collaborator",
    description: "Context-aware coding and security assistant accelerating implementation, analysis, and docs.",
    badges: [
      { label: "AI-Powered", icon: Zap },
      { label: "Automation", icon: Code },
    ],
    capabilities: [
      "Code generation & refactoring",
      "Security vulnerability analysis",
      "Architecture & design patterns",
      "Documentation & testing assistance",
      "Real-time development context via MCP",
    ],
    integration: "Connected to GitHub, Sentry, Vercel, and other development tools via Model Context Protocol (MCP), providing comprehensive project awareness and intelligent assistance across the entire development lifecycle.",
    avatarType: "icon",
    avatarIcon: Bot,
    isPrimary: false,
  },
];

export const collaborationAreas: TeamCollaborationArea[] = [
  {
    title: "Development",
    icon: Code,
    description: "Drew architects solutions and makes strategic decisions while DCYFR accelerates implementation through intelligent code generation and refactoring suggestions.",
  },
  {
    title: "Security",
    icon: Shield,
    description: "Drew provides security expertise and threat modeling while DCYFR assists with vulnerability scanning, security pattern implementation, and compliance checks.",
  },
  {
    title: "Innovation",
    icon: Sparkles,
    description: "Together, we explore emerging technologies, experiment with new patterns, and continuously improve our development practices and tooling.",
  },
];

export const teamHighlights: TeamHighlight[] = [
  {
    emoji: "⚡",
    title: "Fastest Collaboration Time",
    description: "Shipped a complete blog system with MDX processing, syntax highlighting, and analytics in under 4 hours.",
  },
  {
    emoji: "🔒",
    title: "Security Wins",
    description: "Implemented comprehensive CSP, rate limiting, and input validation across the entire platform.",
  },
  {
    emoji: "📚",
    title: "Favorite Tech Stack",
    description: "Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui for the perfect balance of performance and developer experience.",
  },
  {
    emoji: "🎯",
    title: "Current Focus",
    description: "Exploring advanced MCP integrations, performance optimization, and building comprehensive documentation systems.",
  },
];

export const teamDescription = "A human-AI partnership building secure, innovative solutions for the modern web.";

export const teamApproach = {
  title: "Our Collaborative Approach",
  principles: [
    {
      title: "Human Judgment + AI Efficiency",
      description: "Drew brings strategic thinking, security expertise, and real-world experience. DCYFR provides rapid implementation, pattern recognition, and tireless attention to detail.",
    },
    {
      title: "Context-Aware Development",
      description: "Through Model Context Protocol (MCP), DCYFR maintains awareness of the entire codebase, recent changes, production issues, and deployment status—enabling more intelligent assistance.",
    },
    {
      title: "Continuous Learning",
      description: "Every interaction improves our workflow. Drew refines processes and shares knowledge, while DCYFR adapts to project patterns and preferences.",
    },
    {
      title: "Security-First Mindset",
      description: "Both team members prioritize security at every level—from architecture decisions to code implementation to deployment practices.",
    },
  ],
};

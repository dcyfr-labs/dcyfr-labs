/**
 * Team Data
 *
 * Centralized team member information for /team and /about pages.
 */

import { Code, Shield, Sparkles, Zap } from 'lucide-react';
import type { TeamMember } from '@/types/team';

export const teamDescription =
  'Author of @dcyfr/ai, a portable open-source AI agent framework on npm, and a human-AI partnership building secure software at scale.';

export const teamMembers: TeamMember[] = [
  {
    id: 'drew',
    name: 'Drew',
    title: 'Founding Architect',
    subtitle: 'Cyber Architect & Security Expert',
    description:
      'Founding Architect and creator of @dcyfr/ai — a portable open-source TypeScript AI agent with plugin marketplace, delegation system, and 20+ specialist agents published on npm. Security architect with 6+ years of experience leading global security programs and secure AI engineering.',
    badges: [
      { label: 'Coffee Powered', icon: Sparkles },
      { label: 'Secure by Design', icon: Shield },
      { label: 'Full-Stack Developer', icon: Code },
    ],
    philosophy: "Security isn't about saying no, it's about enabling innovation with confidence.",
    avatarType: 'image',
    avatarImagePath: 'https://github.com/dcyfr.png',
    isPrimary: true,
    slug: 'drew',
    profileUrl: '/about/drew',
  },
  {
    id: 'dcyfr',
    name: 'DCYFR',
    title: 'AI Lab Assistant',
    subtitle: 'Agent Swarm & Automation',
    description:
      'An autonomous agent swarm built on the @dcyfr/ai framework — 20+ specialist agents for security analysis, code generation, architecture review, and delegation-routed task execution. Published on npm and powering DCYFR Labs development.',
    badges: [
      { label: 'Security Focused', icon: Shield },
      { label: 'AI Paired-Programming', icon: Zap },
      { label: 'Full-Stack Automation', icon: Code },
    ],
    philosophy: 'Augmenting human expertise with AI to build better, more secure software.',
    highlights: [
      {
        icon: Shield,
        title: 'Security Architecture',
        description:
          'Plugin marketplace trust scoring, TLP classification, HMAC identity verification, and 8 adversarial scenario mitigations built into @dcyfr/ai.',
      },
      {
        icon: Zap,
        title: 'Delegation Framework',
        description:
          'Reputation-driven task routing with SLA contracts, quality gates, and automatic agent selection based on proven track records.',
      },
      {
        icon: Code,
        title: '20+ Specialist Agents',
        description:
          'fullstack-developer, typescript-pro, security-engineer, test-engineer, and more — each with declared capabilities and performance metrics.',
      },
    ],
    avatarType: 'image',
    avatarImagePath: '/images/dcyfr-avatar.svg',
    isPrimary: false,
    slug: 'dcyfr',
    profileUrl: '/about/dcyfr',
  },
];

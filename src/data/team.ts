/**
 * Team Data
 * 
 * Centralized team member information for /team and /about pages.
 */

import { Code, Shield, Sparkles, Zap } from "lucide-react";
import type { TeamMember, TeamCollaborationArea, TeamHighlight } from "@/types/team";

export const teamDescription = "A virtual partnership dedicated to building secure, innovative solutions for the modern web.";

export const teamMembers: TeamMember[] = [
  {
    id: "drew",
    name: "Drew",
    title: "Founding Architect",
    subtitle: "Cyber Architect & Security Expert",
    description: "A seasoned cybersecurity architect with a passion for building secure, scalable web solutions that empower businesses to innovate with confidence.",
    badges: [
      { label: "Coffee-Powered", icon: Sparkles },
      { label: "Security by Design", icon: Shield },
      { label: "Full-Stack Developer", icon: Code },
    ],
    philosophy: "Security isn't about saying no, it's about enabling innovation with confidence.",
    avatarType: "image",
    avatarImagePath: "https://github.com/dcyfr.png", // Drew's GitHub avatar
    isPrimary: true,
    slug: "drew",
    profileUrl: "/about/drew",
  },
  {
    id: "dcyfr",
    name: "DCYFR",
    title: "AI Lab Assistant",
    subtitle: "Context-Aware Coding & Security AI",
    description: "An AI assistant focused on automating code reviews, documentation, and security analysis to enhance developer productivity.",
    badges: [
      { label: "AI-Powered", icon: Zap },
      { label: "Innovation by Design", icon: Shield },
      { label: "Full-Stack Automation", icon: Code },
    ],
    philosophy: "Augmenting human expertise with AI to build better, more secure software.",
    highlights: [
      {
        icon: Zap,
        title: "AI-Powered Assistance",
        description: "Leverages advanced AI to provide context-aware coding help and security insights.",
      },
      {
        icon: Shield,
        title: "Security Focused",
        description: "Specializes in identifying vulnerabilities and suggesting robust security practices.",
      },
    ],
    avatarType: "image",
    avatarImagePath: "/images/dcyfr-avatar.svg",
    isPrimary: false,
    slug: "dcyfr",
    profileUrl: "/about/dcyfr",
  },
];
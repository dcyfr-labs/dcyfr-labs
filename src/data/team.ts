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
    description: "Cyber architect specializing in secure development, incident response, and building resilient systems.",
    badges: [
      { label: "Security", icon: Shield },
      { label: "Development", icon: Code },
    ],
    philosophy: "Security isn't about saying no, it's about enabling innovation with confidence.",
    avatarType: "image",
    isPrimary: true,
  },
  {
    id: "dcyfr",
    name: "DCYFR",
    title: "AI Lab Assistant",
    subtitle: "Context-Aware Coding & Security AI",
    description: "Context-aware coding and security assistant accelerating implementation, analysis, and docs.",
    badges: [
      { label: "AI-Powered", icon: Zap },
      { label: "Automation", icon: Code },
    ],
    avatarType: "image",
    avatarImagePath: "/images/dcyfr-avatar.svg",
    isPrimary: false,
  },
];
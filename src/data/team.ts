/**
 * Team Data
 *
 * Centralized team member information for /team and /about pages.
 */

import { Code, Shield, Sparkles, Zap } from "lucide-react";
import type {
  TeamMember,
  TeamCollaborationArea,
  TeamHighlight,
} from "@/types/team";

export const teamDescription =
  "A virtual partnership dedicated to building secure, innovative solutions for the modern web.";

export const teamMembers: TeamMember[] = [
  {
    id: "drew",
    name: "Drew",
    title: "Founding Architect",
    subtitle: "Cyber Architect & Security Expert",
    description:
      "A seasoned cybersecurity architect with a passion for building secure, scalable web solutions that empower businesses to innovate with confidence.",
    badges: [
      { label: "Coffee Powered", icon: Sparkles },
      { label: "Secure by Design", icon: Shield },
      { label: "Full-Stack Developer", icon: Code },
    ],
    philosophy:
      "Security isn't about saying no, it's about enabling innovation with confidence.",
    avatarType: "image",
    avatarImagePath: "https://github.com/dcyfr.png",
    isPrimary: true,
    slug: "drew",
    profileUrl: "/about/drew",
  },
  {
    id: "dcyfr",
    name: "DCYFR",
    title: "AI Lab Assistant",
    subtitle: "Context-Aware Coding & Security AI",
    description:
      "An AI assistant focused on automating code reviews, documentation, and security analysis to enhance developer productivity.",
    badges: [
      { label: "Security Focused", icon: Shield },
      { label: "AI Paired-Programming", icon: Zap },
      { label: "Full-Stack Automation", icon: Code },
    ],
    philosophy:
      "Augmenting human expertise with AI to build better, more secure software.",
    highlights: [
      {
        icon: Shield,
        title: "Security-Focused",
        description:
          "Specializes in identifying vulnerabilities and suggesting best practices during the development process.",
      },
      {
        icon: Zap,
        title: "AI Paired-Programming",
        description:
          "Excels at collaborating with developers to write, review, and optimize code efficiently.",
      },
      {
        icon: Code,
        title: "Full-Stack Expertise",
        description:
          "Proficient across front-end and back-end technologies, enabling seamless integration and automation.",
      },
    ],
    avatarType: "image",
    avatarImagePath: "/images/dcyfr-avatar.svg",
    isPrimary: false,
    slug: "dcyfr",
    profileUrl: "/about/dcyfr",
  },
];

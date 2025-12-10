import type { InviteCode } from "@/types/invites";

/**
 * Invite Codes Data
 *
 * Centralized list of invite/referral codes for platforms and services.
 * Featured codes appear on /sponsors page, all codes on /invites page.
 */

export const inviteCodes: InviteCode[] = [
  // Professional Networks
  {
    id: "linkedin",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/dcyfr",
    description: "Connect with me on LinkedIn for professional networking, industry insights, and career opportunities.",
    category: "professional-network",
    featured: false,
    addedAt: "2025-12-06",
    metrics: "10k+ connections"
  },
  {
    id: "peerlist",
    platform: "Peerlist",
    url: "https://peerlist.io/dcyfr/signup",
    description: "Professional network for people in tech. Build your portfolio, connect with peers, and discover opportunities.",
    category: "professional-network",
    featured: true,
    addedAt: "2025-12-06",
    metrics: "Join 100K+ builders"
  },
  {
    id: "wellfound",
    platform: "Wellfound",
    url: "https://wellfound.com/u/dcyfr",
    description: "Join me on Wellfound to explore startup opportunities, connect with founders, and grow your career in tech.",
    category: "professional-network",
    featured: false,
    addedAt: "2025-12-06",
    metrics: "Discover startups"
  },
  // Developer Communities
  {
    id: "sponsors",
    platform: "GitHub Sponsors",
    url: "https://github.com/sponsors/dcyfr",
    description: "Support open source development by sponsoring our work on GitHub.",
    category: "developer-community",
    featured: false,
    addedAt: "2024-01-15",
    metrics: "Support our work"
  },
  // Learning Platforms
  {
    id: "perplexity",
    platform: "Perplexity",
    url: "https://www.perplexity.ai/referrals/17XCE9S0",
    description: "AI-powered search engine that answers complex questions with sources. Use our referral link for a great experience.",
    category: "learning-platform",
    featured: true,
    addedAt: "2025-12-10",
    metrics: "AI-powered answers"
  },
  // Productivity Tools
  {
    id: "cal",
    platform: "Cal.com",
    url: "https://refer.cal.com/dcyfr",
    description: "Schedule a 1:1 meeting to discuss security, architecture, or career growth in tech.",
    category: "productivity-tools",
    featured: true,
    addedAt: "2025-12-06",
    metrics: "Book a free intro call"
  },
  {
    id: "raycast",
    platform: "Raycast",
    url: "https://raycast.com/?via=dcyfr",
    description: "Supercharge your productivity with Raycast. A blazingly fast launcher that lets you control tools, shortcuts, and workflows.",
    category: "productivity-tools",
    featured: false,
    addedAt: "2025-12-06",
    metrics: "Free to start"
  },
  // Design Tools
  // Other
];

/**
 * Get featured invite codes (shown on /sponsors page)
 */
export const featuredInviteCodes = inviteCodes.filter(code => code.featured);

/**
 * Get invite codes by category
 */
export function getInviteCodesByCategory(category: InviteCode["category"]): InviteCode[] {
  return inviteCodes.filter(code => code.category === category);
}

/**
 * Get invite code by ID
 */
export function getInviteCodeById(id: string): InviteCode | undefined {
  return inviteCodes.find(code => code.id === id);
}

/**
 * Category labels for display
 */
export const INVITE_CODE_CATEGORY_LABELS: Record<InviteCode["category"], string> = {
  "professional-network": "Professional Networks",
  "developer-community": "Developer Communities",
  "design-tools": "Design Tools",
  "learning-platform": "Learning Platforms",
  "productivity-tools": "Productivity Tools",
  "other": "Other"
};

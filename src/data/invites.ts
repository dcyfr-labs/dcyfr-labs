import type { InviteCode } from "@/types/invites";

/**
 * Invite Codes Data
 *
 * Centralized list of invite/referral codes for platforms and services.
 * Featured codes appear on /sponsors page, all codes on /invites page.
 */

export const inviteCodes: InviteCode[] = [
  {
    id: "peerlist",
    platform: "Peerlist",
    url: "https://peerlist.io/dcyfr/signup",
    description: "Professional network for people in tech. Build your portfolio, connect with peers, and discover opportunities.",
    category: "professional-network",
    featured: true,
    addedAt: "2025-12-06",
    metrics: "Join 100K+ tech professionals"
  },
  {
    id: "github-sponsors",
    platform: "GitHub Sponsors",
    url: "https://github.com/sponsors/dcyfr",
    description: "Support open source work and get exclusive benefits. Help us dedicate more time to building in public.",
    category: "developer-community",
    featured: true,
    addedAt: "2025-12-06",
    metrics: "Sponsor open source"
  },
  {
    id: "cal",
    platform: "Cal.com",
    url: "https://cal.com/dcyfr",
    description: "Schedule a 1:1 meeting to discuss security, architecture, or career growth in tech.",
    category: "productivity-tools",
    featured: true,
    addedAt: "2025-12-06",
    metrics: "Book a free consultation"
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/dcyfr",
    description: "Connect on LinkedIn for professional networking and career updates in security and software engineering.",
    category: "professional-network",
    featured: false,
    addedAt: "2025-12-06"
  },
  {
    id: "credly",
    platform: "Credly",
    url: "https://www.credly.com/users/dcyfr",
    description: "Verify professional certifications and security credentials. View badges from GIAC, CompTIA, and more.",
    category: "professional-network",
    featured: false,
    addedAt: "2025-12-06"
  },
  {
    id: "goodreads",
    platform: "Goodreads",
    url: "https://www.goodreads.com/dcyfr",
    description: "Follow reading lists focused on security, systems design, and software engineering.",
    category: "learning-platform",
    featured: false,
    addedAt: "2025-12-06"
  },
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

/**
 * Social Media Links Configuration
 * 
 * Centralized management of all social media accounts and profiles.
 * Used across the site for consistent linking and display.
 */

export type SocialPlatform =
  | "linkedin"
  | "github"
  | "sponsors"
  | "twitter"
  | "dev"
  | "peerlist"
  | "wellfound"
  | "goodreads"
  | "credly"
  | "calendar"
  | "orcid"

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
  icon?: string; // Optional icon identifier for UI libraries
  description?: string; // Optional description for accessibility
};

/**
 * Primary social media accounts
 */
export const socialLinks: SocialLink[] = [
    {
      platform: "calendar",
      label: "Booking Page",
      url: "https://cal.com/dcyfr",
      icon: "calendar",
      description: "Meet with us"
    },
    {
      platform: "twitter",
      label: "Twitter/X",
      url: "https://x.com/dcyfr_",
      icon: "twitter",
      description: "Follow us on Twitter/X"
    },
    {
      platform: "dev",
      label: "DEV",
      url: "https://dev.to/dcyfr",
      icon: "code",
      description: "Read our articles on DEV"
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/dcyfr",
      icon: "linkedin",
      description: "Connect on LinkedIn"
    },
    {
      platform: "peerlist",
      label: "Peerlist",
      url: "https://peerlist.io/dcyfr",
      icon: "users",
      description: "Build on Peerlist"
    },
    {
      platform: "wellfound",
      label: "Wellfound",
      url: "https://wellfound.com/u/dcyfr",
      icon: "briefcase",
      description: "Explore startups on Wellfound"
    },
    {
      platform: "github",
      label: "GitHub",
      url: "https://github.com/dcyfr",
      icon: "github",
      description: "View our code"
    },
    {
      platform: "sponsors",
      label: "Become a Sponsor",
      url: "https://github.com/sponsors/dcyfr",
      icon: "heart",
      description: "Support open source projects"
    },
    {
      platform: "credly",
      label: "Credly",
      url: "https://www.credly.com/users/dcyfr",
      icon: "award",
      description: "View our professional certifications"
    },
    {
      platform: "goodreads",
      label: "Goodreads",
      url: "https://www.goodreads.com/dcyfr",
      icon: "book-open",
      description: "Read through our bookshelf"
    }
  ];

/**
 * Get social link by platform
 */
export function getSocialLink(platform: SocialPlatform): SocialLink | undefined {
  return socialLinks.find(link => link.platform === platform);
}

/**
 * Get all social URLs as an array (useful for JSON-LD schema)
 */
export function getSocialUrls(): string[] {
  return socialLinks.map(link => link.url);
}

/**
 * Username/handle constants for dynamic URL construction
 */
export const SOCIAL_HANDLES = {
  twitter: "dcyfr_",
  dev: "dcyfr",
  github: "dcyfr",
  linkedin: "dcyfr",
  peerlist: "dcyfr",
  goodreads: "dcyfr",
} as const;

/**
 * Invite Code Types
 *
 * Types for invite code tracking and display.
 * Used on /sponsors and /invites pages.
 */

/**
 * Platform category for grouping invite codes
 */
export type InviteCodeCategory =
  | "professional-network"
  | "developer-community"
  | "design-tools"
  | "learning-platform"
  | "productivity-tools"
  | "other";

/**
 * Invite code data structure
 */
export interface InviteCode {
  /** Unique identifier (platform slug) */
  id: string;
  /** Platform name (e.g., "Peerlist", "GitHub Sponsors") */
  platform: string;
  /** Display label (if different from platform) */
  label?: string;
  /** Full invite/signup URL */
  url: string;
  /** Short description of the platform/benefit */
  description: string;
  /** Platform category for grouping */
  category: InviteCodeCategory;
  /** Featured codes appear on /sponsors page */
  featured?: boolean;
  /** Optional sponsor who provides this code */
  sponsorName?: string;
  /** Date code was added (ISO string) */
  addedAt: string;
  /** Optional metrics text (e.g., "Join 50K+ developers") */
  metrics?: string;
}

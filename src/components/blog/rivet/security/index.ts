/**
 * Security Components for Blog Posts
 *
 * This module provides specialized components for displaying
 * security-related information in blog posts:
 *
 * - SeverityLabel: Color-coded badges for vulnerability severity levels
 * - CVELink: Automatic CVE linking with footnote tracking
 * - CVETracker: Context provider for tracking CVE first mentions
 * - CVEFootnote: Formatted footnote entries for CVE details
 */

export { SeverityLabel, type SeverityLevel } from "./severity-label";
export { CVELink, CVETracker, CVEFootnote } from "./cve-link";

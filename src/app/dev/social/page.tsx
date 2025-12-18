import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/metadata';
import { SocialManager } from '@/components/admin';

export const metadata: Metadata = createPageMetadata({
  title: "Social Media Management",
  description: "Social media management dashboard for analytics, drafts, posting, and timeline views across multiple platforms",
  path: "/dev/social",
});

/**
 * Social Media Management Dashboard
 * 
 * Comprehensive tool for managing social media presence including:
 * - Analytics and engagement stats across platforms
 * - Draft post creation and management  
 * - Remote posting capabilities
 * - Timeline view of published content
 * - Platform-specific settings and authentication
 * 
 * Currently supports:
 * - LinkedIn (primary integration)
 * 
 * Future platforms:
 * - Twitter/X
 * - Instagram
 * - Facebook
 */
export default function SocialManagementPage() {
  return <SocialManager />;
}
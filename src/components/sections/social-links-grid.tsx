import React from "react";
import { Card } from "@/components/ui/card";
import { sanitizeUrl } from "@/lib/utils";
import { socialLinks } from "@/data/socials";
import { HOVER_EFFECTS } from "@/lib/design-tokens";
import {
  Github,
  Linkedin,
  Heart,
  Users,
  BookOpen,
  Calendar,
  Award,
  GraduationCap,
  ExternalLink,
  Twitter,
  Code2,
  Briefcase,
} from "lucide-react";

/** Map of platform names to their icon components */
const PLATFORM_ICONS: Record<string, React.ElementType> = {
  calendar: Calendar,
  twitter: Twitter,
  dev: Code2,
  linkedin: Linkedin,
  peerlist: Users,
  wellfound: Briefcase,
  github: Github,
  sponsors: Heart,
  credly: Award,
  goodreads: BookOpen,
  orcid: GraduationCap,
};

/**
 * Social Links Grid Component
 *
 * Displays social media and professional profile links in a responsive grid layout.
 * All links are external and open in a new tab with proper security attributes.
 *
 * Features:
 * - Responsive grid (1 col mobile, 2 cols desktop)
 * - Platform-specific icons
 * - Hover effects with border/icon color transitions
 * - External link indicators
 * - URL sanitization for security
 *
 * @example
 * ```tsx
 * <SocialLinksGrid />
 * ```
 */
export function SocialLinksGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {socialLinks.map((social) => {
        const IconComponent = PLATFORM_ICONS[social.platform] ?? ExternalLink;

        // All social links are external, render with <a> tag
        return (
          <a
            key={social.platform}
            href={sanitizeUrl(social.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className={`p-4 h-full ${HOVER_EFFECTS.cardSubtle}`}>
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <IconComponent
                    className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {social.label}
                  </p>
                  {social.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {social.description}
                    </p>
                  )}
                </div>
                <ExternalLink
                  className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-hidden="true"
                />
              </div>
            </Card>
          </a>
        );
      })}
    </div>
  );
}

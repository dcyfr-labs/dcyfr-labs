import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  TYPOGRAPHY,
  SPACING,
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Section, ProfileAvatar } from "@/components/common";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeroProps {
  userProfile: UserProfile;
  name: string;
  title: string;
  subtitle?: string;
  summary: string;
  badges: Array<{
    icon: ReactNode;
    label: string;
  }>;
}

/**
 * ProfileHero Component
 *
 * Shared hero section for profile pages (Drew, DCYFR).
 * Displays avatar, name, title, summary, and capability badges.
 * Uses prose max-width for optimal readability.
 */
export function ProfileHero({
  userProfile,
  name,
  title,
  subtitle,
  summary,
  badges,
}: ProfileHeroProps) {
  return (
    <Section
      id={`${userProfile}-hero`}
      className={`mx-auto ${CONTAINER_WIDTHS.prose} ${CONTAINER_PADDING} pt-16 md:pt-24 lg:pt-32`}
    >
      <div
        className={cn(
          "flex flex-col md:flex-row items-center md:items-start gap-4",
          SPACING.content
        )}
      >
        {/* Avatar */}
        <div className="shrink-0 *:mt-0">
          <ProfileAvatar userProfile={userProfile} size="lg" />
        </div>

        {/* Content */}
        <div className={cn("flex-1", SPACING.content)}>
          <div>
            <h2 className={cn(TYPOGRAPHY.h1.hero, "font-serif")}>{name}</h2>
            <p className="">{title}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <p className={TYPOGRAPHY.description}>{summary}</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <Badge key={idx} variant="secondary" className="gap-1">
                {badge.icon}
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

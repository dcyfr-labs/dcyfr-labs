import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AboutAvatar } from "@/components/about/about-avatar";
import { TYPOGRAPHY, HOVER_EFFECTS, SPACING } from "@/lib/design-tokens";
import { Sparkles } from "lucide-react";
import { teamMembers, teamDescription } from "@/data/team";
import type { TeamMember } from "@/types/team";

/**
 * Team Member Spotlight Card
 *
 * Individual card for displaying a team member's profile with avatar,
 * title, badges, and description.
 */
function TeamMemberCard({ member }: { member: TeamMember }) {
  const isAI = member.avatarType === "icon";

  return (
    <Card
      className={`p-5 space-y-4 ${isAI ? "border-primary/20" : ""} ${HOVER_EFFECTS.cardSubtle}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {isAI ? (
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {member.avatarIcon && (
                <member.avatarIcon className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
        ) : (
          <AboutAvatar size="sm" />
        )}

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-medium text-lg">{member.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{member.title}</p>
          <div className="flex flex-wrap gap-2">
            {member.badges.map((badge, idx) => (
              <Badge key={idx} variant="outline">
                <badge.icon className="w-3 h-3 mr-1" />
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">{member.description}</p>

      {/* Strengths (human) or Capabilities (AI) */}
      {member.strengths && member.strengths.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Key Strengths
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {member.strengths.slice(0, 3).map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {member.capabilities && member.capabilities.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Capabilities
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {member.capabilities.slice(0, 3).map((capability, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {capability}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/**
 * Team Spotlights Component
 *
 * Displays profile spotlights for all team members in a responsive grid.
 * Each member gets a card with their avatar, title, badges, description,
 * and key strengths/capabilities.
 */
export function TeamSpotlights() {
  return (
    <div className={SPACING.content}>
      <div className="space-y-2">
        <h2 className={TYPOGRAPHY.h2.standard}>Meet the Team</h2>
        <p className="text-muted-foreground">{teamDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {teamMembers.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

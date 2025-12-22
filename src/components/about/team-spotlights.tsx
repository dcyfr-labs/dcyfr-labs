import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { teamMembers, teamDescription } from "@/data/team";
import { TeamMemberCard } from "@/components/common";

/**
 * Team Spotlights Component
 *
 * Displays profile spotlights for all team members in a responsive grid.
 * Each member gets a card with their avatar, title, badges, description,
 * and key strengths/capabilities using the unified TeamMemberCard component.
 * 
 * Uses the "detailed" layout variant for comprehensive profile display.
 */
export function TeamSpotlights() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className={TYPOGRAPHY.h2.standard}>Meet the Team</h2>
        <p className="text-muted-foreground">{teamDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {teamMembers.map((member) => (
          <TeamMemberCard 
            key={member.id} 
            member={member} 
            layout="detailed"
            avatarUrl={member.avatarType === "image" && member.id === "drew" ? "https://github.com/dcyfr.png" : undefined}
            linkTo={member.profileUrl}
          />
        ))}
      </div>
    </div>
  );
}

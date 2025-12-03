import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { teamMembers, teamDescription } from "@/data/team";
import { TeamMemberCard } from "@/components/common";

/**
 * AboutTeam Component (Deprecated)
 *
 * @deprecated Use `TeamSpotlights` for the detailed team section on /about page,
 * or use `TeamMemberCard` directly for custom layouts.
 *
 * This component is kept for backward compatibility but should not be used
 * in new code. It now delegates to the unified TeamMemberCard component.
 *
 * @see TeamSpotlights - Full team section for /about page
 * @see TeamMemberCard - Unified card component for team members
 */
export function AboutTeam() {
  return (
    <div className={SPACING.content}>
      <div className="space-y-2">
        <h2 className={TYPOGRAPHY.h2.standard}>Meet the team</h2>
        <p className={TYPOGRAPHY.metadata}>{teamDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {teamMembers.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            layout="detailed"
            avatarUrl={
              member.avatarType === "image" && member.id === "drew"
                ? "https://github.com/dcyfr.png"
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

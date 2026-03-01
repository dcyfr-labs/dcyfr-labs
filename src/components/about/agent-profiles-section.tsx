import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { AGENT_PROFILES, AGENT_CATEGORY_LABELS, type AgentCategory } from '@/lib/agent-profiles';
import { AgentProfileCard } from './agent-profile-card';

const CATEGORIES: AgentCategory[] = ['framework', 'engineering', 'quality', 'operations'];

/**
 * AgentProfilesSection
 *
 * Showcases the AI agents powering DCYFR's engineering work.
 * Renders agent profiles grouped by category on the About page.
 */
export function AgentProfilesSection() {
  return (
    <section
      aria-labelledby="agent-profiles-heading"
      data-testid="agent-profiles-section"
      className={SPACING.subsection}
    >
      {/* Section header */}
      <div className={SPACING.content}>
        <h2 id="agent-profiles-heading" className={TYPOGRAPHY.h2.standard}>
          Our AI Agent Team
        </h2>
        <p className={TYPOGRAPHY.description}>
          DCYFR is built by a swarm of specialised AI agents, each with deep expertise in a specific
          engineering domain. Together they handle everything from feature development to security
          auditing — autonomously and at scale.
        </p>
      </div>

      {/* Profile grid by category */}
      <div className={SPACING.section}>
        {CATEGORIES.map((category) => {
          const profiles = AGENT_PROFILES.filter((p) => p.category === category);
          if (profiles.length === 0) return null;

          return (
            <div key={category} className={SPACING.subsection}>
              <h3
                className={TYPOGRAPHY.h3.standard}
                aria-label={`${AGENT_CATEGORY_LABELS[category]} agents`}
              >
                {AGENT_CATEGORY_LABELS[category]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile) => (
                  <AgentProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

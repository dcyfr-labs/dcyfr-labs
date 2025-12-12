import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { InviteCodeCard } from "@/components/sponsors";
import type { InviteCode } from "@/types/invites";

interface InvitesFeaturedProps {
  codes: InviteCode[];
}

/**
 * Featured Invites Section Component
 *
 * Displays featured invite codes in a prominent section.
 * Used on /invites page to highlight the best offers.
 */
export function InvitesFeatured({ codes }: InvitesFeaturedProps) {
  if (codes.length === 0) {
    return null;
  }

  return (
    <div className={SPACING.content}>
      <div className="mb-6">
        <h2 className={TYPOGRAPHY.h2.standard}>Featured</h2>
        <p className="text-muted-foreground mt-2">
          Our top {codes.length} {codes.length === 1 ? "recommendation" : "recommendations"}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
        {codes.map((code) => (
          <InviteCodeCard
            key={code.id}
            code={code}
            showFullDescription={true}
            showMetrics={true}
          />
        ))}
      </div>
    </div>
  );
}

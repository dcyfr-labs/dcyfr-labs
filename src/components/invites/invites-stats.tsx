import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

interface InvitesStatsProps {
  totalInvites: number;
  totalCategories: number;
  featuredCount: number;
}

export function InvitesStats({
  totalInvites,
  totalCategories,
  featuredCount,
}: InvitesStatsProps) {
  return (
    <div className={SPACING.content}>
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className={`${TYPOGRAPHY.display.stat} text-primary`}>
              {totalInvites}
            </p>
            <p className={`${TYPOGRAPHY.metadata} mt-1`}>Total Invites</p>
          </div>
          <div>
            <p className={`${TYPOGRAPHY.display.stat} text-primary`}>
              {totalCategories}
            </p>
            <p className={`${TYPOGRAPHY.metadata} mt-1`}>Categories</p>
          </div>
          <div>
            <p className={`${TYPOGRAPHY.display.stat} text-primary`}>
              {featuredCount}
            </p>
            <p className={`${TYPOGRAPHY.metadata} mt-1`}>Featured</p>
          </div>
          <div>
            <p className={`${TYPOGRAPHY.display.stat} text-primary`}>100%</p>
            <p className={`${TYPOGRAPHY.metadata} mt-1`}>Free to Join</p>
          </div>
        </div>
      </div>
    </div>
  );
}

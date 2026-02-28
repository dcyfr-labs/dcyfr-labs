import { TYPOGRAPHY, SPACING, SPACING_SCALE } from '@/lib/design-tokens';
import { InviteCodeCard } from "@/components/sponsors";
import type { InviteCode } from "@/types/invites";

interface InvitesCategorySectionProps {
  category: string;
  label: string;
  codes: InviteCode[];
}

export function InvitesCategorySection({
  category,
  label,
  codes,
}: InvitesCategorySectionProps) {
  // Use responsive grid that adapts to content
  // Single item: full width, 2 items: 2 columns, 3+: 3 columns max
  const gridCols =
    codes.length === 1
      ? "grid-cols-2 max-w-full"
      : codes.length === 2
        ? "grid-cols-1 md:grid-cols-2 max-w-full"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={SPACING.content}>
      <div className="mb-6">
        <h2 className={TYPOGRAPHY.h2.standard}>{label}</h2>
        <p className="text-muted-foreground mt-2">
          {codes.length} {codes.length === 1 ? "platform" : "platforms"}{" "}
          available
        </p>
      </div>

      <div className={`grid ${gridCols} gap-${SPACING_SCALE.md}`}>
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

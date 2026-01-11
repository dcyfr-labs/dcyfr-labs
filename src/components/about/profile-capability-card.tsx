import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { TYPOGRAPHY, SHADOWS, BORDERS, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface ProfileCapabilityCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  examples?: string[];
}

/**
 * ProfileCapabilityCard Component
 *
 * Shared card for displaying capabilities, skills, or features.
 * Used in both Drew and DCYFR profile pages.
 */
export function ProfileCapabilityCard({
  icon,
  title,
  description,
  examples,
}: ProfileCapabilityCardProps) {
  return (
    <Card className={cn("p-8", SHADOWS.card.rest, BORDERS.card, SPACING.content)}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={TYPOGRAPHY.h3.standard}>{title}</h4>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {examples && examples.length > 0 && (
        <ul className="text-sm text-muted-foreground list-disc list-inside">
          {examples.map((example, idx) => (
            <li key={idx}>{example}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

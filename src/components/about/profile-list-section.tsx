import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { SHADOWS, BORDERS, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface ProfileListSectionProps {
  items: string[];
  bulletStyle?: "bullet" | "arrow";
  bulletColor?: string;
}

/**
 * ProfileListSection Component
 *
 * Shared list card for displaying principles, philosophy, or approaches.
 * Used in both Drew and DCYFR profile pages.
 */
export function ProfileListSection({
  items,
  bulletStyle = "bullet",
  bulletColor = "text-primary",
}: ProfileListSectionProps) {
  return (
    <Card className={cn("p-8", SHADOWS.card.rest, BORDERS.card)}>
      <ul className={SPACING.content}>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-4">
            <span
              className={cn(
                bulletColor,
                bulletStyle === "bullet"
                  ? "text-xl font-bold mt-0.5"
                  : "font-mono text-sm mt-0.5"
              )}
            >
              {bulletStyle === "bullet" ? "•" : "→"}
            </span>
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

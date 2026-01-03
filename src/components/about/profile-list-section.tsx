import { Card } from "@/components/ui/card";
import { SHADOWS, BORDERS, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface ProfileListSectionProps {
  items: string[];
  bulletStyle?: "bullet" | "arrow";
}

/**
 * ProfileListSection Component
 *
 * Shared list card for displaying principles, philosophy, or approaches.
 * Uses SVG logo bullets for brand consistency (via list-disc CSS) or Circle icons for arrows.
 * Used in both Drew and DCYFR profile pages.
 */
export function ProfileListSection({
  items,
  bulletStyle = "bullet",
}: ProfileListSectionProps) {
  if (bulletStyle === "bullet") {
    // Use list-disc for SVG logo bullets (applied via global CSS)
    return (
      <Card className={cn("p-8", SHADOWS.card.rest, BORDERS.card)}>
        <ul className={cn("list-disc list-inside", SPACING.content)}>
          {items.map((item, idx) => (
            <li key={idx} className="text-muted-foreground pl-2">
              {item}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  // Arrow style uses Circle icon pattern
  return (
    <Card className={cn("p-8", SHADOWS.card.rest, BORDERS.card)}>
      <ul className={cn("list-none", SPACING.content)}>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Circle
              className="w-1.5 h-1.5 mt-2 shrink-0 fill-primary text-primary"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

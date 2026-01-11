import { Card } from "@/components/ui/card";
import { SHADOWS, BORDERS, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import React from "react";

interface ProfileListSectionProps {
  items: string[] | Array<{ text: string; icon: string }>;
  bulletStyle?: "bullet" | "arrow";
  iconMap?: Record<string, React.ReactNode>;
}

/**
 * ProfileListSection Component
 *
 * Shared list card for displaying principles, philosophy, or approaches.
 * Uses SVG logo bullets for brand consistency (via list-disc CSS) or icons/circles for arrows.
 * Used in both Drew and DCYFR profile pages.
 *
 * When bulletStyle="arrow" and items have icon names, uses iconMap to render SVG icons.
 */
export function ProfileListSection({
  items,
  bulletStyle = "bullet",
  iconMap,
}: ProfileListSectionProps) {
  // Check if items are objects with text and icon properties
  const isIconized =
    Array.isArray(items) &&
    items.length > 0 &&
    typeof items[0] === "object" &&
    "text" in items[0];

  if (bulletStyle === "bullet") {
    // Use list-disc for SVG logo bullets (applied via global CSS)
    return (
      <Card className={cn("p-8", SHADOWS.card.rest, BORDERS.card)}>
        <ul className={cn("list-disc list-inside", SPACING.content)}>
          {items.map((item, idx) => {
            const text = typeof item === "string" ? item : item.text;
            return (
              <li key={idx} className="text-muted-foreground pl-2">
                {text}
              </li>
            );
          })}
        </ul>
      </Card>
    );
  }

  // Arrow style uses icons or Circle pattern
  return (
    <Card className={cn("p-8", SHADOWS.card.rest, BORDERS.card)}>
      <ul className={cn("list-none", SPACING.content)}>
        {items.map((item, idx) => {
          const text = typeof item === "string" ? item : item.text;
          const iconName = typeof item === "string" ? null : item.icon;

          return (
            <li key={idx} className="flex items-start gap-3">
              {isIconized && iconName && iconMap?.[iconName] ? (
                <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center text-primary">
                  {iconMap[iconName]}
                </div>
              ) : (
                <Circle
                  className="w-1.5 h-1.5 mt-2 shrink-0 fill-primary text-primary"
                  aria-hidden="true"
                />
              )}
              <span className="text-muted-foreground">{text}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

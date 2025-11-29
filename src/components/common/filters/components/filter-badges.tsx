"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { FilterBadgesProps } from "../types";

export function FilterBadges({
  items,
  selected,
  onToggle,
  icon: Icon,
  label,
  className,
  displayMap,
  caseInsensitive,
}: FilterBadgesProps) {
  if (items.length === 0) return null;

  // Check if item is selected (supports case-insensitive comparison)
  const isItemSelected = (item: string) => {
    if (caseInsensitive) {
      return selected.some((s) => s.toLowerCase() === item.toLowerCase());
    }
    return selected.includes(item);
  };

  // Get display label for item
  const getDisplayLabel = (item: string) => {
    if (displayMap && displayMap[item]) {
      return displayMap[item];
    }
    return item;
  };

  return (
    <div className={className}>
      {(label || Icon) && (
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {label && (
            <>
              {/* eslint-disable-next-line no-restricted-syntax */}
              <span className="text-sm font-medium text-muted-foreground">
                {label}
              </span>
            </>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = isItemSelected(item);
          return (
            <Badge
              key={item}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors select-none"
              onClick={() => onToggle(item)}
            >
              {getDisplayLabel(item)}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

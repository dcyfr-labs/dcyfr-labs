import * as React from "react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/lib/design-tokens";

export interface TableCaptionProps extends React.HTMLAttributes<HTMLElement> {
  /** Whether the caption should appear above or below the table */
  position?: "top" | "bottom";
  /** Visual style variant */
  variant?: "default" | "muted" | "subtle";
}

/**
 * Table Caption Component
 * 
 * Provides accessible captions for MDX tables following modern design patterns.
 * Supports positioning above or below tables and various visual styles.
 * 
 * @example
 * ```tsx
 * <TableCaption position="bottom">
 *   Table 1: Performance comparison across different frameworks
 * </TableCaption>
 * ```
 */
export function TableCaption({
  className,
  position = "bottom",
  variant = "default",
  children,
  ...props
}: TableCaptionProps) {
  const variantStyles = {
    default: cn(
      TYPOGRAPHY.metadata,
      "text-muted-foreground font-medium"
    ),
    muted: cn(
      TYPOGRAPHY.metadata,
      "text-muted-foreground/80"
    ),
    subtle: cn(
      "text-xs text-muted-foreground/70 font-normal"
    ),
  };

  return (
    <caption
      {...props}
      className={cn(
        "text-center px-4 py-3",
        variantStyles[variant],
        position === "bottom" && "mt-2 border-t border-border/30",
        position === "top" && "mb-2",
        className
      )}
      style={{
        captionSide: position,
        ...props.style,
      }}
    >
      {children}
    </caption>
  );
}
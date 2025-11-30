/**
 * Scroll Indicator Component
 * 
 * Subtle visual indicator encouraging users to scroll down.
 * Animated arrow with fade effect.
 * 
 * @component
 * @example
 * ```tsx
 * <ScrollIndicator />
 * ```
 */

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  /** Custom CSS classes */
  className?: string;
  /** Text to display (default: "Scroll to explore") */
  text?: string;
}

export function ScrollIndicator({
  className,
  text = "Scroll to explore",
}: ScrollIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-muted-foreground text-sm",
        "animate-bounce",
        className
      )}
    >
      <span className="hidden sm:inline opacity-75">{text}</span>
      <ChevronDown className="h-5 w-5 opacity-50" />
    </div>
  );
}

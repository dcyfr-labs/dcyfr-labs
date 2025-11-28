"use client";

import { Logo } from "@/components/logo";
import { useEffect, useRef, useState } from "react";

/**
 * Horizontal Rule Component
 * 
 * A custom horizontal rule that displays with the site logo in the center.
 * Automatically hides consecutive horizontal rules, showing only the first one
 * when multiple <hr> elements are stacked in MDX content.
 * 
 * This prevents visual clutter when markdown contains multiple horizontal rule
 * syntaxes in sequence (---, ***, ___).
 * 
 * @component
 * @example
 * ```tsx
 * <HorizontalRule />
 * ```
 */
export function HorizontalRule() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!ref.current) return;

    // Check if there's another HorizontalRule immediately before this one
    const element = ref.current;
    const previousSibling = element.previousElementSibling;

    // Hide this rule if the previous sibling is also a horizontal rule
    // This ensures only the first in a sequence is shown
    if (previousSibling?.getAttribute("role") === "separator") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM inspection on mount
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      ref={ref}
      className="relative flex items-center justify-center my-8" 
      role="separator"
    >
      {/* Left line */}
      <div className="flex-1 border-t border-border" />
      
      {/* Center logo */}
      <div className="px-4">
        <Logo 
          width="1rem"
          height="1rem" 
          className="text-muted-foreground opacity-50" 
        />
      </div>
      
      {/* Right line */}
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOUCH_TARGET } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Copy code button component for code blocks.
 * Appears on hover and provides visual feedback on copy success.
 *
 * **Animation approach:** Uses CSS animations (Tailwind animate-in) instead of Framer Motion.
 * The icon swap animation is a simple scale/rotate effect that CSS handles efficiently.
 */
export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 right-2",
        // Mobile-first: 44x44px minimum, scale down on tablet+
        TOUCH_TARGET.close,
        "opacity-0 group-hover:opacity-100 transition-opacity"
      )}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <div className="animate-in spin-in-0 zoom-in-0 duration-200">
          <Check className="h-4 w-4 text-emerald-500" />
        </div>
      ) : (
        <div className="animate-in spin-in-0 zoom-in-0 duration-200">
          <Copy className="h-4 w-4" />
        </div>
      )}
    </Button>
  );
}

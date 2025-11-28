"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration-safe pattern
  useEffect(() => setMounted(true), []);

  const isDark = (mounted ? resolvedTheme : theme) === "dark";

  const handleToggle = () => {
    // Use View Transitions API if available for smoother theme changes
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(() => {
        startTransition(() => {
          setTheme(isDark ? "light" : "dark");
        });
      });
    } else {
      // Fallback to regular transition
      startTransition(() => {
        setTheme(isDark ? "light" : "dark");
      });
    }
  };

  // Avoid hydration mismatch by rendering a stable placeholder until mounted.
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="opacity-0"
        disabled
      >
        <Sun className="size-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={handleToggle}
      disabled={isPending}
   >
      {isDark ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </Button>
  );
}

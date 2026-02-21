"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";
import { trackThemeToggle } from "@/lib/analytics";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  useEffect(() => setMounted(true), []);

  const currentTheme = mounted ? theme : "system";

  const getNextTheme = () => {
    switch (currentTheme) {
      case "system":
        return "light";
      case "light":
        return "dark";
      case "dark":
        return "system";
      default:
        return "system";
    }
  };

  const handleToggle = () => {
    const nextTheme = getNextTheme();
    
    // Use View Transitions API if available for smoother theme changes
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(() => {
        startTransition(() => {
          setTheme(nextTheme);
          trackThemeToggle(nextTheme as "light" | "dark" | "system");
        });
      });
    } else {
      // Fallback to regular transition
      startTransition(() => {
        setTheme(nextTheme);
        trackThemeToggle(nextTheme as "light" | "dark" | "system");
      });
    }
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case "system":
        return <Monitor className="h-4 w-4" aria-hidden="true" />;
      case "light":
        return <Sun className="h-4 w-4" aria-hidden="true" />;
      case "dark":
        return <Moon className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Monitor className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case "system":
        return "Switch to light theme";
      case "light":
        return "Switch to dark theme";
      case "dark":
        return "Switch to system theme";
      default:
        return "Toggle theme";
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
        <Monitor className="h-4 w-4" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={getThemeLabel()}
      onClick={handleToggle}
      disabled={isPending}
   >
      {getThemeIcon()}
    </Button>
  );
}

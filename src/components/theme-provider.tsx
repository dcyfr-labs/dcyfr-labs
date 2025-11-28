"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Enable View Transitions API for smooth theme switching if supported
  useEffect(() => {
    if (typeof window !== "undefined" && "startViewTransition" in document) {
      // Add class to indicate View Transitions API is available
      document.documentElement.classList.add("view-transitions-supported");
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

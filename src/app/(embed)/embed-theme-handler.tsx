"use client";

import { useEffect } from "react";

export function EmbedThemeHandler() {
  useEffect(() => {
    // Listen for theme messages from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'setTheme') {
        const theme = event.data.theme;
        document.documentElement.classList.remove('light', 'dark');
        if (theme !== 'system') {
          document.documentElement.classList.add(theme);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Read theme from URL parameter on mount
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');
    if (theme && (theme === 'light' || theme === 'dark')) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return null; // This component doesn't render anything
}
"use client";

import { useEffect } from "react";

// Allowed origins for postMessage communication
const ALLOWED_ORIGINS = [
  'https://dcyfr.com',
  'https://www.dcyfr.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [])
];

export function EmbedThemeHandler() {
  useEffect(() => {
    // Listen for theme messages from parent window
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin before processing message
      if (!ALLOWED_ORIGINS.includes(event.origin)) {
        console.warn('[EmbedThemeHandler] Rejected message from unauthorized origin:', event.origin);
        return;
      }

      if (event.data && event.data.type === 'setTheme') {
        const theme = event.data.theme;

        // Validate theme value
        if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
          console.warn('[EmbedThemeHandler] Invalid theme value:', theme);
          return;
        }

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
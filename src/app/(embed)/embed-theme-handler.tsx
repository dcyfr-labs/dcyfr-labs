'use client';

import { useEffect } from 'react';

// Allowed origins for postMessage communication
const ALLOWED_ORIGINS = [
  'https://www.dcyfr.ai', // Production (redirect)
  'https://www.dcyfr.ai', // Production (primary)
  'https://dcyfr-preview.vercel.app', // Preview deployments
  ...(process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : []),
];

export function EmbedThemeHandler() {
  useEffect(() => {
    // Listen for theme messages from parent window
    const handleMessage = (event: MessageEvent) => {
      // SECURITY: Origin validation - MUST be first check (defense against XSS)
      const isAllowedOrigin = ALLOWED_ORIGINS.includes(event.origin);

      if (!isAllowedOrigin) {
        console.warn(
          '[EmbedThemeHandler] Rejected message from unauthorized origin:',
          event.origin
        );
        return;
      }

      // Safe to process message - origin validated above

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

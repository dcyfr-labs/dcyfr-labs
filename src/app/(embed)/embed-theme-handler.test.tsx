import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmbedThemeHandler } from './embed-theme-handler';

describe('EmbedThemeHandler Security', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.documentElement.className = '';
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    document.documentElement.className = '';
  });

  describe('Origin Verification (Security)', () => {
    it('should reject messages from unauthorized origins', async () => {
      render(<EmbedThemeHandler />);

      // Attack: Malicious origin tries to send theme change
      const maliciousEvent = new MessageEvent('message', {
        origin: 'https://malicious-site.com',
        data: { type: 'setTheme', theme: 'dark' }
      });

      window.dispatchEvent(maliciousEvent);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[EmbedThemeHandler] Rejected message from unauthorized origin:',
          'https://malicious-site.com'
        );
      });

      // Verify theme was NOT applied
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    // Note: Production environment behavior (blocking localhost) is tested in E2E tests

    it('should accept messages from dcyfr.com', async () => {
      render(<EmbedThemeHandler />);

      const validEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'dark' }
      });

      window.dispatchEvent(validEvent);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should accept messages from www.dcyfr.com', async () => {
      render(<EmbedThemeHandler />);

      const validEvent = new MessageEvent('message', {
        origin: 'https://www.dcyfr.com',
        data: { type: 'setTheme', theme: 'light' }
      });

      window.dispatchEvent(validEvent);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // Note: Localhost is allowed only during build time based on NODE_ENV
    // This is tested in E2E tests and integration tests instead
  });

  describe('Theme Value Validation (Input Sanitization)', () => {
    it('should reject invalid theme values', async () => {
      render(<EmbedThemeHandler />);

      const invalidEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'malicious-value' }
      });

      window.dispatchEvent(invalidEvent);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[EmbedThemeHandler] Invalid theme value:',
          'malicious-value'
        );
      });

      expect(document.documentElement.className).toBe('');
    });

    it('should reject XSS attempts in theme value', async () => {
      render(<EmbedThemeHandler />);

      const xssEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: '<script>alert("xss")</script>' }
      });

      window.dispatchEvent(xssEvent);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      expect(document.documentElement.className).toBe('');
    });

    it('should accept valid light theme', async () => {
      render(<EmbedThemeHandler />);

      const validEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'light' }
      });

      window.dispatchEvent(validEvent);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });
    });

    it('should accept valid dark theme', async () => {
      render(<EmbedThemeHandler />);

      const validEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'dark' }
      });

      window.dispatchEvent(validEvent);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should accept valid system theme', async () => {
      render(<EmbedThemeHandler />);

      document.documentElement.classList.add('dark');

      const validEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'system' }
      });

      window.dispatchEvent(validEvent);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(document.documentElement.classList.contains('light')).toBe(false);
      });
    });
  });

  describe('Defense in Depth', () => {
    it('should reject messages without type field', async () => {
      render(<EmbedThemeHandler />);

      const noTypeEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { theme: 'dark' }
      });

      window.dispatchEvent(noTypeEvent);

      // Should not apply theme
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should reject messages with wrong type', async () => {
      render(<EmbedThemeHandler />);

      const wrongTypeEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'malicious', theme: 'dark' }
      });

      window.dispatchEvent(wrongTypeEvent);

      // Should not apply theme
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should handle null data gracefully', async () => {
      render(<EmbedThemeHandler />);

      const nullDataEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: null
      });

      expect(() => {
        window.dispatchEvent(nullDataEvent);
      }).not.toThrow();
    });

    it('should handle undefined data gracefully', async () => {
      render(<EmbedThemeHandler />);

      const undefinedDataEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: undefined
      });

      expect(() => {
        window.dispatchEvent(undefinedDataEvent);
      }).not.toThrow();
    });
  });

  describe('Theme Switching', () => {
    it('should switch from light to dark', async () => {
      render(<EmbedThemeHandler />);

      document.documentElement.classList.add('light');

      const darkEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'dark' }
      });

      window.dispatchEvent(darkEvent);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should switch from dark to light', async () => {
      render(<EmbedThemeHandler />);

      document.documentElement.classList.add('dark');

      const lightEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'light' }
      });

      window.dispatchEvent(lightEvent);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });
    });

    it('should remove theme classes when switching to system', async () => {
      render(<EmbedThemeHandler />);

      document.documentElement.classList.add('dark');

      const systemEvent = new MessageEvent('message', {
        origin: 'https://dcyfr.com',
        data: { type: 'setTheme', theme: 'system' }
      });

      window.dispatchEvent(systemEvent);

      await waitFor(() => {
        expect(document.documentElement.className).toBe('');
      });
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<EmbedThemeHandler />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});

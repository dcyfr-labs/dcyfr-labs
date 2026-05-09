import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getClientIp, validateRequest } from '@/lib/anti-spam';

describe('Anti-Spam Utilities', () => {
  describe('getClientIp', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('extracts first IP from comma-separated x-forwarded-for', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('trims whitespace from forwarded IP', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '  192.168.1.1  ',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('falls back to x-real-ip when x-forwarded-for is not present', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-real-ip': '10.0.0.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('10.0.0.1');
    });

    it('prefers x-forwarded-for over x-real-ip', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '10.0.0.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('returns "unknown" when no IP headers present', () => {
      const request = new NextRequest('http://localhost:3000');

      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });

    it('handles IPv6 addresses', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    });
  });

  describe('validateRequest', () => {
    describe('User-Agent Validation', () => {
      it('rejects requests without user-agent', () => {
        const request = new NextRequest('http://localhost:3000');

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('missing_user_agent');
      });

      it('accepts requests with valid user-agent', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
        expect(result.reason).toBeUndefined();
      });
    });

    describe('Bot Detection', () => {
      it('blocks requests with "bot" in user-agent', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'Googlebot/2.1',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });

      it('blocks requests with "crawler" in user-agent', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'Mozilla/5.0 compatible; AhrefsCrawler/1.0',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });

      it('blocks requests with "spider" in user-agent', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'spider-bot/1.0',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });

      it('blocks requests with "scraper" in user-agent', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'data-scraper/2.0',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });

      it('blocks curl requests', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'curl/7.68.0',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });

      it('blocks wget requests', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'Wget/1.20.3',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });

      it('blocks Python requests library', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'python-requests/2.25.1',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });

      it('is case-insensitive for bot detection', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': 'MyCustomBOT/1.0',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('bot_detected');
      });
    });

    describe('Valid User-Agents', () => {
      it('accepts Chrome desktop browser', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
      });

      it('accepts Firefox desktop browser', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
      });

      it('accepts Safari desktop browser', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
      });

      it('accepts mobile Safari (iOS)', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
      });

      it('accepts Chrome mobile (Android)', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
      });

      it('accepts Edge browser', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('handles empty user-agent string', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': '',
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('missing_user_agent');
      });

      it('handles user-agent with only whitespace', () => {
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': '   ',
          },
        });

        const result = validateRequest(request);
        // Whitespace-only strings are too short (< 10 chars)
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('suspicious_user_agent');
      });

      it('handles very long user-agent strings', () => {
        const longUserAgent = 'Mozilla/5.0 ' + 'X'.repeat(1000);
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            'user-agent': longUserAgent,
          },
        });

        const result = validateRequest(request);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Integration', () => {
    it('can extract IP and validate request together', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const ip = getClientIp(request);
      const validation = validateRequest(request);

      expect(ip).toBe('192.168.1.1');
      expect(validation.valid).toBe(true);
    });

    it('identifies bot with IP extraction', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Googlebot/2.1',
        },
      });

      const ip = getClientIp(request);
      const validation = validateRequest(request);

      expect(ip).toBe('192.168.1.1');
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('bot_detected');
    });
  });
});

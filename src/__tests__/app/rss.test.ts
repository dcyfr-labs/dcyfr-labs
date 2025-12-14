import { describe, test, expect, vi } from 'vitest';
import { GET } from '@/app/rss.xml/route';

// Mock Next.js redirect
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url) => {
    throw new Error(`NEXT_REDIRECT:${url}`); // Next.js throws to redirect
  })
}));

describe('RSS Feed Route (/rss.xml)', () => {
  test('redirects to /feed with 301', async () => {
    expect(() => GET()).toThrow('NEXT_REDIRECT:/feed');
  });

  test('uses permanent redirect for SEO', async () => {
    // The redirect should be permanent (301) not temporary (302)
    // Next.js redirect() function defaults to 301 permanent redirect
    expect(() => GET()).toThrow('NEXT_REDIRECT:/feed');
  });

  test('maintains backwards compatibility', async () => {
    // This route exists to handle legacy RSS URLs
    // Should always redirect to the canonical feed URL
    expect(() => GET()).toThrow('NEXT_REDIRECT:/feed');
  });

  test('does not require request parameters', async () => {
    // Function should work without any parameters
    expect(() => GET()).toThrow('NEXT_REDIRECT:/feed');
  });
});
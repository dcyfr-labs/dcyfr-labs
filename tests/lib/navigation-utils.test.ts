import { describe, it, expect } from 'vitest';
import {
  isNavItemActive,
  getAriaCurrent,
  getNavAnalytics,
  formatShortcut,
  isExternalLink,
  getLinkRel,
  getLinkTarget,
} from '@/lib/navigation/utils';
import type { NavItem } from '@/lib/navigation/types';

describe('isNavItemActive', () => {
  it('returns true for exact match when exactMatch is set', () => {
    const item: NavItem = { href: '/', label: 'Home', exactMatch: true };
    expect(isNavItemActive(item, '/')).toBe(true);
  });

  it('returns false when exactMatch set and path differs', () => {
    const item: NavItem = { href: '/', label: 'Home', exactMatch: true };
    expect(isNavItemActive(item, '/blog')).toBe(false);
  });

  it('returns false for items with query params', () => {
    const item: NavItem = { href: '/blog?category=AI', label: 'AI' };
    expect(isNavItemActive(item, '/blog')).toBe(false);
  });

  it('returns true for exact path match without exactMatch', () => {
    const item: NavItem = { href: '/blog', label: 'Blog' };
    expect(isNavItemActive(item, '/blog')).toBe(true);
  });

  it('returns true for child route', () => {
    const item: NavItem = { href: '/blog', label: 'Blog' };
    expect(isNavItemActive(item, '/blog/my-post')).toBe(true);
  });

  it('returns false for prefix-only match without child route', () => {
    const item: NavItem = { href: '/blog', label: 'Blog' };
    expect(isNavItemActive(item, '/blogger')).toBe(false);
  });
});

describe('getAriaCurrent', () => {
  it('returns "page" for exact match', () => {
    expect(getAriaCurrent('/about', '/about', true)).toBe('page');
  });

  it('returns undefined for non-matching exact', () => {
    expect(getAriaCurrent('/about', '/blog', true)).toBeUndefined();
  });

  it('returns "page" for prefix match', () => {
    expect(getAriaCurrent('/blog', '/blog/post', false)).toBe('page');
  });

  it('returns undefined for non-matching prefix', () => {
    expect(getAriaCurrent('/work', '/blog', false)).toBeUndefined();
  });
});

describe('getNavAnalytics', () => {
  it('returns correct analytics object', () => {
    const item: NavItem = { href: '/blog', label: 'Blog' };
    const result = getNavAnalytics(item, 'header');
    expect(result).toEqual({
      event: 'navigation_click',
      category: 'nav_header',
      label: 'header_blog',
      href: '/blog',
    });
  });

  it('returns "home" for root href', () => {
    const item: NavItem = { href: '/', label: 'Home' };
    const result = getNavAnalytics(item, 'footer');
    expect(result.label).toBe('footer_home');
  });
});

describe('formatShortcut', () => {
  it('formats single key', () => {
    expect(formatShortcut('h')).toBe('H');
  });

  it('formats multi-key shortcut', () => {
    expect(formatShortcut('g h')).toBe('G then H');
  });

  it('formats three-key shortcut', () => {
    expect(formatShortcut('g s p')).toBe('G then S then P');
  });
});

describe('isExternalLink', () => {
  it('returns true for http links', () => {
    expect(isExternalLink('http://example.com')).toBe(true);
  });

  it('returns true for https links', () => {
    expect(isExternalLink('https://example.com')).toBe(true);
  });

  it('returns true for mailto links', () => {
    expect(isExternalLink('mailto:test@example.com')).toBe(true);
  });

  it('returns false for relative paths', () => {
    expect(isExternalLink('/about')).toBe(false);
  });
});

describe('getLinkRel', () => {
  it('returns noopener noreferrer for external items', () => {
    const item: NavItem = { href: '/sitemap.xml', label: 'Sitemap', external: true };
    expect(getLinkRel(item)).toBe('noopener noreferrer');
  });

  it('returns noopener noreferrer for http links', () => {
    const item: NavItem = { href: 'https://github.com', label: 'GitHub' };
    expect(getLinkRel(item)).toBe('noopener noreferrer');
  });

  it('returns undefined for internal links', () => {
    const item: NavItem = { href: '/about', label: 'About' };
    expect(getLinkRel(item)).toBeUndefined();
  });
});

describe('getLinkTarget', () => {
  it('returns _blank for external items', () => {
    const item: NavItem = { href: '/sitemap.xml', label: 'Sitemap', external: true };
    expect(getLinkTarget(item)).toBe('_blank');
  });

  it('returns _blank for http links', () => {
    const item: NavItem = { href: 'https://github.com', label: 'GitHub' };
    expect(getLinkTarget(item)).toBe('_blank');
  });

  it('returns undefined for internal links', () => {
    const item: NavItem = { href: '/about', label: 'About' };
    expect(getLinkTarget(item)).toBeUndefined();
  });
});

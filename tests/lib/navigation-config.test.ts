import { describe, it, expect } from 'vitest';
import {
  HEADER_NAV,
  BLOG_NAV,
  WORK_NAV,
  BOTTOM_NAV,
  MOBILE_NAV_SECTIONS,
  FOOTER_NAV_SECTIONS,
  NAVIGATION,
  getKeyboardShortcuts,
  findNavItem,
} from '@/lib/navigation/config';

describe('HEADER_NAV', () => {
  it('has expected number of items', () => {
    expect(HEADER_NAV.length).toBeGreaterThanOrEqual(6);
  });

  it('has Home as first item with exactMatch', () => {
    expect(HEADER_NAV[0].href).toBe('/');
    expect(HEADER_NAV[0].label).toBe('Home');
    expect(HEADER_NAV[0].exactMatch).toBe(true);
  });

  it('all items have href and label', () => {
    for (const item of HEADER_NAV) {
      expect(item.href).toBeTruthy();
      expect(item.label).toBeTruthy();
    }
  });

  it('all items have keyboard shortcuts', () => {
    for (const item of HEADER_NAV) {
      expect(item.shortcut).toBeTruthy();
    }
  });
});

describe('BLOG_NAV', () => {
  it('has blog-related items', () => {
    expect(BLOG_NAV.length).toBeGreaterThanOrEqual(2);
    expect(BLOG_NAV[0].href).toBe('/blog');
  });

  it('first item has exactMatch', () => {
    expect(BLOG_NAV[0].exactMatch).toBe(true);
  });
});

describe('WORK_NAV', () => {
  it('has work-related items', () => {
    expect(WORK_NAV.length).toBeGreaterThanOrEqual(1);
    expect(WORK_NAV[0].href).toBe('/work');
  });
});

describe('BOTTOM_NAV', () => {
  it('has limited items for mobile', () => {
    expect(BOTTOM_NAV.length).toBeGreaterThanOrEqual(3);
    expect(BOTTOM_NAV.length).toBeLessThanOrEqual(6);
  });

  it('includes Home with exactMatch', () => {
    const home = BOTTOM_NAV.find((i) => i.href === '/');
    expect(home).toBeDefined();
    expect(home?.exactMatch).toBe(true);
  });
});

describe('MOBILE_NAV_SECTIONS', () => {
  it('has sections with items', () => {
    expect(MOBILE_NAV_SECTIONS.length).toBeGreaterThanOrEqual(1);
    for (const section of MOBILE_NAV_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.label).toBeTruthy();
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it('main section contains Home', () => {
    const main = MOBILE_NAV_SECTIONS.find((s) => s.id === 'main');
    expect(main).toBeDefined();
    const home = main?.items.find((i) => i.href === '/');
    expect(home).toBeDefined();
  });
});

describe('FOOTER_NAV_SECTIONS', () => {
  it('has multiple sections', () => {
    expect(FOOTER_NAV_SECTIONS.length).toBeGreaterThanOrEqual(3);
  });

  it('has legal section', () => {
    const legal = FOOTER_NAV_SECTIONS.find((s) => s.id === 'legal');
    expect(legal).toBeDefined();
    expect(legal?.items.length).toBeGreaterThan(0);
  });

  it('has resources section', () => {
    const resources = FOOTER_NAV_SECTIONS.find((s) => s.id === 'resources');
    expect(resources).toBeDefined();
  });
});

describe('NAVIGATION', () => {
  it('contains all navigation structures', () => {
    expect(NAVIGATION.header).toBe(HEADER_NAV);
    expect(NAVIGATION.mobile).toBe(MOBILE_NAV_SECTIONS);
    expect(NAVIGATION.bottom).toBe(BOTTOM_NAV);
    expect(NAVIGATION.footer).toBe(FOOTER_NAV_SECTIONS);
  });

  it('has mega menus for blog and work', () => {
    expect(NAVIGATION.megaMenus?.blog).toBeDefined();
    expect(NAVIGATION.megaMenus?.work).toBeDefined();
  });
});

describe('getKeyboardShortcuts', () => {
  it('returns shortcuts from header nav', () => {
    const shortcuts = getKeyboardShortcuts();
    expect(shortcuts.length).toBeGreaterThan(0);
    for (const s of shortcuts) {
      expect(s.shortcut).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.href).toBeTruthy();
    }
  });

  it('includes Home shortcut', () => {
    const shortcuts = getKeyboardShortcuts();
    const home = shortcuts.find((s) => s.href === '/');
    expect(home).toBeDefined();
    expect(home?.shortcut).toBe('g h');
  });
});

describe('findNavItem', () => {
  it('finds header nav item', () => {
    const item = findNavItem('/blog');
    expect(item).toBeDefined();
    expect(item?.label).toBe('Blog');
  });

  it('finds footer nav item', () => {
    const item = findNavItem('/privacy');
    expect(item).toBeDefined();
    expect(item?.label).toBe('Privacy');
  });

  it('returns undefined for unknown href', () => {
    expect(findNavItem('/nonexistent-page')).toBeUndefined();
  });

  it('finds mobile nav item', () => {
    const item = findNavItem('/activity');
    expect(item).toBeDefined();
  });
});

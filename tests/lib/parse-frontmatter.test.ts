import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseFrontmatter, isShowcaseRepo, applyDefaults } from '@/lib/markdown/parse-frontmatter';
import type { RepoFrontmatter } from '@/lib/markdown/types';

vi.mock('@/config/repos-config', () => ({
  REPO_DEFAULTS: {
    status: 'active' as const,
    category: 'code' as const,
    maxHeuristicsLines: 200,
  },
}));

describe('parseFrontmatter', () => {
  it('returns empty frontmatter when no frontmatter present', () => {
    const result = parseFrontmatter('# Hello World\nSome content');
    expect(result.frontmatter).toEqual({});
    expect(result.body).toBe('# Hello World\nSome content');
  });

  it('parses basic frontmatter fields', () => {
    const raw = `---
title: My Project
description: A great project
featured: true
---
# Content`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.title).toBe('My Project');
    expect(result.frontmatter.description).toBe('A great project');
    expect(result.frontmatter.featured).toBe(true);
    expect(result.body).toBe('# Content');
  });

  it('parses status field with valid values', () => {
    const raw = `---
status: in-progress
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.status).toBe('in-progress');
  });

  it('ignores invalid status values', () => {
    const raw = `---
status: invalid
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.status).toBeUndefined();
  });

  it('parses category field with valid values', () => {
    const raw = `---
category: community
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.category).toBe('community');
  });

  it('ignores invalid category values', () => {
    const raw = `---
category: invalid
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.category).toBeUndefined();
  });

  it('parses array fields (tech, tags, highlights)', () => {
    const raw = `---
tech:
  - TypeScript
  - React
tags:
  - web
  - security
highlights:
  - Fast
  - Secure
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.tech).toEqual(['TypeScript', 'React']);
    expect(result.frontmatter.tags).toEqual(['web', 'security']);
    expect(result.frontmatter.highlights).toEqual(['Fast', 'Secure']);
  });

  it('filters non-string values from arrays', () => {
    const raw = `---
tech:
  - TypeScript
  - 42
  - true
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.tech).toEqual(['TypeScript']);
  });

  it('parses workShowcase boolean', () => {
    const raw = `---
workShowcase: true
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.workShowcase).toBe(true);
  });

  it('parses demo and docs URLs', () => {
    const raw = `---
demo: https://example.com
docs: https://docs.example.com
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.demo).toBe('https://example.com');
    expect(result.frontmatter.docs).toBe('https://docs.example.com');
  });

  it('trims string values', () => {
    const raw = `---
title: "  Padded Title  "
description: "  Padded Description  "
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.title).toBe('Padded Title');
    expect(result.frontmatter.description).toBe('Padded Description');
  });

  it('handles invalid YAML gracefully', () => {
    const raw = `---
: broken: yaml: [
---
body`;
    const result = parseFrontmatter(raw);
    // On error, frontmatter is empty and body is the entire raw string
    expect(result.frontmatter).toEqual({});
    expect(result.body).toBe(raw);
  });

  it('handles missing closing delimiter', () => {
    const raw = `---
title: No Closing
content here`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter).toEqual({});
    expect(result.body).toContain('title: No Closing');
  });

  it('handles non-object YAML', () => {
    const raw = `---
just a string
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter).toEqual({});
  });

  it('handles Windows line endings', () => {
    const raw = '---\r\ntitle: Windows\r\n---\r\nbody';
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.title).toBe('Windows');
  });

  it('ignores non-boolean featured', () => {
    const raw = `---
featured: "yes"
---
body`;
    const result = parseFrontmatter(raw);
    expect(result.frontmatter.featured).toBeUndefined();
  });
});

describe('isShowcaseRepo', () => {
  it('returns true when workShowcase is true', () => {
    expect(isShowcaseRepo({ workShowcase: true })).toBe(true);
  });

  it('returns false when workShowcase is false', () => {
    expect(isShowcaseRepo({ workShowcase: false })).toBe(false);
  });

  it('returns false when workShowcase is undefined', () => {
    expect(isShowcaseRepo({})).toBe(false);
  });
});

describe('applyDefaults', () => {
  it('applies default status and category', () => {
    const result = applyDefaults({});
    expect(result.status).toBe('active');
    expect(result.category).toBe('code');
  });

  it('preserves provided values over defaults', () => {
    const result = applyDefaults({ status: 'archived', category: 'community' });
    expect(result.status).toBe('archived');
    expect(result.category).toBe('community');
  });

  it('preserves other frontmatter fields', () => {
    const result = applyDefaults({ title: 'My Project', featured: true });
    expect(result.title).toBe('My Project');
    expect(result.featured).toBe(true);
    expect(result.status).toBe('active');
  });
});

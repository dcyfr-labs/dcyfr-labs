/**
 * Tests for README frontmatter parsing utilities.
 *
 * Pure logic — gray-matter is the only real dependency.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/repos-config', () => ({
  REPO_DEFAULTS: { status: 'active', category: 'code', maxHeuristicsLines: 50 },
}));

import { parseFrontmatter, isShowcaseRepo, applyDefaults } from '@/lib/markdown/parse-frontmatter';

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------

describe('parseFrontmatter', () => {
  it('extracts workShowcase:true from valid frontmatter', () => {
    const raw = `---
workShowcase: true
title: My Project
description: A great project
---
# Body content`;
    const { frontmatter, body } = parseFrontmatter(raw);
    expect(frontmatter.workShowcase).toBe(true);
    expect(frontmatter.title).toBe('My Project');
    expect(frontmatter.description).toBe('A great project');
    expect(body).toContain('# Body content');
  });

  it('returns workShowcase:undefined when not present', () => {
    const raw = `---
title: No Showcase
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.workShowcase).toBeUndefined();
  });

  it('returns empty frontmatter when no frontmatter block is present', () => {
    const { frontmatter } = parseFrontmatter('# Just a README with no frontmatter');
    expect(frontmatter).toEqual({});
  });

  it('handles empty README', () => {
    const { frontmatter } = parseFrontmatter('');
    expect(frontmatter).toEqual({});
  });

  it('parses tech array', () => {
    const raw = `---
workShowcase: true
tech:
  - TypeScript
  - React
  - Node.js
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.tech).toEqual(['TypeScript', 'React', 'Node.js']);
  });

  it('parses tags array', () => {
    const raw = `---
workShowcase: true
tags:
  - open-source
  - ai
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.tags).toEqual(['open-source', 'ai']);
  });

  it('parses valid status field', () => {
    const raw = `---
workShowcase: true
status: active
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.status).toBe('active');
  });

  it('ignores invalid status values', () => {
    const raw = `---
workShowcase: true
status: invalid-status
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.status).toBeUndefined();
  });

  it('parses valid category', () => {
    const raw = `---
workShowcase: true
category: startup
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.category).toBe('startup');
  });

  it('ignores invalid category values', () => {
    const raw = `---
workShowcase: true
category: invalid-cat
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.category).toBeUndefined();
  });

  it('parses featured boolean', () => {
    const raw = `---
workShowcase: true
featured: true
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.featured).toBe(true);
  });

  it('parses highlights array', () => {
    const raw = `---
workShowcase: true
highlights:
  - Built with TypeScript
  - 100% test coverage
---`;
    const { frontmatter } = parseFrontmatter(raw);
    expect(frontmatter.highlights).toEqual(['Built with TypeScript', '100% test coverage']);
  });
});

// ---------------------------------------------------------------------------
// isShowcaseRepo
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// applyDefaults
// ---------------------------------------------------------------------------

describe('applyDefaults', () => {
  it('fills status with default when not present', () => {
    const { frontmatter } = parseFrontmatter('');
    const result = applyDefaults(frontmatter);
    expect(result.status).toBe('active');
  });

  it('fills category with default when not present', () => {
    const { frontmatter } = parseFrontmatter('');
    const result = applyDefaults(frontmatter);
    expect(result.category).toBe('code');
  });

  it('preserves existing status when provided', () => {
    const raw = `---\nworkShowcase: true\nstatus: archived\ncategory: startup\n---`;
    const { frontmatter } = parseFrontmatter(raw);
    const result = applyDefaults(frontmatter);
    expect(result.status).toBe('archived');
    expect(result.category).toBe('startup');
  });

  it('does not overwrite title when provided', () => {
    const raw = `---\nworkShowcase: true\ntitle: My Title\n---`;
    const { frontmatter } = parseFrontmatter(raw);
    const result = applyDefaults(frontmatter);
    expect(result.title).toBe('My Title');
  });
});

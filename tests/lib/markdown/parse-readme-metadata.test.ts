/**
 * Tests for the combined README metadata parser (frontmatter + heuristics).
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/repos-config', () => ({
  REPO_DEFAULTS: { status: 'active', category: 'code', maxHeuristicsLines: 50 },
}));

import { parseReadmeMetadata } from '@/lib/markdown/parse-readme-metadata';

describe('parseReadmeMetadata', () => {
  it('returns empty metadata for empty readme', () => {
    const result = parseReadmeMetadata('');
    expect(result.frontmatter).toEqual({});
    expect(result.bodyWithoutFrontmatter).toBe('');
    expect(result.firstParagraph).toBeUndefined();
    expect(result.hasFeaturesList).toBe(false);
    expect(result.extractedHighlights).toEqual([]);
  });

  it('extracts frontmatter fields correctly', () => {
    const raw = `---
workShowcase: true
title: Showcase Repo
description: A great project for the showcase
tech:
  - TypeScript
  - React
---
# Showcase Repo

This is the first paragraph.`;
    const result = parseReadmeMetadata(raw);
    expect(result.frontmatter.workShowcase).toBe(true);
    expect(result.frontmatter.title).toBe('Showcase Repo');
    expect(result.frontmatter.description).toBe('A great project for the showcase');
    expect(result.frontmatter.tech).toEqual(['TypeScript', 'React']);
  });

  it('extracts firstParagraph from body (no frontmatter)', () => {
    const raw = `# My Repo

This is the intro paragraph.`;
    const result = parseReadmeMetadata(raw);
    expect(result.firstParagraph).toBe('This is the intro paragraph.');
  });

  it('body without frontmatter does not contain YAML block', () => {
    const raw = `---
workShowcase: true
title: Test
---
# Content

Paragraph.`;
    const result = parseReadmeMetadata(raw);
    expect(result.bodyWithoutFrontmatter).not.toContain('workShowcase');
    expect(result.bodyWithoutFrontmatter).toContain('# Content');
  });

  it('detects features list in body', () => {
    const raw = `# My Repo

## Features

- Feature one
- Feature two`;
    const result = parseReadmeMetadata(raw);
    expect(result.hasFeaturesList).toBe(true);
    expect(result.extractedHighlights).toContain('Feature one');
  });

  it('strips frontmatter before extracting body heuristics', () => {
    const raw = `---
workShowcase: true
---
## Features

- From body`;
    const result = parseReadmeMetadata(raw);
    expect(result.hasFeaturesList).toBe(true);
    expect(result.extractedHighlights).toContain('From body');
  });
});

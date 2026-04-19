import { describe, it, expect, vi } from 'vitest';
import { parseReadmeMetadata } from '@/lib/markdown/parse-readme-metadata';

vi.mock('@/config/repos-config', () => ({
  REPO_DEFAULTS: {
    status: 'active' as const,
    category: 'code' as const,
    maxHeuristicsLines: 200,
  },
}));

describe('parseReadmeMetadata', () => {
  it('parses README with frontmatter and body', () => {
    const raw = `---
title: My Project
description: A great project
---
# My Project

This is the description paragraph.

## Features
- Fast builds
- Hot reload`;

    const result = parseReadmeMetadata(raw);
    expect(result.frontmatter.title).toBe('My Project');
    expect(result.frontmatter.description).toBe('A great project');
    expect(result.bodyWithoutFrontmatter).toContain('# My Project');
    expect(result.firstParagraph).toBe('This is the description paragraph.');
    expect(result.hasFeaturesList).toBe(true);
    expect(result.extractedHighlights).toEqual(['Fast builds', 'Hot reload']);
  });

  it('parses README without frontmatter', () => {
    const raw = `# Title

Some paragraph content.`;

    const result = parseReadmeMetadata(raw);
    expect(result.frontmatter).toEqual({});
    expect(result.firstParagraph).toBe('Some paragraph content.');
  });

  it('handles empty README', () => {
    const result = parseReadmeMetadata('');
    expect(result.frontmatter).toEqual({});
    expect(result.bodyWithoutFrontmatter).toBe('');
    expect(result.firstParagraph).toBeUndefined();
    expect(result.hasFeaturesList).toBe(false);
    expect(result.extractedHighlights).toEqual([]);
  });

  it('returns body without frontmatter block', () => {
    const raw = `---
title: Test
---
Body content`;
    const result = parseReadmeMetadata(raw);
    expect(result.bodyWithoutFrontmatter).toBe('Body content');
  });
});

import { describe, it, expect, vi } from 'vitest';
import {
  extractFirstParagraph,
  extractHighlights,
  hasFeaturesList,
} from '@/lib/markdown/parse-heuristics';

vi.mock('@/config/repos-config', () => ({
  REPO_DEFAULTS: {
    maxHeuristicsLines: 200,
  },
}));

describe('extractFirstParagraph', () => {
  it('returns first paragraph text', () => {
    const body = '# Title\n\nThis is the first paragraph.\n\nSecond paragraph.';
    expect(extractFirstParagraph(body)).toBe('This is the first paragraph.');
  });

  it('skips headings', () => {
    const body = '# Title\n## Subtitle\nActual content here.';
    expect(extractFirstParagraph(body)).toBe('Actual content here.');
  });

  it('skips badge lines', () => {
    const body =
      '[![Build](https://img.shields.io/badge.svg)](link)\n![Logo](logo.png)\nReal content.';
    expect(extractFirstParagraph(body)).toBe('Real content.');
  });

  it('skips HTML comments', () => {
    const body = '<!-- comment -->\nActual content.';
    expect(extractFirstParagraph(body)).toBe('Actual content.');
  });

  it('skips code blocks', () => {
    const body = '```\ncode here\n```\nAfter code.';
    expect(extractFirstParagraph(body)).toBe('After code.');
  });

  it('skips horizontal rules', () => {
    const body = '---\nContent after rule.';
    expect(extractFirstParagraph(body)).toBe('Content after rule.');
  });

  it('returns undefined for empty body', () => {
    expect(extractFirstParagraph('')).toBeUndefined();
  });

  it('returns undefined when only headings and badges', () => {
    const body = '# Title\n## Subtitle\n[![Badge](url)](link)';
    expect(extractFirstParagraph(body)).toBeUndefined();
  });
});

describe('extractHighlights', () => {
  it('extracts bullet items from Features section', () => {
    const body = '# Title\n## Features\n- Fast build times\n- Hot reload\n- TypeScript support';
    const highlights = extractHighlights(body);
    expect(highlights).toEqual(['Fast build times', 'Hot reload', 'TypeScript support']);
  });

  it('extracts from Highlights section', () => {
    const body = '## Highlights\n- Item 1\n- Item 2';
    const highlights = extractHighlights(body);
    expect(highlights).toEqual(['Item 1', 'Item 2']);
  });

  it('extracts from "What\'s Included" section', () => {
    const body = "## What's Included\n- Feature A\n- Feature B";
    const highlights = extractHighlights(body);
    expect(highlights).toEqual(['Feature A', 'Feature B']);
  });

  it('limits to 6 items', () => {
    const items = Array.from({ length: 10 }, (_, i) => `- Item ${i + 1}`).join('\n');
    const body = `## Features\n${items}`;
    const highlights = extractHighlights(body);
    expect(highlights).toHaveLength(6);
  });

  it('stops at next heading', () => {
    const body = '## Features\n- Item 1\n- Item 2\n## Other Section\n- Other item';
    const highlights = extractHighlights(body);
    expect(highlights).toEqual(['Item 1', 'Item 2']);
  });

  it('returns empty array when no features section', () => {
    const body = '# Title\nSome content without features.';
    expect(extractHighlights(body)).toEqual([]);
  });

  it('handles numbered lists', () => {
    const body = '## Features\n1. First\n2. Second\n3. Third';
    const highlights = extractHighlights(body);
    expect(highlights).toEqual(['First', 'Second', 'Third']);
  });

  it('skips non-bullet lines', () => {
    const body = '## Features\nSome text\n- Actual item\nMore text\n- Another item';
    const highlights = extractHighlights(body);
    expect(highlights).toEqual(['Actual item', 'Another item']);
  });
});

describe('hasFeaturesList', () => {
  it('returns true when Features section exists', () => {
    expect(hasFeaturesList('# Title\n## Features\n- Item')).toBe(true);
  });

  it('returns true when Highlights section exists', () => {
    expect(hasFeaturesList('## Highlights\n- Item')).toBe(true);
  });

  it('returns false when no features section', () => {
    expect(hasFeaturesList('# Title\n## Setup\nSome content')).toBe(false);
  });
});

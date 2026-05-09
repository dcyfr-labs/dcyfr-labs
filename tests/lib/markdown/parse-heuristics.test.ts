/**
 * Tests for README heuristic metadata extraction.
 *
 * Pure logic — tests extractFirstParagraph, extractHighlights, hasFeaturesList.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/repos-config', () => ({
  REPO_DEFAULTS: { status: 'active', category: 'code', maxHeuristicsLines: 50 },
}));

import {
  extractFirstParagraph,
  extractHighlights,
  hasFeaturesList,
} from '@/lib/markdown/parse-heuristics';

// ---------------------------------------------------------------------------
// extractFirstParagraph
// ---------------------------------------------------------------------------

describe('extractFirstParagraph', () => {
  it('returns undefined for empty body', () => {
    expect(extractFirstParagraph('')).toBeUndefined();
  });

  it('extracts the first non-heading paragraph', () => {
    const body = `# My Project

This is the first paragraph of the README.

Another paragraph here.`;
    expect(extractFirstParagraph(body)).toBe('This is the first paragraph of the README.');
  });

  it('skips headings to find first paragraph', () => {
    const body = `# Title

## Subtitle

The real intro paragraph.`;
    expect(extractFirstParagraph(body)).toBe('The real intro paragraph.');
  });

  it('returns undefined when only headings are present', () => {
    const body = `# Title\n## Subtitle\n### Third level`;
    expect(extractFirstParagraph(body)).toBeUndefined();
  });

  it('handles body with no heading', () => {
    const body = `This is the intro.\n\nMore content.`;
    expect(extractFirstParagraph(body)).toBe('This is the intro.');
  });

  it('skips badge lines (shields.io)', () => {
    const body = `[![Build Status](https://badge.io)](http://ci.example.com)\n\nActual description.`;
    expect(extractFirstParagraph(body)).toBe('Actual description.');
  });
});

// ---------------------------------------------------------------------------
// extractHighlights
// ---------------------------------------------------------------------------

describe('extractHighlights', () => {
  it('returns empty array for empty body', () => {
    expect(extractHighlights('')).toEqual([]);
  });

  it('extracts bullet list under Features section', () => {
    const body = `# My Project

## Features

- Built with TypeScript
- 100% test coverage
- Easy to use`;
    const result = extractHighlights(body);
    expect(result).toContain('Built with TypeScript');
    expect(result).toContain('100% test coverage');
    expect(result).toContain('Easy to use');
  });

  it('extracts bullet list under Highlights section', () => {
    const body = `# My Project

## Highlights

- Fast performance
- Open source`;
    const result = extractHighlights(body);
    expect(result).toContain('Fast performance');
    expect(result).toContain('Open source');
  });

  it('returns empty array when no features/highlights section', () => {
    const body = `# My Project\n\nJust some text.\n\n## Installation\n\nRun npm install.`;
    expect(extractHighlights(body)).toEqual([]);
  });

  it('stops extracting at the next heading', () => {
    const body = `## Features

- Feature one
- Feature two

## Installation

- Step one`;
    const result = extractHighlights(body);
    expect(result).toContain('Feature one');
    expect(result).toContain('Feature two');
    expect(result).not.toContain('Step one');
  });
});

// ---------------------------------------------------------------------------
// hasFeaturesList
// ---------------------------------------------------------------------------

describe('hasFeaturesList', () => {
  it('returns false for empty body', () => {
    expect(hasFeaturesList('')).toBe(false);
  });

  it('returns true when a Features section exists with bullets', () => {
    const body = `## Features\n\n- Thing one\n- Thing two`;
    expect(hasFeaturesList(body)).toBe(true);
  });

  it('returns true when a Highlights section exists with bullets', () => {
    const body = `## Highlights\n\n- Highlight one`;
    expect(hasFeaturesList(body)).toBe(true);
  });

  it('returns false when no Features/Highlights section', () => {
    const body = `# Usage\n\nRun the tool.\n\n## Options\n\n- option-a`;
    expect(hasFeaturesList(body)).toBe(false);
  });
});

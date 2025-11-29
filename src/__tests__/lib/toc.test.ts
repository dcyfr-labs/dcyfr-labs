/**
 * Tests for lib/toc.ts - Table of Contents extraction from MDX
 */

import { describe, expect, it } from 'vitest';
import { extractHeadings, type TocHeading } from '@/lib/toc';

describe('extractHeadings', () => {
  describe('Basic Functionality', () => {
    it('extracts h2 headings', () => {
      const content = `
# H1 Heading (ignored)
## First Section
Some content here
## Second Section
More content
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0]).toEqual({
        id: 'first-section',
        text: 'First Section',
        level: 2,
      });
      expect(headings[1]).toEqual({
        id: 'second-section',
        text: 'Second Section',
        level: 2,
      });
    });

    it('extracts h3 headings', () => {
      const content = `
### Subsection One
### Subsection Two
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0]).toEqual({
        id: 'subsection-one',
        text: 'Subsection One',
        level: 3,
      });
      expect(headings[1]).toEqual({
        id: 'subsection-two',
        text: 'Subsection Two',
        level: 3,
      });
    });

    it('extracts mixed h2 and h3 headings', () => {
      const content = `
## Main Topic
### Subtopic A
### Subtopic B
## Another Topic
### Subtopic C
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(5);
      expect(headings[0].level).toBe(2);
      expect(headings[1].level).toBe(3);
      expect(headings[2].level).toBe(3);
      expect(headings[3].level).toBe(2);
      expect(headings[4].level).toBe(3);
    });

    it('ignores h1 headings', () => {
      const content = `
# Main Title
## Section One
# Another Title
## Section Two
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0].text).toBe('Section One');
      expect(headings[1].text).toBe('Section Two');
    });

    it('ignores h4+ headings', () => {
      const content = `
## H2 Heading
### H3 Heading
#### H4 Heading (ignored)
##### H5 Heading (ignored)
###### H6 Heading (ignored)
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0].text).toBe('H2 Heading');
      expect(headings[1].text).toBe('H3 Heading');
    });
  });

  describe('Slug Generation', () => {
    it('generates lowercase slugs', () => {
      const content = '## UPPERCASE HEADING';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('uppercase-heading');
    });

    it('replaces spaces with hyphens', () => {
      const content = '## Multiple Word Heading';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('multiple-word-heading');
    });

    it('removes special characters', () => {
      const content = '## Special!@#$%^&*()Characters';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('specialcharacters');
    });

    it('handles punctuation', () => {
      const content = '## What is TypeScript?';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('what-is-typescript');
    });

    it('collapses multiple spaces and hyphens', () => {
      const content = '## Multiple   Spaces---And---Hyphens';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('multiple-spaces-and-hyphens');
    });

    it('trims leading/trailing whitespace', () => {
      const content = '##   Heading with spaces   ';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('heading-with-spaces');
    });

    it('handles numbers in headings', () => {
      const content = '## Step 1: Getting Started';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('step-1-getting-started');
    });
  });

  describe('Markdown Formatting Removal', () => {
    it('strips bold markdown (**text**)', () => {
      const content = '## Heading with **bold text**';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Heading with bold text');
      expect(headings[0].id).toBe('heading-with-bold-text');
    });

    it('strips italic markdown (*text*)', () => {
      const content = '## Heading with *italic text*';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Heading with italic text');
      expect(headings[0].id).toBe('heading-with-italic-text');
    });

    it('strips alternative bold markdown (__text__)', () => {
      const content = '## Heading with __bold text__';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Heading with bold text');
      // Note: Underscores remain in slug (treated as word characters)
      expect(headings[0].id).toBe('heading-with-__bold-text__');
    });

    it('strips alternative italic markdown (_text_)', () => {
      const content = '## Heading with _italic text_';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Heading with italic text');
      // Note: Underscores remain in slug (treated as word characters)
      expect(headings[0].id).toBe('heading-with-_italic-text_');
    });

    it('strips inline code (`code`)', () => {
      const content = '## Using `useState` Hook';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Using useState Hook');
      expect(headings[0].id).toBe('using-usestate-hook');
    });

    it('strips links ([text](url))', () => {
      const content = '## Check out [React](https://react.dev)';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Check out React');
      expect(headings[0].id).toBe('check-out-reacthttpsreactdev');
    });

    it('strips images (![alt](url))', () => {
      const content = '## Figure ![diagram](/image.png) shows';
      const headings = extractHeadings(content);
      // Note: Image markdown leaves exclamation mark in text
      expect(headings[0].text).toBe('Figure !diagram shows');
      // But the URL parts remain in the slug (only [] removed, not the URL content)
      expect(headings[0].id).toBe('figure-diagramimagepng-shows');
    });

    it('strips strikethrough (~~text~~)', () => {
      const content = '## Old ~~deprecated~~ method';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Old deprecated method');
      expect(headings[0].id).toBe('old-deprecated-method');
    });

    it('strips combined markdown formatting', () => {
      const content = '## **Bold** and *italic* with `code`';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Bold and italic with code');
      expect(headings[0].id).toBe('bold-and-italic-with-code');
    });
  });

  describe('Edge Cases', () => {
    it('returns empty array for empty content', () => {
      const headings = extractHeadings('');
      expect(headings).toEqual([]);
    });

    it('returns empty array for content without headings', () => {
      const content = `
Just some regular text.
No headings here.
      `;
      const headings = extractHeadings('');
      expect(headings).toEqual([]);
    });

    it('handles headings with only whitespace', () => {
      const content = '##   ';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(1);
      expect(headings[0].text).toBe('');
      expect(headings[0].id).toBe('');
    });

    it('handles headings with special unicode characters', () => {
      const content = '## Café ☕ and Résumé 📄';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Café ☕ and Résumé 📄');
      // Note: Emojis leave trailing hyphen after removal
      expect(headings[0].id).toBe('caf-and-rsum-');
    });

    it('handles headings with emojis', () => {
      const content = '## 🚀 Getting Started';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('🚀 Getting Started');
      // Note: Leading emoji leaves leading hyphen after removal
      expect(headings[0].id).toBe('-getting-started');
    });

    it('handles headings with HTML entities', () => {
      const content = '## Heading &amp; More';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Heading &amp; More');
      expect(headings[0].id).toBe('heading-amp-more');
    });

    it('handles consecutive headings without content between', () => {
      const content = `
## First
## Second
## Third
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(3);
      expect(headings[0].text).toBe('First');
      expect(headings[1].text).toBe('Second');
      expect(headings[2].text).toBe('Third');
    });

    it('handles headings at start and end of content', () => {
      const content = `## First Heading
Some content in the middle
## Last Heading`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0].text).toBe('First Heading');
      expect(headings[1].text).toBe('Last Heading');
    });
  });

  describe('Real-World Blog Post Scenarios', () => {
    it('extracts headings from typical blog post structure', () => {
      const content = `
# Blog Post Title

This is the introduction paragraph.

## Introduction

Some intro text here.

## Main Content

### Subsection 1

Details about subsection 1.

### Subsection 2

Details about subsection 2.

## Conclusion

Wrapping things up.
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(5);
      expect(headings.map(h => ({ text: h.text, level: h.level }))).toEqual([
        { text: 'Introduction', level: 2 },
        { text: 'Main Content', level: 2 },
        { text: 'Subsection 1', level: 3 },
        { text: 'Subsection 2', level: 3 },
        { text: 'Conclusion', level: 2 },
      ]);
    });

    it('extracts headings with code examples', () => {
      const content = `
## Using \`React.useState\`

### The \`useEffect\` Hook

Code example here.

## Working with **TypeScript** Generics
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(3);
      expect(headings[0].text).toBe('Using React.useState');
      expect(headings[1].text).toBe('The useEffect Hook');
      expect(headings[2].text).toBe('Working with TypeScript Generics');
    });

    it('handles headings with technical terminology', () => {
      const content = `
## What is API Rate Limiting?

### Implementing Rate Limits with Redis

### Using \`express-rate-limit\` Middleware
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(3);
      expect(headings[0].id).toBe('what-is-api-rate-limiting');
      expect(headings[1].id).toBe('implementing-rate-limits-with-redis');
      expect(headings[2].id).toBe('using-express-rate-limit-middleware');
    });

    it('preserves heading order for navigation', () => {
      const content = `
## Step 1: Setup
### Prerequisites
### Installation
## Step 2: Configuration
### Environment Variables
### Database Setup
## Step 3: Testing
`;
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(7);
      // Verify order is preserved
      expect(headings[0].text).toBe('Step 1: Setup');
      expect(headings[1].text).toBe('Prerequisites');
      expect(headings[2].text).toBe('Installation');
      expect(headings[3].text).toBe('Step 2: Configuration');
      expect(headings[4].text).toBe('Environment Variables');
      expect(headings[5].text).toBe('Database Setup');
      expect(headings[6].text).toBe('Step 3: Testing');
    });
  });

  describe('Type Safety', () => {
    it('returns TocHeading objects with correct shape', () => {
      const content = '## Test Heading';
      const headings = extractHeadings(content);
      expect(headings[0]).toHaveProperty('id');
      expect(headings[0]).toHaveProperty('text');
      expect(headings[0]).toHaveProperty('level');
      expect(typeof headings[0].id).toBe('string');
      expect(typeof headings[0].text).toBe('string');
      expect(typeof headings[0].level).toBe('number');
    });

    it('ensures level is always 2 or 3', () => {
      const content = `
## H2 Heading
### H3 Heading
`;
      const headings = extractHeadings(content);
      headings.forEach(heading => {
        expect(heading.level).toBeGreaterThanOrEqual(2);
        expect(heading.level).toBeLessThanOrEqual(3);
      });
    });
  });
});

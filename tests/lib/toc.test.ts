import { describe, it, expect } from 'vitest';

import { extractHeadings } from '@/lib/toc';

describe('toc', () => {
  describe('extractHeadings', () => {
    it('extracts h2 headings', () => {
      const content = '## Introduction\n\nSome text\n\n## Conclusion';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0]).toEqual({ id: 'introduction', text: 'Introduction', level: 2 });
      expect(headings[1]).toEqual({ id: 'conclusion', text: 'Conclusion', level: 2 });
    });

    it('extracts h3 headings', () => {
      const content = '### Sub Section';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(1);
      expect(headings[0].level).toBe(3);
    });

    it('ignores h1 and h4+ headings', () => {
      const content = '# H1\n## H2\n### H3\n#### H4\n##### H5';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0].text).toBe('H2');
      expect(headings[1].text).toBe('H3');
    });

    it('skips headings inside code blocks', () => {
      const content = '## Before\n\n```\n## Code Heading\n```\n\n## After';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0].text).toBe('Before');
      expect(headings[1].text).toBe('After');
    });

    it('skips headings inside collapsible components', () => {
      const content = '## Before\n<RiskAccordion>\n## Hidden\n</RiskAccordion>\n## After';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
      expect(headings[0].text).toBe('Before');
      expect(headings[1].text).toBe('After');
    });

    it('skips headings inside CollapsibleSection', () => {
      const content = '## Before\n<CollapsibleSection>\n## Hidden\n</CollapsibleSection>\n## After';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
    });

    it('skips headings inside Footnotes', () => {
      const content = '## Before\n<Footnotes>\n## Hidden\n</Footnotes>\n## After';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
    });

    it('strips markdown bold from heading text', () => {
      const content = '## **Bold Heading**';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Bold Heading');
    });

    it('strips markdown italic from heading text', () => {
      const content = '## *Italic Heading*';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Italic Heading');
    });

    it('strips inline code from heading text', () => {
      const content = '## Using `fetch` API';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Using fetch API');
    });

    it('strips links from heading text', () => {
      const content = '## Check [this link](https://example.com)';
      const headings = extractHeadings(content);
      expect(headings[0].text).toBe('Check this link');
    });

    it('generates unique IDs for duplicate headings', () => {
      const content = '## Section\n## Section\n## Section';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('section');
      expect(headings[1].id).toBe('section-1');
      expect(headings[2].id).toBe('section-2');
    });

    it('preserves accented characters in slugs', () => {
      const content = '## Café';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('café');
    });

    it('converts spaces to hyphens in slugs', () => {
      const content = '## Hello World';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('hello-world');
    });

    it('removes punctuation from slugs', () => {
      const content = '## Further Reading & Resources';
      const headings = extractHeadings(content);
      expect(headings[0].id).toBe('further-reading--resources');
    });

    it('returns empty array for content with no headings', () => {
      const content = 'Just some text\nwith no headings';
      expect(extractHeadings(content)).toHaveLength(0);
    });

    it('returns empty array for empty content', () => {
      expect(extractHeadings('')).toHaveLength(0);
    });

    it('handles RiskAccordionGroup', () => {
      const content = '## Before\n<RiskAccordionGroup>\n## Hidden\n</RiskAccordionGroup>\n## After';
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(2);
    });
  });
});

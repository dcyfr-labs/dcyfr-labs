/**
 * Tests for MDX-to-RSS Transformer
 *
 * Validates that custom MDX components are correctly transformed
 * to RSS-safe HTML for feed readers.
 */

import { describe, it, expect } from 'vitest';
import { transformMDXForRSS, getSupportedComponents, isComponentSupported } from '@/lib/rss';

describe('transformMDXForRSS', () => {
  // ============================================================================
  // Basic Transformations
  // ============================================================================

  describe('Basic Components', () => {
    it('converts TLDRSummary to semantic HTML', async () => {
      const mdx = '<TLDRSummary>Key points here</TLDRSummary>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<div class="tldr');
      expect(html).toContain('<strong>TL;DR:');
      expect(html).toContain('Key points here');
      expect(html).not.toContain('<TLDRSummary>');
    });

    it('converts KeyTakeaway to blockquote', async () => {
      const mdx = '<KeyTakeaway icon="💡">Important insight</KeyTakeaway>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<blockquote class="key-takeaway');
      expect(html).toContain('💡 Key Point:');
      expect(html).toContain('Important insight');
      expect(html).not.toContain('<KeyTakeaway>');
    });

    it('uses default icon for KeyTakeaway if not provided', async () => {
      const mdx = '<KeyTakeaway>Important insight</KeyTakeaway>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('💡 Key Point:');
    });

    it('converts Alert to div with variant class', async () => {
      const mdx = '<Alert variant="warning">Watch out!</Alert>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<div class="alert');
      expect(html).toContain('alert-warning');
      expect(html).toContain('Watch out!');
      expect(html).not.toContain('<Alert>');
    });
  });

  // ============================================================================
  // Interactive Component Transformations
  // ============================================================================

  describe('Interactive Components', () => {
    it('converts GlossaryTooltip to abbr element', async () => {
      const mdx =
        '<GlossaryTooltip term="API" definition="Application Programming Interface">API</GlossaryTooltip>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<abbr');
      expect(html).toContain('title="Application Programming Interface"');
      expect(html).toContain('API');
      expect(html).not.toContain('<GlossaryTooltip>');
    });

    it('converts CollapsibleSection to details element', async () => {
      const mdx =
        '<CollapsibleSection title="Advanced Details">Hidden content here</CollapsibleSection>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<details');
      expect(html).toContain('<summary');
      expect(html).toContain('Advanced Details');
      expect(html).toContain('Hidden content here');
      expect(html).not.toContain('<CollapsibleSection>');
    });

    it('uses default title for CollapsibleSection if not provided', async () => {
      const mdx = '<CollapsibleSection>Content</CollapsibleSection>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('Show More');
    });
  });

  // ============================================================================
  // Component Removal
  // ============================================================================

  describe('Component Removal', () => {
    it('removes SectionShare component', async () => {
      const mdx = '<SectionShare>Share this section</SectionShare>';
      const html = await transformMDXForRSS(mdx);

      expect(html).not.toContain('SectionShare');
      expect(html).not.toContain('Share this section');
    });

    it('removes NewsletterSignup component', async () => {
      const mdx = '<NewsletterSignup>Subscribe now</NewsletterSignup>';
      const html = await transformMDXForRSS(mdx);

      expect(html).not.toContain('NewsletterSignup');
      expect(html).not.toContain('Subscribe now');
    });

    it('removes SeriesNavigation component', async () => {
      const mdx = '<SeriesNavigation>Next: Part 2</SeriesNavigation>';
      const html = await transformMDXForRSS(mdx);

      expect(html).not.toContain('SeriesNavigation');
      expect(html).not.toContain('Next: Part 2');
    });
  });

  // ============================================================================
  // Complex Component Transformations
  // ============================================================================

  describe('Complex Components', () => {
    it('simplifies RiskMatrix to text placeholder', async () => {
      const mdx = '<RiskMatrix data={matrixData} />';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('Risk Matrix visualization');
      expect(html).toContain('view on web for full experience');
      expect(html).not.toContain('<RiskMatrix>');
    });

    it('converts RoleBasedCTA to simple div', async () => {
      const mdx = '<RoleBasedCTA>Call to action</RoleBasedCTA>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<div class="cta');
      expect(html).toContain('Call to action');
      expect(html).not.toContain('<RoleBasedCTA>');
    });

    it('converts DownloadableAsset to link', async () => {
      const mdx =
        '<DownloadableAsset url="/files/guide.pdf" title="Security Guide">Download</DownloadableAsset>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<a href="/files/guide.pdf"');
      expect(html).toContain('📥 Security Guide');
      expect(html).not.toContain('<DownloadableAsset>');
    });

    it('keeps FAQSchema content as simple div', async () => {
      const mdx = '<FAQSchema>FAQ content</FAQSchema>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<div class="faq');
      expect(html).toContain('FAQ content');
      expect(html).not.toContain('<FAQSchema>');
    });

    it('keeps first tab content from TabInterface', async () => {
      const mdx = '<TabInterface>Tab content</TabInterface>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<div class="tabs');
      expect(html).toContain('Tab content');
      expect(html).not.toContain('<TabInterface>');
    });
  });

  // ============================================================================
  // Nested Components
  // ============================================================================

  describe('Nested Components', () => {
    it('handles nested components correctly', async () => {
      const mdx = `
<TLDRSummary>
  This contains a <GlossaryTooltip term="Term" definition="Definition">term</GlossaryTooltip>.
</TLDRSummary>
      `.trim();

      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<div class="tldr');
      expect(html).toContain('<abbr');
      expect(html).toContain('title="Definition"');
    });

    it('handles CollapsibleSection with nested KeyTakeaway', async () => {
      const mdx = `
<CollapsibleSection title="Advanced">
  <KeyTakeaway>Important point</KeyTakeaway>
</CollapsibleSection>
      `.trim();

      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<details');
      expect(html).toContain('<blockquote');
      expect(html).toContain('Important point');
    });
  });

  // ============================================================================
  // Standard Markdown Preservation
  // ============================================================================

  describe('Standard Markdown', () => {
    it('preserves standard markdown headings', async () => {
      const mdx = '# Heading\n\nParagraph text.';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<h1');
      expect(html).toContain('Heading');
      expect(html).toContain('<p');
      expect(html).toContain('Paragraph text');
    });

    it('preserves markdown lists', async () => {
      const mdx = '- Item 1\n- Item 2\n- Item 3';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<ul');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
    });

    it('preserves markdown links', async () => {
      const mdx = '[Link text](https://example.com)';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<a href="https://example.com"');
      expect(html).toContain('Link text');
    });

    it('preserves markdown code blocks', async () => {
      const mdx = '```javascript\nconst x = 1;\n```';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<code');
      expect(html).toContain('const x = 1');
    });
  });

  // ============================================================================
  // Attribute Stripping
  // ============================================================================

  describe('Feed-Safe Attribute Stripping', () => {
    it('removes ARIA attributes', async () => {
      const mdx = '<div aria-label="Test">Content</div>';
      const html = await transformMDXForRSS(mdx);

      expect(html).not.toContain('aria-label');
      expect(html).toContain('Content');
    });

    it('removes data attributes', async () => {
      const mdx = '<div data-testid="test">Content</div>';
      const html = await transformMDXForRSS(mdx);

      expect(html).not.toContain('data-testid');
      expect(html).toContain('Content');
    });

    it('removes role attributes', async () => {
      const mdx = '<div role="button">Click</div>';
      const html = await transformMDXForRSS(mdx);

      expect(html).not.toContain('role=');
      expect(html).toContain('Click');
    });
  });

  // ============================================================================
  // Unknown Components
  // ============================================================================

  describe('Unknown Components', () => {
    it('removes unknown custom components', async () => {
      const mdx = '<UnknownComponent>Content</UnknownComponent>';
      const html = await transformMDXForRSS(mdx);

      expect(html).not.toContain('UnknownComponent');
      // Note: Content might be preserved depending on transformation
    });

    it('preserves standard HTML elements', async () => {
      const mdx = '<div>Standard HTML</div>';
      const html = await transformMDXForRSS(mdx);

      expect(html).toContain('<div');
      expect(html).toContain('Standard HTML');
    });
  });

  // ============================================================================
  // Real-World Content
  // ============================================================================

  describe('Real-World Content', () => {
    it('handles blog post with multiple custom components', async () => {
      const mdx = `
# Blog Post Title

<TLDRSummary>
  This post covers important security concepts including <GlossaryTooltip term="XSS" definition="Cross-Site Scripting">XSS</GlossaryTooltip>.
</TLDRSummary>

Regular paragraph with **bold** and *italic* text.

<KeyTakeaway icon="🛡️">
  Always sanitize user input.
</KeyTakeaway>

<CollapsibleSection title="Advanced Details">
  More technical information here.
</CollapsibleSection>

<SectionShare />
      `.trim();

      const html = await transformMDXForRSS(mdx);

      // Check structure
      expect(html).toContain('<h1');
      expect(html).toContain('Blog Post Title');

      // Check TLDRSummary transformation
      expect(html).toContain('<div class="tldr');
      expect(html).toContain('TL;DR:');

      // Check GlossaryTooltip transformation
      expect(html).toContain('<abbr');
      expect(html).toContain('title="Cross-Site Scripting"');

      // Check KeyTakeaway transformation
      expect(html).toContain('<blockquote');
      expect(html).toContain('🛡️ Key Point:');

      // Check CollapsibleSection transformation
      expect(html).toContain('<details');
      expect(html).toContain('Advanced Details');

      // Check SectionShare removal
      expect(html).not.toContain('SectionShare');

      // Check markdown preservation
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });
  });
});

// ============================================================================
// Utility Functions
// ============================================================================

describe('Utility Functions', () => {
  describe('getSupportedComponents', () => {
    it('returns list of supported components', () => {
      const components = getSupportedComponents();

      expect(components).toContain('TLDRSummary');
      expect(components).toContain('GlossaryTooltip');
      expect(components).toContain('CollapsibleSection');
      expect(components).toContain('KeyTakeaway');
      expect(components).toContain('Alert');
      expect(components.length).toBeGreaterThan(5);
    });
  });

  describe('isComponentSupported', () => {
    it('returns true for supported components', () => {
      expect(isComponentSupported('TLDRSummary')).toBe(true);
      expect(isComponentSupported('GlossaryTooltip')).toBe(true);
      expect(isComponentSupported('CollapsibleSection')).toBe(true);
    });

    it('returns false for unsupported components', () => {
      expect(isComponentSupported('UnknownComponent')).toBe(false);
      expect(isComponentSupported('RandomElement')).toBe(false);
    });
  });
});

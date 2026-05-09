/**
 * Tests for JSON-LD Schema Generation
 *
 * Tests the generation of Schema.org structured data for SEO.
 * Validates schema structure, required fields, and proper formatting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPersonSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
  getArticleSchema,
  getBlogCollectionSchema,
  getAboutPageSchema,
  getContactPageSchema,
  getJsonLdScriptProps,
} from '@/lib/json-ld';
import type { Post } from '@/data/posts';

// Mock site config
vi.mock('@/lib/site-config', () => ({
  SITE_URL: 'https://example.com',
  SITE_TITLE: 'Test Site',
  AUTHOR_NAME: 'Test Author',
}));

// Mock socials data
vi.mock('@/data/socials', () => ({
  getSocialUrls: vi.fn(() => [
    'https://github.com/test',
    'https://twitter.com/test',
    'https://linkedin.com/in/test',
  ]),
}));

describe('json-ld.ts', () => {
  describe('getPersonSchema', () => {
    it('should generate basic Person schema', () => {
      const schema = getPersonSchema();

      expect(schema).toEqual({
        '@type': 'Person',
        '@id': 'https://example.com/#person',
        name: 'Test Author',
        url: 'https://example.com',
        jobTitle: 'Founding Architect',
        sameAs: [
          'https://github.com/test',
          'https://twitter.com/test',
          'https://linkedin.com/in/test',
        ],
      });
    });

    it('should include image when provided', () => {
      const schema = getPersonSchema('https://example.com/profile.jpg');

      expect(schema.image).toBe('https://example.com/profile.jpg');
    });

    it('should not include image when not provided', () => {
      const schema = getPersonSchema();

      expect(schema).not.toHaveProperty('image');
    });
  });

  describe('getWebSiteSchema', () => {
    it('should generate WebSite schema with search action', () => {
      const schema = getWebSiteSchema();

      expect(schema).toEqual({
        '@type': 'WebSite',
        '@id': 'https://example.com/#website',
        url: 'https://example.com',
        name: 'Test Site',
        publisher: {
          '@id': 'https://example.com/#person',
        },
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://example.com/blog?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      });
    });

    it('should reference person schema by ID', () => {
      const schema = getWebSiteSchema();

      expect(schema.publisher['@id']).toBe('https://example.com/#person');
    });

    it('should include search functionality', () => {
      const schema = getWebSiteSchema();

      expect(schema.potentialAction['@type']).toBe('SearchAction');
      expect(schema.potentialAction.target.urlTemplate).toContain('/blog?q=');
    });
  });

  describe('getBreadcrumbSchema', () => {
    it('should generate BreadcrumbList with single item', () => {
      const items = [{ name: 'Home', url: 'https://example.com' }];
      const schema = getBreadcrumbSchema(items);

      expect(schema).toEqual({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://example.com',
          },
        ],
      });
    });

    it('should generate BreadcrumbList with multiple items', () => {
      const items = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Blog', url: 'https://example.com/blog' },
        { name: 'Post', url: 'https://example.com/blog/post-slug' },
      ];
      const schema = getBreadcrumbSchema(items);

      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[2].position).toBe(3);
    });

    it('should handle empty array', () => {
      const schema = getBreadcrumbSchema([]);

      expect(schema.itemListElement).toEqual([]);
    });

    it('should preserve item order', () => {
      const items = [
        { name: 'First', url: 'https://example.com/first' },
        { name: 'Second', url: 'https://example.com/second' },
        { name: 'Third', url: 'https://example.com/third' },
      ];
      const schema = getBreadcrumbSchema(items);

      expect(schema.itemListElement[0].name).toBe('First');
      expect(schema.itemListElement[1].name).toBe('Second');
      expect(schema.itemListElement[2].name).toBe('Third');
    });
  });

  describe('getArticleSchema', () => {
    const basePost: Post = {
      id: 'test-post-id',
      slug: 'test-post',
      title: 'Test Post Title',
      summary: 'Test post summary',
      body: 'Test post body',
      publishedAt: '2024-01-15',
      tags: ['javascript', 'testing'],
      readingTime: {
        words: 1200,
        minutes: 5,
        text: '5 min read',
      },
    };

    it('should generate basic Article schema', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe('Test Post Title');
      expect(schema.description).toBe('Test post summary');
      expect(schema.datePublished).toBe('2024-01-15');
      expect(schema.url).toBe('https://example.com/blog/test-post');
    });

    it('should include author information', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'Test Author',
        url: 'https://example.com',
      });
    });

    it('should include publisher information', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.publisher).toEqual({
        '@type': 'Person',
        name: 'Test Author',
        url: 'https://example.com',
      });
    });

    it('should include image with proper dimensions', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.image).toEqual({
        '@type': 'ImageObject',
        url: 'https://example.com/og.jpg',
        width: 1200,
        height: 630,
      });
    });

    it('should include reading time metadata', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.wordCount).toBe(1200);
      expect(schema.timeRequired).toBe('5 min read');
    });

    it('should include keywords from tags', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.keywords).toBe('javascript, testing');
    });

    it('should include dateModified when updatedAt is present', () => {
      const updatedPost = { ...basePost, updatedAt: '2024-02-01' };
      const schema = getArticleSchema(updatedPost, null, 'https://example.com/og.jpg');

      expect(schema.dateModified).toBe('2024-02-01');
    });

    it('should not include dateModified when updatedAt is absent', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema).not.toHaveProperty('dateModified');
    });

    it('should include view count when provided and greater than 0', () => {
      const schema = getArticleSchema(basePost, 100, 'https://example.com/og.jpg');

      expect(schema.interactionStatistic).toEqual({
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: 100,
      });
    });

    it('should not include view count when 0', () => {
      const schema = getArticleSchema(basePost, 0, 'https://example.com/og.jpg');

      expect(schema).not.toHaveProperty('interactionStatistic');
    });

    it('should not include view count when null', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema).not.toHaveProperty('interactionStatistic');
    });

    it('should mark archived posts with creativeWorkStatus', () => {
      const archivedPost = { ...basePost, archived: true, updatedAt: '2024-03-01' };
      const schema = getArticleSchema(archivedPost, null, 'https://example.com/og.jpg');

      expect(schema.creativeWorkStatus).toBe('Archived');
      expect(schema.archivedAt).toBe('2024-03-01');
    });

    it('should use publishedAt as archivedAt if updatedAt absent', () => {
      const archivedPost = { ...basePost, archived: true };
      const schema = getArticleSchema(archivedPost, null, 'https://example.com/og.jpg');

      expect(schema.archivedAt).toBe('2024-01-15');
    });

    it('should not include archived fields for non-archived posts', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema).not.toHaveProperty('creativeWorkStatus');
      expect(schema).not.toHaveProperty('archivedAt');
    });

    it('should mark content as free', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.isAccessibleForFree).toBe(true);
    });

    it('should include mainEntityOfPage reference', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.mainEntityOfPage).toEqual({
        '@type': 'WebPage',
        '@id': 'https://example.com/blog/test-post',
      });
    });

    it('should set language to en-US', () => {
      const schema = getArticleSchema(basePost, null, 'https://example.com/og.jpg');

      expect(schema.inLanguage).toBe('en-US');
    });

    it('should handle empty tags array', () => {
      const postNoTags = { ...basePost, tags: [] };
      const schema = getArticleSchema(postNoTags, null, 'https://example.com/og.jpg');

      expect(schema.keywords).toBe('');
    });
  });

  describe('getBlogCollectionSchema', () => {
    const testPosts: Post[] = [
      {
        id: 'post-1-id',
        slug: 'post-1',
        title: 'Post 1',
        summary: 'Summary 1',
        body: 'Body 1',
        publishedAt: '2024-01-15',
        tags: [],
        readingTime: { words: 600, minutes: 3, text: '3 min read' },
      },
      {
        id: 'post-2-id',
        slug: 'post-2',
        title: 'Post 2',
        summary: 'Summary 2',
        body: 'Body 2',
        publishedAt: '2024-01-10',
        tags: [],
        readingTime: { words: 400, minutes: 2, text: '2 min read' },
      },
    ];

    it('should generate CollectionPage schema', () => {
      const schema = getBlogCollectionSchema(testPosts, 'Blog', 'Blog description');

      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.name).toBe('Blog');
      expect(schema.description).toBe('Blog description');
      expect(schema.url).toBe('https://example.com/blog');
    });

    it('should reference website schema', () => {
      const schema = getBlogCollectionSchema(testPosts, 'Blog', 'Blog description');

      expect(schema.isPartOf).toEqual({
        '@id': 'https://example.com/#website',
      });
    });

    it('should include ItemList with correct count', () => {
      const schema = getBlogCollectionSchema(testPosts, 'Blog', 'Blog description');

      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.numberOfItems).toBe(2);
    });

    it('should list all posts in itemListElement', () => {
      const schema = getBlogCollectionSchema(testPosts, 'Blog', 'Blog description');

      expect(schema.mainEntity.itemListElement).toHaveLength(2);
      expect(schema.mainEntity.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        url: 'https://example.com/blog/post-1',
        name: 'Post 1',
      });
      expect(schema.mainEntity.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        url: 'https://example.com/blog/post-2',
        name: 'Post 2',
      });
    });

    it('should handle empty posts array', () => {
      const schema = getBlogCollectionSchema([], 'Blog', 'Blog description');

      expect(schema.mainEntity.numberOfItems).toBe(0);
      expect(schema.mainEntity.itemListElement).toEqual([]);
    });

    it('should handle filtered blog title', () => {
      const schema = getBlogCollectionSchema(testPosts, 'Blog - JavaScript', 'JavaScript posts');

      expect(schema.name).toBe('Blog - JavaScript');
      expect(schema.description).toBe('JavaScript posts');
    });
  });

  describe('getAboutPageSchema', () => {
    it('should generate AboutPage and ProfilePage schemas', () => {
      const schema = getAboutPageSchema('About page description');

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@graph']).toHaveLength(3);
    });

    it('should include AboutPage schema', () => {
      const schema = getAboutPageSchema('About page description');
      const aboutPage = schema['@graph'][0] as any;

      expect(aboutPage['@type']).toBe('AboutPage');
      expect(aboutPage.url).toBe('https://example.com/about');
      expect(aboutPage.name).toBe('About');
      expect(aboutPage.description).toBe('About page description');
    });

    it('should include ProfilePage schema', () => {
      const schema = getAboutPageSchema('About page description');
      const profilePage = schema['@graph'][1];

      expect(profilePage['@type']).toBe('ProfilePage');
      expect(profilePage.url).toBe('https://example.com/about');
      expect(profilePage.name).toBe('About Test Author');
    });

    it('should include Person schema', () => {
      const schema = getAboutPageSchema('About page description');
      const personSchema = schema['@graph'][2];

      expect(personSchema['@type']).toBe('Person');
      expect(personSchema.name).toBe('Test Author');
    });

    it('should link AboutPage to Person', () => {
      const schema = getAboutPageSchema('About page description');
      const aboutPage = schema['@graph'][0] as any;

      expect(aboutPage.about).toEqual({
        '@id': 'https://example.com/#person',
      });
    });

    it('should link ProfilePage to Person', () => {
      const schema = getAboutPageSchema('About page description');
      const profilePage = schema['@graph'][1] as any;

      expect(profilePage.mainEntity).toEqual({
        '@id': 'https://example.com/#person',
      });
    });

    it('should include social image when provided', () => {
      const schema = getAboutPageSchema(
        'About page description',
        'https://example.com/profile.jpg'
      );
      const personSchema = schema['@graph'][2] as any;

      expect(personSchema.image).toBe('https://example.com/profile.jpg');
    });

    it('should not include social image when not provided', () => {
      const schema = getAboutPageSchema('About page description');
      const personSchema = schema['@graph'][2];

      expect(personSchema).not.toHaveProperty('image');
    });
  });

  describe('getContactPageSchema', () => {
    it('should generate ContactPage schema', () => {
      const schema = getContactPageSchema('Contact page description');

      expect(schema['@type']).toBe('ContactPage');
      expect(schema.url).toBe('https://example.com/contact');
      expect(schema.name).toBe('Contact');
      expect(schema.description).toBe('Contact page description');
    });

    it('should reference website schema', () => {
      const schema = getContactPageSchema('Contact page description');

      expect(schema.isPartOf).toEqual({
        '@id': 'https://example.com/#website',
      });
    });

    it('should reference person schema', () => {
      const schema = getContactPageSchema('Contact page description');

      expect(schema.about).toEqual({
        '@id': 'https://example.com/#person',
      });
    });

    it('should set language to en-US', () => {
      const schema = getContactPageSchema('Contact page description');

      expect(schema.inLanguage).toBe('en-US');
    });
  });

  describe('getJsonLdScriptProps', () => {
    it('should generate script props with nonce', () => {
      const schema = { '@type': 'WebSite', name: 'Test' };
      const props = getJsonLdScriptProps(schema, 'test-nonce-123');

      expect(props.type).toBe('application/ld+json');
      expect(props.nonce).toBe('test-nonce-123');
      expect(props.suppressHydrationWarning).toBe(true);
    });

    it('should serialize schema to JSON', () => {
      const schema = { '@type': 'WebSite', name: 'Test', url: 'https://example.com' };
      const props = getJsonLdScriptProps(schema, 'test-nonce');

      expect((props.dangerouslySetInnerHTML as { __html: string }).__html).toBe(
        JSON.stringify(schema)
      );
    });

    it('should handle complex nested schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebSite', name: 'Test' },
          { '@type': 'Person', name: 'Test Author' },
        ],
      };
      const props = getJsonLdScriptProps(schema, 'test-nonce');

      expect((props.dangerouslySetInnerHTML as { __html: string }).__html).toBe(
        JSON.stringify(schema)
      );
    });

    it('should handle empty object', () => {
      const props = getJsonLdScriptProps({}, 'test-nonce');

      expect((props.dangerouslySetInnerHTML as { __html: string }).__html).toBe('{}');
    });
  });
});

/**
 * Test Suite: lib/metadata.ts
 * 
 * Tests metadata generation functions for SEO, Open Graph, Twitter Cards,
 * and JSON-LD structured data.
 * 
 * Coverage: createPageMetadata, createArchivePageMetadata, createArticlePageMetadata,
 * createBreadcrumbSchema, createArticleSchema, createCollectionSchema, getJsonLdScriptProps
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Metadata } from 'next';
import {
  createPageMetadata,
  createArchivePageMetadata,
  createArticlePageMetadata,
  createBreadcrumbSchema,
  createArticleSchema,
  createCollectionSchema,
  getJsonLdScriptProps,
  type BaseMetadataOptions,
  type ArchiveMetadataOptions,
  type ArticleMetadataOptions,
  type BreadcrumbItem,
  type ArticleSchemaOptions,
  type CollectionSchemaOptions,
} from '@/lib/metadata';

// Mock site-config
vi.mock('@/lib/site-config', () => ({
  SITE_URL: 'https://www.dcyfr.ai',
  SITE_TITLE_PLAIN: "DCYFR Labs",
  getOgImageUrl: vi.fn((title?: string, description?: string) => {
    const url = new URL('/opengraph-image', 'https://www.dcyfr.ai');
    if (title) url.searchParams.set('title', title);
    if (description) url.searchParams.set('description', description);
    return url.toString();
  }),
  getTwitterImageUrl: vi.fn((title?: string, description?: string) => {
    const url = new URL('/twitter-image', 'https://www.dcyfr.ai');
    if (title) url.searchParams.set('title', title);
    if (description) url.searchParams.set('description', description);
    return url.toString();
  }),
}));

describe('metadata.ts', () => {
  describe('createPageMetadata', () => {
    it('should generate basic metadata with required fields', () => {
      const options: BaseMetadataOptions = {
        title: 'About',
        description: 'Learn more about us',
        path: '/about',
      };

      const metadata = createPageMetadata(options);

      expect(metadata.title).toBe('About');
      expect(metadata.description).toBe('Learn more about us');
      expect(metadata.openGraph?.title).toBe("About — DCYFR Labs");
      expect(metadata.openGraph?.description).toBe('Learn more about us');
      expect(metadata.openGraph?.url).toBe('https://www.dcyfr.ai/about');
      expect(metadata.openGraph?.siteName).toBe("DCYFR Labs");
      expect((metadata.openGraph as any)?.type).toBe('website');
    });

    it('should include keywords when provided', () => {
      const options: BaseMetadataOptions = {
        title: 'Security',
        description: 'Security best practices',
        path: '/security',
        keywords: ['security', 'best practices', 'cybersecurity'],
      };

      const metadata = createPageMetadata(options);

      expect(metadata.keywords).toEqual(['security', 'best practices', 'cybersecurity']);
    });

    it('should generate Open Graph image with dynamic generator', () => {
      const options: BaseMetadataOptions = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
      };

      const metadata = createPageMetadata(options);

      expect(metadata.openGraph?.images).toHaveLength(1);
      const ogImage = (metadata.openGraph?.images as any)?.[0];
      expect(ogImage.url).toContain('/opengraph-image');
      expect(ogImage.url).toContain('title=Test+Page');
      expect(ogImage.width).toBe(1200);
      expect(ogImage.height).toBe(630);
      expect(ogImage.type).toBe('image/png');
    });

    it('should use custom image when provided', () => {
      const options: BaseMetadataOptions = {
        title: 'Custom Image Page',
        description: 'Page with custom image',
        path: '/custom',
        customImage: 'https://example.com/custom.jpg',
        imageWidth: 1920,
        imageHeight: 1080,
        imageAlt: 'Custom alt text',
      };

      const metadata = createPageMetadata(options);

      const ogImage = (metadata.openGraph?.images as any)?.[0];
      expect(ogImage.url).toBe('https://example.com/custom.jpg');
      expect(ogImage.width).toBe(1920);
      expect(ogImage.height).toBe(1080);
      expect(ogImage.type).toBe('image/jpeg');
      expect(ogImage.alt).toBe('Custom alt text');
    });

    it('should generate Twitter card metadata', () => {
      const options: BaseMetadataOptions = {
        title: 'Twitter Test',
        description: 'Twitter card test',
        path: '/twitter',
      };

      const metadata = createPageMetadata(options);

      expect((metadata.twitter as any)?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe("Twitter Test — DCYFR Labs");
      expect(metadata.twitter?.description).toBe('Twitter card test');
      expect(metadata.twitter?.images).toHaveLength(1);
      expect((metadata.twitter?.images as any)?.[0]).toContain('/twitter-image');
    });

    it('should default image alt to title when not provided', () => {
      const options: BaseMetadataOptions = {
        title: 'Default Alt',
        description: 'Testing default alt',
        path: '/alt',
      };

      const metadata = createPageMetadata(options);

      expect((metadata.openGraph?.images as any)?.[0].alt).toBe("Default Alt — DCYFR Labs");
    });
  });

  describe('createArchivePageMetadata', () => {
    it('should generate basic archive metadata', () => {
      const options: ArchiveMetadataOptions = {
        title: 'Blog',
        description: 'All blog posts',
        path: '/blog',
      };

      const metadata = createArchivePageMetadata(options);

      expect(metadata.title).toBe('Blog');
      expect(metadata.description).toBe('All blog posts');
    });

    it('should append item count to description', () => {
      const options: ArchiveMetadataOptions = {
        title: 'Our Work',
        description: 'All work items',
        path: '/work',
        itemCount: 5,
      };

      const metadata = createArchivePageMetadata(options);

      expect(metadata.description).toBe('All work items (5 items)');
    });

    it('should use singular "item" for count of 1', () => {
      const options: ArchiveMetadataOptions = {
        title: 'Our Work',
        description: 'All work items',
        path: '/work',
        itemCount: 1,
      };

      const metadata = createArchivePageMetadata(options);

      expect(metadata.description).toBe('All work items (1 item)');
    });

    it('should append active tag to title and description', () => {
      const options: ArchiveMetadataOptions = {
        title: 'Blog',
        description: 'All blog posts',
        path: '/blog',
        activeTag: 'TypeScript',
        itemCount: 10,
      };

      const metadata = createArchivePageMetadata(options);

      expect(metadata.title).toBe('Blog - TypeScript');
      expect(metadata.description).toBe('All blog posts — Filtered by "TypeScript"');
    });

    it('should append active search to title', () => {
      const options: ArchiveMetadataOptions = {
        title: 'Blog',
        description: 'All blog posts',
        path: '/blog',
        activeSearch: 'react hooks',
      };

      const metadata = createArchivePageMetadata(options);

      expect(metadata.title).toBe('Blog - Search: react hooks');
    });

    it('should prioritize tag over search in title', () => {
      const options: ArchiveMetadataOptions = {
        title: 'Blog',
        description: 'All blog posts',
        path: '/blog',
        activeTag: 'React',
        activeSearch: 'hooks',
      };

      const metadata = createArchivePageMetadata(options);

      expect(metadata.title).toBe('Blog - React');
    });

    it('should pass through base options', () => {
      const options: ArchiveMetadataOptions = {
        title: 'Blog',
        description: 'All blog posts',
        path: '/blog',
        keywords: ['blog', 'articles'],
      };

      const metadata = createArchivePageMetadata(options);

      expect(metadata.keywords).toEqual(['blog', 'articles']);
      expect(metadata.openGraph?.url).toBe('https://www.dcyfr.ai/blog');
    });
  });

  describe('createArticlePageMetadata', () => {
    const baseDate = new Date('2024-01-15T10:00:00Z');
    const modifiedDate = new Date('2024-02-01T15:30:00Z');

    it('should generate basic article metadata', () => {
      const options: ArticleMetadataOptions = {
        title: 'My Blog Post',
        description: 'A great blog post',
        path: '/blog/my-post',
        publishedAt: baseDate,
        author: 'Drew',
      };

      const metadata = createArticlePageMetadata(options);

      expect(metadata.title).toBe('My Blog Post');
      expect(metadata.description).toBe('A great blog post');
      expect((metadata.openGraph as any)?.type).toBe('article');
      expect((metadata.openGraph as any)?.publishedTime).toBe(baseDate.toISOString());
    });

    it('should normalize single author to array', () => {
      const options: ArticleMetadataOptions = {
        title: 'Article',
        description: 'Description',
        path: '/blog/article',
        author: 'Drew',
      };

      const metadata = createArticlePageMetadata(options);

      expect(metadata.authors).toEqual([{ name: 'Drew' }]);
      expect((metadata.openGraph as any)?.authors).toEqual(['Drew']);
    });

    it('should handle multiple authors', () => {
      const options: ArticleMetadataOptions = {
        title: 'Collaborative Article',
        description: 'Written by many',
        path: '/blog/collab',
        author: ['Drew', 'Jane Doe', 'John Smith'],
      };

      const metadata = createArticlePageMetadata(options);

      expect(metadata.authors).toEqual([
        { name: 'Drew' },
        { name: 'Jane Doe' },
        { name: 'John Smith' },
      ]);
      expect((metadata.openGraph as any)?.authors).toEqual(['Drew', 'Jane Doe', 'John Smith']);
    });

    it('should handle missing author', () => {
      const options: ArticleMetadataOptions = {
        title: 'Anonymous Article',
        description: 'No author',
        path: '/blog/anon',
      };

      const metadata = createArticlePageMetadata(options);

      expect(metadata.authors).toBeUndefined();
      expect((metadata.openGraph as any)?.authors).toBeUndefined();
    });

    it('should set modifiedTime when provided', () => {
      const options: ArticleMetadataOptions = {
        title: 'Updated Article',
        description: 'Has been modified',
        path: '/blog/updated',
        publishedAt: baseDate,
        modifiedAt: modifiedDate,
      };

      const metadata = createArticlePageMetadata(options);

      expect((metadata.openGraph as any)?.publishedTime).toBe(baseDate.toISOString());
      expect((metadata.openGraph as any)?.modifiedTime).toBe(modifiedDate.toISOString());
    });

    it('should use publishedAt for modifiedTime when not provided', () => {
      const options: ArticleMetadataOptions = {
        title: 'Article',
        description: 'Description',
        path: '/blog/article',
        publishedAt: baseDate,
      };

      const metadata = createArticlePageMetadata(options);

      expect((metadata.openGraph as any)?.modifiedTime).toBe(baseDate.toISOString());
    });

    it('should include keywords in Open Graph tags', () => {
      const options: ArticleMetadataOptions = {
        title: 'Tagged Article',
        description: 'Has tags',
        path: '/blog/tagged',
        keywords: ['react', 'typescript', 'nextjs'],
      };

      const metadata = createArticlePageMetadata(options);

      expect(metadata.keywords).toEqual(['react', 'typescript', 'nextjs']);
      expect((metadata.openGraph as any)?.tags).toEqual(['react', 'typescript', 'nextjs']);
    });

    it('should use custom hero image when provided', () => {
      const options: ArticleMetadataOptions = {
        title: 'Article with Image',
        description: 'Has hero image',
        path: '/blog/hero',
        image: 'https://www.dcyfr.ai/images/hero.jpg',
        imageWidth: 1920,
        imageHeight: 1080,
        imageAlt: 'Hero image',
      };

      const metadata = createArticlePageMetadata(options);

      const ogImage = (metadata.openGraph?.images as any)?.[0];
      expect(ogImage.url).toBe('https://www.dcyfr.ai/images/hero.jpg');
      expect(ogImage.width).toBe(1920);
      expect(ogImage.height).toBe(1080);
      expect(ogImage.type).toBe('image/jpeg');
      expect(ogImage.alt).toBe('Hero image');
    });

    it('should fall back to dynamic OG image generator', () => {
      const options: ArticleMetadataOptions = {
        title: 'Dynamic Image Article',
        description: 'No custom image',
        path: '/blog/dynamic',
      };

      const metadata = createArticlePageMetadata(options);

      const ogImage = (metadata.openGraph?.images as any)?.[0];
      expect(ogImage.url).toContain('/opengraph-image');
      expect(ogImage.type).toBe('image/png');
    });

    it('should support website type instead of article', () => {
      const options: ArticleMetadataOptions = {
        title: 'Page',
        description: 'Not an article',
        path: '/page',
        type: 'website',
      };

      const metadata = createArticlePageMetadata(options);

      expect((metadata.openGraph as any)?.type).toBe('website');
    });

    it('should default to article type', () => {
      const options: ArticleMetadataOptions = {
        title: 'Default Type',
        description: 'No type specified',
        path: '/blog/default',
      };

      const metadata = createArticlePageMetadata(options);

      expect((metadata.openGraph as any)?.type).toBe('article');
    });
  });

  describe('createBreadcrumbSchema', () => {
    it('should generate valid breadcrumb schema', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://www.dcyfr.ai' },
        { name: 'Blog', url: 'https://www.dcyfr.ai/blog' },
        { name: 'My Post', url: 'https://www.dcyfr.ai/blog/my-post' },
      ];

      const schema = createBreadcrumbSchema(items);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.dcyfr.ai',
      });
      expect(schema.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'My Post',
        item: 'https://www.dcyfr.ai/blog/my-post',
      });
    });

    it('should handle single breadcrumb item', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://www.dcyfr.ai' },
      ];

      const schema = createBreadcrumbSchema(items);

      expect(schema.itemListElement).toHaveLength(1);
      expect(schema.itemListElement[0].position).toBe(1);
    });

    it('should handle empty breadcrumb list', () => {
      const items: BreadcrumbItem[] = [];

      const schema = createBreadcrumbSchema(items);

      expect(schema.itemListElement).toHaveLength(0);
    });
  });

  describe('createArticleSchema', () => {
    const baseDate = new Date('2024-01-15T10:00:00Z');
    const modifiedDate = new Date('2024-02-01T15:30:00Z');

    it('should generate valid article schema', () => {
      const options: ArticleSchemaOptions = {
        title: 'Understanding React Hooks',
        description: 'A deep dive into React hooks',
        url: 'https://www.dcyfr.ai/blog/react-hooks',
        publishedAt: baseDate,
        author: 'Drew',
      };

      const schema = createArticleSchema(options);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe('Understanding React Hooks');
      expect(schema.description).toBe('A deep dive into React hooks');
      expect(schema.url).toBe('https://www.dcyfr.ai/blog/react-hooks');
      expect(schema.datePublished).toBe(baseDate.toISOString());
      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'Drew',
      });
    });

    it('should include modified date when provided', () => {
      const options: ArticleSchemaOptions = {
        title: 'Article',
        description: 'Description',
        url: 'https://www.dcyfr.ai/blog/article',
        publishedAt: baseDate,
        modifiedAt: modifiedDate,
        author: 'Drew',
      };

      const schema = createArticleSchema(options);

      expect(schema.dateModified).toBe(modifiedDate.toISOString());
    });

    it('should use published date for modified when not provided', () => {
      const options: ArticleSchemaOptions = {
        title: 'Article',
        description: 'Description',
        url: 'https://www.dcyfr.ai/blog/article',
        publishedAt: baseDate,
        author: 'Drew',
      };

      const schema = createArticleSchema(options);

      expect(schema.dateModified).toBe(baseDate.toISOString());
    });

    it('should include image when provided', () => {
      const options: ArticleSchemaOptions = {
        title: 'Article with Image',
        description: 'Has image',
        url: 'https://www.dcyfr.ai/blog/image',
        publishedAt: baseDate,
        author: 'Drew',
        image: 'https://www.dcyfr.ai/images/article.jpg',
      };

      const schema = createArticleSchema(options);

      expect(schema.image).toBe('https://www.dcyfr.ai/images/article.jpg');
    });

    it('should exclude image when not provided', () => {
      const options: ArticleSchemaOptions = {
        title: 'Article',
        description: 'Description',
        url: 'https://www.dcyfr.ai/blog/article',
        publishedAt: baseDate,
        author: 'Drew',
      };

      const schema = createArticleSchema(options);

      expect(schema.image).toBeUndefined();
    });

    it('should join tags as comma-separated keywords', () => {
      const options: ArticleSchemaOptions = {
        title: 'Tagged Article',
        description: 'Has tags',
        url: 'https://www.dcyfr.ai/blog/tagged',
        publishedAt: baseDate,
        author: 'Drew',
        tags: ['react', 'typescript', 'nextjs'],
      };

      const schema = createArticleSchema(options);

      expect(schema.keywords).toBe('react, typescript, nextjs');
    });

    it('should handle empty tags array', () => {
      const options: ArticleSchemaOptions = {
        title: 'Article',
        description: 'Description',
        url: 'https://www.dcyfr.ai/blog/article',
        publishedAt: baseDate,
        author: 'Drew',
        tags: [],
      };

      const schema = createArticleSchema(options);

      expect(schema.keywords).toBe('');
    });
  });

  describe('createCollectionSchema', () => {
    const baseDate = new Date('2024-01-15T10:00:00Z');

    it('should generate valid collection schema', () => {
      const options: CollectionSchemaOptions = {
        name: 'Blog Posts',
        description: 'All blog posts about web development',
        url: 'https://www.dcyfr.ai/blog',
        items: [
          {
            name: 'React Hooks Guide',
            description: 'Learn React hooks',
            url: 'https://www.dcyfr.ai/blog/react-hooks',
            datePublished: baseDate,
            author: 'Drew',
          },
          {
            name: 'TypeScript Tips',
            description: 'TypeScript best practices',
            url: 'https://www.dcyfr.ai/blog/typescript-tips',
            datePublished: new Date('2024-02-01T10:00:00Z'),
            author: 'Drew',
          },
        ],
      };

      const schema = createCollectionSchema(options);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.name).toBe('Blog Posts');
      expect(schema.description).toBe('All blog posts about web development');
      expect(schema.url).toBe('https://www.dcyfr.ai/blog');
      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.itemListElement).toHaveLength(2);
    });

    it('should correctly structure item list elements', () => {
      const options: CollectionSchemaOptions = {
        name: 'Portfolio',
        description: 'My portfolio',
        url: 'https://www.dcyfr.ai/portfolio',
        items: [
          {
            name: 'Project One',
            description: 'First project',
            url: 'https://www.dcyfr.ai/portfolio/one',
            datePublished: baseDate,
            author: 'Drew',
          },
        ],
      };

      const schema = createCollectionSchema(options);

      const item = schema.mainEntity.itemListElement[0];
      expect(item['@type']).toBe('ListItem');
      expect(item.position).toBe(1);
      expect(item.item['@type']).toBe('Article');
      expect(item.item.name).toBe('Project One');
      expect(item.item.description).toBe('First project');
      expect(item.item.url).toBe('https://www.dcyfr.ai/portfolio/one');
      expect(item.item.datePublished).toBe(baseDate.toISOString());
      expect(item.item.author).toEqual({ '@type': 'Person', name: 'Drew' });
    });

    it('should handle items without optional fields', () => {
      const options: CollectionSchemaOptions = {
        name: 'Simple Collection',
        description: 'Minimal items',
        url: 'https://www.dcyfr.ai/collection',
        items: [
          {
            name: 'Item One',
            url: 'https://www.dcyfr.ai/collection/one',
          },
        ],
      };

      const schema = createCollectionSchema(options);

      const item = schema.mainEntity.itemListElement[0].item;
      expect(item.description).toBeUndefined();
      expect(item.datePublished).toBeUndefined();
      expect(item.author).toBeUndefined();
    });

    it('should handle empty items array', () => {
      const options: CollectionSchemaOptions = {
        name: 'Empty Collection',
        description: 'No items',
        url: 'https://www.dcyfr.ai/empty',
        items: [],
      };

      const schema = createCollectionSchema(options);

      expect(schema.mainEntity.itemListElement).toHaveLength(0);
    });

    it('should maintain correct position order for multiple items', () => {
      const options: CollectionSchemaOptions = {
        name: 'Ordered Collection',
        description: 'Multiple items',
        url: 'https://www.dcyfr.ai/ordered',
        items: [
          { name: 'First', url: 'https://www.dcyfr.ai/1' },
          { name: 'Second', url: 'https://www.dcyfr.ai/2' },
          { name: 'Third', url: 'https://www.dcyfr.ai/3' },
        ],
      };

      const schema = createCollectionSchema(options);

      expect(schema.mainEntity.itemListElement[0].position).toBe(1);
      expect(schema.mainEntity.itemListElement[1].position).toBe(2);
      expect(schema.mainEntity.itemListElement[2].position).toBe(3);
    });
  });

  describe('getJsonLdScriptProps', () => {
    it('should generate script props without nonce', () => {
      const schema = { '@type': 'Article', name: 'Test' };
      const props = getJsonLdScriptProps(schema);

      expect(props.type).toBe('application/ld+json');
      expect(props.dangerouslySetInnerHTML.__html).toBe(JSON.stringify(schema));
      expect(props.suppressHydrationWarning).toBe(true);
      expect(props).not.toHaveProperty('nonce');
    });

    it('should include nonce when provided', () => {
      const schema = { '@type': 'Article', name: 'Test' };
      const nonce = 'abc123xyz';
      const props = getJsonLdScriptProps(schema, nonce);

      expect(props.type).toBe('application/ld+json');
      expect(props.nonce).toBe('abc123xyz');
      expect(props.suppressHydrationWarning).toBe(true);
    });

    it('should not include nonce property when empty string', () => {
      const schema = { '@type': 'Article', name: 'Test' };
      const props = getJsonLdScriptProps(schema, '');

      expect(props).not.toHaveProperty('nonce');
    });

    it('should properly stringify complex schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        author: { '@type': 'Person', name: 'Drew' },
        keywords: ['test', 'article'],
      };
      const props = getJsonLdScriptProps(schema);

      const parsed = JSON.parse(props.dangerouslySetInnerHTML.__html);
      expect(parsed).toEqual(schema);
    });
  });
});

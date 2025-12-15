import { describe, test, expect } from 'vitest';
import { DEFAULT_IMAGE, getDefaultBlogImage, getDynamicDefaultImage, ensurePostImage } from '@/lib/default-images';

describe('default-images.ts', () => {
  describe('DEFAULT_IMAGE', () => {
    test('has correct structure and values', () => {
      expect(DEFAULT_IMAGE).toHaveProperty('url');
      expect(DEFAULT_IMAGE).toHaveProperty('alt');
      expect(DEFAULT_IMAGE.url).toBe('/blog/images/default/hero.svg');
      expect(DEFAULT_IMAGE.alt).toContain('Default blog post featured image');
    });

    test('is defined as constant', () => {
      // Test that the constant is properly defined
      expect(DEFAULT_IMAGE.url).toBe('/blog/images/default/hero.svg');
      expect(DEFAULT_IMAGE.alt).toContain('gradient background');
    });
  });

  describe('getDefaultBlogImage', () => {
    test('returns default image without options', () => {
      const image = getDefaultBlogImage();
      
      expect(image.url).toBe(DEFAULT_IMAGE.url);
      expect(image.alt).toBe(DEFAULT_IMAGE.alt);
    });

    test('returns default image with empty options', () => {
      const image = getDefaultBlogImage({});
      
      expect(image.url).toBe(DEFAULT_IMAGE.url);
      expect(image.alt).toBe(DEFAULT_IMAGE.alt);
    });

    test('returns default image with title and tags', () => {
      const image = getDefaultBlogImage({
        title: 'My Test Post',
        tags: ['react', 'typescript']
      });
      
      expect(image.url).toBe(DEFAULT_IMAGE.url);
      expect(image.alt).toBe(DEFAULT_IMAGE.alt);
    });

    test('maintains API compatibility with options parameter', () => {
      // Function should accept options but currently ignores them
      const image1 = getDefaultBlogImage();
      const image2 = getDefaultBlogImage({ title: 'Test', tags: ['test'] });
      
      expect(image1).toEqual(image2);
    });

    test('returns valid PostImage structure', () => {
      const image = getDefaultBlogImage();
      
      expect(typeof image.url).toBe('string');
      expect(typeof image.alt).toBe('string');
      expect(image.url.startsWith('/')).toBe(true);
      expect(image.url.endsWith('.svg')).toBe(true);
    });
  });

  describe('getDynamicDefaultImage', () => {
    test('generates API URL with title parameter', () => {
      const title = 'Getting Started with Next.js';
      const image = getDynamicDefaultImage(title);
      
      expect(image.url).toContain('/api/default-blog-image?');
      expect(image.url).toContain('title=Getting+Started+with+Next.js');
      expect(image.url).toContain('style=gradient');
    });

    test('creates proper alt text with title', () => {
      const title = 'My Test Post';
      const image = getDynamicDefaultImage(title);
      
      expect(image.alt).toBe('My Test Post - Blog post featured image');
    });

    test('handles titles with special characters', () => {
      const title = 'React & TypeScript: A Guide!';
      const image = getDynamicDefaultImage(title);
      
      expect(image.url).toContain('/api/default-blog-image?');
      expect(image.alt).toBe('React & TypeScript: A Guide! - Blog post featured image');
    });

    test('returns valid PostImage structure', () => {
      const image = getDynamicDefaultImage('Test Title');
      
      expect(typeof image.url).toBe('string');
      expect(typeof image.alt).toBe('string');
      expect(image.url.startsWith('/api/')).toBe(true);
    });

    test('URL encodes title properly', () => {
      const title = 'Hello World & More Stuff!';
      const image = getDynamicDefaultImage(title);
      
      expect(image.url).toContain('Hello+World+%26+More+Stuff%21');
    });
  });

  describe('ensurePostImage', () => {
    test('returns custom image when provided', () => {
      const customImage = {
        url: '/custom/image.jpg',
        alt: 'Custom alt text'
      };
      
      const result = ensurePostImage(customImage);
      expect(result).toBe(customImage);
    });

    test('returns default image when no custom image provided', () => {
      const result = ensurePostImage(undefined);
      
      expect(result.url).toBe(DEFAULT_IMAGE.url);
      expect(result.alt).toBe(DEFAULT_IMAGE.alt);
    });

    test('passes fallback options to getDefaultBlogImage', () => {
      const fallbackOptions = {
        title: 'My Post',
        tags: ['react', 'typescript']
      };
      
      const result = ensurePostImage(undefined, fallbackOptions);
      
      // Should return default image (function currently ignores options)
      expect(result.url).toBe(DEFAULT_IMAGE.url);
      expect(result.alt).toBe(DEFAULT_IMAGE.alt);
    });

    test('prefers custom image over fallback options', () => {
      const customImage = {
        url: '/custom.jpg',
        alt: 'Custom'
      };
      const fallbackOptions = {
        title: 'Fallback Title'
      };
      
      const result = ensurePostImage(customImage, fallbackOptions);
      expect(result).toBe(customImage);
    });

    test('uses caption as alt when caption provided and alt missing', () => {
      const customImage = {
        url: '/with-caption.jpg',
        caption: 'Caption Text'
      } as any;

      const result = ensurePostImage(customImage);
      expect(result.alt).toBe('Caption Text');
      // Should return a new object since alt was injected
      expect(result).not.toBe(customImage);
    });

    test('overrides alt with caption when caption differs', () => {
      const customImage = {
        url: '/with-caption-and-alt.jpg',
        alt: 'Old Alt',
        caption: 'Caption Override'
      } as any;

      const result = ensurePostImage(customImage);
      expect(result.alt).toBe('Caption Override');
      expect(result).not.toBe(customImage);
    });
  });

  describe('file paths and accessibility', () => {
    test('default image uses SVG format for scalability', () => {
      expect(DEFAULT_IMAGE.url.endsWith('.svg')).toBe(true);
    });

    test('alt text is descriptive for accessibility', () => {
      expect(DEFAULT_IMAGE.alt).toContain('Default');
      expect(DEFAULT_IMAGE.alt).toContain('blog post');
    });

    test('path follows expected directory structure', () => {
      expect(DEFAULT_IMAGE.url).toMatch(/^\/blog\/images\/default\//);
    });

    test('dynamic images use appropriate API endpoint', () => {
      const image = getDynamicDefaultImage('Test');
      expect(image.url).toMatch(/^\/api\/default-blog-image\?/);
    });
  });
});
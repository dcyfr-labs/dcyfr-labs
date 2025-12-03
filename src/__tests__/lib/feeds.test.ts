/**
 * Test Suite: lib/feeds.ts
 * 
 * Tests RSS 2.0 and Atom 1.0 feed generation from blog posts and projects.
 * Critical for content syndication and SEO.
 * 
 * Coverage: postToFeedItem, projectToFeedItem, generateRssFeed, generateAtomFeed,
 * buildBlogFeed, buildProjectsFeed, buildCombinedFeed
 */

import { describe, it, expect, vi } from 'vitest';
import {
  postToFeedItem,
  projectToFeedItem,
  generateRssFeed,
  generateAtomFeed,
  buildBlogFeed,
  buildProjectsFeed,
  buildCombinedFeed,
  type FeedItem,
  type FeedConfig,
} from '@/lib/feeds';
import type { Post } from '@/data/posts';
import type { Project } from '@/data/projects';

// Mock dependencies
vi.mock('@/lib/site-config', () => ({
  SITE_URL: 'https://www.dcyfr.ai',
  AUTHOR_NAME: 'Drew',
  AUTHOR_EMAIL: 'drew@www.dcyfr.ai',
  SITE_TITLE: "DCYFR Labs",
  SITE_DESCRIPTION: 'Portfolio and blog',
}));

vi.mock('@/lib/mdx-to-html', () => ({
  mdxToHtml: vi.fn(async (content: string) => `<p>${content}</p>`),
}));

// Test data helpers
const createTestPost = (overrides: Partial<Post> = {}): Post => ({
  id: 'test-id',
  slug: 'test-slug',
  title: 'Test Post',
  summary: 'Test summary',
  body: 'Test body',
  publishedAt: '2024-01-15',
  tags: [],
  readingTime: { words: 600, minutes: 3, text: '3 min read' },
  ...overrides,
});

const createTestProject = (overrides: Partial<Project> = {}): Project => ({
  slug: 'test-project',
  title: 'Test Project',
  description: 'Test description',
  timeline: '2024',
  status: 'active',
  links: [],
  ...overrides,
});

describe('feeds.ts', () => {
  describe('postToFeedItem', () => {
    it('should convert a basic post to feed item', async () => {
      const post: Post = {
        id: 'test-post-id',
        slug: 'test-post',
        title: 'Test Post',
        summary: 'A test post summary',
        body: 'Post body content',
        publishedAt: '2024-01-15',
        tags: ['test', 'blog'],
        readingTime: { words: 1000, minutes: 5, text: '5 min read' },
      };

      const item = await postToFeedItem(post);

      expect(item.id).toBe('https://www.dcyfr.ai/blog/test-post');
      expect(item.title).toBe('Test Post');
      expect(item.description).toBe('A test post summary');
      expect(item.link).toBe('https://www.dcyfr.ai/blog/test-post');
      expect(item.published).toEqual(new Date('2024-01-15'));
      expect(item.categories).toEqual(['test', 'blog']);
      expect(item.author).toEqual({
        name: 'Drew',
        email: 'drew@www.dcyfr.ai',
      });
    });

    it('should include HTML content from MDX', async () => {
      const post = createTestPost({
        slug: 'content-post',
        title: 'Content Post',
        summary: 'Summary',
        body: 'MDX content here',
        publishedAt: '2024-01-15',
      });

      const item = await postToFeedItem(post);

      expect(item.content).toBe('<p>MDX content here</p>');
    });

    it('should handle post with updated date', async () => {
      const post = createTestPost({
        slug: 'updated-post',
        title: 'Updated Post',
        summary: 'Summary',
        body: 'Content',
        publishedAt: '2024-01-15',
        updatedAt: '2024-02-01',
      });

      const item = await postToFeedItem(post);

      expect(item.updated).toEqual(new Date('2024-02-01'));
    });

    it('should handle post without updated date', async () => {
      const post = createTestPost({
        slug: 'no-update',
        title: 'No Update',
        summary: 'Summary',
        body: 'Content',
        publishedAt: '2024-01-15',
      });

      const item = await postToFeedItem(post);

      expect(item.updated).toBeUndefined();
    });

    it('should include image with absolute URL', async () => {
      const post = createTestPost({
        slug: 'image-post',
        title: 'Image Post',
        summary: 'Has image',
        body: 'Content',
        publishedAt: '2024-01-15',
        image: {
          url: '/blog/test-image.jpg',
          alt: 'Test image',
        },
      });

      const item = await postToFeedItem(post);

      expect(item.image).toEqual({
        url: 'https://www.dcyfr.ai/blog/test-image.jpg',
        type: 'image/jpeg',
      });
    });

    it('should handle post without image', async () => {
      const post = createTestPost({
        slug: 'no-image',
        title: 'No Image',
        summary: 'No image',
        body: 'Content',
        publishedAt: '2024-01-15',
      });

      const item = await postToFeedItem(post);

      expect(item.image).toBeUndefined();
    });

    it('should infer MIME type from image extension', async () => {
      const post = createTestPost({
        slug: 'png-image',
        title: 'PNG Image',
        summary: 'Has PNG',
        body: 'Content',
        publishedAt: '2024-01-15',
        image: {
          url: '/images/test.png',
          alt: 'PNG image',
        },
      });

      const item = await postToFeedItem(post);

      expect(item.image?.type).toBe('image/png');
    });
  });

  describe('projectToFeedItem', () => {
    it('should convert a basic project to feed item', () => {
      const project = createTestProject({
        slug: 'test-project',
        title: 'Test Project',
        description: 'A test project',
        timeline: '2024',
        tech: ['TypeScript', 'React'],
        links: [
          { label: 'GitHub', href: 'https://github.com/test' },
        ],
      });

      const item = projectToFeedItem(project);

      expect(item.id).toBe('https://www.dcyfr.ai/work/test-project');
      expect(item.title).toBe('Test Project');
      expect(item.description).toBe('A test project');
      expect(item.link).toBe('https://www.dcyfr.ai/work/test-project');
      expect(item.author).toEqual({
        name: 'Drew',
        email: 'drew@www.dcyfr.ai',
      });
    });

    it('should include technologies in HTML content', () => {
      const project = createTestProject({
        slug: 'tech-project',
        title: 'Tech Project',
        description: 'Project with tech',
        timeline: '2024',
        tech: ['TypeScript', 'Node.js', 'PostgreSQL'],
      });

      const item = projectToFeedItem(project);

      expect(item.content).toContain('Technologies:');
      expect(item.content).toContain('TypeScript, Node.js, PostgreSQL');
    });

    it('should include highlights in HTML content', () => {
      const project = createTestProject({
        slug: 'highlights-project',
        title: 'Highlights Project',
        description: 'Project with highlights',
        timeline: '2024',
        highlights: ['Feature 1', 'Feature 2'],
      });

      const item = projectToFeedItem(project);

      expect(item.content).toContain('<ul>');
      expect(item.content).toContain('Feature 1');
      expect(item.content).toContain('Feature 2');
    });

    it('should include links in HTML content', () => {
      const project = createTestProject({
        slug: 'links-project',
        title: 'Links Project',
        description: 'Project with links',
        timeline: '2024',
        links: [
          { label: 'GitHub', href: 'https://github.com/test' },
          { label: 'Demo', href: 'https://demo.example.com' },
        ],
      });

      const item = projectToFeedItem(project);

      expect(item.content).toContain('Links:');
      expect(item.content).toContain('GitHub');
      expect(item.content).toContain('https://github.com/test');
    });

    it('should escape XML in HTML content', () => {
      const project = createTestProject({
        slug: 'escape-project',
        title: 'Escape Project',
        description: 'Test & <escape> characters',
        timeline: '2024',
      });

      const item = projectToFeedItem(project);

      expect(item.content).toContain('&amp;');
      expect(item.content).toContain('&lt;escape&gt;');
    });

    it('should parse year from timeline', () => {
      const project = createTestProject({
        slug: 'year-project',
        title: 'Year Project',
        description: 'Project with year',
        timeline: 'Jan 2023 - Dec 2023',
      });

      const item = projectToFeedItem(project);

      expect(item.published.getFullYear()).toBe(2023);
    });

    it('should use current year if no timeline', () => {
      // Create project without timeline (don't use helper's default)
      const project: Project = {
        slug: 'no-timeline',
        title: 'No Timeline',
        description: 'No timeline project',
        status: 'active',
        links: [],
      };

      const item = projectToFeedItem(project);

      expect(item.published.getFullYear()).toBe(new Date().getFullYear());
    });

    it('should include project tags as categories', () => {
      const project = createTestProject({
        slug: 'tagged-project',
        title: 'Tagged Project',
        description: 'Has tags',
        timeline: '2024',
        tags: ['web', 'api', 'security'],
      });

      const item = projectToFeedItem(project);

      expect(item.categories).toEqual(['web', 'api', 'security']);
    });

    it('should handle project with image', () => {
      const project = createTestProject({
        slug: 'image-project',
        title: 'Image Project',
        description: 'Has image',
        timeline: '2024',
        image: {
          url: '/portfolio/test.png',
          alt: 'Project image',
        },
      });

      const item = projectToFeedItem(project);

      expect(item.image).toEqual({
        url: 'https://www.dcyfr.ai/portfolio/test.png',
        type: 'image/png',
      });
    });
  });

  describe('generateRssFeed', () => {
    const testItems: FeedItem[] = [
      {
        id: 'https://example.com/item-1',
        title: 'Item 1',
        description: 'First item',
        link: 'https://example.com/item-1',
        published: new Date('2024-01-15T10:00:00Z'),
        categories: ['test'],
        author: { name: 'Author', email: 'author@example.com' },
      },
    ];

    const testConfig: FeedConfig = {
      title: 'Test Feed',
      description: 'A test RSS feed',
      link: 'https://example.com',
      feedUrl: 'https://example.com/feed',
      author: { name: 'Editor', email: 'editor@example.com' },
    };

    it('should generate valid RSS 2.0 XML', () => {
      const xml = generateRssFeed(testItems, testConfig);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<rss version="2.0"');
      expect(xml).toContain('</rss>');
    });

    it('should include channel metadata', () => {
      const xml = generateRssFeed(testItems, testConfig);

      expect(xml).toContain('<title>Test Feed</title>');
      expect(xml).toContain('<description>A test RSS feed</description>');
      expect(xml).toContain('<link>https://example.com</link>');
    });

    it('should include feed self-reference', () => {
      const xml = generateRssFeed(testItems, testConfig);

      expect(xml).toContain('atom:link href="https://example.com/feed"');
      expect(xml).toContain('rel="self"');
      expect(xml).toContain('type="application/rss+xml"');
    });

    it('should include item data', () => {
      const xml = generateRssFeed(testItems, testConfig);

      expect(xml).toContain('<item>');
      expect(xml).toContain('<title><![CDATA[Item 1]]></title>');
      expect(xml).toContain('<link>https://example.com/item-1</link>');
      expect(xml).toContain('<description><![CDATA[First item]]></description>');
    });

    it('should include author information', () => {
      const xml = generateRssFeed(testItems, testConfig);

      expect(xml).toContain('<author>author@example.com (Author)</author>');
      expect(xml).toContain('<managingEditor>editor@example.com (Editor)</managingEditor>');
    });

    it('should include categories', () => {
      const xml = generateRssFeed(testItems, testConfig);

      expect(xml).toContain('<category>test</category>');
    });

    it('should include content when provided', () => {
      const itemsWithContent: FeedItem[] = [
        {
          ...testItems[0],
          content: '<p>Full HTML content</p>',
        },
      ];

      const xml = generateRssFeed(itemsWithContent, testConfig);

      expect(xml).toContain('<content:encoded><![CDATA[<p>Full HTML content</p>]]></content:encoded>');
    });

    it('should include image enclosure', () => {
      const itemsWithImage: FeedItem[] = [
        {
          ...testItems[0],
          image: {
            url: 'https://example.com/image.jpg',
            type: 'image/jpeg',
            length: 12345,
          },
        },
      ];

      const xml = generateRssFeed(itemsWithImage, testConfig);

      expect(xml).toContain('<enclosure url="https://example.com/image.jpg"');
      expect(xml).toContain('type="image/jpeg"');
      expect(xml).toContain('length="12345"');
    });

    it('should wrap titles and descriptions in CDATA', () => {
      const itemsWithSpecialChars: FeedItem[] = [
        {
          ...testItems[0],
          title: 'Test & <Special> Characters',
          description: 'Description with "quotes" and \'apostrophes\'',
        },
      ];

      const xml = generateRssFeed(itemsWithSpecialChars, testConfig);

      // CDATA sections preserve special characters without escaping
      expect(xml).toContain('<![CDATA[Test & <Special> Characters]]>');
      expect(xml).toContain('<![CDATA[Description with "quotes" and \'apostrophes\']]>');
    });

    it('should handle multiple items', () => {
      const multipleItems: FeedItem[] = [
        testItems[0],
        {
          id: 'https://example.com/item-2',
          title: 'Item 2',
          description: 'Second item',
          link: 'https://example.com/item-2',
          published: new Date('2024-01-16T10:00:00Z'),
        },
      ];

      const xml = generateRssFeed(multipleItems, testConfig);

      expect(xml).toContain('Item 1');
      expect(xml).toContain('Item 2');
    });

    it('should use default language when not provided', () => {
      const xml = generateRssFeed(testItems, testConfig);

      expect(xml).toContain('<language>en-us</language>');
    });
  });

  describe('generateAtomFeed', () => {
    const testItems: FeedItem[] = [
      {
        id: 'https://example.com/item-1',
        title: 'Item 1',
        description: 'First item',
        link: 'https://example.com/item-1',
        published: new Date('2024-01-15T10:00:00Z'),
        categories: ['test'],
        author: { name: 'Author', email: 'author@example.com' },
      },
    ];

    const testConfig: FeedConfig = {
      title: 'Test Feed',
      description: 'A test Atom feed',
      link: 'https://example.com',
      feedUrl: 'https://example.com/feed.atom',
      author: { name: 'Editor', email: 'editor@example.com' },
    };

    it('should generate valid Atom 1.0 XML', () => {
      const xml = generateAtomFeed(testItems, testConfig);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
      expect(xml).toContain('</feed>');
    });

    it('should include feed metadata', () => {
      const xml = generateAtomFeed(testItems, testConfig);

      expect(xml).toContain('<title>Test Feed</title>');
      expect(xml).toContain('<subtitle>A test Atom feed</subtitle>');
      expect(xml).toContain('href="https://example.com"');
    });

    it('should include entry data', () => {
      const xml = generateAtomFeed(testItems, testConfig);

      expect(xml).toContain('<entry>');
      expect(xml).toContain('<title type="text">Item 1</title>');
      expect(xml).toContain('href="https://example.com/item-1"');
      expect(xml).toContain('<summary type="html"><![CDATA[First item]]></summary>');
    });

    it('should include ISO 8601 dates', () => {
      const xml = generateAtomFeed(testItems, testConfig);

      expect(xml).toContain('<published>2024-01-15T10:00:00.000Z</published>');
      expect(xml).toContain('<updated>2024-01-15T10:00:00.000Z</updated>');
    });

    it('should use updated date when provided', () => {
      const itemsWithUpdate: FeedItem[] = [
        {
          ...testItems[0],
          updated: new Date('2024-01-20T10:00:00Z'),
        },
      ];

      const xml = generateAtomFeed(itemsWithUpdate, testConfig);

      expect(xml).toContain('<updated>2024-01-20T10:00:00.000Z</updated>');
    });

    it('should include author information', () => {
      const xml = generateAtomFeed(testItems, testConfig);

      expect(xml).toContain('<name>Author</name>');
      expect(xml).toContain('<email>author@example.com</email>');
    });

    it('should include categories', () => {
      const xml = generateAtomFeed(testItems, testConfig);

      expect(xml).toContain('term="test"');
      expect(xml).toContain('label="test"');
    });

    it('should include content when provided', () => {
      const itemsWithContent: FeedItem[] = [
        {
          ...testItems[0],
          content: '<p>Full HTML content</p>',
        },
      ];

      const xml = generateAtomFeed(itemsWithContent, testConfig);

      expect(xml).toContain('<content type="html"><![CDATA[<p>Full HTML content</p>]]></content>');
    });

    it('should include image enclosure', () => {
      const itemsWithImage: FeedItem[] = [
        {
          ...testItems[0],
          image: {
            url: 'https://example.com/image.jpg',
            type: 'image/jpeg',
          },
        },
      ];

      const xml = generateAtomFeed(itemsWithImage, testConfig);

      expect(xml).toContain('rel="enclosure"');
      expect(xml).toContain('type="image/jpeg"');
      expect(xml).toContain('href="https://example.com/image.jpg"');
    });

    it('should include copyright notice', () => {
      const xml = generateAtomFeed(testItems, testConfig);

      expect(xml).toContain('<rights>');
      expect(xml).toContain('All rights reserved');
    });
  });

  describe('buildBlogFeed', () => {
    const testPosts: Post[] = [
      createTestPost({
        id: 'post-1-id',
        slug: 'post-1',
        title: 'Post 1',
        summary: 'Summary 1',
        body: 'Content 1',
        publishedAt: '2024-01-15',
        readingTime: { words: 1000, minutes: 5, text: '5 min read' },
      }),
      createTestPost({
        id: 'post-2-id',
        slug: 'post-2',
        title: 'Post 2',
        summary: 'Summary 2',
        body: 'Content 2',
        publishedAt: '2024-01-10',
        readingTime: { words: 600, minutes: 3, text: '3 min read' },
      }),
    ];

    it('should generate RSS feed by default', async () => {
      const xml = await buildBlogFeed(testPosts);

      expect(xml).toContain('<rss version="2.0"');
    });

    it('should generate Atom feed when specified', async () => {
      const xml = await buildBlogFeed(testPosts, 'atom');

      expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    });

    it('should sort posts by published date descending', async () => {
      const xml = await buildBlogFeed(testPosts);
      const post1Index = xml.indexOf('Post 1');
      const post2Index = xml.indexOf('Post 2');

      expect(post1Index).toBeLessThan(post2Index);
    });

    it('should exclude draft posts', async () => {
      const postsWithDraft: Post[] = [
        ...testPosts,
        createTestPost({
          id: 'draft-id',
          slug: 'draft-post',
          title: 'Draft Post',
          summary: 'Draft summary',
          body: 'Draft content',
          publishedAt: '2024-01-20',
          readingTime: { words: 400, minutes: 2, text: '2 min read' },
          draft: true,
        }),
      ];

      const xml = await buildBlogFeed(postsWithDraft);

      expect(xml).not.toContain('Draft Post');
    });

    it('should limit number of posts', async () => {
      const manyPosts: Post[] = Array.from({ length: 30 }, (_, i) => createTestPost({
        id: `post-${i}-id`,
        slug: `post-${i}`,
        title: `Post ${i}`,
        summary: `Summary ${i}`,
        body: `Content ${i}`,
        publishedAt: `2024-01-${String(i + 1).padStart(2, '0')}`,
        readingTime: { words: 200, minutes: 1, text: '1 min read' },
      }));

      const xml = await buildBlogFeed(manyPosts, 'rss', 10);
      const itemCount = (xml.match(/<item>/g) || []).length;

      expect(itemCount).toBe(10);
    });

    it('should include blog-specific metadata', async () => {
      const xml = await buildBlogFeed(testPosts);

      // Apostrophe is escaped in XML element text
      expect(xml).toContain("DCYFR Labs - Blog");
      expect(xml).toContain('/blog');
    });
  });

  describe('buildProjectsFeed', () => {
    const testProjects: Project[] = [
      createTestProject({
        slug: 'project-1',
        title: 'Project 1',
        description: 'Description 1',
        timeline: '2024',
      }),
      createTestProject({
        slug: 'project-2',
        title: 'Project 2',
        description: 'Description 2',
        timeline: '2023',
      }),
    ];

    it('should generate RSS feed by default', async () => {
      const xml = await buildProjectsFeed(testProjects);

      expect(xml).toContain('<rss version="2.0"');
    });

    it('should generate Atom feed when specified', async () => {
      const xml = await buildProjectsFeed(testProjects, 'atom');

      expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    });

    it('should exclude hidden projects', async () => {
      const projectsWithHidden: Project[] = [
        ...testProjects,
        createTestProject({
          slug: 'hidden-project',
          title: 'Hidden Project',
          description: 'Hidden description',
          timeline: '2024',
          hidden: true,
        }),
      ];

      const xml = await buildProjectsFeed(projectsWithHidden);

      expect(xml).not.toContain('Hidden Project');
    });

    it('should limit number of projects', async () => {
      const manyProjects: Project[] = Array.from({ length: 30 }, (_, i) => createTestProject({
        slug: `project-${i}`,
        title: `Project ${i}`,
        description: `Description ${i}`,
        timeline: '2024',
      }));

      const xml = await buildProjectsFeed(manyProjects, 'rss', 5);
      const itemCount = (xml.match(/<item>/g) || []).length;

      expect(itemCount).toBe(5);
    });

    it('should include projects-specific metadata', async () => {
      const xml = await buildProjectsFeed(testProjects);

      // Apostrophe is escaped in XML element text
      expect(xml).toContain("DCYFR Labs - Our Work");
      expect(xml).toContain('/work');
    });
  });

  describe('buildCombinedFeed', () => {
    const testPosts: Post[] = [
      createTestPost({
        id: 'post-1-id',
        slug: 'post-1',
        title: 'Post 1',
        summary: 'Summary 1',
        body: 'Content 1',
        publishedAt: '2024-01-15',
        readingTime: { words: 1000, minutes: 5, text: '5 min read' },
      }),
    ];

    const testProjects: Project[] = [
      createTestProject({
        slug: 'project-1',
        title: 'Project 1',
        description: 'Description 1',
        timeline: '2024',
      }),
    ];

    it('should combine posts and projects', async () => {
      const xml = await buildCombinedFeed(testPosts, testProjects);

      expect(xml).toContain('Post 1');
      expect(xml).toContain('Project 1');
    });

    it('should sort by published date descending', async () => {
      const recentPost = createTestPost({
        id: 'recent-post-id',
        slug: 'recent-post',
        title: 'Recent Post',
        summary: 'Recent summary',
        body: 'Recent content',
        publishedAt: '2024-12-01',
        readingTime: { words: 600, minutes: 3, text: '3 min read' },
      });

      const xml = await buildCombinedFeed([...testPosts, recentPost], testProjects);
      const recentIndex = xml.indexOf('Recent Post');
      const post1Index = xml.indexOf('Post 1');

      expect(recentIndex).toBeLessThan(post1Index);
    });

    it('should exclude drafts and hidden items', async () => {
      const postsWithDraft: Post[] = [
        ...testPosts,
        createTestPost({
          id: 'draft-id',
          slug: 'draft',
          title: 'Draft',
          summary: 'Draft summary',
          body: 'Draft',
          publishedAt: '2024-01-20',
          readingTime: { words: 200, minutes: 1, text: '1 min read' },
          draft: true,
        }),
      ];

      const projectsWithHidden: Project[] = [
        ...testProjects,
        createTestProject({
          slug: 'hidden',
          title: 'Hidden',
          description: 'Hidden',
          timeline: '2024',
          hidden: true,
        }),
      ];

      const xml = await buildCombinedFeed(postsWithDraft, projectsWithHidden);

      expect(xml).not.toContain('Draft');
      expect(xml).not.toContain('Hidden');
    });

    it('should limit combined items', async () => {
      const manyPosts: Post[] = Array.from({ length: 15 }, (_, i) => createTestPost({
        id: `post-${i}-id`,
        slug: `post-${i}`,
        title: `Post ${i}`,
        summary: `Summary ${i}`,
        body: `Content ${i}`,
        publishedAt: `2024-01-${String(i + 1).padStart(2, '0')}`,
        readingTime: { words: 200, minutes: 1, text: '1 min read' },
      }));

      const manyProjects: Project[] = Array.from({ length: 15 }, (_, i) => createTestProject({
        slug: `project-${i}`,
        title: `Project ${i}`,
        description: `Description ${i}`,
        timeline: '2024',
      }));

      const xml = await buildCombinedFeed(manyPosts, manyProjects, 'rss', 10);
      const itemCount = (xml.match(/<item>/g) || []).length;

      expect(itemCount).toBe(10);
    });

    it('should use site-wide metadata', async () => {
      const xml = await buildCombinedFeed(testPosts, testProjects);

      // Apostrophe is escaped in XML element text
      expect(xml).toContain("DCYFR Labs");
      expect(xml).toContain('Portfolio and blog');
      expect(xml).toContain('https://www.dcyfr.ai/feed');
    });
  });
});

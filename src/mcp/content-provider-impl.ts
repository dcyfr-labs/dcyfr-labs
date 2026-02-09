/**
 * Filesystem Content Provider Implementation
 *
 * Reads MDX blog posts and project content from dcyfr-labs filesystem.
<<<<<<< HEAD
 * Implements ContentProvider interface.
 */

=======
 * Implements ContentProvider interface from @dcyfr/ai/mcp.
 */

import type {
  ContentProvider,
  ContentItem,
  ContentSearchOptions,
} from '@dcyfr/ai/mcp';
>>>>>>> 38cdf95ddc6322e511fa69eb9a4bb2fb967a192f
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
<<<<<<< HEAD
 * Content metadata
 */
export interface ContentMetadata {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  category?: string;
  readingTime?: number;
  wordCount?: number;
  published?: boolean;
}

/**
 * Content item
 */
export interface ContentItem {
  filePath: string;
  type: 'blog' | 'project';
  slug: string;
  metadata: ContentMetadata;
  excerpt?: string;
  body?: string;
}

/**
 * Content search options
 */
export interface ContentSearchOptions {
  query?: string;
  tags?: string[];
  category?: string;
  limit?: number;
  includeUnpublished?: boolean;
}

/**
 * Content provider interface
 */
export interface ContentProvider {
  listContent(type: 'blog' | 'project', options?: ContentSearchOptions): Promise<ContentItem[]>;
  getContent(slug: string, type: 'blog' | 'project'): Promise<ContentItem | null>;
  searchContent(query: string, type?: 'blog' | 'project'): Promise<ContentItem[]>;
  getTags(type?: 'blog' | 'project'): Promise<string[]>;
  getContentByTag(tag: string, type?: 'blog' | 'project'): Promise<ContentItem[]>;
  getContentByCategory(category: string, type?: 'blog' | 'project'): Promise<ContentItem[]>;
}

/**
=======
>>>>>>> 38cdf95ddc6322e511fa69eb9a4bb2fb967a192f
 * Filesystem-based ContentProvider for dcyfr-labs
 */
export class FilesystemContentProvider implements ContentProvider {
  private contentDir: string;

  constructor(contentDir?: string) {
    // Default to src/content relative to project root
    this.contentDir = contentDir || path.join(__dirname, '../../content');
  }

  /**
   * List all content items of a given type
   */
  async listContent(
    type: 'blog' | 'project',
    options?: ContentSearchOptions
  ): Promise<ContentItem[]> {
    const typeDir = path.join(this.contentDir, type);

    try {
      const files = await fs.readdir(typeDir);
      const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

      const items: ContentItem[] = [];

      for (const file of mdxFiles) {
        const filePath = path.join(typeDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: body } = matter(content);

        // Skip unpublished unless requested
        if (!options?.includeUnpublished && data.published === false) {
          continue;
        }

        const slug = file.replace(/\.mdx$/, '');

        // Extract excerpt (first 200 chars of content)
        const excerpt = body.slice(0, 200).replace(/\s+/g, ' ').trim() + '...';

        // Calculate reading time (rough estimate: 200 words/min)
        const wordCount = body.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        items.push({
          filePath,
          slug,
          type,
          metadata: {
            title: data.title || slug,
            description: data.description,
            date: data.date,
            tags: data.tags || [],
            category: data.category,
            published: data.published !== false,
            wordCount,
            readingTime,
          },
          excerpt,
          body: options?.query ? body : undefined, // Only include body if searching
        });
      }

      // Filter by query if provided
      let results = items;
      if (options?.query) {
        const query = options.query.toLowerCase();
        results = items.filter(
          (item) =>
            item.metadata.title?.toLowerCase().includes(query) ||
            item.metadata.description?.toLowerCase().includes(query) ||
            item.metadata.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
            item.body?.toLowerCase().includes(query)
        );
      }

      // Filter by tags if provided
      if (options?.tags) {
        results = results.filter((item) =>
          options.tags!.some((tag) => item.metadata.tags?.includes(tag))
        );
      }

      // Filter by category if provided
      if (options?.category) {
        results = results.filter((item) => item.metadata.category === options.category);
      }

      // Limit results
      if (options?.limit) {
        results = results.slice(0, options.limit);
      }

      return results;
    } catch (error) {
      console.error(`Error listing ${type} content:`, error);
      return [];
    }
  }

  /**
   * Get a specific content item by slug
   */
  async getContent(slug: string, type: 'blog' | 'project'): Promise<ContentItem | null> {
    const filePath = path.join(this.contentDir, type, `${slug}.mdx`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: body } = matter(content);

      // Extract excerpt
      const excerpt = body.slice(0, 200).replace(/\s+/g, ' ').trim() + '...';

      // Calculate reading time
      const wordCount = body.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        filePath,
        slug,
        type,
        metadata: {
          title: data.title || slug,
          description: data.description,
          date: data.date,
          tags: data.tags || [],
          category: data.category,
          published: data.published !== false,
          wordCount,
          readingTime,
        },
        excerpt,
        body,
      };
    } catch (error) {
      console.error(`Error reading ${type}/${slug}:`, error);
      return null;
    }
  }

  /**
   * Search content by query string
   */
  async searchContent(query: string, type?: 'blog' | 'project'): Promise<ContentItem[]> {
    const types: ('blog' | 'project')[] = type ? [type] : ['blog', 'project'];
    const results: ContentItem[] = [];

    for (const contentType of types) {
      const items = await this.listContent(contentType, { query });
      results.push(...items);
    }

    return results;
  }

  /**
   * Get all unique tags across content
   */
  async getTags(type?: 'blog' | 'project'): Promise<string[]> {
    const types: ('blog' | 'project')[] = type ? [type] : ['blog', 'project'];
    const tagSet = new Set<string>();

    for (const contentType of types) {
      const items = await this.listContent(contentType);
      items.forEach((item) => {
        item.metadata.tags?.forEach((tag) => tagSet.add(tag));
      });
    }

    return Array.from(tagSet).sort();
  }

  /**
   * Get content by tag
   */
  async getContentByTag(tag: string, type?: 'blog' | 'project'): Promise<ContentItem[]> {
    const types: ('blog' | 'project')[] = type ? [type] : ['blog', 'project'];
    const results: ContentItem[] = [];

    for (const contentType of types) {
      const items = await this.listContent(contentType, { tags: [tag] });
      results.push(...items);
    }

    return results;
  }

  /**
   * Get content by category
   */
  async getContentByCategory(
    category: string,
    type?: 'blog' | 'project'
  ): Promise<ContentItem[]> {
    const types: ('blog' | 'project')[] = type ? [type] : ['blog', 'project'];
    const results: ContentItem[] = [];

    for (const contentType of types) {
      const items = await this.listContent(contentType, { category });
      results.push(...items);
    }

    return results;
  }
}

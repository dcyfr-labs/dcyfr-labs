import { getAllPosts } from "@/lib/blog";

export type PostImage = {
  url: string; // local path (e.g., "/blog/images/post-slug/hero.jpg") or external URL
  alt: string; // required for accessibility
  width?: number; // optional, for next/image optimization
  height?: number; // optional, maintains aspect ratio
  caption?: string; // optional, displayed below image
  credit?: string; // optional, photographer/source attribution
  position?: "top" | "left" | "right" | "background"; // list view placement hint
};

export type PostCategory = "development" | "security" | "career" | "ai" | "AI" | "tutorial" | "Demo" | "Career Development" | "Web Development" | "DevSecOps";

export type Post = {
  id: string; // stable permanent identifier (never changes, independent of slug)
  slug: string; // unique URL segment (active/current slug - can change)
  title: string;
  summary: string;
  publishedAt: string; // ISO string
  updatedAt?: string; // ISO string
  category?: PostCategory; // primary category for filtering
  tags: string[];
  featured?: boolean;
  archived?: boolean; // posts that are no longer updated
  draft?: boolean; // only visible in development
  body: string; // MDX content
  previousSlugs?: string[]; // old slugs that should 301 redirect to current slug
  image?: PostImage; // optional featured image
  series?: {
    name: string; // series name (e.g., "React Hooks Deep Dive")
    order: number; // position in series (1-indexed)
  };
  readingTime: {
    words: number;
    minutes: number;
    text: string;
  };
};

// Retrieve all posts from the file system
export const posts: Post[] = getAllPosts();

export const postsBySlug = Object.fromEntries(posts.map((post) => [post.slug, post])) as Record<string, Post>;

export const postTagCounts = posts.reduce<Record<string, number>>((acc, post) => {
  for (const tag of post.tags) {
    acc[tag] = (acc[tag] ?? 0) + 1;
  }
  return acc;
}, {});

export const allPostTags = Object.freeze(Object.keys(postTagCounts).sort());

export const postCategoryCounts = posts.reduce<Record<string, number>>((acc, post) => {
  if (post.category) {
    acc[post.category] = (acc[post.category] ?? 0) + 1;
  }
  return acc;
}, {});

export const allPostCategories = Object.freeze(Object.keys(postCategoryCounts).sort());

export const featuredPosts = Object.freeze(posts.filter((post) => post.featured));

// Group posts by series
export const postsBySeries = posts.reduce<Record<string, Post[]>>((acc, post) => {
  if (post.series) {
    if (!acc[post.series.name]) {
      acc[post.series.name] = [];
    }
    acc[post.series.name].push(post);
  }
  return acc;
}, {});

// Sort posts within each series by order
Object.keys(postsBySeries).forEach(seriesName => {
  postsBySeries[seriesName].sort((a, b) => {
    const orderA = a.series?.order ?? 0;
    const orderB = b.series?.order ?? 0;
    return orderA - orderB;
  });
});

export const allSeriesNames = Object.freeze(Object.keys(postsBySeries).sort());

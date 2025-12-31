/**
 * Example: Integrating Google Indexing API with Blog Publishing
 *
 * This file demonstrates how to automatically submit blog posts to Google
 * when they're published. Adapt this pattern to your specific workflow.
 */

import { inngest } from "@/inngest/client";
import { SITE_URL } from "@/lib/site-config";

/**
 * Example 1: Manual Publishing Flow
 * Use this when you manually publish blog posts
 */
export async function publishBlogPost(post: {
  slug: string;
  title: string;
  published: boolean;
}) {
  // 1. Publish the post (your existing logic)
  // ... save to database, update files, etc. ...

  // 2. Submit to Google Indexing API (if published)
  if (post.published) {
    const url = `${SITE_URL}/blog/${post.slug}`;

    try {
      await inngest.send({
        name: "google/url.submit",
        data: { url },
      });

      console.log(`✓ Submitted ${url} to Google Indexing API`);
    } catch (error) {
      // Don't fail the publish if indexing fails
      console.error(`Failed to submit to Google:`, error);
    }
  }

  return post;
}

/**
 * Example 2: Unpublishing/Deleting Posts
 * Use this when removing blog posts
 */
export async function unpublishBlogPost(slug: string) {
  // 1. Remove/unpublish the post
  // ... your logic ...

  // 2. Request removal from Google index
  const url = `${SITE_URL}/blog/${slug}`;

  try {
    await inngest.send({
      name: "google/url.delete",
      data: { url },
    });

    console.log(`✓ Requested deletion of ${url} from Google`);
  } catch (error) {
    console.error(`Failed to request deletion from Google:`, error);
  }
}

/**
 * Example 3: Updating Existing Posts
 * Trigger re-indexing when content is updated
 */
export async function updateBlogPost(slug: string) {
  // 1. Update the post
  // ... your logic ...

  // 2. Trigger re-indexing
  const url = `${SITE_URL}/blog/${slug}`;

  try {
    await inngest.send({
      name: "google/url.submit",
      data: {
        url,
        type: "URL_UPDATED", // Explicitly mark as update
      },
    });

    console.log(`✓ Submitted updated ${url} to Google`);
  } catch (error) {
    console.error(`Failed to submit update to Google:`, error);
  }
}

/**
 * Example 4: Batch Publishing
 * When publishing multiple posts at once
 */
export async function batchPublishPosts(posts: Array<{ slug: string }>) {
  // 1. Publish all posts
  // ... your logic ...

  // 2. Submit all URLs to Google
  const urls = posts.map((post) => `${SITE_URL}/blog/${post.slug}`);

  try {
    await inngest.send({
      name: "google/urls.batch-submit",
      data: { urls },
    });

    console.log(`✓ Submitted ${urls.length} URLs to Google Indexing API`);
  } catch (error) {
    console.error(`Failed to batch submit to Google:`, error);
  }
}

/**
 * Example 5: API Route Integration
 * If you have an API route for publishing posts
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, action } = body; // action: 'publish', 'unpublish', 'update'

    const url = `${SITE_URL}/blog/${slug}`;

    // Handle different actions
    switch (action) {
      case "publish":
        // Publish the post...
        await inngest.send({
          name: "google/url.submit",
          data: { url },
        });
        break;

      case "unpublish":
        // Unpublish the post...
        await inngest.send({
          name: "google/url.delete",
          data: { url },
        });
        break;

      case "update":
        // Update the post...
        await inngest.send({
          name: "google/url.submit",
          data: { url, type: "URL_UPDATED" },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Post ${action}ed and submitted to Google`,
    });
  } catch (error) {
    console.error("Error in publish API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Example 6: Scheduled Re-indexing
 * Create an Inngest function to periodically re-submit important posts
 */
export const reindexImportantPosts = inngest.createFunction(
  { id: "reindex-important-posts" },
  { cron: "0 0 * * 0" }, // Weekly on Sunday at midnight
  async ({ step }) => {
    // Get list of important posts (e.g., most viewed, recent, etc.)
    const importantSlugs = [
      "essential-guide",
      "getting-started",
      "latest-release",
    ];

    const urls = importantSlugs.map((slug) => `${SITE_URL}/blog/${slug}`);

    await step.run("reindex-posts", async () => {
      await inngest.send({
        name: "google/urls.batch-submit",
        data: { urls },
      });
    });

    return {
      success: true,
      reindexed: urls.length,
    };
  }
);

/**
 * Example 7: Integration with Content Management
 * Trigger indexing when MDX files are modified
 */
import { watch } from "fs";

export function watchBlogContent(contentDir: string) {
  watch(contentDir, { recursive: true }, async (_eventType, filename) => {
    if (!filename?.endsWith(".mdx")) return;

    // Extract slug from filename
    const slug = filename
      .replace(/\.mdx$/, "")
      .split("/")
      .pop();
    if (!slug) return;

    const url = `${SITE_URL}/blog/${slug}`;

    console.log(`Content changed: ${filename}`);

    // Submit to Google (with debouncing in production)
    try {
      await inngest.send({
        name: "google/url.submit",
        data: { url },
      });

      console.log(`✓ Auto-submitted ${url} to Google`);
    } catch (error) {
      console.error(`Failed to auto-submit:`, error);
    }
  });
}

/**
 * Best Practices:
 *
 * 1. **Don't Block Publishing**
 *    - Always wrap Google API calls in try-catch
 *    - Don't fail the main operation if indexing fails
 *
 * 2. **Respect Rate Limits**
 *    - Use batch functions for multiple URLs
 *    - Space out submissions throughout the day
 *
 * 3. **Only Submit Published Content**
 *    - Don't submit drafts or unpublished posts
 *    - Check `published` flag before submission
 *
 * 4. **Monitor Quota Usage**
 *    - Default: 200 requests/day
 *    - Track your submissions
 *    - Request increase if needed
 *
 * 5. **Handle Errors Gracefully**
 *    - Log errors but don't crash
 *    - Inngest has automatic retries
 *    - Monitor Inngest dashboard for failures
 */

import { inngest } from "./client";
import { google } from "googleapis";
import type { AuthClient } from "google-auth-library";

/**
 * Google Indexing API integration for automatic URL submission
 * 
 * @remarks
 * This function automatically submits blog post URLs to Google's Indexing API
 * when new content is published, ensuring faster indexing and better search visibility.
 * 
 * Prerequisites:
 * 1. Create a Google Cloud Platform project
 * 2. Enable the Indexing API
 * 3. Create a service account with JSON key
 * 4. Add service account as owner in Google Search Console
 * 5. Store service account JSON as GOOGLE_INDEXING_API_KEY env variable
 * 
 * @see https://developers.google.com/search/apis/indexing-api/v3/quickstart
 * @see https://developers.google.com/search/apis/indexing-api/v3/using-api
 */

// Load service account credentials from environment
function getServiceAccountCredentials() {
  const credentialsJson = process.env.GOOGLE_INDEXING_API_KEY;
  
  if (!credentialsJson) {
    console.warn("GOOGLE_INDEXING_API_KEY not configured. Skipping Google indexing.");
    return null;
  }

  try {
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error("Failed to parse GOOGLE_INDEXING_API_KEY:", error);
    return null;
  }
}

// Initialize Google Auth client
async function getAuthClient(): Promise<AuthClient | null> {
  const credentials = getServiceAccountCredentials();
  
  if (!credentials) {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });

  return auth.getClient();
}

/**
 * Submit URL update notification to Google Indexing API
 * 
 * Notifies Google that a URL has been added or updated, prompting
 * Google to crawl and index the page.
 */
export const submitUrlToGoogle = inngest.createFunction(
  { 
    id: "submit-url-to-google",
    retries: 3,
  },
  { event: "google/url.submit" },
  async ({ event, step }) => {
    const { url, type = "URL_UPDATED" } = event.data;

    // Step 1: Validate configuration
    const authClient = await step.run("authenticate", async () => {
      const client = await getAuthClient();
      
      if (!client) {
        console.warn("Google Indexing API not configured. Skipping URL submission.");
        return null;
      }
      
      return client;
    });

    if (!authClient) {
      return { 
        success: false, 
        reason: "api-not-configured",
        url,
      };
    }

    // Step 2: Submit URL to Google Indexing API
    const result = await step.run("submit-url", async () => {
      try {
        const indexing = google.indexing({ version: "v3", auth: authClient as any });

        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url,
            type,
          },
        });

        console.log(`✓ Submitted ${url} to Google Indexing API:`, response.data);

        return {
          success: true,
          url,
          type,
          metadata: response.data,
        };
      } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data || error.message;

        console.error(`✗ Failed to submit ${url} to Google:`, {
          status: statusCode,
          error: errorMessage,
        });

        // Handle specific error cases
        if (statusCode === 429) {
          // Rate limited - will retry
          throw new Error(`Rate limited (429): ${errorMessage}`);
        } else if (statusCode === 403) {
          // Permission denied - likely not added to Search Console
          console.error(
            "Permission denied. Ensure service account is added as owner in Google Search Console."
          );
        }

        return {
          success: false,
          url,
          error: errorMessage,
          statusCode,
        };
      }
    });

    return result;
  }
);

/**
 * Delete URL from Google index
 * 
 * Notifies Google that a URL has been removed and should be
 * deleted from search results.
 */
export const deleteUrlFromGoogle = inngest.createFunction(
  { 
    id: "delete-url-from-google",
    retries: 3,
  },
  { event: "google/url.delete" },
  async ({ event, step }) => {
    const { url } = event.data;

    // Step 1: Validate configuration
    const authClient = await step.run("authenticate", async () => {
      const client = await getAuthClient();
      
      if (!client) {
        console.warn("Google Indexing API not configured. Skipping URL deletion.");
        return null;
      }
      
      return client;
    });

    if (!authClient) {
      return { 
        success: false, 
        reason: "api-not-configured",
        url,
      };
    }

    // Step 2: Submit deletion request to Google
    const result = await step.run("delete-url", async () => {
      try {
        const indexing = google.indexing({ version: "v3", auth: authClient as any });

        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url,
            type: "URL_DELETED",
          },
        });

        console.log(`✓ Submitted deletion for ${url} to Google:`, response.data);

        return {
          success: true,
          url,
          type: "URL_DELETED",
          metadata: response.data,
        };
      } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data || error.message;

        console.error(`✗ Failed to delete ${url} from Google:`, {
          status: statusCode,
          error: errorMessage,
        });

        // Handle specific error cases
        if (statusCode === 429) {
          // Rate limited - will retry
          throw new Error(`Rate limited (429): ${errorMessage}`);
        }

        return {
          success: false,
          url,
          error: errorMessage,
          statusCode,
        };
      }
    });

    return result;
  }
);

/**
 * Batch submit blog posts to Google Indexing API
 * 
 * Processes multiple URLs in sequence, respecting rate limits.
 * Useful for backfilling existing blog posts.
 */
export const batchSubmitBlogPosts = inngest.createFunction(
  { 
    id: "batch-submit-blog-posts",
    retries: 1,
  },
  { event: "google/urls.batch-submit" },
  async ({ event, step }) => {
    const { urls } = event.data;

    if (!Array.isArray(urls) || urls.length === 0) {
      return { 
        success: false, 
        reason: "no-urls-provided",
      };
    }

    console.log(`Starting batch submission of ${urls.length} URLs to Google...`);

    // Process each URL sequentially to respect rate limits
    const results = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      const result = await step.run(`submit-url-${i}`, async () => {
        // Send individual submission event
        await inngest.send({
          name: "google/url.submit",
          data: { url },
        });

        // Add delay to respect rate limits (default quota: 200/day)
        // Space out requests: 24h / 200 = ~432 seconds = ~7 minutes
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }

        return { url, submitted: true };
      });

      results.push(result);
    }

    console.log(`✓ Batch submission completed. Processed ${results.length} URLs.`);

    return {
      success: true,
      totalUrls: urls.length,
      results,
    };
  }
);

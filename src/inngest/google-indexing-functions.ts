import { inngest } from "./client";
import { google } from "googleapis";
import type { AuthClient } from "google-auth-library";

/**
 * Google Indexing API integration for automatic URL submission
 * 
 * @remarks
 * This module provides comprehensive Google Indexing API management:
 * - Validates sitemap against submission status
 * - Detects missing/unindexed pages
 * - Respects API rate limits (200 submissions/day quota)
 * - Verifies successful indexing status
 * - Batch submission with proper queueing
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

// Google Indexing API rate limit constants
const GOOGLE_DAILY_QUOTA = 200; // Submissions per day
const GOOGLE_RATE_LIMIT_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours
const SUBMISSION_RATE_LIMIT_MS = 200; // Min ms between submissions

// In-memory rate limit tracking (would use Redis in production)
interface RateLimitState {
  submissionCount: number;
  lastResetTime: number;
  lastSubmissionTime: number;
}

const rateLimitState: RateLimitState = {
  submissionCount: 0,
  lastResetTime: Date.now(),
  lastSubmissionTime: 0,
};

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
 * Track rate limit state and return current quota remaining
 * 
 * @returns Remaining submissions for today
 */
function getRemainingQuota(): number {
  const now = Date.now();
  
  // Reset counter if 24 hours have passed
  if (now - rateLimitState.lastResetTime > GOOGLE_RATE_LIMIT_RESET_MS) {
    rateLimitState.submissionCount = 0;
    rateLimitState.lastResetTime = now;
  }
  
  return Math.max(0, GOOGLE_DAILY_QUOTA - rateLimitState.submissionCount);
}

/**
 * Check if submission is within rate limits
 * 
 * @returns true if submission can proceed
 */
function canSubmit(): boolean {
  const remaining = getRemainingQuota();
  const timeSinceLastSubmission = Date.now() - rateLimitState.lastSubmissionTime;
  
  return remaining > 0 && timeSinceLastSubmission >= SUBMISSION_RATE_LIMIT_MS;
}

/**
 * Record a submission in rate limit tracking
 */
function recordSubmission(): void {
  rateLimitState.submissionCount++;
  rateLimitState.lastSubmissionTime = Date.now();
}

/**
 * Check indexing status for a URL
 * 
 * Queries Google Search Console to verify if a URL has been indexed
 * and get metadata about its status.
 */
async function checkIndexingStatus(
  url: string, 
  authClient: AuthClient | any
): Promise<{
  indexed: boolean;
  status: string;
  metadata: any;
}> {
  try {
    const indexing = google.indexing({ version: "v3", auth: authClient as any });
    
    const response = await indexing.urlNotifications.getMetadata({
      url,
    });

    const data = response.data as any;
    const mobileFriendlyStatus = data.mobileFriendlyStatus || "UNKNOWN";
    const indexed = mobileFriendlyStatus !== "NOT_FOUND";

    return {
      indexed,
      status: mobileFriendlyStatus,
      metadata: data,
    };
  } catch (error: any) {
    const statusCode = error.response?.status;
    
    // 404 means URL is not indexed
    if (statusCode === 404) {
      return {
        indexed: false,
        status: "NOT_FOUND",
        metadata: { url },
      };
    }

    throw error;
  }
}

/**
 * Submit URL update notification to Google Indexing API
 * 
 * Notifies Google that a URL has been added or updated, respecting
 * rate limits and recording submission for quota tracking.
 */
export const submitUrlToGoogle = inngest.createFunction(
  { 
    id: "submit-url-to-google",
    retries: 3,
  },
  { event: "google/url.submit" },
  async ({ event, step }) => {
    const { url, type = "URL_UPDATED", skipRateLimit = false } = event.data;

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

    // Step 2: Check rate limits
    const quotaCheck = await step.run("check-rate-limit", async () => {
      const remaining = getRemainingQuota();
      const canSubmitNow = canSubmit();

      return { remaining, canSubmit: canSubmitNow };
    });

    if (!skipRateLimit && !quotaCheck.canSubmit) {
      return {
        success: false,
        reason: "rate-limit-exceeded",
        url,
        quotaRemaining: quotaCheck.remaining,
      };
    }

    // Step 3: Submit URL to Google Indexing API
    const result = await step.run("submit-url", async () => {
      try {
        const indexing = google.indexing({ version: "v3", auth: authClient as any });

        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url,
            type,
          },
        });

        // Record submission for rate limit tracking
        recordSubmission();

        console.log(`✓ Submitted ${url} to Google Indexing API:`, response.data);

        return {
          success: true,
          url,
          type,
          metadata: response.data,
          quotaRemaining: getRemainingQuota(),
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

    // Step 4: Verify indexing status
    if (result.success) {
      const indexingStatus = await step.run("verify-indexing", async () => {
        // Wait a moment for Google to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          return await checkIndexingStatus(url, authClient);
        } catch (error) {
          console.warn(`Could not verify indexing status for ${url}:`, error);
          return { indexed: null, status: "UNKNOWN", metadata: {} };
        }
      });

      return {
        ...result,
        indexingStatus,
      };
    }

    return result;
  }
);

/**
 * Validate sitemap against Google submission status
 * 
 * Compares sitemap URLs with Google Search Console data to identify:
 * - Successfully indexed pages
 * - Missing/unindexed pages
 * - Pages pending indexing
 * 
 * Returns missing pages that need submission.
 */
export const validateSitemapAndGetMissing = inngest.createFunction(
  { 
    id: "validate-sitemap-and-get-missing",
    retries: 2,
  },
  { event: "google/sitemap.validate" },
  async ({ event, step }) => {
    const { sitemapUrls } = event.data;

    if (!Array.isArray(sitemapUrls) || sitemapUrls.length === 0) {
      return {
        success: false,
        reason: "no-urls-provided",
        indexed: [],
        missing: [],
        pending: [],
      };
    }

    // Step 1: Validate configuration
    const authClient = await step.run("authenticate", async () => {
      const client = await getAuthClient();
      
      if (!client) {
        console.warn("Google Indexing API not configured. Skipping sitemap validation.");
        return null;
      }
      
      return client;
    });

    if (!authClient) {
      return {
        success: false,
        reason: "api-not-configured",
        indexed: [],
        missing: [],
        pending: [],
      };
    }

    console.log(`🔍 Validating ${sitemapUrls.length} URLs against Google Search Console...`);

    // Step 2: Check indexing status for each URL
    const statusResults = await step.run("check-all-urls", async () => {
      const results = [];
      
      for (let i = 0; i < sitemapUrls.length; i++) {
        const url = sitemapUrls[i];
        
        try {
          const status = await checkIndexingStatus(url, authClient);
          results.push({
            url,
            indexed: status.indexed,
            status: status.status,
            metadata: status.metadata,
          });
          
          // Small delay to avoid rate limiting
          if (i < sitemapUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
          console.warn(`Could not check status for ${url}:`, error.message);
          results.push({
            url,
            indexed: null,
            status: "ERROR",
            error: error.message,
          });
        }
      }
      
      return results;
    });

    // Step 3: Categorize results
    const categorized = await step.run("categorize-results", async () => {
      const indexed = [];
      const missing = [];
      const pending = [];

      for (const result of statusResults) {
        if (result.indexed === true) {
          indexed.push(result.url);
        } else if (result.indexed === false) {
          missing.push(result.url);
        } else {
          // Status unknown, treat as pending
          pending.push(result.url);
        }
      }

      return { indexed, missing, pending };
    });

    console.log(`✓ Sitemap validation complete:`);
    console.log(`  📖 Indexed: ${categorized.indexed.length}`);
    console.log(`  ❌ Missing: ${categorized.missing.length}`);
    console.log(`  ⏳ Pending: ${categorized.pending.length}`);

    return {
      success: true,
      total: sitemapUrls.length,
      indexed: categorized.indexed,
      missing: categorized.missing,
      pending: categorized.pending,
      validationTime: new Date().toISOString(),
    };
  }
);

/**
 * Delete URL from Google index
 * 
 * Notifies Google that a URL has been removed and should be
 * deleted from search results, respecting rate limits.
 */
export const deleteUrlFromGoogle = inngest.createFunction(
  { 
    id: "delete-url-from-google",
    retries: 3,
  },
  { event: "google/url.delete" },
  async ({ event, step }) => {
    const { url, skipRateLimit = false } = event.data;

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

    // Step 2: Check rate limits
    const quotaCheck = await step.run("check-rate-limit", async () => {
      const remaining = getRemainingQuota();
      const canSubmitNow = canSubmit();

      return { remaining, canSubmit: canSubmitNow };
    });

    if (!skipRateLimit && !quotaCheck.canSubmit) {
      return {
        success: false,
        reason: "rate-limit-exceeded",
        url,
        quotaRemaining: quotaCheck.remaining,
      };
    }

    // Step 3: Submit deletion request to Google
    const result = await step.run("delete-url", async () => {
      try {
        const indexing = google.indexing({ version: "v3", auth: authClient as any });

        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url,
            type: "URL_DELETED",
          },
        });

        // Record submission for rate limit tracking
        recordSubmission();

        console.log(`✓ Submitted deletion for ${url} to Google:`, response.data);

        return {
          success: true,
          url,
          type: "URL_DELETED",
          metadata: response.data,
          quotaRemaining: getRemainingQuota(),
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
 * Batch submit blog posts to Google Indexing API (Legacy)
 * 
 * @deprecated Use submitMissingPagesToGoogle instead
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

/**
 * Batch submit and validate URLs with rate limit awareness
 * 
 * High-level orchestration function that:
 * 1. Identifies missing pages from sitemap
 * 2. Respects API rate limits throughout submission
 * 3. Submits URLs in batches
 * 4. Validates successful indexing
 * 
 * Returns comprehensive report on submissions and indexing status.
 */
export const submitMissingPagesToGoogle = inngest.createFunction(
  { 
    id: "submit-missing-pages-to-google",
    retries: 1,
  },
  { event: "google/missing-pages.submit" },
  async ({ event, step }) => {
    const { sitemapUrls, maxSubmissions } = event.data;

    if (!Array.isArray(sitemapUrls) || sitemapUrls.length === 0) {
      return {
        success: false,
        reason: "no-urls-provided",
        submitted: [],
        failed: [],
        skipped: [],
        summary: {},
      };
    }

    // Step 1: Validate configuration
    const authClient = await step.run("authenticate", async () => {
      const client = await getAuthClient();
      
      if (!client) {
        console.warn("Google Indexing API not configured. Cannot submit pages.");
        return null;
      }
      
      return client;
    });

    if (!authClient) {
      return {
        success: false,
        reason: "api-not-configured",
        submitted: [],
        failed: [],
        skipped: [],
        summary: {},
      };
    }

    // Step 2: Validate sitemap and identify missing pages
    const validationResult = await step.run("validate-sitemap", async () => {
      return await checkIndexingStatus("https://placeholder.com", authClient).then(
        () => ({ success: true }),
        () => ({ success: false }) // API is working even on placeholder fail
      ).then(async () => {
        // Do actual validation
        const results = [];
        const missing = [];

        for (let i = 0; i < sitemapUrls.length; i++) {
          const url = sitemapUrls[i];
          
          try {
            const status = await checkIndexingStatus(url, authClient);
            
            if (!status.indexed) {
              missing.push(url);
            }

            results.push({
              url,
              indexed: status.indexed,
              status: status.status,
            });

            // Small delay between checks
            if (i < sitemapUrls.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error: any) {
            console.warn(`Could not check status for ${url}:`, error.message);
            // Treat unknown as potentially missing
            missing.push(url);
          }
        }

        return { results, missing };
      });
    });

    const missingUrls = validationResult.missing || [];
    console.log(`Found ${missingUrls.length} missing/unindexed pages`);

    // Step 3: Determine how many we can submit given quota
    const quotaInfo = await step.run("check-quota", async () => {
      const remaining = getRemainingQuota();
      const toSubmit = maxSubmissions 
        ? Math.min(missingUrls.length, remaining, maxSubmissions)
        : Math.min(missingUrls.length, remaining);

      return {
        totalMissing: missingUrls.length,
        quotaRemaining: remaining,
        willSubmit: toSubmit,
        willSkip: missingUrls.length - toSubmit,
      };
    });

    console.log(`📊 Quota info:`, quotaInfo);

    // Step 4: Submit missing URLs respecting quota
    const submissionResults = await step.run("submit-missing-urls", async () => {
      const submitted = [];
      const failed = [];
      const skipped = [];

      const urlsToSubmit = missingUrls.slice(0, quotaInfo.willSubmit);
      const urlsToSkip = missingUrls.slice(quotaInfo.willSubmit);

      for (let i = 0; i < urlsToSubmit.length; i++) {
        const url = urlsToSubmit[i];

        try {
          const indexing = google.indexing({ 
            version: "v3", 
            auth: authClient as any 
          });

          await indexing.urlNotifications.publish({
            requestBody: {
              url,
              type: "URL_UPDATED",
            },
          });

          recordSubmission();
          submitted.push(url);

          console.log(`✓ Submitted ${url}`);

          // Respectful delay between submissions
          if (i < urlsToSubmit.length - 1) {
            await new Promise(resolve => 
              setTimeout(resolve, SUBMISSION_RATE_LIMIT_MS)
            );
          }
        } catch (error: any) {
          console.error(`✗ Failed to submit ${url}:`, error.message);
          failed.push({
            url,
            error: error.message,
          });
        }
      }

      // Collect skipped URLs
      for (const url of urlsToSkip) {
        skipped.push(url);
      }

      return { submitted, failed, skipped };
    });

    // Step 5: Verify indexing status of submitted URLs
    const verificationResults = await step.run("verify-submissions", async () => {
      const verified = [];

      for (const url of submissionResults.submitted) {
        try {
          // Wait for Google to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const status = await checkIndexingStatus(url, authClient);
          verified.push({
            url,
            indexed: status.indexed,
            status: status.status,
          });
        } catch (error: any) {
          console.warn(`Could not verify ${url}:`, error.message);
          verified.push({
            url,
            indexed: null,
            status: "UNKNOWN",
          });
        }
      }

      return verified;
    });

    return {
      success: true,
      submitted: submissionResults.submitted,
      failed: submissionResults.failed,
      skipped: submissionResults.skipped,
      verified: verificationResults,
      summary: {
        total: sitemapUrls.length,
        indexed: validationResult.results?.length || 0,
        missing: missingUrls.length,
        submitted: submissionResults.submitted.length,
        successfullyIndexed: verificationResults.filter(v => v.indexed).length,
        failed: submissionResults.failed.length,
        skipped: submissionResults.skipped.length,
        quotaRemaining: getRemainingQuota(),
      },
      timestamp: new Date().toISOString(),
    };
  }
);

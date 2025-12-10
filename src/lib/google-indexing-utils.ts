/**
 * Google Indexing API Utilities
 * 
 * Standalone utility functions for Google Search Console integration.
 * Can be used outside of Inngest context for scripts, API routes, etc.
 * 
 * @see src/inngest/google-indexing-functions.ts for Inngest-based functions
 */

import { google } from "googleapis";
import type { AuthClient } from "google-auth-library";

// Rate limit constants (same as inngest module)
export const GOOGLE_DAILY_QUOTA = 200;
export const GOOGLE_RATE_LIMIT_RESET_MS = 24 * 60 * 60 * 1000;
export const SUBMISSION_RATE_LIMIT_MS = 200;

/**
 * Get Google service account credentials from environment
 */
export function getServiceAccountCredentials(): Record<string, any> | null {
  const credentialsJson = process.env.GOOGLE_INDEXING_API_KEY;
  
  if (!credentialsJson) {
    console.warn("GOOGLE_INDEXING_API_KEY not configured");
    return null;
  }

  try {
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error("Failed to parse GOOGLE_INDEXING_API_KEY:", error);
    return null;
  }
}

/**
 * Initialize Google Auth client
 */
export async function getAuthClient(): Promise<AuthClient | null> {
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
 * Result of indexing status check
 */
export interface IndexingStatusResult {
  indexed: boolean;
  status: string;
  metadata: any;
}

/**
 * Check indexing status for a URL
 * 
 * @param url - The URL to check
 * @param authClient - Authenticated Google client
 * @returns Indexing status information
 */
export async function checkIndexingStatus(
  url: string,
  authClient: AuthClient
): Promise<IndexingStatusResult> {
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
 * Submit a URL to Google Indexing API
 * 
 * @param url - The URL to submit
 * @param authClient - Authenticated Google client
 * @param type - Notification type (default: URL_UPDATED)
 * @returns Submission result
 */
export async function submitUrlToGoogle(
  url: string,
  authClient: AuthClient,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{ success: boolean; metadata?: any; error?: string }> {
  try {
    const indexing = google.indexing({ version: "v3", auth: authClient as any });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });

    console.log(`✓ Submitted ${url} to Google Indexing API`);

    return {
      success: true,
      metadata: response.data,
    };
  } catch (error: any) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    console.error(`✗ Failed to submit ${url}:`, {
      status: statusCode,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate sitemap URLs and find missing/unindexed pages
 * 
 * @param sitemapUrls - Array of URLs from sitemap
 * @param authClient - Authenticated Google client
 * @returns Categorized URLs by indexing status
 */
export async function validateSitemapUrls(
  sitemapUrls: string[],
  authClient: AuthClient
): Promise<{
  indexed: string[];
  missing: string[];
  pending: string[];
  errors: Array<{ url: string; error: string }>;
}> {
  const indexed = [];
  const missing = [];
  const pending = [];
  const errors = [];

  console.log(`🔍 Validating ${sitemapUrls.length} URLs...`);

  for (let i = 0; i < sitemapUrls.length; i++) {
    const url = sitemapUrls[i];

    try {
      const status = await checkIndexingStatus(url, authClient);

      if (status.indexed === true) {
        indexed.push(url);
      } else if (status.indexed === false) {
        missing.push(url);
      } else {
        pending.push(url);
      }

      // Small delay between checks
      if (i < sitemapUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      console.warn(`Could not check ${url}:`, error.message);
      errors.push({
        url,
        error: error.message,
      });
    }
  }

  return {
    indexed,
    missing,
    pending,
    errors,
  };
}

/**
 * Submit missing pages to Google with rate limit awareness
 * 
 * @param missingUrls - URLs to submit
 * @param authClient - Authenticated Google client
 * @param maxSubmissions - Maximum submissions to process (respects daily quota)
 * @returns Submission results
 */
export async function submitMissingPagesToGoogle(
  missingUrls: string[],
  authClient: AuthClient,
  maxSubmissions?: number
): Promise<{
  submitted: string[];
  failed: Array<{ url: string; error: string }>;
  skipped: string[];
  quotaUsed: number;
  summary: {
    total: number;
    submitted: number;
    failed: number;
    skipped: number;
  };
}> {
  const submitted = [];
  const failed = [];
  const skipped = [];
  let quotaUsed = 0;

  // Determine how many to submit
  const toSubmit = maxSubmissions 
    ? Math.min(missingUrls.length, maxSubmissions)
    : missingUrls.length;

  const urlsToSubmit = missingUrls.slice(0, toSubmit);
  const urlsToSkip = missingUrls.slice(toSubmit);

  console.log(`📤 Submitting ${urlsToSubmit.length} URL(s) to Google...`);

  for (let i = 0; i < urlsToSubmit.length; i++) {
    const url = urlsToSubmit[i];

    try {
      const result = await submitUrlToGoogle(url, authClient, "URL_UPDATED");

      if (result.success) {
        submitted.push(url);
        quotaUsed++;
      } else {
        failed.push({
          url,
          error: result.error || "Unknown error",
        });
      }

      // Respectful delay between submissions
      if (i < urlsToSubmit.length - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, SUBMISSION_RATE_LIMIT_MS)
        );
      }
    } catch (error: any) {
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

  return {
    submitted,
    failed,
    skipped,
    quotaUsed,
    summary: {
      total: missingUrls.length,
      submitted: submitted.length,
      failed: failed.length,
      skipped: skipped.length,
    },
  };
}

/**
 * Validate and submit missing pages end-to-end
 * 
 * Complete workflow: validate sitemap → identify missing → submit
 * 
 * @param sitemapUrls - All URLs from sitemap
 * @param maxSubmissions - Maximum to submit in this run
 * @returns Complete report of validation and submission
 */
export async function validateAndSubmitMissingPages(
  sitemapUrls: string[],
  maxSubmissions?: number
): Promise<{
  success: boolean;
  validation: {
    indexed: string[];
    missing: string[];
    pending: string[];
  };
  submission: {
    submitted: string[];
    failed: Array<{ url: string; error: string }>;
    skipped: string[];
  };
  summary: {
    total: number;
    indexed: number;
    missing: number;
    submitted: number;
    failed: number;
    skipped: number;
  };
  error?: string;
}> {
  // Get auth client
  const authClient = await getAuthClient();

  if (!authClient) {
    return {
      success: false,
      error: "Google Indexing API not configured",
      validation: { indexed: [], missing: [], pending: [] },
      submission: { submitted: [], failed: [], skipped: [] },
      summary: {
        total: 0,
        indexed: 0,
        missing: 0,
        submitted: 0,
        failed: 0,
        skipped: 0,
      },
    };
  }

  try {
    // Step 1: Validate sitemap
    console.log("\n📋 Step 1: Validating sitemap...");
    const validation = await validateSitemapUrls(sitemapUrls, authClient);

    console.log(`✓ Validation complete:`);
    console.log(`  📖 Indexed: ${validation.indexed.length}`);
    console.log(`  ❌ Missing: ${validation.missing.length}`);
    console.log(`  ⏳ Pending: ${validation.pending.length}`);

    // Step 2: Submit missing pages
    console.log("\n📤 Step 2: Submitting missing pages...");
    const submission = await submitMissingPagesToGoogle(
      validation.missing,
      authClient,
      maxSubmissions
    );

    console.log(`✓ Submission complete:`);
    console.log(`  ✅ Submitted: ${submission.submitted.length}`);
    console.log(`  ❌ Failed: ${submission.failed.length}`);
    console.log(`  ⏸ Skipped: ${submission.skipped.length}`);

    return {
      success: true,
      validation: {
        indexed: validation.indexed,
        missing: validation.missing,
        pending: validation.pending,
      },
      submission: {
        submitted: submission.submitted,
        failed: submission.failed,
        skipped: submission.skipped,
      },
      summary: {
        total: sitemapUrls.length,
        indexed: validation.indexed.length,
        missing: validation.missing.length,
        submitted: submission.submitted.length,
        failed: submission.failed.length,
        skipped: submission.skipped.length,
      },
    };
  } catch (error: any) {
    console.error("Error during validation/submission:", error);
    return {
      success: false,
      error: error.message,
      validation: { indexed: [], missing: [], pending: [] },
      submission: { submitted: [], failed: [], skipped: [] },
      summary: {
        total: sitemapUrls.length,
        indexed: 0,
        missing: 0,
        submitted: 0,
        failed: 0,
        skipped: 0,
      },
    };
  }
}

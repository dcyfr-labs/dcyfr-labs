import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { blockExternalAccess } from "@/lib/api-security";
import { NextRequest, NextResponse } from "next/server";
import { helloWorld } from "@/inngest/functions";
import { contactFormSubmitted } from "@/inngest/contact-functions";
import { 
  refreshGitHubData, 
  manualRefreshGitHubData,
  processGitHubCommit,
} from "@/inngest/github-functions";
import {
  trackPostView,
  handleMilestone,
  calculateTrending,
  generateAnalyticsSummary,
  dailyAnalyticsSummary,
} from "@/inngest/blog-functions";
import {
  securityAdvisoryMonitor,
  securityAdvisoryHandler,
  dailySecurityTest,
} from "@/inngest/security-functions";
import {
  submitUrlToGoogle,
  deleteUrlFromGoogle,
  batchSubmitBlogPosts,
  validateSitemapAndGetMissing,
  submitMissingPagesToGoogle,
} from "@/inngest/google-indexing-functions";
import {
  refreshActivityFeed,
  invalidateActivityFeed,
} from "@/inngest/activity-cache-functions";
import {
  refreshCredlyCache,
  clearCredlyCache,
} from "@/inngest/credly-cache-functions";
import { inngestErrorHandler } from "@/inngest/error-handler";

/**
 * Inngest API endpoint for Next.js App Router
 *
 * @remarks
 * This route handler serves all Inngest functions and provides:
 * - Development UI at /api/inngest (local development only)
 * - Webhook endpoint for Inngest Cloud to trigger functions
 * - Function registration and discovery
 *
 * In development:
 * - Visit http://localhost:3000/api/inngest to see the Inngest Dev Server UI
 * - Test functions directly from the UI
 * - View function logs and step-by-step execution
 *
 * In production:
 * - Inngest Cloud uses this endpoint as a webhook
 * - Configure the webhook URL in your Inngest dashboard
 * - Example: https://www.dcyfr.ai/api/inngest
 *
 * Security:
 * - Inngest SDK's serve() function validates request signatures automatically
 * - Additional defense-in-depth: explicit header presence checks
 * - Signature validation uses INNGEST_SIGNING_KEY from environment
 *
 * @see https://www.inngest.com/docs/sdk/serve
 * @see https://www.inngest.com/docs/deploy/nextjs
 * @see https://www.inngest.com/docs/security/signing-keys
 */

/**
 * Validates Inngest webhook requests
 * 
 * @remarks
 * CRITICAL: The Inngest serve() function handles cryptographic signature validation.
 * This function should NOT reject requests based on headers - that causes false 401s.
 * 
 * Real-world behavior:
 * - Inngest Cloud may send requests without visible signature headers in proxied requests
 * - The serve() function uses INNGEST_SIGNING_KEY env var for validation (crypto happens inside)
 * - Pre-emptive header checks here block legitimate webhook deliveries → 2,936+ failed requests
 * 
 * Solution: Trust serve() to do its job. Only allow it to run.
 * If signature validation fails, serve() will return 401 with proper error messages.
 * 
 * @see https://www.inngest.com/docs/sdk/serve
 * @see https://github.com/inngest/inngest-js/blob/main/packages/sdk-js/src/components/Inngest.ts#L462
 */
function validateInngestHeaders(request: NextRequest): boolean {
  // In development, allow all requests (Inngest Dev Server)
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // In production: Allow the request through to serve()
  // serve() will validate the signature cryptographically using INNGEST_SIGNING_KEY
  // Do NOT reject based on header presence - that causes false positives
  
  // Only basic sanity check: ensure it's an HTTP method we support
  const method = request.method;
  if (!["GET", "POST", "PUT"].includes(method)) {
    console.warn(`[Inngest] Unsupported method: ${method}`);
    return false;
  }

  return true;
}

// Create the base Inngest handlers
const { GET: inngestGET, POST: inngestPOST, PUT: inngestPUT } = serve({
  client: inngest,
  functions: [
    // Demo function
    helloWorld,

    // Contact form processing
    contactFormSubmitted,

    // GitHub data refresh
    refreshGitHubData,           // Scheduled: every hour
    manualRefreshGitHubData,    // Event-driven: manual refresh
    processGitHubCommit,        // Event-driven: webhook → commit pushed

    // Blog analytics
    trackPostView,               // Event-driven: on post view
    handleMilestone,             // Event-driven: on milestone reached
    calculateTrending,           // Scheduled: hourly
    generateAnalyticsSummary,    // Event-driven: on demand
    dailyAnalyticsSummary,       // Scheduled: daily at midnight UTC

    // Security monitoring (CVE-2025-55182 response)
    securityAdvisoryMonitor,     // Scheduled: hourly GHSA polling
    securityAdvisoryHandler,     // Event-driven: process detections
    dailySecurityTest,           // Scheduled: daily at 6PM MT (Dec 12-20)

    // Google Indexing API
    submitUrlToGoogle,               // Event-driven: submit URL for indexing
    deleteUrlFromGoogle,             // Event-driven: remove URL from index
    batchSubmitBlogPosts,            // Event-driven: batch process multiple URLs (legacy)
    validateSitemapAndGetMissing,    // Event-driven: validate sitemap against GSC
    submitMissingPagesToGoogle,      // Event-driven: end-to-end: validate→submit→verify

    // Activity feed caching
    refreshActivityFeed,             // Scheduled: every 5 minutes
    invalidateActivityFeed,          // Event-driven: on content changes

    // Credly badge caching
    refreshCredlyCache,              // Scheduled: daily at 6 AM UTC
    clearCredlyCache,                // Event-driven: manual cache clear

    // Error handling (centralized monitoring and alerting)
    inngestErrorHandler,             // Event-driven: triggered on function failures
  ],
});

// Export handlers - trust serve() to handle signature validation
export const GET = async (request: NextRequest, context: unknown) => {
  if (!validateInngestHeaders(request)) {
    console.error(
      `[Inngest] GET rejected by header validation. Method: ${request.method}`
    );
    return NextResponse.json(
      { error: "Unsupported method" },
      { status: 405 }
    );
  }
  
  try {
    const response = await inngestGET(request, context);
    
    // Log signature validation failures from serve()
    if (response.status === 401) {
      console.warn(
        "[Inngest] GET returned 401 from serve() - signature validation failed"
      );
    }
    
    return response;
  } catch (error) {
    console.error("[Inngest] GET handler error:", error);
    throw error;
  }
};

export const POST = async (request: NextRequest, context: unknown) => {
  if (!validateInngestHeaders(request)) {
    console.error(
      `[Inngest] POST rejected by header validation. Method: ${request.method}`
    );
    return NextResponse.json(
      { error: "Unsupported method" },
      { status: 405 }
    );
  }
  
  try {
    const response = await inngestPOST(request, context);
    
    // Log signature validation failures from serve()
    if (response.status === 401) {
      console.warn(
        "[Inngest] POST returned 401 from serve() - signature validation failed"
      );
    }
    
    return response;
  } catch (error) {
    console.error("[Inngest] POST handler error:", error);
    throw error;
  }
};

export const PUT = async (request: NextRequest, context: unknown) => {
  if (!validateInngestHeaders(request)) {
    console.error(
      `[Inngest] PUT rejected by header validation. Method: ${request.method}`
    );
    return NextResponse.json(
      { error: "Unsupported method" },
      { status: 405 }
    );
  }
  
  try {
    const response = await inngestPUT(request, context);
    
    // Log signature validation failures from serve()
    if (response.status === 401) {
      console.warn(
        "[Inngest] PUT returned 401 from serve() - signature validation failed"
      );
    }
    
    return response;
  } catch (error) {
    console.error("[Inngest] PUT handler error:", error);
    throw error;
  }
};

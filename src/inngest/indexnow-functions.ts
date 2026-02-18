import { inngest } from './client';

/**
 * IndexNow API integration for real-time search engine indexing
 * 
 * @remarks
 * This module provides IndexNow protocol submissions to search engines:
 * - Validates and normalizes submission URLs
 * - Submits to IndexNow API endpoints (Bing, Yandex, Seznam.cz, Naver)
 * - Handles rate limiting and retries with exponential backoff  
 * - Tracks submission success/failure rates
 * - Validates ownership via API key file serving
 * 
 * Prerequisites:
 * 1. IndexNow API key (UUID v4 format) configured in environment
 * 2. Key file served at /{api-key}.txt endpoint
 * 3. URLs must be from the same domain as the API key location
 * 
 * @see https://www.indexnow.org/documentation
 * @see https://blogs.bing.com/webmaster/october-2021/IndexNow-instantly-index-your-web-content-in-search-engines
 */

// IndexNow API endpoint URLs for different search engines
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow', // Primary endpoint
  'https://www.bing.com/indexnow',     // Bing specific
  // 'https://yandex.com/indexnow',       // Yandex (if needed)
  // 'https://search.seznam.cz/indexnow', // Seznam.cz (if needed)
] as const;

// Rate limiting and retry configuration
const INDEXNOW_CONFIG = {
  MAX_URLS_PER_REQUEST: 10000,        // IndexNow protocol limit
  MAX_RETRIES: 3,                     // Max retry attempts
  INITIAL_RETRY_DELAY: 1000,          // Initial retry delay (ms)
  MAX_RETRY_DELAY: 10000,             // Maximum retry delay (ms)
  REQUEST_TIMEOUT: 30000,             // Request timeout (ms)
  BATCH_SIZE: 100,                    // URLs per batch for large submissions
} as const;

/**
 * IndexNow submission data structure
 */
interface IndexNowSubmissionData {
  urls: string[];
  key: string;
  keyLocation: string;
  requestId: string;
  requestedAt: number;
  userAgent?: string;
  ip?: string;
}

/**
 * IndexNow API request payload
 */
interface IndexNowApiPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * IndexNow API response
 */
interface IndexNowApiResponse {
  success: boolean;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  error?: string;
}

/**
 * Process IndexNow submission request
 * 
 * Triggered by: indexnow/submission.requested
 * 
 * This function handles the actual submission to IndexNow API endpoints:
 * 1. Validates and normalizes URLs
 * 2. Batches URLs if needed (max 10,000 per request)  
 * 3. Submits to IndexNow endpoints with retry logic
 * 4. Tracks success/failure metrics
 * 5. Logs detailed submission results
 */
export const processIndexNowSubmission = inngest.createFunction(
  {
    id: 'process-indexnow-submission',
    retries: 3, // Retry on transient failures
  },
  { event: 'indexnow/submission.requested' },
  async ({ event, step }) => {
    const submissionData = event.data as IndexNowSubmissionData;
    const { urls, key, keyLocation, requestId } = submissionData;

    console.log(`[IndexNow] Processing submission ${requestId} with ${urls.length} URLs`);

    // Step 1: Validate submission data
    const validationResult = await step.run('validate-submission', async () => {
      console.log(`[IndexNow] Validating submission data for ${requestId}`);

      // Validate API key format (UUID v4)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(key)) {
        throw new Error(`Invalid API key format: ${key}`);
      }

      // Validate key location URL
      try {
        new URL(keyLocation);
      } catch (error) {
        throw new Error(`Invalid key location URL: ${keyLocation}`);
      }

      // Validate and normalize URLs
      const validUrls: string[] = [];
      const invalidUrls: string[] = [];
      
      for (const url of urls) {
        try {
          const normalizedUrl = new URL(url);
          // Normalize to remove fragments and unnecessary parameters
          normalizedUrl.hash = '';
          validUrls.push(normalizedUrl.toString());
        } catch (error) {
          invalidUrls.push(url);
        }
      }

      if (invalidUrls.length > 0) {
        console.warn(`[IndexNow] Found ${invalidUrls.length} invalid URLs:`, invalidUrls);
      }

      if (validUrls.length === 0) {
        throw new Error('No valid URLs to submit');
      }

      console.log(`[IndexNow] Validated ${validUrls.length} URLs (${invalidUrls.length} invalid)`);

      return {
        validUrls,
        invalidUrls,
        totalValid: validUrls.length,
        totalInvalid: invalidUrls.length,
      };
    });

    // Skip if no valid URLs
    if (validationResult.totalValid === 0) {
      return {
        success: false,
        error: 'No valid URLs to submit',
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 2: Prepare IndexNow payloads (batch if needed)
    const payloads = await step.run('prepare-payloads', async () => {
      console.log(`[IndexNow] Preparing payloads for ${validationResult.totalValid} URLs`);

      const { validUrls } = validationResult;
      const payloads: IndexNowApiPayload[] = [];
      
      // Extract host from the first URL (all URLs should be from same domain)
      const firstUrl = new URL(validUrls[0]);
      const host = firstUrl.hostname;

      // Batch URLs if we exceed the limit
      if (validUrls.length <= INDEXNOW_CONFIG.MAX_URLS_PER_REQUEST) {
        // Single payload
        payloads.push({
          host,
          key,
          keyLocation,
          urlList: validUrls,
        });
      } else {
        // Multiple payloads (batch)
        const batchSize = INDEXNOW_CONFIG.BATCH_SIZE;
        for (let i = 0; i < validUrls.length; i += batchSize) {
          const batchUrls = validUrls.slice(i, i + batchSize);
          payloads.push({
            host,
            key,
            keyLocation,
            urlList: batchUrls,
          });
        }
      }

      console.log(`[IndexNow] Created ${payloads.length} payloads (max ${INDEXNOW_CONFIG.MAX_URLS_PER_REQUEST} URLs each)`);

      return { payloads, host };
    });

    // Step 3: Submit to IndexNow endpoints
    const submissionResults = await step.run('submit-to-indexnow', async () => {
      console.log(`[IndexNow] Submitting ${payloads.payloads.length} payloads to ${INDEXNOW_ENDPOINTS.length} endpoints`);

      const results: IndexNowApiResponse[] = [];

      for (const payload of payloads.payloads) {
        for (const endpoint of INDEXNOW_ENDPOINTS) {
          const startTime = Date.now();
          
          try {
            console.log(`[IndexNow] Submitting ${payload.urlList.length} URLs to ${endpoint}`);

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'User-Agent': 'DCYFR-Labs IndexNow Client/1.0',
              },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(INDEXNOW_CONFIG.REQUEST_TIMEOUT),
            });

            const responseTime = Date.now() - startTime;

            if (response.ok) {
              console.log(`[IndexNow] ✅ Success: ${endpoint} (${response.status}) in ${responseTime}ms`);
              results.push({
                success: true,
                endpoint,
                statusCode: response.status,
                responseTime,
              });
            } else {
              const errorText = await response.text().catch(() => 'Unknown error');
              console.warn(`[IndexNow] ⚠️ HTTP ${response.status}: ${endpoint} - ${errorText}`);
              results.push({
                success: false,
                endpoint,
                statusCode: response.status,
                responseTime,
                error: `HTTP ${response.status}: ${errorText}`,
              });
            }

          } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            console.error(`[IndexNow] ❌ Error: ${endpoint} - ${errorMessage}`);
            results.push({
              success: false,
              endpoint,
              statusCode: 0,
              responseTime,
              error: errorMessage,
            });
          }

          // Rate limiting: small delay between requests
          if (INDEXNOW_ENDPOINTS.indexOf(endpoint) < INDEXNOW_ENDPOINTS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // Delay between batches
        if (payloads.payloads.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return results;
    });

    // Step 4: Analyze results and return summary
    const summary = await step.run('analyze-results', async () => {
      const successful = submissionResults.filter(r => r.success);
      const failed = submissionResults.filter(r => !r.success);
      
      const totalUrls = validationResult.totalValid;
      const successRate = successful.length / submissionResults.length;
      const avgResponseTime = submissionResults.reduce((sum, r) => sum + r.responseTime, 0) / submissionResults.length;

      console.log(`[IndexNow] Submission ${requestId} complete:`);
      console.log(`  - URLs submitted: ${totalUrls}`);
      console.log(`  - Success rate: ${(successRate * 100).toFixed(1)}% (${successful.length}/${submissionResults.length})`);
      console.log(`  - Avg response time: ${avgResponseTime.toFixed(0)}ms`);

      if (failed.length > 0) {
        console.warn(`[IndexNow] Failed submissions:`, failed.map(f => `${f.endpoint}: ${f.error}`));
      }

      return {
        success: successful.length > 0, // At least one endpoint succeeded
        requestId,
        totalUrls,
        payloads: payloads.payloads.length,
        submissions: {
          total: submissionResults.length,
          successful: successful.length,
          failed: failed.length,
          successRate,
        },
        performance: {
          avgResponseTime,
          totalProcessingTime: Date.now() - submissionData.requestedAt,
        },
        details: {
          validationResult,
          submissionResults,
        },
        timestamp: new Date().toISOString(),
      };
    });

    return summary;
  }
);

/**
 * Scheduled function to verify IndexNow key file accessibility
 * 
 * Runs every 12 hours to ensure the API key file is properly accessible
 * and the IndexNow setup is working correctly.
 */
export const verifyIndexNowKeyFile = inngest.createFunction(
  {
    id: 'verify-indexnow-key-file',
    retries: 2,
  },
  { cron: '0 */12 * * *' }, // Every 12 hours
  async ({ step }) => {
    const apiKey = process.env.INDEXNOW_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!apiKey || !siteUrl) {
      console.warn('[IndexNow] Key file verification skipped - missing configuration');
      return {
        success: false,
        error: 'Missing INDEXNOW_API_KEY or NEXT_PUBLIC_SITE_URL',
        timestamp: new Date().toISOString(),
      };
    }

    const keyFileUrl = `${siteUrl}/${apiKey}.txt`;

    return await step.run('verify-key-file', async () => {
      console.log(`[IndexNow] Verifying key file accessibility: ${keyFileUrl}`);

      try {
        const response = await fetch(keyFileUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'DCYFR-Labs IndexNow Verification/1.0',
          },
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();
        if (content.trim() !== apiKey) {
          throw new Error(`Key file content mismatch. Expected: ${apiKey}, Got: ${content.trim()}`);
        }

        console.log('[IndexNow] ✅ Key file verification successful');

        return {
          success: true,
          keyFileUrl,
          statusCode: response.status,
          contentValid: true,
          timestamp: new Date().toISOString(),
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[IndexNow] ❌ Key file verification failed: ${errorMessage}`);

        return {
          success: false,
          keyFileUrl,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };
      }
    });
  }
);
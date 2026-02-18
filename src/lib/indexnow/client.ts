import { SITE_URL } from '@/lib/site-config';

export type IndexNowSubmissionOptions = {
  endpoint?: string;
  signal?: AbortSignal;
  throwOnError?: boolean;
};

export type IndexNowSubmitResult = {
  success: boolean;
  status: number;
  queued: number;
  message?: string;
  error?: string;
};

const INDEXNOW_SUBMIT_ENDPOINT = '/api/indexnow/submit';

function normalizeUrls(urls: string | string[]): string[] {
  const input = Array.isArray(urls) ? urls : [urls];
  return Array.from(new Set(input.map((url) => url.trim()).filter(Boolean)));
}

function getSubmitEndpoint(explicitEndpoint?: string): string {
  if (explicitEndpoint) {
    return explicitEndpoint;
  }

  if (typeof window !== 'undefined') {
    return INDEXNOW_SUBMIT_ENDPOINT;
  }

  return `${SITE_URL.replace(/\/$/, '')}${INDEXNOW_SUBMIT_ENDPOINT}`;
}

/**
 * Build canonical blog post URL for IndexNow submission.
 */
export function getBlogPostUrl(slug: string): string {
  return `${SITE_URL.replace(/\/$/, '')}/blog/${slug}`;
}

/**
 * Build canonical project URL for IndexNow submission.
 */
export function getProjectUrl(slug: string): string {
  return `${SITE_URL.replace(/\/$/, '')}/work/${slug}`;
}

/**
 * Submit one or more URLs to the IndexNow submission API and return result details.
 */
export async function submitToIndexNowWithResult(
  urls: string | string[],
  options: IndexNowSubmissionOptions = {}
): Promise<IndexNowSubmitResult> {
  const normalizedUrls = normalizeUrls(urls);

  if (normalizedUrls.length === 0) {
    return {
      success: false,
      status: 400,
      queued: 0,
      error: 'No valid URLs provided',
    };
  }

  const endpoint = getSubmitEndpoint(options.endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: normalizedUrls }),
      signal: options.signal,
    });

    const payload = await response.json().catch(() => ({} as Record<string, unknown>));
    const queued =
      typeof payload === 'object' && payload !== null &&
      typeof (payload as { queued?: { urls?: number } }).queued?.urls === 'number'
        ? (payload as { queued: { urls: number } }).queued.urls
        : normalizedUrls.length;

    if (!response.ok) {
      const errorMessage =
        typeof payload === 'object' && payload !== null &&
        typeof (payload as { error?: string }).error === 'string'
          ? (payload as { error: string }).error
          : `IndexNow submission failed with status ${response.status}`;

      const failure: IndexNowSubmitResult = {
        success: false,
        status: response.status,
        queued: 0,
        error: errorMessage,
      };

      if (options.throwOnError) {
        throw new Error(errorMessage);
      }

      return failure;
    }

    return {
      success: true,
      status: response.status,
      queued,
      message:
        typeof payload === 'object' && payload !== null &&
        typeof (payload as { message?: string }).message === 'string'
          ? (payload as { message: string }).message
          : 'URLs queued for IndexNow submission',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (options.throwOnError) {
      throw error;
    }

    return {
      success: false,
      status: 500,
      queued: 0,
      error: message,
    };
  }
}

/**
 * Fire-and-forget submission helper for content publishing workflows.
 * Logs failures but does not throw by default.
 */
export async function submitToIndexNow(
  urls: string | string[],
  options: IndexNowSubmissionOptions = {}
): Promise<void> {
  const result = await submitToIndexNowWithResult(urls, options);

  if (!result.success) {
    console.warn('[IndexNow] Submission skipped/failed:', {
      status: result.status,
      error: result.error,
      queued: result.queued,
    });
  }
}

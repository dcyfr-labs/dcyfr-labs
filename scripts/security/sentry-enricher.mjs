#!/usr/bin/env node

/**
 * Sentry Enrichment Script
 * Queries Sentry API to enrich test failure reports with production error data
 */

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG || "dcyfr-labs";
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || "dcyfr-labs";
const SENTRY_API_BASE = "https://sentry.io/api/0";

if (!SENTRY_AUTH_TOKEN) {
  console.warn("⚠️  SENTRY_AUTH_TOKEN not set. Sentry enrichment will be skipped.");
}

/**
 * Query Sentry for issues matching a search query
 * @param {Object} options - Query options
 * @param {string} options.query - Sentry search query
 * @param {number} options.days - Number of days to look back (default: 7)
 * @param {number} options.limit - Max results to return (default: 10)
 * @returns {Promise<Array>} Sentry issues
 */
export async function querySentryIssues({ query, days = 7, limit = 10 }) {
  if (!SENTRY_AUTH_TOKEN) {
    return [];
  }

  try {
    const statsPeriod = `${days}d`;
    const url = new URL(
      `${SENTRY_API_BASE}/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/`
    );

    url.searchParams.set("query", query);
    url.searchParams.set("statsPeriod", statsPeriod);
    url.searchParams.set("limit", limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Sentry API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const issues = await response.json();
    return issues;
  } catch (error) {
    console.error("❌ Error querying Sentry:", error.message);
    return [];
  }
}

/**
 * Get details for a specific Sentry issue
 * @param {string} issueId - Sentry issue ID
 * @returns {Promise<Object|null>} Issue details or null
 */
export async function getSentryIssueDetails(issueId) {
  if (!SENTRY_AUTH_TOKEN) {
    return null;
  }

  try {
    const url = `${SENTRY_API_BASE}/issues/${issueId}/`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Sentry API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const issue = await response.json();
    return issue;
  } catch (error) {
    console.error(`❌ Error fetching Sentry issue ${issueId}:`, error.message);
    return null;
  }
}

/**
 * Enrich test failure with related Sentry errors
 * @param {Object} testFailure - Test failure object
 * @param {string} testFailure.testFile - Test file path
 * @param {string} testFailure.testName - Test name
 * @param {string} testFailure.errorMessage - Error message
 * @param {string} testFailure.errorType - Error type (e.g., "TypeError", "Error")
 * @returns {Promise<string>} Markdown formatted Sentry enrichment section
 */
export async function enrichWithSentryData(testFailure) {
  if (!SENTRY_AUTH_TOKEN) {
    return "_Sentry enrichment unavailable (SENTRY_AUTH_TOKEN not set)_";
  }

  const { testFile, testName, errorMessage, errorType } = testFailure;

  // Build search query to find related errors
  // Look for errors matching the file path and error type
  const fileMatch = testFile.replace("src/__tests__/", "src/").replace(".test.", ".");
  const queries = [
    `${errorType}`,
    `${fileMatch}`,
    errorMessage ? errorMessage.slice(0, 50) : "",
  ].filter(Boolean);

  const searchQuery = queries.join(" ");

  console.log(`🔍 Searching Sentry for: ${searchQuery}`);

  const issues = await querySentryIssues({
    query: searchQuery,
    days: 7,
    limit: 5,
  });

  if (!issues || issues.length === 0) {
    return `_No related Sentry errors found in the last 7 days._\n\n**Search query:** \`${searchQuery}\``;
  }

  // Format Sentry issues as markdown
  let markdown = `Found **${issues.length}** related error(s) in Sentry:\n\n`;

  for (const issue of issues) {
    const {
      id,
      title,
      culprit,
      count,
      userCount,
      permalink,
      metadata,
      level,
    } = issue;

    const errorValue = metadata?.value || title;
    const errorLocation = culprit || "Unknown location";

    markdown += `#### [${errorValue}](${permalink})\n`;
    markdown += `- **Location:** \`${errorLocation}\`\n`;
    markdown += `- **Severity:** ${level}\n`;
    markdown += `- **Occurrences:** ${count} (${userCount} users affected)\n`;
    markdown += `- **Sentry Issue:** [#${id}](${permalink})\n\n`;
  }

  markdown += `\n**📊 Total Impact:** ${issues.reduce((sum, i) => sum + i.count, 0)} errors affecting ${issues.reduce((sum, i) => sum + i.userCount, 0)} users in the last 7 days.`;

  return markdown;
}

/**
 * Batch enrich multiple test failures
 * @param {Array<Object>} testFailures - Array of test failure objects
 * @returns {Promise<Object>} Map of test names to Sentry enrichment markdown
 */
export async function batchEnrich(testFailures) {
  const enrichments = {};

  for (const failure of testFailures) {
    const key = `${failure.testFile}::${failure.testName}`;
    console.log(`\n🔍 Enriching: ${key}`);

    enrichments[key] = await enrichWithSentryData(failure);

    // Rate limit: wait 100ms between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return enrichments;
}

/**
 * Format enrichment data for Issue body
 * @param {Object} enrichments - Map of test names to enrichment markdown
 * @returns {string} Formatted markdown section
 */
export function formatEnrichmentSection(enrichments) {
  const keys = Object.keys(enrichments);

  if (keys.length === 0) {
    return "_No test failures to enrich._";
  }

  let markdown = "";

  for (const key of keys) {
    const [file, test] = key.split("::");
    markdown += `### ${test}\n`;
    markdown += `**File:** \`${file}\`\n\n`;
    markdown += enrichments[key];
    markdown += "\n\n---\n\n";
  }

  return markdown;
}

const sentryEnricher = {
  querySentryIssues,
  getSentryIssueDetails,
  enrichWithSentryData,
  batchEnrich,
  formatEnrichmentSection,
};

export default sentryEnricher;

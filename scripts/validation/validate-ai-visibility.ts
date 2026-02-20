#!/usr/bin/env npx tsx
/**
 * validate-ai-visibility.ts
 *
 * Queries the Perplexity Search API with a set of brand-awareness queries,
 * then checks whether dcyfr.ai appears in the returned search results and
 * at what position.
 *
 * Uses the /search endpoint (not /chat/completions) which returns structured
 * result objects with title, url, snippet, date, and last_updated — identical
 * to what the official Perplexity Python SDK's client.search.create() returns.
 *
 * Usage:
 *   npx tsx scripts/validation/validate-ai-visibility.ts
 *   PERPLEXITY_API_KEY=<key> npx tsx scripts/validation/validate-ai-visibility.ts
 *
 * Exit codes:
 *   0 – at least one query returned dcyfr.ai in search results
 *   1 – dcyfr.ai not found in any query results (visibility gap)
 *   2 – API error / missing key
 */

const TARGET_DOMAIN = 'dcyfr.ai';
const SEARCH_API_URL = 'https://api.perplexity.ai/search';
const MAX_RESULTS = 10;

// ── Test Queries ─────────────────────────────────────────────────────────────

interface QueryTest {
  id: string;
  query: string;
  /** Keywords expected to appear in relevant snippets */
  expectedKeywords: string[];
}

const QUERY_TESTS: QueryTest[] = [
  {
    id: 'what-is',
    query: 'Tell me about DCYFR Labs',
    expectedKeywords: ['cybersecurity', 'security', 'Drew', 'architecture'],
  },
  {
    id: 'topics',
    query: 'DCYFR Labs blog topics cybersecurity AI',
    expectedKeywords: ['AI', 'security', 'OWASP', 'web'],
  },
  {
    id: 'who-writes',
    query: 'Who writes the DCYFR Labs blog',
    expectedKeywords: ['Drew', 'architect', 'dcyfr'],
  },
  {
    id: 'ai-security',
    query: 'DCYFR Labs agentic AI security best practices',
    expectedKeywords: ['agent', 'security', 'OWASP', 'LLM'],
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  last_updated?: string;
}

interface SearchResponse {
  id: string;
  results: SearchResult[];
  server_time?: string;
}

interface TestResult {
  id: string;
  query: string;
  found: boolean;
  positions: number[];          // 1-based positions of dcyfr.ai URLs
  dcyfrResults: SearchResult[]; // All results from dcyfr.ai domain
  allResults: SearchResult[];
  keywordsFound: string[];
  keywordScore: number;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isDcyfrUrl(url: string): boolean {
  return url.includes(TARGET_DOMAIN);
}

function findKeywordsInResults(results: SearchResult[], keywords: string[]): string[] {
  const combined = results
    .filter((r) => isDcyfrUrl(r.url))
    .map((r) => `${r.title} ${r.snippet}`)
    .join(' ')
    .toLowerCase();
  return keywords.filter((kw) => combined.includes(kw.toLowerCase()));
}

function truncate(s: string, n = 200): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

// ── API Call ─────────────────────────────────────────────────────────────────

async function searchPerplexity(
  apiKey: string,
  query: string
): Promise<SearchResponse> {
  const response = await fetch(SEARCH_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      max_results: MAX_RESULTS,
      max_tokens: 25000,
      max_tokens_per_page: 2048,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Perplexity Search API ${response.status}: ${body}`);
  }

  return response.json() as Promise<SearchResponse>;
}

// ── Runner ───────────────────────────────────────────────────────────────────

async function runTest(apiKey: string, test: QueryTest): Promise<TestResult> {
  try {
    const data = await searchPerplexity(apiKey, test.query);
    const results = data.results ?? [];

    const positions: number[] = [];
    const dcyfrResults: SearchResult[] = [];

    results.forEach((r, i) => {
      if (isDcyfrUrl(r.url)) {
        positions.push(i + 1);
        dcyfrResults.push(r);
      }
    });

    const keywordsFound = findKeywordsInResults(results, test.expectedKeywords);

    return {
      id: test.id,
      query: test.query,
      found: positions.length > 0,
      positions,
      dcyfrResults,
      allResults: results,
      keywordsFound,
      keywordScore: test.expectedKeywords.length > 0
        ? Math.round((keywordsFound.length / test.expectedKeywords.length) * 100)
        : 0,
    };
  } catch (err) {
    return {
      id: test.id,
      query: test.query,
      found: false,
      positions: [],
      dcyfrResults: [],
      allResults: [],
      keywordsFound: [],
      keywordScore: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

function printResult(result: TestResult): void {
  const icon = result.found ? '✅' : '❌';
  const label = result.found
    ? `FOUND at position${result.positions.length > 1 ? 's' : ''} ${result.positions.join(', ')}`
    : 'NOT FOUND';

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`🔎 Query: "${result.query}"`);
  console.log(`${icon} ${label}`);

  if (result.error) {
    console.log(`   ❌ Error: ${result.error}`);
    return;
  }

  if (result.dcyfrResults.length > 0) {
    console.log(`   dcyfr.ai results:`);
    result.dcyfrResults.forEach((r, i) => {
      console.log(`     [pos ${result.positions[i]}] ${r.url}`);
      console.log(`            ${truncate(r.snippet, 140)}`);
    });
  }

  if (result.allResults.length > 0 && !result.found) {
    console.log(`   Top 3 results returned instead:`);
    result.allResults.slice(0, 3).forEach((r, i) => {
      console.log(`     [${i + 1}] ${r.url}`);
    });
  }

  console.log(
    `   Keywords in dcyfr.ai snippets: [${result.keywordsFound.join(', ')}] (${result.keywordScore}%)`
  );
}

function printSummary(results: TestResult[]): { foundCount: number } {
  const foundCount = results.filter((r) => r.found).length;
  const errorCount = results.filter((r) => r.error).length;
  const avgKeywordScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.keywordScore, 0) / results.length)
      : 0;

  // Collect all unique dcyfr.ai URLs found across all queries
  const allFoundUrls = new Set<string>();
  results.forEach((r) => r.dcyfrResults.forEach((sr) => allFoundUrls.add(sr.url)));

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 AI Visibility Summary — ${new Date().toLocaleDateString()}`);
  console.log(`   Provider: Perplexity Search API`);
  console.log(`   Target: ${TARGET_DOMAIN}`);
  console.log(`   Queries tested: ${results.length}`);
  console.log(`   Queries with dcyfr.ai results: ${foundCount}/${results.length}`);
  console.log(`   Unique dcyfr.ai URLs indexed: ${allFoundUrls.size}`);
  if (allFoundUrls.size > 0) {
    allFoundUrls.forEach((url) => console.log(`     • ${url}`));
  }
  console.log(`   Avg keyword coverage in snippets: ${avgKeywordScore}%`);
  if (errorCount > 0) console.log(`   API errors: ${errorCount}`);
  console.log();

  if (foundCount === results.length) {
    console.log(`✅ Excellent — dcyfr.ai found in all ${results.length} query results`);
  } else if (foundCount > 0) {
    console.log(`⚠️  Partial visibility — found in ${foundCount}/${results.length} queries`);
    const missing = results.filter((r) => !r.found && !r.error);
    if (missing.length > 0) {
      console.log(`   Queries without dcyfr.ai results:`);
      missing.forEach((r) => console.log(`     - "${r.query}"`));
    }
  } else {
    console.log(`❌ Not found — dcyfr.ai not in any search results`);
    console.log(`   Possible causes: new content not yet indexed, low domain authority`);
  }

  console.log(`${'═'.repeat(60)}`);
  return { foundCount };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not set. Source .env.local or export the key.');
    process.exit(2);
  }

  console.log(`🔍 DCYFR Labs — AI Visibility Audit`);
  console.log(`   Running ${QUERY_TESTS.length} search queries against Perplexity Search API…`);
  console.log(`   Endpoint: ${SEARCH_API_URL}`);

  const results: TestResult[] = [];

  // Run sequentially to avoid rate-limiting
  for (const test of QUERY_TESTS) {
    process.stdout.write(`   Testing: "${test.query}" … `);
    const result = await runTest(apiKey, test);
    results.push(result);
    const icon = result.error ? '❌' : result.found ? '✅' : '⚠️';
    console.log(icon);
  }

  results.forEach(printResult);
  const { foundCount } = printSummary(results);

  // Exit 0 only if at least one query found dcyfr.ai
  process.exit(foundCount > 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(2);
});

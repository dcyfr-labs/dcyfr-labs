#!/usr/bin/env npx tsx
/**
 * validate-ai-visibility.ts
 *
 * Queries the Perplexity Sonar API (web-search enabled) with a set of
 * brand-awareness prompts, then checks whether dcyfr.ai appears in the
 * cited sources or response text.
 *
 * Usage:
 *   npx tsx scripts/validation/validate-ai-visibility.ts
 *   PERPLEXITY_API_KEY=<key> npx tsx scripts/validation/validate-ai-visibility.ts
 *
 * Exit codes:
 *   0 – at least one query cited dcyfr.ai as a source
 *   1 – no queries cited dcyfr.ai (visibility gap)
 *   2 – API error / missing key
 */

const TARGET_DOMAIN = 'dcyfr.ai';
const API_URL = 'https://api.perplexity.ai/chat/completions';
const MODEL = 'sonar'; // web-search enabled model

// ── Test Prompts ────────────────────────────────────────────────────────────

interface PromptTest {
  id: string;
  prompt: string;
  /** Keywords expected to appear in a good answer */
  expectedKeywords: string[];
}

const PROMPT_TESTS: PromptTest[] = [
  {
    id: 'what-is',
    prompt: 'What is DCYFR Labs?',
    expectedKeywords: ['cybersecurity', 'security', 'Drew', 'architecture'],
  },
  {
    id: 'topics',
    prompt: 'What topics does the DCYFR Labs blog cover?',
    expectedKeywords: ['AI security', 'vulnerability', 'OWASP', 'web'],
  },
  {
    id: 'who-writes',
    prompt: 'Who writes the DCYFR Labs blog?',
    expectedKeywords: ['Drew', 'cyber architect', 'dcyfr'],
  },
  {
    id: 'ai-security',
    prompt:
      'What does DCYFR Labs say about agentic AI security best practices?',
    expectedKeywords: ['agent', 'security', 'OWASP', 'LLM'],
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  /** Array of source URLs referenced as [1], [2], … in content */
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TestResult {
  id: string;
  prompt: string;
  cited: boolean;
  mentionedInContent: boolean;
  citations: string[];
  contentSnippet: string;
  keywordsFound: string[];
  keywordScore: number;
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function containsDomain(urls: string[], domain: string): boolean {
  return urls.some((u) => u.includes(domain));
}

function contentMentionsDomain(content: string, domain: string): boolean {
  return content.toLowerCase().includes(domain.toLowerCase());
}

function findKeywords(content: string, keywords: string[]): string[] {
  return keywords.filter((kw) =>
    content.toLowerCase().includes(kw.toLowerCase())
  );
}

function truncate(s: string, n = 160): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

// ── API Call ─────────────────────────────────────────────────────────────────

async function queryPerplexity(
  apiKey: string,
  prompt: string
): Promise<PerplexityResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Be precise and concise. Include source citations when referencing specific websites or publications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
      return_citations: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Perplexity API ${response.status}: ${body}`);
  }

  return response.json() as Promise<PerplexityResponse>;
}

// ── Runner ───────────────────────────────────────────────────────────────────

async function runTest(
  apiKey: string,
  test: PromptTest
): Promise<TestResult> {
  try {
    const data = await queryPerplexity(apiKey, test.prompt);
    const content = data.choices[0]?.message?.content ?? '';
    const citations = data.citations ?? [];

    const cited = containsDomain(citations, TARGET_DOMAIN);
    const mentionedInContent = contentMentionsDomain(content, TARGET_DOMAIN);
    const keywordsFound = findKeywords(content, test.expectedKeywords);

    return {
      id: test.id,
      prompt: test.prompt,
      cited,
      mentionedInContent,
      citations,
      contentSnippet: truncate(content),
      keywordsFound,
      keywordScore: Math.round(
        (keywordsFound.length / test.expectedKeywords.length) * 100
      ),
    };
  } catch (err) {
    return {
      id: test.id,
      prompt: test.prompt,
      cited: false,
      mentionedInContent: false,
      citations: [],
      contentSnippet: '',
      keywordsFound: [],
      keywordScore: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

function printResult(result: TestResult): void {
  const citedIcon = result.cited ? '✅' : result.mentionedInContent ? '⚠️' : '❌';
  const label = result.cited
    ? 'CITED'
    : result.mentionedInContent
      ? 'MENTIONED (not cited)'
      : 'NOT FOUND';

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📋 Prompt: "${result.prompt}"`);
  console.log(`${citedIcon} ${label}`);

  if (result.error) {
    console.log(`   ❌ Error: ${result.error}`);
    return;
  }

  if (result.citations.length > 0) {
    console.log(`   Sources (${result.citations.length}):`);
    result.citations.slice(0, 5).forEach((url, i) => {
      const highlight = url.includes(TARGET_DOMAIN) ? ' ← dcyfr.ai' : '';
      console.log(`     [${i + 1}] ${url}${highlight}`);
    });
    if (result.citations.length > 5) {
      console.log(`     … and ${result.citations.length - 5} more`);
    }
  } else {
    console.log(`   No citations returned`);
  }

  console.log(
    `   Keywords: ${result.keywordsFound.length}/${Object.keys(result.keywordsFound).length} — [${result.keywordsFound.join(', ')}] (${result.keywordScore}%)`
  );
  console.log(`   Answer: ${result.contentSnippet}`);
}

function printSummary(results: TestResult[]): { citationCount: number } {
  const citationCount = results.filter((r) => r.cited).length;
  const mentionCount = results.filter(
    (r) => r.mentionedInContent && !r.cited
  ).length;
  const errorCount = results.filter((r) => r.error).length;
  const avgKeywordScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.keywordScore, 0) / results.length
        )
      : 0;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 AI Visibility Summary — ${new Date().toLocaleDateString()}`);
  console.log(`   Provider: Perplexity Sonar (web-search)`);
  console.log(`   Target: ${TARGET_DOMAIN}`);
  console.log(`   Prompts tested: ${results.length}`);
  console.log(`   Cited as source: ${citationCount}/${results.length}`);
  console.log(`   Mentioned (not cited): ${mentionCount}/${results.length}`);
  console.log(`   Avg keyword coverage: ${avgKeywordScore}%`);
  if (errorCount > 0) console.log(`   API errors: ${errorCount}`);
  console.log();

  if (citationCount === results.length) {
    console.log(`✅ Excellent — dcyfr.ai cited in all ${results.length} prompts`);
  } else if (citationCount > 0) {
    console.log(
      `⚠️  Partial visibility — cited in ${citationCount}/${results.length} prompts`
    );
    const missing = results.filter((r) => !r.cited && !r.error);
    if (missing.length > 0) {
      console.log(`   Prompts without citation:`);
      missing.forEach((r) => console.log(`     - "${r.prompt}"`));
    }
  } else if (mentionCount > 0) {
    console.log(
      `⚠️  Mentioned but not cited — content may not be authoritative enough yet`
    );
  } else {
    console.log(
      `❌ Not found — dcyfr.ai not cited or mentioned in any prompt response`
    );
    console.log(
      `   Possible causes: new content not yet indexed, page lacks citations-ready structure`
    );
  }

  console.log(`${'═'.repeat(60)}`);
  return { citationCount };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error(
      '❌ PERPLEXITY_API_KEY not set. Source .env.local or export the key.'
    );
    process.exit(2);
  }

  console.log(`🔍 DCYFR Labs — AI Visibility Audit`);
  console.log(
    `   Running ${PROMPT_TESTS.length} prompt tests against Perplexity Sonar…`
  );

  const results: TestResult[] = [];

  // Run sequentially to avoid rate-limiting
  for (const test of PROMPT_TESTS) {
    process.stdout.write(`   Testing: "${test.prompt}" … `);
    const result = await runTest(apiKey, test);
    results.push(result);
    const icon = result.error ? '❌' : result.cited ? '✅' : '⚠️';
    console.log(icon);
  }

  results.forEach(printResult);
  const { citationCount } = printSummary(results);

  // Exit 0 only if at least one citation found
  process.exit(citationCount > 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(2);
});

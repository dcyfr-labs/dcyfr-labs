#!/usr/bin/env node
/**
 * Parses vitest JSON output from red-team tests and reports results to
 * Axiom, Slack, and GitHub deployment comments.
 *
 * Usage:
 *   node scripts/report-red-team-results.mjs \
 *     --results=red-team-results.json \
 *     --axiom --slack --comment
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

// ── Parse vitest JSON output ──────────────────────────────────────────────────

function parseResults(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));

  // Vitest JSON reporter schema
  const testResults = raw.testResults ?? [];
  const tests = [];

  for (const suite of testResults) {
    for (const test of suite.assertionResults ?? []) {
      tests.push({
        name: test.fullName ?? test.title,
        passed: test.status === 'passed',
        duration: test.duration ?? 0,
        failureMessage: test.failureMessages?.[0] ?? null,
      });
    }
  }

  const passes = tests.filter((t) => t.passed).length;
  const failures = tests.filter((t) => !t.passed).length;
  const duration = raw.testResults?.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) ?? 0;

  return { stats: { passes, failures, duration }, tests };
}

// ── Axiom ingestion ───────────────────────────────────────────────────────────

async function ingestToAxiom(results) {
  const token = process.env.AXIOM_API_TOKEN;
  if (!token) {
    console.warn('AXIOM_API_TOKEN not set — skipping Axiom ingestion');
    return;
  }

  const events = results.tests.map((t) => ({
    _time: new Date().toISOString(),
    type: 'red_team:test_result',
    scenario: t.name,
    status: t.passed ? 'pass' : 'fail',
    duration_ms: t.duration,
    failure_message: t.failureMessage,
    commit_sha: process.env.DEPLOYMENT_SHA ?? 'unknown',
    deployment_url: process.env.DEPLOYMENT_URL ?? 'unknown',
  }));

  // Batch into max 100 events per request
  const BATCH = 100;
  for (let i = 0; i < events.length; i += BATCH) {
    const batch = events.slice(i, i + BATCH);
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch('https://api.axiom.co/v1/datasets/dcyfr_security/ingest', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });
        if (!res.ok) throw new Error(`Axiom HTTP ${res.status}`);
        break;
      } catch (err) {
        lastErr = err;
        if (attempt < 3) await sleep(attempt * 1000);
      }
    }
    if (lastErr) console.error('Axiom ingestion failed:', lastErr.message);
  }

  console.log(`Axiom: ingested ${events.length} events`);
}

// ── Slack notification ────────────────────────────────────────────────────────

async function notifySlack(results) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) {
    console.warn('SLACK_WEBHOOK_URL not set — skipping Slack notification');
    return;
  }

  const { passes, failures, duration } = results.stats;
  const total = passes + failures;
  const allPass = failures === 0;
  const icon = allPass ? ':white_check_mark:' : ':rotating_light:';
  const durationSec = (duration / 1000).toFixed(1);

  const failLines = results.tests
    .filter((t) => !t.passed)
    .map((t) => `  • ${t.name}`)
    .join('\n');

  const text = [
    `${icon} *Red-Team Security Tests* — ${allPass ? 'All passed' : `${failures} FAILED`}`,
    `${passes}/${total} tests passed in ${durationSec}s`,
    process.env.DEPLOYMENT_URL ? `Deployment: ${process.env.DEPLOYMENT_URL}` : null,
    failLines ? `\nFailed:\n${failLines}` : null,
    !allPass ? '\n<!subteam^security-team> action required' : null,
  ]
    .filter(Boolean)
    .join('\n');

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  console.log('Slack: notification sent');
}

// ── GitHub deployment comment ─────────────────────────────────────────────────

async function postGitHubComment(results) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.DEPLOYMENT_SHA;

  if (!token || !repo || !sha) {
    console.warn('GitHub env vars not set — skipping deployment comment');
    return;
  }

  const { passes, failures, duration } = results.stats;
  const total = passes + failures;
  const allPass = failures === 0;
  const durationSec = (duration / 1000).toFixed(1);

  const rows = results.tests
    .map((t) => `| ${t.passed ? '✅' : '❌'} | ${t.name} | ${t.duration}ms |`)
    .join('\n');

  const body = [
    `### ${allPass ? '✅' : '❌'} Red-Team Security Tests`,
    '',
    `**${passes}/${total} passed** in ${durationSec}s`,
    '',
    '| Status | Test | Duration |',
    '|--------|------|----------|',
    rows,
  ].join('\n');

  const [owner, repoName] = repo.split('/');
  const commitsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/commits/${sha}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!commitsRes.ok) {
    console.warn('GitHub comment failed:', await commitsRes.text());
  } else {
    console.log('GitHub: deployment comment posted');
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const resultsFile = args.results;
  if (!resultsFile) {
    console.error('Usage: --results=<file.json>');
    process.exit(1);
  }

  const results = parseResults(resultsFile);
  const { passes, failures } = results.stats;
  console.log(`Parsed: ${passes} passed, ${failures} failed`);

  await Promise.all([
    args.axiom ? ingestToAxiom(results) : Promise.resolve(),
    args.slack ? notifySlack(results) : Promise.resolve(),
    args.comment ? postGitHubComment(results) : Promise.resolve(),
  ]);

  if (failures > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

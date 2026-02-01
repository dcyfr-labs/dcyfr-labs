#!/usr/bin/env node

/**
 * Analyze CodeQL Alerts for Autofix
 *
 * Fetches open CodeQL alerts from GitHub and identifies which ones are fixable
 * by GitHub Copilot. Returns structured data for parallel processing.
 *
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub API token
 *   GITHUB_REPOSITORY - Repository in owner/repo format
 *   ALERT_NUMBER - Specific alert to analyze (optional)
 *   MIN_SEVERITY - Minimum severity to fix (default: high)
 *
 * Outputs:
 *   alerts_json - JSON array of alerts for matrix build
 *   alerts_count - Total alert count
 *   has_fixable - Boolean indicating if fixable alerts exist
 */

import { execaSync } from 'execa';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const ALERT_NUMBER = process.env.ALERT_NUMBER;
const MIN_SEVERITY = process.env.MIN_SEVERITY || 'high';

const [REPO_OWNER, REPO_NAME] = GITHUB_REPOSITORY.split('/');

// Map severity to priority (higher number = higher priority)
const SEVERITY_PRIORITY = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  warning: 1,
  note: 0,
};

// CodeQL rules that are typically fixable by Copilot
const FIXABLE_RULES = new Set([
  'javascript/CleartextLogging', // Logging sensitive data
  'javascript/XSS', // Cross-site scripting
  'javascript/SqlInjection', // SQL injection
  'javascript/CommandInjection', // Command injection
  'javascript/PathTraversal', // Path traversal
  'javascript/IncorrectRegexpParse', // Regex issues
  'javascript/IncorrectRegexpEscape', // Regex escaping
  'javascript/InputValidation', // Input validation
  'javascript/CleartextStorage', // Storing secrets in plaintext
  'typescript/CleartextLogging', // TypeScript logging
  'typescript/InputValidation', // TypeScript input validation
]);

// Rules that require manual review (false positives, complex patterns)
const REQUIRES_MANUAL_REVIEW = new Set([
  'javascript/DOMXSS', // DOM XSS - often false positives
  'javascript/TaintedPath', // Complex path validation
  'javascript/NoHardcodedPasswords', // May be in tests
]);

async function getCodeQLAlerts() {
  if (!GITHUB_TOKEN) {
    console.error('❌ Missing GITHUB_TOKEN');
    process.exit(1);
  }

  try {
    let query = `/repos/${REPO_OWNER}/${REPO_NAME}/code-scanning/alerts`;

    // Add filters
    const params = new URLSearchParams({
      state: 'open',
      per_page: '100',
    });

    if (ALERT_NUMBER) {
      // Fetch specific alert
      query = `${query}/${ALERT_NUMBER}`;
    }

    // FIX: CWE-78 - Use execa with array syntax to prevent command injection
    const { stdout: output } = execaSync('gh', ['api', `${query}?${params.toString()}`], {
      env: { ...process.env, GITHUB_TOKEN },
      encoding: 'utf-8',
      shell: false,
    });

    const alerts = ALERT_NUMBER ? [JSON.parse(output)] : JSON.parse(output);

    if (!Array.isArray(alerts)) {
      console.error('❌ Invalid API response');
      process.exit(1);
    }

    return alerts;
  } catch (error) {
    console.error('❌ Error fetching CodeQL alerts:', error.message);
    return [];
  }
}

function isFixableAlert(alert) {
  const severity = alert.rule?.security_severity_level || alert.rule?.severity || 'note';
  const ruleName = alert.rule?.id || 'unknown';

  // Check if alert meets minimum severity
  const minPriority = SEVERITY_PRIORITY[MIN_SEVERITY] || 3;
  const alertPriority = SEVERITY_PRIORITY[severity] || 0;

  if (alertPriority < minPriority) {
    return { fixable: false, reason: `Below minimum severity (${severity})` };
  }

  // Check if rule requires manual review
  if (REQUIRES_MANUAL_REVIEW.has(ruleName)) {
    return { fixable: false, reason: 'Requires manual review (known false positives)' };
  }

  // Check if rule is in fixable list
  if (!FIXABLE_RULES.has(ruleName)) {
    return { fixable: false, reason: 'Not in autofix list' };
  }

  // Check if alert has valid location information
  if (!alert.most_recent_instance?.location) {
    return { fixable: false, reason: 'Missing location information' };
  }

  return { fixable: true, reason: 'Ready for autofix' };
}

function alertToMatrixItem(alert) {
  const location = alert.most_recent_instance?.location;
  const ruleName = alert.rule?.id || 'unknown';

  return {
    number: alert.number,
    rule_id: ruleName,
    rule_name: alert.rule?.name || 'Unknown Rule',
    severity: alert.rule?.security_severity_level || alert.rule?.severity || 'note',
    description: alert.rule?.description || 'Security issue detected',
    file: location?.path || 'unknown',
    line: location?.start_line || 1,
    column: location?.start_column || 1,
    message: alert.most_recent_instance?.message?.text || alert.rule?.description || '',
    state: alert.state,
    dismissed_at: alert.dismissed_at,
    dismissed_reason: alert.dismissed_reason,
  };
}

async function main() {
  console.log('🔍 Analyzing CodeQL alerts for autofix...\n');

  const alerts = await getCodeQLAlerts();
  console.log(`📊 Total open alerts: ${alerts.length}`);

  if (alerts.length === 0) {
    console.log('✅ No open alerts found');
    console.log('::set-output name=alerts_json::[]');
    console.log('::set-output name=alerts_count::0');
    console.log('::set-output name=has_fixable::false');
    return;
  }

  const fixable = [];
  const unfixable = [];

  for (const alert of alerts) {
    const { fixable: isFixable, reason } = isFixableAlert(alert);

    if (isFixable) {
      fixable.push(alertToMatrixItem(alert));
      console.log(`✅ Alert #${alert.number}: Fixable - ${reason}`);
    } else {
      unfixable.push(alert.number);
      console.log(`⚠️  Alert #${alert.number}: ${reason}`);
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   Total: ${alerts.length}`);
  console.log(`   Fixable: ${fixable.length}`);
  console.log(`   Requires manual review: ${unfixable.length}`);

  // Output for GitHub Actions
  const alertsJson = JSON.stringify(fixable);
  console.log(`\n::set-output name=alerts_json::${alertsJson}`);
  console.log(`::set-output name=alerts_count::${alerts.length}`);
  console.log(`::set-output name=has_fixable::${fixable.length > 0 ? 'true' : 'false'}`);

  if (unfixable.length > 0) {
    console.log(`\n⚠️  Alerts requiring manual review: ${unfixable.join(', ')}`);
    console.log('See: https://github.com/' + GITHUB_REPOSITORY + '/security/code-scanning');
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

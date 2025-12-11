#!/usr/bin/env node
// parse-gitleaks-report.mjs
// Accepts path to gitleaks JSON report and checks for critical secrets
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const reportFile = args[0] || './gitleaks-report.json';

function loadReport(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('ERROR: Could not read or parse report:', e.message);
    process.exit(2);
  }
}

function loadAllowlist(file = './.pii-allowlist.json') {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return {};
  }
}

// What patterns should block PRs? (Rule names or descriptions as seen in gitleaks)
const blockList = [
  'AWS', 'AKIA', 'Private Key', 'PRIVATE KEY', 'RSA', 'ENCRYPTED', 'SSH PRIVATE', 'SECRET', 'API Key', 'Access Key'
];

function shouldBlock(match, allowlist) {
  const combined = `${match.rule || ''} ${match.description || ''} ${match.tags || ''}`.toUpperCase();
  for (const b of blockList) {
    if (combined.includes(b.toUpperCase())) return true;
  }
  return false;
}

function main() {
  const report = loadReport(reportFile);
  if (!Array.isArray(report) || report.length === 0) {
    console.log('Gitleaks: no findings');
    process.exit(0);
  }
  // report is an array of findings
  const allowlist = loadAllowlist();
  const privateKeyPaths = allowlist.privateKeyPaths || [];

  const critical = report.filter(f => {
    if (!shouldBlock(f, allowlist)) return false;
    // If file is under a privateKeyPaths allowlist and has a reason that includes 'placeholder' or 'example', skip blocking
    const pathMatch = privateKeyPaths.some(p => f.file && f.file.startsWith(p.replace('/**', '')));
    if (pathMatch) {
      const reasons = allowlist.allowlistReasons || {};
      const reason = reasons[privateKeyPaths.find(p => f.file && f.file.startsWith(p.replace('/**', '')))] || '';
      if (/PLACEHOLDER|EXAMPLE|REDACTED|REDAC|DUMMY|TEST/i.test(reason)) {
        return false;
      }
    }
    return true;
  });
  if (critical.length > 0) {
    console.error(`Gitleaks: ${critical.length} critical secrets found:`);
    critical.forEach(c => {
      console.error(`- ${c.rule} in ${c.file} (line ${c.line || 'n/a'})`);
    });
    // Exit with code 3 for actionable CI failure
    process.exit(3);
  }
  console.log('Gitleaks: no critical secrets found.');
  process.exit(0);
}

main();

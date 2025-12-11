#!/usr/bin/env node
// validate-allowlist.mjs
// Simple validator for .pii-allowlist.json to ensure entries have reasons
import fs from 'fs';
import path from 'path';
const file = path.resolve(new URL(import.meta.url).pathname, '..', '..', '.pii-allowlist.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error('ERROR: Could not parse .pii-allowlist.json:', e.message);
    process.exit(2);
  }
}

function validate(allowlist) {
  // collect all candidate keys from paths lists
  const pathKeys = [];
  ['paths', 'proprietaryPaths', 'piPaths', 'piiPaths', 'privateKeyPaths'].forEach(k => {
    const arr = allowlist[k] || [];
    arr.forEach(p => pathKeys.push(p));
  });

  const reasons = allowlist.allowlistReasons || {};
  const missing = [];
  for (const p of pathKeys) {
    if (!Object.prototype.hasOwnProperty.call(reasons, p)) {
      missing.push(p);
    }
  }

  if (missing.length > 0) {
    console.error('Allowlist Validation Failure: The following paths/domains are missing allowlistReasons:');
    missing.forEach(m => console.error(' -', m));
    console.error('\nPlease add a justification in `allowlistReasons` in `.pii-allowlist.json` and re-run.');
    process.exit(1);
  }

  console.log('Allowlist validation ok.');
  process.exit(0);
}

validate(load());

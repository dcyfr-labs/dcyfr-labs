#!/usr/bin/env node
// audit-allowlist.mjs
// Prints all allowlist entries with reasons in a readable format
import fs from 'fs';
import path from 'path';
const file = path.resolve(new URL(import.meta.url).pathname, '..', '..', '.pii-allowlist.json');

function load() {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error('ERROR: Could not parse .pii-allowlist.json:', e.message); process.exit(2); }
}

function audit(allowlist) {
  console.log('--- Allowlist Audit ---');
  console.log('Paths');
  (allowlist.paths || []).forEach(p => console.log(' -', p, '-', (allowlist.allowlistReasons && allowlist.allowlistReasons[p]) || 'no reason'));
  console.log('\nPI Paths');
  (allowlist.piPaths || []).forEach(p => console.log(' -', p, '-', (allowlist.allowlistReasons && allowlist.allowlistReasons[p]) || 'no reason'));
  console.log('\nPII Paths');
  (allowlist.piiPaths || []).forEach(p => console.log(' -', p, '-', (allowlist.allowlistReasons && allowlist.allowlistReasons[p]) || 'no reason'));
  console.log('\nProprietary Paths');
  (allowlist.proprietaryPaths || []).forEach(p => console.log(' -', p, '-', (allowlist.allowlistReasons && allowlist.allowlistReasons[p]) || 'no reason'));
  console.log('\nPrivate Key Paths');
  (allowlist.privateKeyPaths || []).forEach(p => console.log(' -', p, '-', (allowlist.allowlistReasons && allowlist.allowlistReasons[p]) || 'no reason'));
  console.log('\nEmail Domains');
  (allowlist.emailDomains || []).forEach(d => console.log(' -', d));
  console.log('\nEmails');
  (allowlist.emails || []).forEach(e => console.log(' -', e));
  console.log('\n--- End of Allowlist ---');
}

audit(load());

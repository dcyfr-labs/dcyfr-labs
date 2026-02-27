#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

const scriptsToRemove = [
  'redis:migrate',
  'redis:migrate-to-id',
  'redis:revert-id-based',
  'redis:fix-keys',
  'redis:fix-keys:dry-run',
  'redis:consolidate-views',
  'redis:consolidate-views:dry-run',
  'redis:sync-counters',
  'redis:sync-counters:dry-run',
  'redis:analyze-mismatch',
  'redis:check-old',
  'redis:cleanup-orphaned',
  'redis:cleanup-orphaned:dry-run',
  'redis:final-status',
  'redis:final-verification',
  'redis:find-orphaned',
  'redis:verify-safety',
  'redis:verify-tracking',
  'redis:verify-views',
  'redis:verify-views-shares',
  'redis:check-history',
  'ai:fallback:health',
  'ai:fallback:init',
  'ai:fallback:return',
  'ai:fallback:status',
  'ai:fallback:trigger',
  'ai:telemetry:compare',
  'ai:telemetry:export',
  'ai:telemetry:handoffs',
  'ai:telemetry:stats',
  'session',
  'session:handoff',
  'session:recover',
  'session:restore',
  'session:save',
  'session:track',
  'session:track:clear',
  'session:track:last',
  'session:track:report',
  'session:track:report:json',
  'dev:debug',
  'dev:verbose',
];

let removed = 0;
scriptsToRemove.forEach((script) => {
  if (pkg.scripts[script]) {
    delete pkg.scripts[script];
    removed++;
  }
});

writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log(`✅ Removed ${removed} scripts`);
console.log(`📊 Remaining scripts: ${Object.keys(pkg.scripts).length}`);

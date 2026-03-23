#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const localNodeModules = path.join(packageRoot, 'node_modules');
const workspaceNodeModules = path.resolve(packageRoot, '..', 'node_modules');
const eslintCandidates = [
  path.join(localNodeModules, 'eslint', 'bin', 'eslint.js'),
  path.join(workspaceNodeModules, 'eslint', 'bin', 'eslint.js'),
];
const eslintBin = eslintCandidates.find((candidate) => existsSync(candidate));

if (!eslintBin) {
  console.error(
    'Unable to find an ESLint binary in dcyfr-labs/node_modules or workspace root node_modules'
  );
  process.exit(1);
}

const nodePathEntries = [localNodeModules, workspaceNodeModules, process.env.NODE_PATH].filter(
  Boolean
);

const result = spawnSync(process.execPath, [eslintBin, ...process.argv.slice(2)], {
  cwd: packageRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_PATH: nodePathEntries.join(path.delimiter),
  },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

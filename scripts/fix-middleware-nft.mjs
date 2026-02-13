/**
 * Fix middleware.js.nft.json for Turbopack builds
 *
 * Turbopack bundles middleware into server/edge/chunks/ and does NOT generate
 * the server/middleware.js.nft.json file. Vercel's builder expects this file
 * to exist during the "Created all serverless functions" packaging step.
 *
 * Since middleware runs on the Edge Runtime (not Node.js), it has no Node file
 * traces — the nft.json just needs an empty file list.
 *
 * This script runs as a postbuild hook: `next build` → this script → Vercel packaging.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NEXT_DIR = join(process.cwd(), '.next', 'server');
const NFT_PATH = join(NEXT_DIR, 'middleware.js.nft.json');

if (existsSync(NFT_PATH)) {
  console.log('✓ middleware.js.nft.json already exists (webpack build)');
  process.exit(0);
}

// Verify this is actually a build with middleware
const manifestPath = join(NEXT_DIR, 'middleware-manifest.json');
if (!existsSync(manifestPath)) {
  console.log('⊘ No middleware-manifest.json found — skipping nft.json fix');
  process.exit(0);
}

// Create the empty nft.json trace file for edge middleware
// Edge middleware has no Node.js file dependencies; all code is in edge chunks
const nftContent = JSON.stringify({ version: 1, files: [] });

mkdirSync(NEXT_DIR, { recursive: true });
writeFileSync(NFT_PATH, nftContent, 'utf-8');

console.log('✓ Created middleware.js.nft.json for Turbopack edge middleware');

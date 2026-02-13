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

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const NEXT_DIR = join(process.cwd(), '.next', 'server');
const NFT_PATH = join(NEXT_DIR, 'middleware.js.nft.json');
const MIDDLEWARE_PATH = join(NEXT_DIR, 'middleware.js');

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

// Also create middleware.js compatibility file for Vercel
if (!existsSync(MIDDLEWARE_PATH)) {
  createMiddlewareCompatibilityFile();
}

function createMiddlewareCompatibilityFile() {
  // Read the middleware-manifest.json to get chunk file list
  const manifestPath = join(NEXT_DIR, 'middleware-manifest.json');
  if (!existsSync(manifestPath)) {
    console.log('⊘ No middleware-manifest.json found — skipping middleware.js creation');
    return;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const middlewareConfig = manifest.middleware?.['/'];

  if (!middlewareConfig) {
    console.log('⊘ No middleware config for "/" route found');
    return;
  }

  // Create a simple middleware.js file that serves as an entry point
  // This is a compatibility layer that tells Vercel the file exists
  // The actual middleware logic runs through the edge chunks referenced in middleware-manifest.json
  const middlewareContent = `/**
 * Middleware compatibility stub for Turbopack builds
 *
 * Turbopack generates middleware as multiple chunks in server/edge/chunks/.
 * This file exists to satisfy Vercel's expectation that middleware.js exists.
 * The actual middleware execution is handled by the edge runtime chunks.
 */

// Note: This file is not directly executed. The edge runtime loads
// middleware through the chunks referenced in middleware-manifest.json.
// This stub just ensures the file exists for Vercel's bundler.

export default function middleware() {
  // This should never be called - actual middleware runs via edge chunks
  throw new Error('Middleware stub called - should use edge chunks instead');
}

export const config = {
  // Re-export config for compatibility (actual config is in edge chunks)
  matcher: []
};
`;

  writeFileSync(MIDDLEWARE_PATH, middlewareContent, 'utf-8');
  console.log('✓ Created middleware.js compatibility file for Vercel');
}

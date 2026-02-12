#!/usr/bin/env node
/**
 * Content Manager MCP Server Startup Script
 *
 * Starts the Content Manager MCP server with dcyfr-labs FilesystemContentProvider.
 * This script is the entry point for the dcyfr-contentmanager MCP server.
 */

import { createContentManagerServer } from '@dcyfr/ai/mcp';
import { FilesystemContentProvider } from './content-provider-impl.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize content provider with dcyfr-labs content directory
const contentDir = path.join(__dirname, '../content');
const provider = new FilesystemContentProvider(contentDir);

// Create and start server
const server = createContentManagerServer(provider);

server
  .start({ transportType: 'stdio' })
  .then(() => {
    console.error('✅ Content Manager MCP Server started (stdio mode)');
  })
  .catch((error: unknown) => {
    console.error('❌ Failed to start Content Manager MCP server:', error);
    process.exit(1);
  });

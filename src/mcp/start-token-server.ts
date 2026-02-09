#!/usr/bin/env node
/**
 * Design Tokens MCP Server Startup Script
 *
 * Starts the Design Tokens MCP server with dcyfr-labs DcyfrLabsTokenProvider.
 * This script is the entry point for the dcyfr-designtokens MCP server.
 */

import { createDesignTokenServer } from '@dcyfr/ai/mcp';
import { DcyfrLabsTokenProvider } from './token-provider-impl.js';

// Initialize token provider with dcyfr-labs design tokens
const provider = new DcyfrLabsTokenProvider();

// Create and start server
const server = createDesignTokenServer(provider);

server
  .start({ transportType: 'stdio' })
  .then(() => {
    console.error('✅ Design Tokens MCP Server started (stdio mode)');
  })
  .catch((error: unknown) => {
    console.error('❌ Failed to start Design Tokens MCP server:', error);
    process.exit(1);
  });

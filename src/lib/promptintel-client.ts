/**
 * Legacy PromptIntel client stub.
 * PromptIntel MCP server has been removed.
 * This file is a temporary compatibility layer to maintain compilation.
 * Migrate to @dcyfr/ai threat intelligence or remove usage.
 */

import type { PromptIntelIoPC, PromptIntelTaxonomy } from './promptintel-types.js';

export class PromptIntelClient {
  constructor(_config?: unknown) {
    throw new Error(
      'PromptIntel MCP server has been deprecated. ' +
        'Please migrate to @dcyfr/ai threat intelligence services or remove this feature.'
    );
  }

  // Stub methods for compilation (will never be called due to constructor throw)
  async getPrompts(_options?: unknown): Promise<PromptIntelIoPC[]> {
    return [];
  }

  async getTaxonomy(_options?: unknown): Promise<PromptIntelTaxonomy[]> {
    return [];
  }

  async healthCheck(_options?: unknown): Promise<unknown> {
    return {};
  }

  async submitReport(_report?: unknown): Promise<unknown> {
    return {};
  }
}

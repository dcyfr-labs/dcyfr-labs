/**
 * @deprecated PromptIntel MCP server has been removed
 * This file is a temporary stub to maintain compilation.
 * Migrate to @dcyfr/ai threat intelligence or remove usage.
 */

export class PromptIntelClient {
  constructor() {
    throw new Error(
      'PromptIntel MCP server has been deprecated. ' +
        'Please migrate to @dcyfr/ai threat intelligence services or remove this feature.'
    );
  }

  // Stub methods for compilation (will never be called due to constructor throw)
  async getPrompts(_options?: unknown): Promise<never[]> {
    return [];
  }

  async getTaxonomy(_options?: unknown): Promise<never[]> {
    return [];
  }
}

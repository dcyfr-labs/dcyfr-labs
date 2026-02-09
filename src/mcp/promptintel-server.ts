#!/usr/bin/env node
/**
 * PromptIntel MCP Server
 *
 * Provides AI assistants with direct access to PromptIntel threat intelligence database.
 * Enables real-time security scanning, threat detection, and vulnerability reporting.
 *
 * @deprecated Migrated to @dcyfr/ai/mcp/servers/promptintel (Feb 2026)
 * This implementation maintained for backward compatibility.
 * New implementations should import from @dcyfr/ai.
 * Planned removal: March 2027 (1-year transition period)
 *
 * Tools:
 * - promptintel:searchThreats - Search IoPC database for adversarial prompt patterns
 * - promptintel:getTaxonomy - Fetch threat attack technique taxonomy
 * - promptintel:submitReport - Submit security finding or vulnerability
 *
 * Resources:
 * - promptintel://threats/critical - Critical severity threats
 * - promptintel://taxonomy - Full threat taxonomy
 * - promptintel://health - API health status
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { PromptIntelClient } from './shared/promptintel-client.js';
import {
  handleToolError,
  logToolExecution,
  measurePerformance,
} from './shared/utils.js';
import { SimpleCache } from './shared/cache.js';

// ============================================================================
// Server Configuration
// ============================================================================

const server = new FastMCP({
  name: 'dcyfr-promptintel',
  version: '1.0.0',
  instructions:
    'Provides access to PromptIntel threat intelligence platform. Use these tools to search IoPC (Indicators of Prompt Compromise), analyze attack patterns, and submit security findings. All data is from collaborative threat intelligence community.',
});

// ============================================================================
// Client Initialization
// ============================================================================

const apiKey = process.env.PROMPTINTEL_API_KEY;
if (!apiKey) {
  throw new Error(
    'PROMPTINTEL_API_KEY environment variable is required. Get your key from https://promptintel.novahunting.ai/account/api-keys'
  );
}

const client = new PromptIntelClient({
  apiKey,
  baseUrl: 'https://api.promptintel.novahunting.ai/api/v1',
  timeout: 15000,
});

// ============================================================================
// Cache Configuration (5-minute TTL)
// ============================================================================

const promptIntelCache = new SimpleCache<unknown>(300000);

// ============================================================================
// Tool 1: Search Threats
// ============================================================================

server.addTool({
  name: 'promptintel:searchThreats',
  description:
    'Search IoPC (Indicators of Prompt Compromise) database for adversarial prompt patterns and attack techniques. Filter by severity and category to find relevant threats.',
  parameters: z.object({
    severity: z
      .enum(['critical', 'high', 'medium', 'low', 'info'])
      .optional()
      .describe('Filter by severity level'),
    category: z
      .string()
      .optional()
      .describe('Filter by threat category (e.g., injection, manipulation)'),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe('Maximum number of results (max 100)'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (
    args: { severity?: string; category?: string; limit?: number },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `threats:${args.severity}:${args.category}:${args.limit}`;
        const cached = promptIntelCache.get(cacheKey);

        if (cached) {
          log.info('Returning cached threats');
          return cached;
        }

        const threats = await client.getPrompts({
          severity: args.severity,
          category: args.category,
          limit: Math.min(args.limit || 20, 100),
        });

        promptIntelCache.set(cacheKey, threats);
        return threats;
      }, 'searchThreats');

      logToolExecution(
        'promptintel:searchThreats',
        { severity: args.severity, category: args.category, limit: args.limit },
        true,
        durationMs
      );

      return JSON.stringify(
        {
          count: Array.isArray(result) ? result.length : 0,
          threats: result,
        },
        null,
        2
      );
    } catch (error) {
      logToolExecution(
        'promptintel:searchThreats',
        { severity: args.severity, category: args.category },
        false
      );
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 2: Get Taxonomy
// ============================================================================

server.addTool({
  name: 'promptintel:getTaxonomy',
  description:
    'Fetch threat taxonomy - hierarchical classification of attack techniques, defense strategies, and security categories.',
  parameters: z.object({
    limit: z
      .number()
      .optional()
      .default(50)
      .describe('Maximum number of taxonomy entries (max 100)'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (
    args: { limit?: number },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `taxonomy:${args.limit}`;
        const cached = promptIntelCache.get(cacheKey);

        if (cached) {
          log.info('Returning cached taxonomy');
          return cached;
        }

        const taxonomy = await client.getTaxonomy({
          limit: Math.min(args.limit || 50, 100),
        });

        promptIntelCache.set(cacheKey, taxonomy);
        return taxonomy;
      }, 'getTaxonomy');

      const taxonomyArray = Array.isArray(result) ? result : [result];
      const categories = new Set<string>();

      for (const item of taxonomyArray) {
        if (typeof item === 'object' && item !== null && 'category_type' in item) {
          const categoryType = (item as Record<string, unknown>).category_type;
          if (typeof categoryType === 'string') {
            categories.add(categoryType);
          }
        }
      }

      logToolExecution(
        'promptintel:getTaxonomy',
        { limit: args.limit },
        true,
        durationMs
      );

      return JSON.stringify(
        {
          count: taxonomyArray.length,
          categories: Array.from(categories),
          taxonomy: result,
        },
        null,
        2
      );
    } catch (error) {
      logToolExecution('promptintel:getTaxonomy', { limit: args.limit }, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 3: Submit Report
// ============================================================================

server.addTool({
  name: 'promptintel:submitReport',
  description:
    'Submit a security finding or vulnerability report to PromptIntel community. Helps contribute to collaborative threat intelligence.',
  parameters: z.object({
    agentName: z
      .string()
      .describe('Name of the agent or system being reported'),
    title: z.string().describe('Brief title of the finding'),
    description: z.string().describe('Detailed description of the vulnerability'),
    severity: z
      .enum(['critical', 'high', 'medium', 'low'])
      .describe('Severity level'),
    findings: z
      .any()
      .describe('Structured findings data (JSON object)'),
    metadata: z
      .any()
      .optional()
      .describe('Additional metadata'),
  }),
  annotations: {
    readOnlyHint: false,
    openWorldHint: true,
  },
  execute: async (
    args: {
      agentName: string;
      title: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      findings: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        return await client.submitReport({
          agent_name: args.agentName,
          title: args.title,
          description: args.description,
          severity: args.severity,
          findings: args.findings,
          metadata: args.metadata || {},
        });
      }, 'submitReport');

      logToolExecution(
        'promptintel:submitReport',
        { title: args.title, severity: args.severity },
        true,
        durationMs
      );

      return JSON.stringify(
        {
          success: true,
          report: {
            id: result?.id ?? 'unknown',
            title: result?.title ?? args.title,
            created_at: result?.created_at ?? new Date().toISOString(),
          },
          message: 'Report submitted successfully to PromptIntel community',
        },
        null,
        2
      );
    } catch (error) {
      logToolExecution(
        'promptintel:submitReport',
        { title: args.title, severity: args.severity },
        false
      );
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Resource 1: Critical Threats
// ============================================================================

server.addResource({
  uri: 'promptintel://threats/critical',
  name: 'Critical Threats',
  description: 'Critical severity threats from PromptIntel',
  mimeType: 'application/json',
  async load() {
    try {
      const cacheKey = 'resource:critical-threats';
      const cached = promptIntelCache.get(cacheKey);

      if (cached) {
        return {
          text: JSON.stringify(cached, null, 2),
        };
      }

      const threats = await client.getPrompts({
        severity: 'critical',
        limit: 10,
        order: 'created_at.desc',
      });

      promptIntelCache.set(cacheKey, threats);

      return {
        text: JSON.stringify(threats, null, 2),
      };
    } catch (error) {
      return {
        text: JSON.stringify(
          {
            error: 'Failed to fetch critical threats',
            message: error instanceof Error ? error.message : String(error),
          },
          null,
          2
        ),
      };
    }
  },
});

// ============================================================================
// Resource 2: Threat Taxonomy
// ============================================================================

server.addResource({
  uri: 'promptintel://taxonomy',
  name: 'Threat Taxonomy',
  description: 'Attack techniques and defense strategies taxonomy',
  mimeType: 'application/json',
  async load() {
    try {
      const cacheKey = 'resource:taxonomy';
      const cached = promptIntelCache.get(cacheKey);

      if (cached) {
        return {
          text: JSON.stringify(cached, null, 2),
        };
      }

      const taxonomy = await client.getTaxonomy({ limit: 50 });

      promptIntelCache.set(cacheKey, taxonomy);

      return {
        text: JSON.stringify(taxonomy, null, 2),
      };
    } catch (error) {
      return {
        text: JSON.stringify(
          {
            error: 'Failed to fetch taxonomy',
            message: error instanceof Error ? error.message : String(error),
          },
          null,
          2
        ),
      };
    }
  },
});

// ============================================================================
// Resource 3: API Health Status
// ============================================================================

server.addResource({
  uri: 'promptintel://health',
  name: 'PromptIntel API Health',
  description: 'Current status and health of PromptIntel API',
  mimeType: 'application/json',
  async load() {
    try {
      const cacheKey = 'resource:health';
      const cached = promptIntelCache.get(cacheKey);

      if (cached) {
        return {
          text: JSON.stringify(cached, null, 2),
        };
      }

      const health = await client.healthCheck();

      promptIntelCache.set(cacheKey, health);

      return {
        text: JSON.stringify(health, null, 2),
      };
    } catch (error) {
      return {
        text: JSON.stringify(
          {
            status: 'down',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      };
    }
  },
});

// ============================================================================
// Start Server
// ============================================================================

server.start({
  transportType: 'stdio',
});

console.warn('✅ PromptIntel MCP Server started (stdio mode)');

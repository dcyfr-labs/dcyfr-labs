/**
 * AI Agent Compatibility Layer
 *
 * Provides backward compatibility while migrating to the new tiered agent architecture:
 * - PUBLIC tier: @dcyfr/ai (15 generic agents)
 * - PRIVATE tier: @dcyfr/agents (17 DCYFR-specific agents)
 * - PROJECT tier: .claude/agents/ (project overrides)
 *
 * @module lib/ai-compat
 */

import type {
  Agent,
  AgentManifest,
  AgentRegistry as BaseAgentRegistry,
  AgentRouter as BaseAgentRouter,
} from '@dcyfr/ai';

/**
 * Task context for agent routing
 */
export interface TaskContext {
  description: string;
  filesInProgress?: string[];
  phase?: 'planning' | 'implementation' | 'testing' | 'review';
  requiresDesignTokens?: boolean;
  requiresDcyfrPatterns?: boolean;
}

/**
 * Agent routing result
 */
export interface RoutingResult {
  agent: Agent;
  tier: 'public' | 'private' | 'project';
  reasoning: string;
  delegationChain?: string[];
}

/**
 * Compatibility wrapper for AgentRegistry
 *
 * Provides a simplified interface for dcyfr-labs while using
 * the new tiered agent architecture underneath.
 */
export class AgentRegistry {
  private registry: BaseAgentRegistry | null = null;
  private initialized = false;

  constructor() {
    // Lazy initialization to avoid circular dependencies
  }

  /**
   * Initialize the registry with all three tiers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid bundling issues
      const { AgentRegistry: BaseRegistry } = await import('@dcyfr/ai');

      this.registry = new BaseRegistry({
        autoDiscover: true,
        public: {
          enabled: true,
          source: '@dcyfr/ai/agents-builtin',
        },
        private: {
          enabled: true,
          source: '@dcyfr/agents',
        },
        project: {
          enabled: true,
          paths: [
            '.claude/agents',
            '.github/agents',
          ],
        },
      });

      await this.registry.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AgentRegistry:', error);
      throw error;
    }
  }

  /**
   * Get a specific agent by name
   * Respects tier priority: project > private > public
   */
  async getAgent(name: string): Promise<Agent | null> {
    await this.ensureInitialized();
    return this.registry!.resolveAgent(name);
  }

  /**
   * List all available agents
   */
  async listAgents(): Promise<Agent[]> {
    await this.ensureInitialized();
    return this.registry!.getAllAgents();
  }

  /**
   * List agents by tier
   */
  async listAgentsByTier(tier: 'public' | 'private' | 'project'): Promise<Agent[]> {
    await this.ensureInitialized();
    return this.registry!.getAgentsByTier(tier);
  }

  /**
   * List agents by category
   */
  async listAgentsByCategory(
    category:
      | 'core'
      | 'development'
      | 'architecture'
      | 'testing'
      | 'security'
      | 'performance'
      | 'content'
      | 'design'
      | 'devops'
      | 'data'
      | 'research'
      | 'specialized'
  ): Promise<Agent[]> {
    await this.ensureInitialized();
    return this.registry!.getAgentsByCategory(category);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

/**
 * Compatibility wrapper for AgentRouter
 *
 * Routes tasks to the most appropriate agent based on context
 */
export class AgentRouter {
  private router: BaseAgentRouter | null = null;
  private registry: AgentRegistry;

  constructor(registry?: AgentRegistry) {
    this.registry = registry || new AgentRegistry();
  }

  /**
   * Route a task to the most appropriate agent
   */
  async route(context: TaskContext): Promise<RoutingResult> {
    await this.registry.initialize();

    try {
      const { AgentRouter: BaseRouter } = await import('@dcyfr/ai');

      if (!this.router) {
        this.router = new BaseRouter(this.registry['registry']!);
      }

      const result = await this.router.route({
        description: context.description,
        files: context.filesInProgress || [],
        phase: context.phase || 'implementation',
        metadata: {
          requiresDesignTokens: context.requiresDesignTokens,
          requiresDcyfrPatterns: context.requiresDcyfrPatterns,
        },
      });

      return {
        agent: result.agent,
        tier: result.agent.manifest.tier as 'public' | 'private' | 'project',
        reasoning: result.reasoning,
        delegationChain: result.agent.manifest.delegatesTo,
      };
    } catch (error) {
      console.error('Failed to route task:', error);
      throw error;
    }
  }

  /**
   * Get routing suggestions for a task (dry run)
   */
  async suggest(context: TaskContext): Promise<RoutingResult[]> {
    await this.registry.initialize();

    try {
      const { AgentRouter: BaseRouter } = await import('@dcyfr/ai');

      if (!this.router) {
        this.router = new BaseRouter(this.registry['registry']!);
      }

      const suggestions = await this.router.suggest({
        description: context.description,
        files: context.filesInProgress || [],
        phase: context.phase || 'implementation',
      });

      return suggestions.map((s) => ({
        agent: s.agent,
        tier: s.agent.manifest.tier as 'public' | 'private' | 'project',
        reasoning: s.reasoning,
        delegationChain: s.agent.manifest.delegatesTo,
      }));
    } catch (error) {
      console.error('Failed to get routing suggestions:', error);
      throw error;
    }
  }
}

/**
 * Singleton registry instance for dcyfr-labs
 */
let globalRegistry: AgentRegistry | null = null;

/**
 * Get the global agent registry instance
 */
export function getAgentRegistry(): AgentRegistry {
  if (!globalRegistry) {
    globalRegistry = new AgentRegistry();
  }
  return globalRegistry;
}

/**
 * Get the global agent router instance
 */
export function getAgentRouter(): AgentRouter {
  const registry = getAgentRegistry();
  return new AgentRouter(registry);
}

/**
 * Helper: Route a task to an agent
 *
 * @example
 * ```typescript
 * const result = await routeTask({
 *   description: 'Fix design token violations in header',
 *   filesInProgress: ['src/components/header.tsx'],
 *   requiresDesignTokens: true,
 * });
 *
 * console.log(`Routed to: ${result.agent.manifest.name} (${result.tier})`);
 * // Output: "Routed to: design-specialist (private)"
 * ```
 */
export async function routeTask(context: TaskContext): Promise<RoutingResult> {
  const router = getAgentRouter();
  return router.route(context);
}

/**
 * Helper: Get an agent by name
 *
 * @example
 * ```typescript
 * const dcyfr = await getAgent('dcyfr');
 * if (dcyfr) {
 *   console.log(dcyfr.manifest.description);
 * }
 * ```
 */
export async function getAgent(name: string): Promise<Agent | null> {
  const registry = getAgentRegistry();
  return registry.getAgent(name);
}

/**
 * Helper: List all DCYFR-specific agents (private + project tiers)
 *
 * @example
 * ```typescript
 * const dcyfrAgents = await listDcyfrAgents();
 * console.log(`Found ${dcyfrAgents.length} DCYFR agents`);
 * ```
 */
export async function listDcyfrAgents(): Promise<Agent[]> {
  const registry = getAgentRegistry();
  await registry.initialize();

  const [privateAgents, projectAgents] = await Promise.all([
    registry.listAgentsByTier('private'),
    registry.listAgentsByTier('project'),
  ]);

  return [...privateAgents, ...projectAgents];
}

/**
 * Helper: List all generic agents (public tier)
 *
 * @example
 * ```typescript
 * const genericAgents = await listGenericAgents();
 * console.log(`Found ${genericAgents.length} generic agents`);
 * ```
 */
export async function listGenericAgents(): Promise<Agent[]> {
  const registry = getAgentRegistry();
  return registry.listAgentsByTier('public');
}

/**
 * Helper: Validate design token compliance
 *
 * @example
 * ```typescript
 * const result = await validateDesignTokens(['src/components/header.tsx']);
 * if (result.compliance < 90) {
 *   console.error('Design token compliance below threshold!');
 * }
 * ```
 */
export async function validateDesignTokens(
  files: string[]
): Promise<{ compliance: number; violations: string[]; suggestions: string[] }> {
  try {
    const { validateTokenUsage } = await import('@dcyfr/agents/enforcement/design-tokens');

    const results = await Promise.all(files.map((file) => validateTokenUsage(file)));

    const totalChecks = results.reduce((sum, r) => sum + r.totalChecks, 0);
    const violations = results.flatMap((r) => r.violations);
    const compliance = totalChecks > 0 ? ((totalChecks - violations.length) / totalChecks) * 100 : 100;

    return {
      compliance: Math.round(compliance * 100) / 100,
      violations: violations.map((v) => v.message),
      suggestions: violations.map((v) => v.fix),
    };
  } catch (error) {
    console.error('Failed to validate design tokens:', error);
    return { compliance: 0, violations: [], suggestions: [] };
  }
}

/**
 * Helper: Check if a change requires approval
 *
 * @example
 * ```typescript
 * const needsApproval = await requiresApproval({
 *   type: 'breaking',
 *   scope: 'api',
 *   files: ['src/app/api/users/route.ts'],
 * });
 *
 * if (needsApproval) {
 *   console.log('This change requires manual approval');
 * }
 * ```
 */
export async function requiresApproval(change: {
  type: 'breaking' | 'security' | 'architecture';
  scope: string;
  files: string[];
}): Promise<boolean> {
  try {
    const { requiresApproval: checkApproval } = await import(
      '@dcyfr/agents/enforcement/approval-gates'
    );

    return checkApproval(change.type, change.scope, change.files);
  } catch (error) {
    console.error('Failed to check approval requirements:', error);
    // Default to requiring approval if check fails
    return true;
  }
}

/**
 * Type re-exports for convenience
 */
export type { Agent, AgentManifest };

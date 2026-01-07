/**
 * Agent Telemetry Tracking System (v1.0)
 *
 * Tracks agent usage, quality metrics, costs, and performance across all AI providers.
 * Provides data-driven insights for optimizing agent allocation and cost management.
 *
 * Features:
 * - Usage tracking (time, tasks, outcomes)
 * - Quality metrics (compliance, test pass rate, violations)
 * - Cost tracking (API usage, estimated costs)
 * - Performance metrics (completion time, efficiency)
 * - Handoff analytics (provider switching patterns)
 *
 * @example
 * ```typescript
 * import { telemetry } from '@/lib/agents/agent-telemetry';
 *
 * // Start tracking a task
 * const session = telemetry.startSession('claude', {
 *   taskType: 'feature',
 *   description: 'Implement dark mode',
 * });
 *
 * // Record metrics during execution
 * session.recordMetric('token_compliance', 0.98);
 * session.recordMetric('test_pass_rate', 0.995);
 *
 * // End session
 * const result = session.end('success');
 *
 * // Get analytics
 * const stats = await telemetry.getAgentStats('claude', '30d');
 * ```
 */

export type AgentType = "claude" | "copilot" | "groq" | "ollama";
export type TaskType =
  | "feature"
  | "bug"
  | "refactor"
  | "quick-fix"
  | "research";
export type TaskOutcome = "success" | "escalated" | "failed";
export type ValidationStatus = "pass" | "fail" | "pending" | "skipped";

export interface TelemetrySession {
  sessionId: string;
  agent: AgentType;
  taskType: TaskType;
  taskDescription: string;
  startTime: Date;
  endTime?: Date;
  outcome?: TaskOutcome;
  metrics: TelemetryMetrics;
  violations: ViolationRecord[];
  handoffs: HandoffRecord[];
  cost: CostEstimate;
}

export interface TelemetryMetrics {
  // Quality Metrics
  tokenCompliance: number; // 0-1 (% using design tokens)
  testPassRate: number; // 0-1 (% tests passing)
  lintViolations: number; // Count of ESLint violations
  typeErrors: number; // Count of TypeScript errors

  // Performance Metrics
  executionTime: number; // ms
  tokensUsed: number; // API tokens consumed
  filesModified: number; // Number of files changed
  linesChanged: number; // Total lines added/removed

  // Validation Status
  validations: {
    typescript: ValidationStatus;
    eslint: ValidationStatus;
    tests: ValidationStatus;
    designTokens: ValidationStatus;
    security: ValidationStatus;
  };
}

export interface ViolationRecord {
  timestamp: Date;
  type: "design-token" | "eslint" | "typescript" | "test" | "security";
  severity: "error" | "warning";
  message: string;
  file?: string;
  line?: number;
  fixed: boolean;
}

export interface HandoffRecord {
  timestamp: Date;
  fromAgent: AgentType;
  toAgent: AgentType;
  reason: "rate-limit" | "quality" | "manual" | "cost-optimization" | "offline";
  automatic: boolean;
}

export interface CostEstimate {
  provider: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number; // USD
  currency: "USD";
}

export interface AgentStats {
  agent: AgentType;
  period: string; // e.g., '30d', '7d', 'all-time'
  totalSessions: number;
  totalTime: number; // ms
  averageSessionTime: number; // ms
  outcomes: {
    success: number;
    escalated: number;
    failed: number;
  };
  quality: {
    averageTokenCompliance: number;
    averageTestPassRate: number;
    totalViolations: number;
    violationsFixed: number;
  };
  performance: {
    averageExecutionTime: number;
    totalTokensUsed: number;
    averageFilesModified: number;
  };
  cost: {
    totalCost: number;
    averageCostPerSession: number;
    costByTaskType: Record<TaskType, number>;
  };
  taskTypes: Record<TaskType, number>;
}

export interface ComparisonStats {
  period: string;
  agents: Record<AgentType, AgentStats>;
  recommendations: string[];
}

/**
 * Telemetry Session Manager
 */
export class TelemetrySessionManager {
  private session: TelemetrySession;
  private startTime: number;

  constructor(
    sessionId: string,
    agent: AgentType,
    taskType: TaskType,
    taskDescription: string
  ) {
    this.startTime = Date.now();
    this.session = {
      sessionId,
      agent,
      taskType,
      taskDescription,
      startTime: new Date(),
      metrics: {
        tokenCompliance: 0,
        testPassRate: 0,
        lintViolations: 0,
        typeErrors: 0,
        executionTime: 0,
        tokensUsed: 0,
        filesModified: 0,
        linesChanged: 0,
        validations: {
          typescript: "pending",
          eslint: "pending",
          tests: "pending",
          designTokens: "pending",
          security: "pending",
        },
      },
      violations: [],
      handoffs: [],
      cost: {
        provider: agent,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        currency: "USD",
      },
    };
  }

  /**
   * Record a metric value
   */
  recordMetric(
    metric: keyof Omit<TelemetryMetrics, "validations">,
    value: number
  ): void {
    this.session.metrics[metric] = value;
  }

  /**
   * Record validation status
   */
  recordValidation(
    validation: keyof TelemetryMetrics["validations"],
    status: ValidationStatus
  ): void {
    this.session.metrics.validations[validation] = status;
  }

  /**
   * Record a violation
   */
  recordViolation(violation: Omit<ViolationRecord, "timestamp">): void {
    this.session.violations.push({
      timestamp: new Date(),
      ...violation,
    });

    // Update violation count
    if (violation.type === "eslint") {
      this.session.metrics.lintViolations++;
    } else if (violation.type === "typescript") {
      this.session.metrics.typeErrors++;
    }
  }

  /**
   * Record a handoff to another agent
   */
  recordHandoff(handoff: Omit<HandoffRecord, "timestamp" | "fromAgent">): void {
    this.session.handoffs.push({
      timestamp: new Date(),
      fromAgent: this.session.agent,
      ...handoff,
    });
  }

  /**
   * Update cost estimate
   */
  updateCost(inputTokens: number, outputTokens: number): void {
    this.session.cost.inputTokens += inputTokens;
    this.session.cost.outputTokens += outputTokens;

    // Calculate cost based on provider
    const costPerMillionTokens = this.getCostPerMillionTokens(
      this.session.agent
    );
    const totalTokens = inputTokens + outputTokens;
    this.session.cost.estimatedCost +=
      (totalTokens / 1_000_000) * costPerMillionTokens;

    // Update tokens used metric
    this.session.metrics.tokensUsed = totalTokens;
  }

  private getCostPerMillionTokens(agent: AgentType): number {
    const costs: Record<AgentType, number> = {
      claude: 15, // $15 per 1M tokens (Sonnet 3.5)
      copilot: 0.1, // Included in subscription
      groq: 0, // Free tier
      ollama: 0, // Local
    };
    return costs[agent];
  }

  /**
   * End the session and return final metrics
   */
  end(outcome: TaskOutcome): TelemetrySession {
    this.session.endTime = new Date();
    this.session.outcome = outcome;
    this.session.metrics.executionTime = Date.now() - this.startTime;

    // Save to storage
    saveTelemetrySession(this.session);

    return this.session;
  }

  /**
   * Get current session data
   */
  getSession(): TelemetrySession {
    return { ...this.session };
  }
}

/**
 * Main Telemetry Manager
 */
export class AgentTelemetryManager {
  private activeSessions: Map<string, TelemetrySessionManager>;
  private storageKey = "agent-telemetry";

  constructor() {
    this.activeSessions = new Map();
  }

  /**
   * Start a new telemetry session
   */
  startSession(
    agent: AgentType,
    options: {
      taskType: TaskType;
      description: string;
    }
  ): TelemetrySessionManager {
    const sessionId = this.generateSessionId();
    const session = new TelemetrySessionManager(
      sessionId,
      agent,
      options.taskType,
      options.description
    );

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Get an active session
   */
  getSession(sessionId: string): TelemetrySessionManager | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * End a session
   */
  endSession(sessionId: string, outcome: TaskOutcome): TelemetrySession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    const result = session.end(outcome);
    this.activeSessions.delete(sessionId);
    return result;
  }

  /**
   * Get statistics for a specific agent
   */
  async getAgentStats(agent: AgentType, period = "30d"): Promise<AgentStats> {
    const sessions = await this.getSessionsForPeriod(agent, period);

    const totalSessions = sessions.length;
    const totalTime = sessions.reduce(
      (sum, s) => sum + s.metrics.executionTime,
      0
    );
    const averageExecutionTime = totalTime / totalSessions || 0;
    const averageSessionTime = averageExecutionTime; // Same metric, different context

    const outcomes = {
      success: sessions.filter((s) => s.outcome === "success").length,
      escalated: sessions.filter((s) => s.outcome === "escalated").length,
      failed: sessions.filter((s) => s.outcome === "failed").length,
    };

    const quality = {
      averageTokenCompliance:
        sessions.reduce((sum, s) => sum + s.metrics.tokenCompliance, 0) /
          totalSessions || 0,
      averageTestPassRate:
        sessions.reduce((sum, s) => sum + s.metrics.testPassRate, 0) /
          totalSessions || 0,
      totalViolations: sessions.reduce(
        (sum, s) => sum + s.violations.length,
        0
      ),
      violationsFixed: sessions.reduce(
        (sum, s) => sum + s.violations.filter((v) => v.fixed).length,
        0
      ),
    };

    const performance = {
      averageExecutionTime,
      totalTokensUsed: sessions.reduce(
        (sum, s) => sum + s.metrics.tokensUsed,
        0
      ),
      averageFilesModified:
        sessions.reduce((sum, s) => sum + s.metrics.filesModified, 0) /
          totalSessions || 0,
    };

    const cost = {
      totalCost: sessions.reduce((sum, s) => sum + s.cost.estimatedCost, 0),
      averageCostPerSession:
        sessions.reduce((sum, s) => sum + s.cost.estimatedCost, 0) /
          totalSessions || 0,
      costByTaskType: this.calculateCostByTaskType(sessions),
    };

    const taskTypes = sessions.reduce(
      (acc, s) => {
        acc[s.taskType] = (acc[s.taskType] || 0) + 1;
        return acc;
      },
      {} as Record<TaskType, number>
    );

    return {
      agent,
      period,
      totalSessions,
      totalTime,
      averageSessionTime,
      outcomes,
      quality,
      performance,
      cost,
      taskTypes,
    };
  }

  /**
   * Compare stats across all agents
   */
  async compareAgents(period = "30d"): Promise<ComparisonStats> {
    const agents: AgentType[] = ["claude", "copilot", "groq", "ollama"];
    const stats: Record<AgentType, AgentStats> = {} as Record<
      AgentType,
      AgentStats
    >;

    for (const agent of agents) {
      stats[agent] = await this.getAgentStats(agent, period);
    }

    const recommendations = this.generateRecommendations(stats);

    return {
      period,
      agents: stats,
      recommendations,
    };
  }

  /**
   * Get handoff patterns
   */
  async getHandoffPatterns(period = "30d"): Promise<{
    totalHandoffs: number;
    byReason: Record<HandoffRecord["reason"], number>;
    mostCommonPath: string;
    automaticVsManual: { automatic: number; manual: number };
  }> {
    const sessions = await this.getAllSessionsForPeriod(period);
    const allHandoffs = sessions.flatMap((s) => s.handoffs);

    const totalHandoffs = allHandoffs.length;

    const byReason = allHandoffs.reduce(
      (acc, h) => {
        acc[h.reason] = (acc[h.reason] || 0) + 1;
        return acc;
      },
      {} as Record<HandoffRecord["reason"], number>
    );

    const paths: Record<string, number> = {};
    allHandoffs.forEach((h) => {
      const path = `${h.fromAgent} → ${h.toAgent}`;
      paths[path] = (paths[path] || 0) + 1;
    });

    const mostCommonPath =
      Object.entries(paths).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    const automaticVsManual = {
      automatic: allHandoffs.filter((h) => h.automatic).length,
      manual: allHandoffs.filter((h) => !h.automatic).length,
    };

    return {
      totalHandoffs,
      byReason,
      mostCommonPath,
      automaticVsManual,
    };
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getSessionsForPeriod(
    agent: AgentType,
    period: string
  ): Promise<TelemetrySession[]> {
    const allSessions = await loadTelemetrySessions();
    const cutoffDate = this.getPeriodCutoffDate(period);

    return allSessions.filter(
      (s) => s.agent === agent && s.startTime >= cutoffDate
    );
  }

  private async getAllSessionsForPeriod(
    period: string
  ): Promise<TelemetrySession[]> {
    const allSessions = await loadTelemetrySessions();
    const cutoffDate = this.getPeriodCutoffDate(period);

    return allSessions.filter((s) => s.startTime >= cutoffDate);
  }

  private getPeriodCutoffDate(period: string): Date {
    const now = new Date();
    const match = period.match(/(\d+)([dhm])/);

    if (!match) return new Date(0); // All time

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
      case "h":
        return new Date(now.getTime() - value * 60 * 60 * 1000);
      case "m":
        return new Date(now.getTime() - value * 60 * 1000);
      default:
        return new Date(0);
    }
  }

  private calculateCostByTaskType(
    sessions: TelemetrySession[]
  ): Record<TaskType, number> {
    return sessions.reduce(
      (acc, s) => {
        acc[s.taskType] = (acc[s.taskType] || 0) + s.cost.estimatedCost;
        return acc;
      },
      {} as Record<TaskType, number>
    );
  }

  private generateRecommendations(
    stats: Record<AgentType, AgentStats>
  ): string[] {
    const recommendations: string[] = [];

    // Analyze quality metrics
    const bestQuality = Object.entries(stats).sort(
      (a, b) =>
        b[1].quality.averageTokenCompliance -
        a[1].quality.averageTokenCompliance
    )[0];

    recommendations.push(
      `Use ${bestQuality[0]} for highest quality work (${(bestQuality[1].quality.averageTokenCompliance * 100).toFixed(1)}% token compliance)`
    );

    // Analyze cost efficiency
    const freeAgents = Object.entries(stats).filter(
      ([, s]) => s.cost.totalCost === 0
    );

    if (freeAgents.length > 0) {
      recommendations.push(
        `Use ${freeAgents.map(([agent]) => agent).join(" or ")} for cost optimization (free tier)`
      );
    }

    // Analyze task type patterns
    Object.entries(stats).forEach(([agent, agentStats]) => {
      const topTaskType = Object.entries(agentStats.taskTypes).sort(
        (a, b) => b[1] - a[1]
      )[0];

      if (topTaskType) {
        recommendations.push(
          `${agent} is most used for ${topTaskType[0]} tasks (${topTaskType[1]} sessions)`
        );
      }
    });

    return recommendations;
  }
}

/**
 * Storage functions (placeholder - implement with your storage layer)
 */
function saveTelemetrySession(session: TelemetrySession): void {
  // In production, save to database/Redis/file
  // For now, use localStorage in browser or file in Node.js
  if (typeof window !== "undefined") {
    const existing = JSON.parse(
      localStorage.getItem("agent-telemetry") || "[]"
    );
    existing.push(session);
    localStorage.setItem("agent-telemetry", JSON.stringify(existing));
  } else {
    // Node.js environment - append to file
    // (Actual implementation would use fs.appendFileSync or database)
    console.warn("Telemetry session saved:", session.sessionId);
  }
}

async function loadTelemetrySessions(): Promise<TelemetrySession[]> {
  // In production, load from database/Redis/file
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("agent-telemetry") || "[]");
  } else {
    // Node.js environment - read from file
    // (Actual implementation would use fs.readFileSync or database)
    return [];
  }
}

/**
 * Singleton telemetry instance
 */
export const telemetry = new AgentTelemetryManager();

/**
 * Convenience function to start tracking
 */
export function trackAgentSession(
  agent: AgentType,
  taskType: TaskType,
  description: string
): TelemetrySessionManager {
  return telemetry.startSession(agent, { taskType, description });
}

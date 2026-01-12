/**
 * Unified AI Cost Aggregator
 *
 * Combines cost and usage data from all AI sources:
 * - Claude Code (sessions tracked via telemetry)
 * - GitHub Copilot/VS Code (tracked via OpenCode)
 * - OpenCode.ai (native tracking)
 *
 * Provides unified view of spending, token usage, and cost efficiency
 */

import { telemetry, type AgentType } from './agents/agent-telemetry';
import { getMonthlyUsage, getHistoricalUsage } from './api-usage-tracker';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CostSourceType = 'claude-code' | 'copilot-vscode' | 'opencode' | 'all';
export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface UnifiedCostData {
  timestamp: Date;
  period: TimeRange;
  sources: {
    claudeCode: ClaudeCodeCost;
    copilotVSCode: CopilotCost;
    opencode: OpencodeCost;
  };
  summary: CostSummary;
  trends: CostTrends;
  recommendations: CostRecommendation[];
}

export interface ClaudeCodeCost {
  agent: AgentType;
  sessions: number;
  successRate: number;
  totalTokens: number;
  estimatedCost: number; // Estimated based on token count
  costBreakdown: {
    byTaskType: Record<string, number>;
    byOutcome: Record<string, number>;
  };
  qualityMetrics: {
    tokenCompliance: number;
    testPassRate: number;
    violationsFixed: number;
  };
  period: TimeRange;
}

export interface CopilotCost {
  sessions: number;
  totalTokens: number;
  costPerMonth: number; // Flat $20/month
  costPerSession: number;
  averageTokensPerSession: number;
  qualityRating: number; // 1-5
  violationRate: number; // % of sessions with violations
  period: TimeRange;
}

export interface OpencodeCost {
  sessions: number;
  totalTokens: number;
  estimatedCost: number; // If using premium models
  costByModel: {
    'gpt-5-mini': number; // $0 (included)
    'raptor-mini': number; // $0 (included)
    'claude-sonnet': number; // $X if used
  };
  qualityMetrics: {
    averageQuality: number; // 1-5
    taskBreakdown: Record<string, number>;
  };
  period: TimeRange;
}

export interface CostSummary {
  totalCost: number;
  totalSessions: number;
  totalTokens: number;
  averageCostPerSession: number;
  averageTokensPerSession: number;
  mostUsedTool: CostSourceType;
  costBySource: Record<CostSourceType, number>;
  monthlyBudgetUsed: number;
  estimatedMonthlyTotal: number;
}

export interface CostTrends {
  dailySpending: Array<{
    date: string;
    cost: number;
    sessions: number;
    tokens: number;
  }>;
  sourceDistribution: Record<CostSourceType, number>;
  costPerTaskType: Record<string, number>;
  efficiencyTrend: 'improving' | 'stable' | 'declining';
}

export interface CostRecommendation {
  id: string;
  category: 'cost-optimization' | 'quality-improvement' | 'budget-alert';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  estimatedSavings?: number;
  action: string;
}

// ============================================================================
// COST CALCULATOR CLASS
// ============================================================================

export class UnifiedCostAggregator {
  private readonly monthlyBudgetClaude = 480; // $480/month for Claude at full usage
  private readonly monthlyBudgetCopilot = 20; // $20/month flat fee
  private readonly monthlyBudgetOpencode = 20; // $20/month GitHub Copilot (free models)
  private readonly monthlyBudgetTotal = 520; // Total budget

  /**
   * Get unified cost data across all sources
   */
  async getUnifiedCostData(period: TimeRange = '30d'): Promise<UnifiedCostData> {
    const [claudeData, copilotData, opencodeData] = await Promise.all([
      this.getClaudeCodeCost('claude', period),
      this.getCopilotCost(period),
      this.getOpencodeCost(period),
    ]);

    const summary = this.calculateSummary(claudeData, copilotData, opencodeData);
    const trends = this.calculateTrends(claudeData, copilotData, opencodeData);
    const recommendations = this.generateRecommendations(
      claudeData,
      copilotData,
      opencodeData,
      summary,
    );

    return {
      timestamp: new Date(),
      period,
      sources: {
        claudeCode: claudeData,
        copilotVSCode: copilotData,
        opencode: opencodeData,
      },
      summary,
      trends,
      recommendations,
    };
  }

  /**
   * Get Claude Code cost metrics
   */
  private async getClaudeCodeCost(agent: AgentType, period: TimeRange): Promise<ClaudeCodeCost> {
    try {
      const stats = await telemetry.getAgentStats(agent, period);

      // Estimate cost based on tokens (Claude Sonnet 4: $3 per 1M tokens)
      const estimatedCost = (stats.performance.totalTokensUsed / 1_000_000) * 3;

      return {
        agent,
        sessions: stats.totalSessions,
        successRate: stats.outcomes.success / stats.totalSessions,
        totalTokens: stats.performance.totalTokensUsed,
        estimatedCost,
        costBreakdown: {
          byTaskType: stats.cost.costByTaskType,
          byOutcome: {
            success: (stats.outcomes.success / stats.totalSessions) * estimatedCost,
            escalated: (stats.outcomes.escalated / stats.totalSessions) * estimatedCost,
            failed: (stats.outcomes.failed / stats.totalSessions) * estimatedCost,
          },
        },
        qualityMetrics: {
          tokenCompliance: stats.quality.averageTokenCompliance,
          testPassRate: stats.quality.averageTestPassRate,
          violationsFixed: stats.quality.violationsFixed,
        },
        period,
      };
    } catch (error) {
      console.warn(`Failed to fetch Claude Code metrics: ${error}`);
      return this.getEmptyClaudeCost(period);
    }
  }

  /**
   * Get GitHub Copilot cost metrics
   */
  private async getCopilotCost(period: TimeRange): Promise<CopilotCost> {
    try {
      // GitHub Copilot is flat-fee, but we can estimate sessions from OpenCode logs
      const opencodeStats = await this.getOpencodeStats(period);

      // Estimate monthly cost based on period
      const monthsDivisor = this.getMonthsDivisor(period);
      const monthlyFlatFee = this.monthlyBudgetCopilot;

      return {
        sessions: opencodeStats.sessions,
        totalTokens: opencodeStats.totalTokens,
        costPerMonth: monthlyFlatFee,
        costPerSession: monthlyFlatFee / Math.max(opencodeStats.sessions, 1),
        averageTokensPerSession: opencodeStats.totalTokens / Math.max(opencodeStats.sessions, 1),
        qualityRating: opencodeStats.averageQuality,
        violationRate: opencodeStats.violationRate,
        period,
      };
    } catch (error) {
      console.warn(`Failed to fetch Copilot metrics: ${error}`);
      return this.getEmptyCopilotCost(period);
    }
  }

  /**
   * Get OpenCode cost metrics
   */
  private async getOpencodeCost(period: TimeRange): Promise<OpencodeCost> {
    try {
      const stats = await this.getOpencodeStats(period);

      return {
        sessions: stats.sessions,
        totalTokens: stats.totalTokens,
        estimatedCost: 0, // GitHub Copilot models are free
        costByModel: {
          'gpt-5-mini': 0,
          'raptor-mini': 0,
          'claude-sonnet': stats.premiumModelTokens > 0 ? (stats.premiumModelTokens / 1_000_000) * 3 : 0,
        },
        qualityMetrics: {
          averageQuality: stats.averageQuality,
          taskBreakdown: stats.taskBreakdown,
        },
        period,
      };
    } catch (error) {
      console.warn(`Failed to fetch OpenCode metrics: ${error}`);
      return this.getEmptyOpencodeCost(period);
    }
  }

  /**
   * Read OpenCode session logs
   */
  private async getOpencodeStats(period: TimeRange): Promise<{
    sessions: number;
    totalTokens: number;
    premiumModelTokens: number;
    averageQuality: number;
    violationRate: number;
    taskBreakdown: Record<string, number>;
  }> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      // Read OpenCode session logs
      const logFile = path.join(process.cwd(), '.opencode/.session-log.jsonl');
      if (!fs.existsSync(logFile)) {
        return {
          sessions: 0,
          totalTokens: 0,
          premiumModelTokens: 0,
          averageQuality: 3,
          violationRate: 0,
          taskBreakdown: {},
        };
      }

      const lines = fs.readFileSync(logFile, 'utf-8').trim().split('\n');
      const sessions = lines.map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Filter by date range
      const filteredSessions = this.filterByDateRange(sessions, period);

      // Calculate metrics with safe property access
      const totalTokens = filteredSessions.reduce((sum, s: any) => sum + (s.estimatedTotalTokens || s.tokens || 0), 0);
      const averageQuality =
        filteredSessions.reduce((sum, s: any) => sum + (s.quality || 3), 0) / Math.max(filteredSessions.length, 1);

      // Count task types
      const taskBreakdown: Record<string, number> = {};
      filteredSessions.forEach((s: any) => {
        const task = s.task || 'unknown';
        taskBreakdown[task] = (taskBreakdown[task] || 0) + 1;
      });

      return {
        sessions: filteredSessions.length,
        totalTokens,
        premiumModelTokens: 0, // Assuming only GitHub Copilot used
        averageQuality,
        violationRate: 0, // Not tracked in OpenCode
        taskBreakdown,
      };
    } catch (error) {
      console.warn(`Failed to read OpenCode stats: ${error}`);
      return {
        sessions: 0,
        totalTokens: 0,
        premiumModelTokens: 0,
        averageQuality: 3,
        violationRate: 0,
        taskBreakdown: {},
      };
    }
  }

  /**
   * Calculate aggregated summary
   */
  private calculateSummary(
    claude: ClaudeCodeCost,
    copilot: CopilotCost,
    opencode: OpencodeCost,
  ): CostSummary {
    const totalCost = claude.estimatedCost + copilot.costPerMonth + opencode.estimatedCost;
    const totalSessions = claude.sessions + copilot.sessions + opencode.sessions;
    const totalTokens = claude.totalTokens + copilot.totalTokens + opencode.totalTokens;

    return {
      totalCost,
      totalSessions,
      totalTokens,
      averageCostPerSession: totalCost / Math.max(totalSessions, 1),
      averageTokensPerSession: totalTokens / Math.max(totalSessions, 1),
      mostUsedTool:
        copilot.sessions > claude.sessions && copilot.sessions > opencode.sessions
          ? 'copilot-vscode'
          : opencode.sessions > claude.sessions
            ? 'opencode'
            : 'claude-code',
      costBySource: {
        'claude-code': claude.estimatedCost,
        'copilot-vscode': copilot.costPerMonth,
        opencode: opencode.estimatedCost,
        all: totalCost,
      },
      monthlyBudgetUsed: (totalCost / this.monthlyBudgetTotal) * 100,
      estimatedMonthlyTotal: this.estimateMonthly(totalCost),
    };
  }

  /**
   * Calculate cost trends
   */
  private calculateTrends(
    claude: ClaudeCodeCost,
    copilot: CopilotCost,
    opencode: OpencodeCost,
  ): CostTrends {
    return {
      dailySpending: this.generateDailySpending(claude, copilot, opencode),
      sourceDistribution: {
        'claude-code': claude.estimatedCost,
        'copilot-vscode': copilot.costPerMonth,
        opencode: opencode.estimatedCost,
        all: claude.estimatedCost + copilot.costPerMonth + opencode.estimatedCost,
      },
      costPerTaskType: this.aggregateTaskTypeCosts(claude, opencode),
      efficiencyTrend: this.calculateEfficiencyTrend(claude, copilot, opencode),
    };
  }

  /**
   * Generate cost optimization recommendations
   */
  private generateRecommendations(
    claude: ClaudeCodeCost,
    copilot: CopilotCost,
    opencode: OpencodeCost,
    summary: CostSummary,
  ): CostRecommendation[] {
    const recommendations: CostRecommendation[] = [];

    // Budget alert
    if (summary.monthlyBudgetUsed > 90) {
      recommendations.push({
        id: 'budget-critical',
        category: 'budget-alert',
        severity: 'critical',
        title: 'Budget Limit Approaching',
        description: `You have used ${summary.monthlyBudgetUsed.toFixed(1)}% of your monthly budget. Current spending: $${summary.totalCost.toFixed(2)}`,
        estimatedSavings: 0,
        action: 'Review usage patterns and consider cost optimization',
      });
    } else if (summary.monthlyBudgetUsed > 70) {
      recommendations.push({
        id: 'budget-warning',
        category: 'budget-alert',
        severity: 'warning',
        title: 'Budget Usage High',
        description: `You have used ${summary.monthlyBudgetUsed.toFixed(1)}% of your monthly budget. Current spending: $${summary.totalCost.toFixed(2)}`,
        estimatedSavings: 0,
        action: 'Monitor spending and optimize usage',
      });
    }

    // Claude Code optimization
    if (claude.sessions > 0 && claude.successRate < 0.8) {
      recommendations.push({
        id: 'claude-success-rate',
        category: 'quality-improvement',
        severity: 'warning',
        title: 'Claude Code Success Rate Low',
        description: `Claude Code has ${(claude.successRate * 100).toFixed(1)}% success rate. Consider escalating complex tasks to improve outcomes.`,
        estimatedSavings: Number((claude.estimatedCost * 0.2).toFixed(2)),
        action: 'Use escalation workflow for complex architectural work',
      });
    }

    // Copilot violation rate
    if (copilot.violationRate > 0.1) {
      recommendations.push({
        id: 'copilot-violations',
        category: 'quality-improvement',
        severity: 'warning',
        title: 'GitHub Copilot Violation Rate High',
        description: `${(copilot.violationRate * 100).toFixed(1)}% of sessions had DCYFR violations. Add validation checks.`,
        estimatedSavings: 0,
        action: 'Enable enhanced validation: npm run check:opencode',
      });
    }

    // OpenCode GitHub Copilot optimization
    if (opencode.sessions > 0) {
      const allFreeModels = Object.values(opencode.costByModel).every((cost) => cost === 0);
      if (allFreeModels) {
        recommendations.push({
          id: 'opencode-optimized',
          category: 'cost-optimization',
          severity: 'info',
          title: 'OpenCode Optimized for Cost',
          description: `All OpenCode sessions use free GitHub Copilot models. You are saving $${(opencode.totalTokens / 1_000_000 * 3).toFixed(2)} vs Claude.`,
          estimatedSavings: opencode.totalTokens / 1_000_000 * 3,
          action: 'Continue current strategy - OpenCode is cost-effective for routine work',
        });
      }
    }

    return recommendations;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getMonthsDivisor(period: TimeRange): number {
    switch (period) {
      case '7d':
        return 30 / 7;
      case '30d':
        return 1;
      case '90d':
        return 3;
      case 'all':
        return 1;
    }
  }

  private estimateMonthly(cost: number): number {
    // Simple estimation: assume current cost extrapolates to month
    return cost * 30;
  }

  private generateDailySpending(
    claude: ClaudeCodeCost,
    copilot: CopilotCost,
    opencode: OpencodeCost,
  ): Array<{
    date: string;
    cost: number;
    sessions: number;
    tokens: number;
  }> {
    // Placeholder: would generate from historical data
    return [];
  }

  private aggregateTaskTypeCosts(claude: ClaudeCodeCost, opencode: OpencodeCost): Record<string, number> {
    const combined: Record<string, number> = { ...claude.costBreakdown.byTaskType };
    Object.entries(opencode.qualityMetrics.taskBreakdown).forEach(([task, count]) => {
      combined[task] = (combined[task] || 0) + count;
    });
    return combined;
  }

  private calculateEfficiencyTrend(
    claude: ClaudeCodeCost,
    copilot: CopilotCost,
    opencode: OpencodeCost,
  ): 'improving' | 'stable' | 'declining' {
    // Placeholder: would compare metrics over time
    return 'stable';
  }

  private filterByDateRange(
    sessions: Array<{ timestamp: string }>,
    period: TimeRange,
  ): Array<{ timestamp: string }> {
    const now = new Date();
    let cutoffDate = new Date();

    switch (period) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        cutoffDate = new Date('1970-01-01');
    }

    return sessions.filter((s) => new Date(s.timestamp) >= cutoffDate);
  }

  private getEmptyClaudeCost(period: TimeRange): ClaudeCodeCost {
    return {
      agent: 'claude',
      sessions: 0,
      successRate: 0,
      totalTokens: 0,
      estimatedCost: 0,
      costBreakdown: { byTaskType: {}, byOutcome: {} },
      qualityMetrics: { tokenCompliance: 0, testPassRate: 0, violationsFixed: 0 },
      period,
    };
  }

  private getEmptyCopilotCost(period: TimeRange): CopilotCost {
    return {
      sessions: 0,
      totalTokens: 0,
      costPerMonth: this.monthlyBudgetCopilot,
      costPerSession: 0,
      averageTokensPerSession: 0,
      qualityRating: 0,
      violationRate: 0,
      period,
    };
  }

  private getEmptyOpencodeCost(period: TimeRange): OpencodeCost {
    return {
      sessions: 0,
      totalTokens: 0,
      estimatedCost: 0,
      costByModel: { 'gpt-5-mini': 0, 'raptor-mini': 0, 'claude-sonnet': 0 },
      qualityMetrics: { averageQuality: 0, taskBreakdown: {} },
      period,
    };
  }
}

// Export singleton instance
export const unifiedCostAggregator = new UnifiedCostAggregator();

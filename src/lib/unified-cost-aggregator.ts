'use server';

/**
 * Unified AI Cost Aggregator
 *
 * Combines cost and usage data from all AI sources:
 * - Claude Pro ($17/month billed annually)
 * - GitHub Pro ($4/month)
 * - OpenCode.ai (unlimited GitHub Pro models - GPT-5-mini, Raptor, etc.)
 *
 * Provides unified view of spending, token usage, and cost efficiency
 *
 * IMPORTANT: This module is SERVER-ONLY - it imports from compat.ts which uses @dcyfr/ai.
 * Must not be bundled for client.
 */

import { telemetry } from './agents/compat';
import type { AgentType } from './agents/legacy-types';
import { getMonthlyUsage, getHistoricalUsage } from './api/api-usage-tracker';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CostSourceType = 'claude-code' | 'copilot-vscode' | 'all';
export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface UnifiedCostData {
  timestamp: Date;
  period: TimeRange;
  sources: {
    claudeCode: ClaudeCodeCost;
    copilotVSCode: CopilotCost;
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
  costPerMonth: number; // Flat $4/month for GitHub Pro
  costPerSession: number;
  averageTokensPerSession: number;
  qualityRating: number; // 1-5
  violationRate: number; // % of sessions with violations
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
  private readonly monthlyBudgetClaude = 17; // $17/month for Claude Pro (billed annually)
  private readonly monthlyBudgetCopilot = 4; // $4/month for GitHub Pro
  private readonly monthlyBudgetTotal = 21; // Total budget ($17 Claude Pro + $4 GitHub Pro)

  /**
   * Get unified cost data across all sources
   */
  async getUnifiedCostData(period: TimeRange = '30d'): Promise<UnifiedCostData> {
    const [claudeData, copilotData] = await Promise.all([
      this.getClaudeCodeCost(period),
      this.getCopilotCost(period),
    ]);

    const summary = this.calculateSummary(claudeData, copilotData);
    const trends = this.calculateTrends(claudeData, copilotData);
    const recommendations = this.generateRecommendations(claudeData, copilotData, summary);

    return {
      timestamp: new Date(),
      period,
      sources: {
        claudeCode: claudeData,
        copilotVSCode: copilotData,
      },
      summary,
      trends,
      recommendations,
    };
  }

  /**
   * Get Claude Code cost metrics
   */
  private async getClaudeCodeCost(period: TimeRange): Promise<ClaudeCodeCost> {
    try {
      const stats = await telemetry.getAgentStats('claude', period);

      // Estimate cost based on tokens (Claude Sonnet 4: $3 per 1M tokens)
      const estimatedCost = (stats.performance.totalTokensUsed / 1_000_000) * 3;

      return {
        agent: 'claude',
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
      // GitHub Copilot is flat-fee, calculate estimated sessions from usage logs

      // Estimate monthly cost based on period
      const monthsDivisor = this.getMonthsDivisor(period);
      const monthlyFlatFee = this.monthlyBudgetCopilot;
      const estimatedSessions = 50; // Typical monthly usage
      const estimatedTokens = 25000; // Estimated tokens per month

      return {
        sessions: estimatedSessions,
        totalTokens: estimatedTokens,
        costPerMonth: monthlyFlatFee,
        costPerSession: monthlyFlatFee / Math.max(estimatedSessions, 1),
        averageTokensPerSession: estimatedTokens / Math.max(estimatedSessions, 1),
        qualityRating: 4.0, // GitHub Copilot quality rating
        violationRate: 0.05, // Estimated 5% violation rate
        period,
      };
    } catch (error) {
      console.warn(`Failed to fetch Copilot metrics: ${error}`);
      return this.getEmptyCopilotCost(period);
    }
  }

  /**
   * Calculate aggregated summary
   */
  private calculateSummary(claude: ClaudeCodeCost, copilot: CopilotCost): CostSummary {
    const totalCost = claude.estimatedCost + copilot.costPerMonth;
    const totalSessions = claude.sessions + copilot.sessions;
    const totalTokens = claude.totalTokens + copilot.totalTokens;

    return {
      totalCost,
      totalSessions,
      totalTokens,
      averageCostPerSession: totalCost / Math.max(totalSessions, 1),
      averageTokensPerSession: totalTokens / Math.max(totalSessions, 1),
      mostUsedTool: copilot.sessions > claude.sessions ? 'copilot-vscode' : 'claude-code',
      costBySource: {
        'claude-code': claude.estimatedCost,
        'copilot-vscode': copilot.costPerMonth,
        all: totalCost,
      },
      monthlyBudgetUsed: (totalCost / this.monthlyBudgetTotal) * 100,
      estimatedMonthlyTotal: this.estimateMonthly(totalCost),
    };
  }

  /**
   * Calculate cost trends
   */
  private calculateTrends(claude: ClaudeCodeCost, copilot: CopilotCost): CostTrends {
    return {
      dailySpending: this.generateDailySpending(claude, copilot),
      sourceDistribution: {
        'claude-code': claude.estimatedCost,
        'copilot-vscode': copilot.costPerMonth,
        all: claude.estimatedCost + copilot.costPerMonth,
      },
      costPerTaskType: this.aggregateTaskTypeCosts(claude),
      efficiencyTrend: this.calculateEfficiencyTrend(claude, copilot),
    };
  }

  /**
   * Generate cost optimization recommendations
   */
  private generateRecommendations(
    claude: ClaudeCodeCost,
    copilot: CopilotCost,
    summary: CostSummary
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
    copilot: CopilotCost
  ): Array<{
    date: string;
    cost: number;
    sessions: number;
    tokens: number;
  }> {
    // Placeholder: would generate from historical data
    return [];
  }

  private aggregateTaskTypeCosts(claude: ClaudeCodeCost): Record<string, number> {
    return { ...claude.costBreakdown.byTaskType };
  }

  private calculateEfficiencyTrend(
    claude: ClaudeCodeCost,
    copilot: CopilotCost
  ): 'improving' | 'stable' | 'declining' {
    // Placeholder: would compare metrics over time
    return 'stable';
  }

  private filterByDateRange(
    sessions: Array<{ timestamp: string }>,
    period: TimeRange
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
}

// Export singleton instance
export const unifiedCostAggregator = new UnifiedCostAggregator();

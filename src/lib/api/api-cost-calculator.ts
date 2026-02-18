/**
 * API Cost Calculator
 *
 * Provides cost estimation and budget tracking for all third-party API services.
 * Uses actual pricing from service providers to calculate monthly costs and
 * predict when limits will be reached.
 *
 * Services tracked:
 * - Perplexity AI (paid tiers)
 * - Resend (free tier, paid tiers)
 * - GreyNoise (free tier)
 * - Semantic Scholar (free)
 * - GitHub API (free with token)
 * - Redis/Upstash (free tier, paid tiers)
 * - Sentry (free tier, paid tiers)
 * - Inngest (free tier)
 */

import { getMonthlyUsage, getHistoricalUsage, type MonthlyUsageAggregate, type DailyUsageData } from './api-usage-tracker';

// ============================================================================
// PRICING MODELS
// ============================================================================

/**
 * Service pricing configuration
 * All costs in USD
 */
export const PRICING = {
  perplexity: {
    name: 'Perplexity AI',
    tiers: {
      free: {
        maxRequests: 5,
        cost: 0,
      },
      standard: {
        // Estimate: ~$0.005 per request (llama-3.1-sonar-small)
        costPerRequest: 0.005,
        costPer1kTokens: {
          prompt: 0.0002,
          completion: 0.0002,
        },
      },
    },
  },
  resend: {
    name: 'Resend Email',
    tiers: {
      free: {
        maxEmails: 3000,
        maxEmailsPerDay: 100,
        cost: 0,
      },
      pro: {
        maxEmails: 50000,
        cost: 20, // $20/month
        additionalPer1k: 1, // $1 per 1,000 additional emails
      },
    },
  },
  greynoise: {
    name: 'GreyNoise IP Reputation',
    tiers: {
      free: {
        maxRequests: 50000,
        cost: 0,
      },
      community: {
        maxRequests: 500000,
        cost: 0,
      },
    },
  },
  semanticScholar: {
    name: 'Semantic Scholar',
    tiers: {
      free: {
        rateLimit: '1 req/sec',
        cost: 0,
      },
    },
  },
  github: {
    name: 'GitHub API',
    tiers: {
      authenticated: {
        rateLimit: 5000, // per hour
        cost: 0,
      },
    },
  },
  redis: {
    name: 'Redis (Upstash)',
    tiers: {
      free: {
        maxCommands: 10000, // per day
        maxStorage: 256, // MB
        maxBandwidth: 200, // MB
        cost: 0,
      },
      payAsYouGo: {
        costPer100kCommands: 0.2, // $0.20 per 100K commands
        costPerGB: 0.25, // $0.25 per GB storage
      },
    },
  },
  sentry: {
    name: 'Sentry Error Tracking',
    tiers: {
      developer: {
        maxEvents: 5000,
        maxTransactions: 10000,
        cost: 0,
      },
      team: {
        maxEvents: 50000,
        maxTransactions: 100000,
        cost: 26, // $26/month
      },
    },
  },
  inngest: {
    name: 'Inngest Background Jobs',
    tiers: {
      hobby: {
        maxSteps: 'unlimited',
        cost: 0,
      },
    },
  },
} as const;

/**
 * Monthly budget allocation (in USD)
 */
export const BUDGET = {
  perplexity: 50, // $50/month max
  resend: 0, // Stay on free tier
  greynoise: 0, // Free tier sufficient
  semanticScholar: 0, // Free
  github: 0, // Free with token
  redis: 0, // Free tier sufficient
  sentry: 0, // Free tier sufficient
  inngest: 0, // Free tier sufficient
  total: 50, // $50/month total budget
} as const;

// ============================================================================
// COST CALCULATION
// ============================================================================

/**
 * Calculate cost for a service based on monthly usage
 */
export function calculateServiceCost(
  service: keyof typeof PRICING,
  usage: MonthlyUsageAggregate
): {
  estimatedCost: number;
  tier: string;
  breakdown: string;
  withinBudget: boolean;
} {
  const budget = BUDGET[service];

  if (service === 'perplexity') {
    const pricing = PRICING.perplexity;
    
    // Use actual cost from usage tracking if available
    if (usage.totalCost > 0) {
      return {
        estimatedCost: usage.totalCost,
        tier: 'standard',
        breakdown: `${usage.totalRequests} requests, ${usage.totalTokens} tokens`,
        withinBudget: usage.totalCost <= budget,
      };
    }
    
    // Fallback to request-based estimation
    const costPerRequest = pricing.tiers.standard.costPerRequest;
    const estimatedCost = usage.totalRequests * costPerRequest;
    
    return {
      estimatedCost,
      tier: 'standard',
      breakdown: `${usage.totalRequests} requests × $${costPerRequest}`,
      withinBudget: estimatedCost <= budget,
    };
  }

  if (service === 'resend') {
    const pricing = PRICING.resend;
    const free = pricing.tiers.free;
    const pro = pricing.tiers.pro;

    if (usage.totalRequests <= free.maxEmails) {
      return {
        estimatedCost: 0,
        tier: 'free',
        breakdown: `${usage.totalRequests}/${free.maxEmails} emails`,
        withinBudget: true,
      };
    }

    // Calculate pro tier cost
    const additional = usage.totalRequests - pro.maxEmails;
    const additionalCost = Math.ceil(additional / 1000) * pro.additionalPer1k;
    const totalCost = pro.cost + additionalCost;

    return {
      estimatedCost: totalCost,
      tier: 'pro',
      breakdown: `Base: $${pro.cost} + ${additional} additional emails`,
      withinBudget: totalCost <= budget,
    };
  }

  if (service === 'greynoise' || service === 'semanticScholar' || service === 'github' || service === 'inngest') {
    // All free services
    return {
      estimatedCost: 0,
      tier: 'free',
      breakdown: `${usage.totalRequests} requests (free tier)`,
      withinBudget: true,
    };
  }

  if (service === 'redis') {
    const pricing = PRICING.redis;
    const free = pricing.tiers.free;
    const payAsYouGo = pricing.tiers.payAsYouGo;

    // Calculate commands cost
    if (usage.totalRequests <= free.maxCommands * usage.daysActive) {
      return {
        estimatedCost: 0,
        tier: 'free',
        breakdown: `${usage.totalRequests} commands (within free tier)`,
        withinBudget: true,
      };
    }

    const excessCommands = usage.totalRequests - (free.maxCommands * usage.daysActive);
    const commandsCost = (excessCommands / 100000) * payAsYouGo.costPer100kCommands;

    return {
      estimatedCost: commandsCost,
      tier: 'pay-as-you-go',
      breakdown: `${excessCommands} excess commands × $${payAsYouGo.costPer100kCommands}/100K`,
      withinBudget: commandsCost <= budget,
    };
  }

  if (service === 'sentry') {
    const pricing = PRICING.sentry;
    const developer = pricing.tiers.developer;
    const team = pricing.tiers.team;

    if (usage.totalRequests <= developer.maxEvents) {
      return {
        estimatedCost: 0,
        tier: 'developer',
        breakdown: `${usage.totalRequests}/${developer.maxEvents} events`,
        withinBudget: true,
      };
    }

    if (usage.totalRequests <= team.maxEvents) {
      return {
        estimatedCost: team.cost,
        tier: 'team',
        breakdown: `${usage.totalRequests}/${team.maxEvents} events`,
        withinBudget: team.cost <= budget,
      };
    }

    // Over team limits
    return {
      estimatedCost: team.cost,
      tier: 'team (over limit)',
      breakdown: `${usage.totalRequests} events (exceeds team tier)`,
      withinBudget: false,
    };
  }

  // Default fallback
  return {
    estimatedCost: 0,
    tier: 'unknown',
    breakdown: 'No pricing data',
    withinBudget: true,
  };
}

/**
 * Calculate total monthly cost across all services
 */
export async function calculateMonthlyCost(month?: string): Promise<{
  services: Array<{
    service: string;
    usage: MonthlyUsageAggregate;
    cost: ReturnType<typeof calculateServiceCost>;
  }>;
  totalCost: number;
  totalBudget: number;
  percentUsed: number;
  withinBudget: boolean;
}> {
  const services = Object.keys(PRICING) as Array<keyof typeof PRICING>;
  const results: Array<{
    service: string;
    usage: MonthlyUsageAggregate;
    cost: ReturnType<typeof calculateServiceCost>;
  }> = [];

  for (const service of services) {
    const usage = await getMonthlyUsage(service, month);
    
    if (usage) {
      const cost = calculateServiceCost(service, usage);
      results.push({
        service,
        usage,
        cost,
      });
    }
  }

  const totalCost = results.reduce((sum, r) => sum + r.cost.estimatedCost, 0);
  const totalBudget = BUDGET.total;

  return {
    services: results,
    totalCost,
    totalBudget,
    percentUsed: (totalCost / totalBudget) * 100,
    withinBudget: totalCost <= totalBudget,
  };
}

// ============================================================================
// LIMIT PREDICTION
// ============================================================================

/**
 * Predict when a service will reach its limit based on current usage trends
 */
export async function predictLimitDate(
  service: keyof typeof PRICING,
  endpoint: string = 'default',
  daysToAnalyze: number = 7
): Promise<{
  daysUntilLimit: number | null;
  estimatedDate: Date | null;
  currentUsage: number;
  limit: number;
  averageDailyUsage: number;
  confidence: 'high' | 'medium' | 'low';
}> {
  // Get historical usage
  const history = await getHistoricalUsage(service, endpoint, daysToAnalyze);

  if (history.length === 0) {
    return {
      daysUntilLimit: null,
      estimatedDate: null,
      currentUsage: 0,
      limit: 0,
      averageDailyUsage: 0,
      confidence: 'low',
    };
  }

  // Calculate average daily usage
  const totalUsage = history.reduce((sum, day) => sum + day.count, 0);
  const averageDailyUsage = totalUsage / history.length;

  // Get service limit
  const limit = getServiceMonthlyLimit(service);
  const currentUsage = history[history.length - 1].count;

  // Calculate days until limit
  const remainingUsage = limit - currentUsage;
  const daysUntilLimit = averageDailyUsage > 0
    ? Math.floor(remainingUsage / averageDailyUsage)
    : null;

  // Estimate date
  const estimatedDate = daysUntilLimit !== null
    ? new Date(Date.now() + daysUntilLimit * 24 * 60 * 60 * 1000)
    : null;

  // Determine confidence based on data consistency
  const variance = calculateVariance(history.map(h => h.count));
  const confidence = variance < averageDailyUsage * 0.5
    ? 'high'
    : variance < averageDailyUsage * 1.5
    ? 'medium'
    : 'low';

  return {
    daysUntilLimit,
    estimatedDate,
    currentUsage,
    limit,
    averageDailyUsage,
    confidence,
  };
}

/**
 * Get monthly limit for a service
 */
function getServiceMonthlyLimit(service: keyof typeof PRICING): number {
  if (service === 'perplexity') {
    // Cost-based limit
    return Math.floor(BUDGET.perplexity / PRICING.perplexity.tiers.standard.costPerRequest);
  }
  
  if (service === 'resend') {
    return PRICING.resend.tiers.free.maxEmails;
  }
  
  if (service === 'greynoise') {
    return PRICING.greynoise.tiers.free.maxRequests;
  }
  
  if (service === 'redis') {
    return PRICING.redis.tiers.free.maxCommands * 30; // Per day × 30 days
  }
  
  if (service === 'sentry') {
    return PRICING.sentry.tiers.developer.maxEvents;
  }
  
  if (service === 'github') {
    return PRICING.github.tiers.authenticated.rateLimit * 24 * 30; // Per hour × 24 × 30
  }
  
  // semanticScholar, inngest
  return Infinity;
}

/**
 * Calculate variance for prediction confidence
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/** Return an overall budget recommendation message or null */
function getBudgetRecommendation(percentUsed: number, totalCost: number, totalBudget: number): string | null {
  if (percentUsed > 90) {
    return `🚨 CRITICAL: Total cost at ${percentUsed.toFixed(1)}% of budget ($${totalCost.toFixed(2)}/$${totalBudget})`;
  }
  if (percentUsed > 70) {
    return `⚠️  WARNING: Total cost at ${percentUsed.toFixed(1)}% of budget ($${totalCost.toFixed(2)}/$${totalBudget})`;
  }
  return null;
}

/** Return service-specific recommendation messages */
function getServiceRecommendations(
  service: string,
  usage: { totalRequests: number; daysActive: number },
  cost: { withinBudget: boolean; estimatedCost: number }
): string[] {
  const msgs: string[] = [];
  if (!cost.withinBudget) {
    msgs.push(`❌ ${PRICING[service as keyof typeof PRICING].name}: Over budget ($${cost.estimatedCost.toFixed(2)} vs $${BUDGET[service as keyof typeof BUDGET]})`);
  }
  if (service === 'perplexity' && cost.estimatedCost > 30) {
    msgs.push(`💡 Consider implementing more aggressive caching for Perplexity API calls (current: $${cost.estimatedCost.toFixed(2)}/month)`);
  }
  if (service === 'resend' && usage.totalRequests > 2500) {
    msgs.push(`📧 Approaching Resend free tier limit (${usage.totalRequests}/3000) - consider email consolidation or upgrade`);
  }
  if (service === 'redis' && usage.totalRequests > 8000 * usage.daysActive) {
    msgs.push(`💾 High Redis usage detected - review caching strategies and TTL settings`);
  }
  if (service === 'sentry' && usage.totalRequests > 4000) {
    msgs.push(`🔍 Consider filtering Sentry events or adjusting sample rates (current: ${usage.totalRequests} events)`);
  }
  return msgs;
}

/**
 * Generate cost optimization recommendations
 */
export async function generateCostRecommendations(month?: string): Promise<string[]> {
  const monthlyCost = await calculateMonthlyCost(month);
  const recommendations: string[] = [];

  const budgetRec = getBudgetRecommendation(monthlyCost.percentUsed, monthlyCost.totalCost, monthlyCost.totalBudget);
  if (budgetRec) recommendations.push(budgetRec);

  for (const { service, usage, cost } of monthlyCost.services) {
    recommendations.push(...getServiceRecommendations(service, usage, cost));
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All services operating within budget and healthy limits');
  }

  return recommendations;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { MonthlyUsageAggregate, DailyUsageData };

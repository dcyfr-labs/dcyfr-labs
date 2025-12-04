/**
 * API Usage Guardrails & Cost Controls
 *
 * Centralized configuration for API rate limits, cost controls,
 * and usage monitoring across all third-party services.
 *
 * Purpose:
 * - Prevent unexpected API costs
 * - Enforce usage limits
 * - Monitor API consumption
 * - Alert on anomalies
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * API Usage Limits (Monthly)
 */
export const API_LIMITS = {
  perplexity: {
    maxRequestsPerMonth: 1000, // Prevent runaway costs
    maxTokensPerRequest: 4000, // Limit response size
    maxCostPerMonth: 50, // USD budget cap
    estimatedCostPerRequest: 0.05, // Approximate cost
  },
  inngest: {
    maxEventsPerMonth: 10000, // Free tier: unlimited, but set reasonable limit
    maxFunctionsPerMonth: 50000, // Free tier: unlimited
  },
  resend: {
    maxEmailsPerMonth: 2500, // Stay under 3K free tier limit
    maxEmailsPerHour: 100, // Prevent email spam
  },
  github: {
    maxRequestsPerHour: 4500, // Stay under 5K authenticated limit
    cacheMinutes: 5, // Minimum cache duration
  },
  redis: {
    maxCommandsPerDay: 9000, // Stay under 10K free tier limit
    maxStorageMB: 50, // Monitor storage usage
  },
  sentry: {
    maxEventsPerMonth: 45000, // Stay under 50K limit
    maxTransactionsPerMonth: 45000, // Performance monitoring
  },
} as const;

/**
 * Rate Limiting Configuration (Per IP/User)
 */
export const RATE_LIMITS = {
  // Public API endpoints
  research: {
    requestsPerMinute: 5,
    requestsPerHour: 50,
    requestsPerDay: 200,
  },
  contact: {
    requestsPerMinute: 3,
    requestsPerHour: 10,
    requestsPerDay: 20,
  },
  analytics: {
    requestsPerMinute: 5,
    requestsPerHour: 100,
    requestsPerDay: 500,
  },
  githubContributions: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 500,
  },
  views: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  shares: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000,
  },
} as const;

/**
 * Alert Thresholds (Percentage of limits)
 */
export const ALERT_THRESHOLDS = {
  warning: 0.7, // Alert at 70% usage
  critical: 0.9, // Critical alert at 90% usage
} as const;

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * API Usage Counter Interface
 */
export interface ApiUsageStats {
  service: string;
  endpoint?: string;
  count: number;
  lastReset: Date;
  estimatedCost?: number;
  limit: number;
  percentUsed: number;
}

/**
 * In-memory usage tracking (reset daily)
 * In production, this should use Redis for distributed tracking
 */
const usageTracking = new Map<string, ApiUsageStats>();

/**
 * Track API usage
 */
export function trackApiUsage(
  service: keyof typeof API_LIMITS,
  endpoint?: string,
  cost?: number
): void {
  const key = endpoint ? `${service}:${endpoint}` : service;
  const now = new Date();
  const existing = usageTracking.get(key);

  // Reset if it's a new day
  const shouldReset =
    existing &&
    now.getDate() !== existing.lastReset.getDate();

  if (!existing || shouldReset) {
    usageTracking.set(key, {
      service,
      endpoint,
      count: 1,
      lastReset: now,
      estimatedCost: cost,
      limit: getLimit(service),
      percentUsed: 0,
    });
  } else {
    existing.count += 1;
    if (cost) {
      existing.estimatedCost = (existing.estimatedCost || 0) + cost;
    }
    existing.percentUsed = (existing.count / existing.limit) * 100;
    usageTracking.set(key, existing);

    // Check for alerts
    checkAlerts(existing);
  }
}

/**
 * Get usage limit for a service
 */
function getLimit(service: keyof typeof API_LIMITS): number {
  const config = API_LIMITS[service];
  if ('maxRequestsPerMonth' in config) {
    return config.maxRequestsPerMonth;
  }
  if ('maxEventsPerMonth' in config) {
    return config.maxEventsPerMonth;
  }
  if ('maxEmailsPerMonth' in config) {
    return config.maxEmailsPerMonth;
  }
  return 1000; // Default
}

/**
 * Check if usage exceeds alert thresholds
 */
function checkAlerts(stats: ApiUsageStats): void {
  const { service, percentUsed, count, limit, estimatedCost } = stats;

  if (percentUsed >= ALERT_THRESHOLDS.critical * 100) {
    console.error(
      `[API GUARDRAILS] 🚨 CRITICAL: ${service} usage at ${percentUsed.toFixed(1)}% (${count}/${limit})`,
      estimatedCost ? `Estimated cost: $${estimatedCost.toFixed(2)}` : ""
    );
  } else if (percentUsed >= ALERT_THRESHOLDS.warning * 100) {
    console.warn(
      `[API GUARDRAILS] ⚠️  WARNING: ${service} usage at ${percentUsed.toFixed(1)}% (${count}/${limit})`,
      estimatedCost ? `Estimated cost: $${estimatedCost.toFixed(2)}` : ""
    );
  }
}

/**
 * Check if service is within limits
 */
export function checkServiceLimit(
  service: keyof typeof API_LIMITS,
  endpoint?: string
): { allowed: boolean; reason?: string; stats?: ApiUsageStats } {
  const key = endpoint ? `${service}:${endpoint}` : service;
  const stats = usageTracking.get(key);

  if (!stats) {
    return { allowed: true };
  }

  // Check if at limit
  if (stats.count >= stats.limit) {
    return {
      allowed: false,
      reason: `${service} monthly limit reached (${stats.count}/${stats.limit})`,
      stats,
    };
  }

  // Check cost limit for paid services
  if (service === "perplexity" && stats.estimatedCost) {
    const costLimit = API_LIMITS.perplexity.maxCostPerMonth;
    if (stats.estimatedCost >= costLimit) {
      return {
        allowed: false,
        reason: `${service} cost limit reached ($${stats.estimatedCost.toFixed(2)}/$${costLimit})`,
        stats,
      };
    }
  }

  return { allowed: true, stats };
}

/**
 * Get all usage statistics
 */
export function getAllUsageStats(): ApiUsageStats[] {
  return Array.from(usageTracking.values());
}

/**
 * Get usage statistics for a specific service
 */
export function getServiceUsageStats(
  service: keyof typeof API_LIMITS
): ApiUsageStats[] {
  return Array.from(usageTracking.values()).filter(
    (stats) => stats.service === service
  );
}

/**
 * Reset usage tracking (for testing or manual reset)
 */
export function resetUsageTracking(): void {
  usageTracking.clear();
  console.log("[API GUARDRAILS] Usage tracking reset");
}

/**
 * Get usage summary
 */
export function getUsageSummary(): {
  totalServices: number;
  totalCost: number;
  servicesNearLimit: string[];
  servicesAtLimit: string[];
} {
  const stats = getAllUsageStats();

  const totalCost = stats.reduce(
    (sum, stat) => sum + (stat.estimatedCost || 0),
    0
  );

  const servicesNearLimit = stats
    .filter((s) => s.percentUsed >= ALERT_THRESHOLDS.warning * 100)
    .map((s) => s.service);

  const servicesAtLimit = stats
    .filter((s) => s.percentUsed >= 100)
    .map((s) => s.service);

  return {
    totalServices: new Set(stats.map((s) => s.service)).size,
    totalCost,
    servicesNearLimit,
    servicesAtLimit,
  };
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Middleware to check API limits before processing request
 */
export async function checkApiLimitMiddleware(
  service: keyof typeof API_LIMITS,
  endpoint?: string
): Promise<
  | { allowed: true }
  | { allowed: false; status: number; message: string; retryAfter?: number }
> {
  const check = checkServiceLimit(service, endpoint);

  if (!check.allowed) {
    return {
      allowed: false,
      status: 429,
      message: check.reason || "API limit exceeded",
      retryAfter: 3600, // Retry after 1 hour
    };
  }

  return { allowed: true };
}

/**
 * Track successful API call
 */
export function recordApiCall(
  service: keyof typeof API_LIMITS,
  endpoint?: string,
  options?: {
    cost?: number;
    tokens?: number;
    duration?: number;
  }
): void {
  trackApiUsage(service, endpoint, options?.cost);

  // Log detailed metrics
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[API CALL] ${service}${endpoint ? `:${endpoint}` : ""}`,
      options
    );
  }
}

// ============================================================================
// COST ESTIMATION
// ============================================================================

/**
 * Estimate cost for Perplexity API request
 */
export function estimatePerplexityCost(options: {
  model: string;
  promptTokens: number;
  completionTokens: number;
}): number {
  // Pricing as of 2025 (approximate)
  const pricing = {
    "llama-3.1-sonar-small-128k-online": {
      prompt: 0.0002, // $0.20 per 1M tokens
      completion: 0.0002,
    },
    "llama-3.1-sonar-large-128k-online": {
      prompt: 0.001, // $1 per 1M tokens
      completion: 0.001,
    },
    "llama-3.1-sonar-huge-128k-online": {
      prompt: 0.005, // $5 per 1M tokens
      completion: 0.005,
    },
  };

  const modelPricing =
    pricing[options.model as keyof typeof pricing] ||
    pricing["llama-3.1-sonar-large-128k-online"];

  const promptCost = (options.promptTokens / 1000) * modelPricing.prompt;
  const completionCost =
    (options.completionTokens / 1000) * modelPricing.completion;

  return promptCost + completionCost;
}

/**
 * Estimate monthly costs for all services
 */
export function estimateMonthlyCosts(): {
  service: string;
  estimatedCost: number;
  basis: string;
}[] {
  const stats = getAllUsageStats();

  return stats
    .filter((s) => s.estimatedCost !== undefined)
    .map((s) => ({
      service: s.service,
      estimatedCost: s.estimatedCost || 0,
      basis: `${s.count} requests`,
    }));
}

// ============================================================================
// MONITORING & ALERTS
// ============================================================================

/**
 * Health check for API usage
 */
export function getApiHealthStatus(): {
  status: "healthy" | "warning" | "critical";
  message: string;
  details: {
    totalCost: number;
    servicesNearLimit: number;
    servicesAtLimit: number;
  };
} {
  const summary = getUsageSummary();

  if (summary.servicesAtLimit.length > 0) {
    return {
      status: "critical",
      message: `${summary.servicesAtLimit.length} service(s) at limit`,
      details: {
        totalCost: summary.totalCost,
        servicesNearLimit: summary.servicesNearLimit.length,
        servicesAtLimit: summary.servicesAtLimit.length,
      },
    };
  }

  if (summary.servicesNearLimit.length > 0) {
    return {
      status: "warning",
      message: `${summary.servicesNearLimit.length} service(s) near limit`,
      details: {
        totalCost: summary.totalCost,
        servicesNearLimit: summary.servicesNearLimit.length,
        servicesAtLimit: summary.servicesAtLimit.length,
      },
    };
  }

  return {
    status: "healthy",
    message: "All services within limits",
    details: {
      totalCost: summary.totalCost,
      servicesNearLimit: 0,
      servicesAtLimit: 0,
    },
  };
}

/**
 * Log usage summary (call daily via cron/Inngest)
 */
export function logDailyUsageSummary(): void {
  const summary = getUsageSummary();
  const stats = getAllUsageStats();

  console.log("\n" + "=".repeat(60));
  console.log("📊 DAILY API USAGE SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Services: ${summary.totalServices}`);
  console.log(`Total Estimated Cost: $${summary.totalCost.toFixed(2)}`);
  console.log(
    `Services Near Limit: ${summary.servicesNearLimit.length}`
  );
  console.log(`Services At Limit: ${summary.servicesAtLimit.length}`);
  console.log("\nDetailed Stats:");
  stats.forEach((stat) => {
    console.log(
      `  - ${stat.service}: ${stat.count}/${stat.limit} (${stat.percentUsed.toFixed(1)}%)${
        stat.estimatedCost
          ? ` - $${stat.estimatedCost.toFixed(2)}`
          : ""
      }`
    );
  });
  console.log("=".repeat(60) + "\n");
}

/**
 * API Cost Dashboard Types
 *
 * Type definitions for API cost monitoring UI
 */

export interface ServiceUsage {
  service: string;
  displayName: string;
  requests: number;
  cost: number;
  limit: number;
  percentUsed: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

export interface DailyUsagePoint {
  date: string;
  displayDate: string;
  totalCost: number;
  totalRequests: number;
  byService: Record<string, { requests: number; cost: number }>;
}

export interface TopEndpoint {
  service: string;
  endpoint: string;
  requests: number;
  cost: number;
  avgDuration: number;
}

export interface BudgetStatus {
  total: number;
  used: number;
  percentUsed: number;
  projected: number;
  projectedPercent: number;
  daysRemaining: number;
  status: "ok" | "warning" | "critical";
}

export interface DashboardState {
  loading: boolean;
  error: string | null;
  lastRefresh: Date;
  serviceUsage: ServiceUsage[];
  dailyTrend: DailyUsagePoint[];
  topEndpoints: TopEndpoint[];
  budgetStatus: BudgetStatus;
}

export const SERVICE_CONFIG: Record<string, { displayName: string; color: string }> = {
  perplexity: { displayName: "Perplexity AI", color: "#2563eb" },
  resend: { displayName: "Resend Email", color: "#16a34a" },
  greynoise: { displayName: "GreyNoise", color: "#dc2626" },
  semanticScholar: { displayName: "Semantic Scholar", color: "#ca8a04" },
  github: { displayName: "GitHub API", color: "#9333ea" },
  redis: { displayName: "Redis", color: "#0891b2" },
  sentry: { displayName: "Sentry", color: "#ea580c" },
  inngest: { displayName: "Inngest", color: "#4f46e5" },
};

export const BUDGET = {
  total: 50, // $50/month
  byService: {
    perplexity: 50,
    resend: 0,
    greynoise: 0,
    semanticScholar: 0,
    github: 0,
    redis: 0,
    sentry: 0,
    inngest: 0,
  },
};

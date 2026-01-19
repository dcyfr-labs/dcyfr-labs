'use client';

/* eslint-disable no-restricted-syntax */
// Dev tools page - intentionally not using PageLayout for internal admin interface

/**
 * API Cost Dashboard - Client Component
 *
 * Main component that orchestrates the API cost monitoring dashboard.
 *
 * Displays:
 * - Budget progress with projections
 * - Service usage percentages
 * - 30-day cost trends
 * - Request volume by service
 * - Top endpoints table
 * - CSV export functionality
 * - Auto-refresh every 60 seconds
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';
import { TYPOGRAPHY } from '@/lib/design-tokens';

// Import components
import {
  BudgetProgressCard,
  ServiceUsageBars,
  CostTrendChart,
  RequestsTrendChart,
  TopEndpointsTable,
  ServiceSummaryCards,
  ExportButton,
} from './components';

// Import hook
import { useApiCostsDashboard } from './hooks';

/**
 * Main API Costs Client Component
 */
export default function ApiCostsClient() {
  const { state, fetchCostData } = useApiCostsDashboard();

  /**
   * Manual refresh handler
   */
  const handleRefresh = () => {
    fetchCostData(true);
  };

  const { serviceUsage, dailyTrend, topEndpoints, budgetStatus, loading, error } = state;

  // Prepare export data
  const exportData = serviceUsage.map((s) => ({
    service: s.displayName,
    requests: s.requests,
    cost: s.cost.toFixed(4),
    limit: s.limit,
    percentUsed: s.percentUsed.toFixed(2),
    trend: s.trend,
  }));

  return (
    <DashboardLayout
      title="API Cost Dashboard"
      description="Monitor API usage, costs, and budget across all services"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {state.lastRefresh.toLocaleTimeString()}
          </span>
          <ExportButton data={exportData} filename="api-costs" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href="https://dashboard.inngest.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Inngest
            </a>
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Budget Alert for Warning/Critical */}
        {budgetStatus.status !== 'ok' && (
          <Alert variant={budgetStatus.status === 'critical' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {budgetStatus.status === 'critical'
                ? `Critical: Budget usage at ${budgetStatus.percentUsed.toFixed(1)}%. Projected to exceed limit.`
                : `Warning: Budget usage at ${budgetStatus.percentUsed.toFixed(1)}%. Monitor closely.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Service Summary Cards */}
        <section>
          <ServiceSummaryCards services={serviceUsage} loading={loading} />
        </section>

        {/* Budget Progress & Service Usage */}
         <section className="grid gap-4 lg:grid-cols-2">
          <BudgetProgressCard budgetStatus={budgetStatus} loading={loading} />
          <ServiceUsageBars services={serviceUsage} loading={loading} />
        </section>

        {/* Cost Trends */}
        <section>
          <div className="mb-4">
            <h2 className={TYPOGRAPHY.h2.standard}>Cost Trends</h2>
            <p className="text-sm text-muted-foreground">
              Daily API costs and request volumes over the past 30 days
            </p>
          </div>
           <div className="grid gap-4 lg:grid-cols-2">
            <CostTrendChart data={dailyTrend} loading={loading} />
            <RequestsTrendChart data={dailyTrend} loading={loading} />
          </div>
        </section>

        {/* Top Endpoints */}
        <section>
          <TopEndpointsTable endpoints={topEndpoints} loading={loading} />
        </section>

        {/* Documentation Link */}
        <section className="text-center text-sm text-muted-foreground">
          <p>
            Cost monitoring runs daily via Inngest.{' '}
            <Link
              href="/dev/docs/features/api-cost-monitoring"
              className="underline hover:text-foreground"
            >
              View documentation
            </Link>
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}

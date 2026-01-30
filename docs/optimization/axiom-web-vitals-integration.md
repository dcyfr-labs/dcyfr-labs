<!-- TLP:CLEAR -->

# Axiom Web Vitals Integration

## Overview

This project integrates [Axiom's Web Vitals tracking](https://axiom.co/docs/apps/vercel#web-vitals) to capture and analyze Core Web Vitals metrics directly from user browsers. This provides unsampled, real-time performance data that complements Vercel's built-in analytics.

## Implementation

### 1. Package Installation

```bash
npm install --save next-axiom
```

**Package**: `next-axiom` - Official Axiom SDK for Next.js

### 2. Next.js Configuration

The Next.js config is wrapped with `withAxiom` to proxy Axiom ingest calls for improved deliverability:

```typescript
// next.config.ts
import { withAxiom } from "next-axiom";

export default withSentryConfig(
  withBundleAnalyzer(
    withBotId(
      withAxiom(nextConfig) // ← Axiom wrapper
    )
  ),
  sentryOptions
);
```

**Purpose**: The `withAxiom` wrapper creates a proxy endpoint for Axiom ingest calls, improving data delivery reliability by avoiding ad-blockers and browser extensions.

### 3. Layout Integration

The `AxiomWebVitals` component is added to the root layout to capture Web Vitals data:

```typescript
// src/app/layout.tsx
import { AxiomWebVitals } from "next-axiom";

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/* ... site content ... */}
          
          {/* Axiom Web Vitals - Production only */}
          <AxiomWebVitals />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Environment Variables

To enable Axiom integration, set the following environment variables in your Vercel project:

### Required Variables

- `NEXT_PUBLIC_AXIOM_DATASET` - Name of the Axiom dataset (e.g., `web-vitals`)
- `NEXT_PUBLIC_AXIOM_TOKEN` - Axiom API token with ingest permissions

### Optional Variables

- `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT` - Custom ingest endpoint (defaults to Axiom's cloud endpoint)

### Setting Variables in Vercel

1. Navigate to your project settings in Vercel
2. Go to **Settings** → **Environment Variables**
3. Add the required variables:
   - Variable name: `NEXT_PUBLIC_AXIOM_DATASET`
   - Value: Your Axiom dataset name
   - Environments: Production, Preview, Development
4. Add Axiom token:
   - Variable name: `NEXT_PUBLIC_AXIOM_TOKEN`
   - Value: Your Axiom API token
   - Environments: Production, Preview, Development

**Note**: For preview deployments, ensure environment variables are enabled for the Preview environment.

## Data Collection

### Web Vitals Captured

The integration automatically captures Core Web Vitals metrics:

- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial render
- **TTFB** (Time to First Byte) - Server response time
- **INP** (Interaction to Next Paint) - Responsiveness

### Additional Context

Each metric includes:

- User agent
- Device type
- Connection type
- Geographic location
- Deployment URL
- Route path

### Production Only

**Important**: Web Vitals are only sent from production deployments by default. This prevents development and preview data from polluting production metrics.

## Usage with Existing Analytics

This integration works alongside existing analytics solutions:

- **Vercel Analytics** (`@vercel/analytics`) - Continues to track aggregate metrics
- **Vercel Speed Insights** (`@vercel/speed-insights`) - Continues to track performance scores
- **Custom Web Vitals Reporter** (`WebVitalsReporter`) - Continues to track client-side metrics

All three systems operate independently and provide complementary data:

- Vercel Analytics: High-level aggregate metrics
- Axiom: Detailed, queryable, unsampled data with full context
- Custom Reporter: In-app performance tracking

## Querying Data

Once data is flowing to Axiom, you can query it using APL (Axiom Processing Language):

### Example Queries

**Average LCP by route:**

```apl
['web-vitals']
| where name == "LCP"
| summarize avg(value) by route
| order by avg_value desc
```

**95th percentile FID by device:**

```apl
['web-vitals']
| where name == "FID"
| summarize percentile(value, 95) by deviceType
```

**CLS issues by page:**

```apl
['web-vitals']
| where name == "CLS" and value > 0.1
| summarize count() by route
| order by count_ desc
```

## Monitoring & Alerts

### Creating Monitors

In Axiom, you can create monitors to alert on performance degradation:

1. Navigate to **Monitors** in Axiom dashboard
2. Create a new monitor with a query like:

   ```apl
   ['web-vitals']
   | where name == "LCP" and value > 2500
   | summarize count()
   ```

3. Set threshold (e.g., alert if more than 10 slow loads in 5 minutes)
4. Configure notification channels (email, Slack, PagerDuty)

## Troubleshooting

### No Data Flowing

1. **Check environment variables**: Ensure `NEXT_PUBLIC_AXIOM_DATASET` and `NEXT_PUBLIC_AXIOM_TOKEN` are set
2. **Verify production deployment**: Web Vitals only send from production
3. **Check browser console**: Look for Axiom-related errors
4. **Verify token permissions**: Token must have ingest permissions for the dataset

### Data Latency

- Normal latency: 1-5 seconds
- Check Axiom status page if experiencing delays
- Verify ingest endpoint is reachable

### High Volume Costs

- Axiom charges based on data ingested
- Consider sampling for high-traffic sites
- Use rate limiting if needed
- Monitor usage in Axiom dashboard

## Migration Notes

If migrating from the Axiom Vercel App (log drains):

1. Delete existing log drain from Vercel project settings
2. Remove `NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT` (unless using custom endpoint)
3. Follow setup steps above
4. Deploy to production

**Benefits of next-axiom over drains:**

- Lower cost for high-volume projects
- More control over what's sent
- Client-side metrics (Web Vitals)
- Better performance (proxied through Next.js)

## Additional Resources

- [Axiom Vercel Integration Docs](https://axiom.co/docs/apps/vercel)
- [next-axiom GitHub Repository](https://github.com/axiomhq/next-axiom)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [APL Query Language Docs](https://axiom.co/docs/apl/)

## Related Files

- `src/app/layout.tsx` - Root layout with AxiomWebVitals component
- `next.config.ts` - Next.js config wrapped with withAxiom
- `package.json` - Dependencies including next-axiom
- `src/components/web-vitals-reporter.tsx` - Custom Web Vitals reporter (complementary)

## Future Enhancements

Potential additions:

- Custom logging with `useLogger` hook in client components
- Server-side logging with `Logger` class
- Route handler instrumentation with `withAxiom`
- Custom events and attributes
- Sampling configuration for high-traffic routes

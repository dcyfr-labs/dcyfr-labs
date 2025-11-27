# Axiom Web Vitals Quick Setup Guide

## What Was Done

Implemented Axiom Web Vitals integration following the official documentation at https://axiom.co/docs/apps/vercel#web-vitals

## Changes Made

1. **Installed next-axiom package**
   ```bash
   npm install --save next-axiom
   ```

2. **Updated next.config.ts**
   - Added `import { withAxiom } from "next-axiom"`
   - Wrapped config with `withAxiom(nextConfig)` to proxy ingest calls

3. **Updated src/app/layout.tsx**
   - Added `import { AxiomWebVitals } from "next-axiom"`
   - Added `<AxiomWebVitals />` component to capture Web Vitals

## Next Steps

To enable this integration in production:

### 1. Create Axiom Dataset and Token

1. Log in to [Axiom](https://app.axiom.co/)
2. Create a new dataset (e.g., `web-vitals` or `dcyfr-labs-vitals`)
3. Create an API token with ingest permissions for this dataset

### 2. Configure Vercel Environment Variables

Add these environment variables to your Vercel project:

**Variable 1: NEXT_PUBLIC_AXIOM_DATASET**
- Name: `NEXT_PUBLIC_AXIOM_DATASET`
- Value: `your-dataset-name` (e.g., `web-vitals`)
- Environments: ✅ Production, ✅ Preview, ✅ Development

**Variable 2: NEXT_PUBLIC_AXIOM_TOKEN**
- Name: `NEXT_PUBLIC_AXIOM_TOKEN`
- Value: Your Axiom API token
- Environments: ✅ Production, ✅ Preview, ✅ Development

### 3. Deploy to Production

```bash
git add .
git commit -m "feat: implement Axiom Web Vitals integration"
git push
```

Vercel will automatically deploy and start sending Web Vitals data to Axiom.

## Verification

After deployment:

1. Visit your production site
2. Navigate to Axiom dashboard
3. Query your dataset:
   ```apl
   ['your-dataset-name']
   | where name in ("LCP", "FID", "CLS", "FCP", "TTFB", "INP")
   | summarize count() by name
   ```

You should see metrics appearing within 1-5 seconds.

## Documentation

See `docs/analytics/axiom-web-vitals-integration.md` for:
- Detailed implementation guide
- Environment variable setup
- Query examples
- Monitoring and alerts
- Troubleshooting
- Migration notes

## Benefits

- **Unsampled Data**: 100% of Web Vitals, no sampling
- **Real-time**: Sub-second latency for analysis
- **Detailed Context**: User agent, device, location, route, etc.
- **Queryable**: Use APL to analyze patterns and issues
- **Complements Existing**: Works alongside Vercel Analytics and Speed Insights
- **Cost Effective**: Only pay for data ingested (production only by default)

## Files Modified

- `package.json` - Added `next-axiom` dependency
- `next.config.ts` - Wrapped config with `withAxiom`
- `src/app/layout.tsx` - Added `AxiomWebVitals` component
- `docs/analytics/axiom-web-vitals-integration.md` - Created (comprehensive guide)
- `docs/analytics/axiom-web-vitals-setup.md` - Created (this file)

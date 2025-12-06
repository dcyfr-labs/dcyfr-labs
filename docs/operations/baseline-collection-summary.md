# Performance Baseline Collection Summary

**Date:** December 6, 2025  
**Deployment:** Preview branch (`ac9cb80`)  
**Deployment URL:** `dcyfr-labs-b7n2dwv3j-dcyfr-labs.vercel.app`

## Status: Partial Collection ✅

Successfully deployed to preview environment. Lighthouse collection blocked by local environment constraints.

## Completed Steps

1. ✅ **Deployment to Preview** - Build successful (42s compile time with Turbopack)
2. ✅ **Vercel API Access** - Confirmed deployment accessible via Vercel MCP
3. ✅ **Build Logs Retrieved** - 829 files bundled, Sentry sourcemaps uploaded
4. ⏸️ **Lighthouse CI** - Hanging locally (Chrome/network issue)

## Next Steps

### Immediate: Use GitHub Actions for Real Data Collection

Since local Lighthouse execution is blocked, the **Vercel Deployment Checks workflow** will collect real baseline data automatically on the next deployment:

```bash
# Trigger the workflow by pushing to preview
git push origin preview
```

The workflow (`.github/workflows/vercel-checks.yml`) will:
1. Run Lighthouse CI on 5 pages (3 runs each)
2. Extract bundle sizes from build output
3. Create Vercel Checks with results
4. Collect real performance baselines

### Alternative: Manual Collection via GitHub Actions

You can also trigger a manual run:

1. Go to: https://github.com/dcyfr/dcyfr-labs/actions/workflows/vercel-checks.yml
2. Wait for next deployment event (automatic trigger)
3. Review results in the Actions tab

## Deployment Details

**Build Information:**
- **Compiler:** Turbopack (Next.js 16.0.7)
- **Build Time:** 42 seconds
- **Files Bundled:** 829 files
- **Regions:** iad1, sfo1, cle1
- **Status:** READY

**Access:**
- **Bypass Secret:** Configured in environment
- **Shareable URL:** Generated (expires 12/7/2025)
- **Vercel API:** Accessible via MCP tools

## Baseline File Status

`performance-baselines.json` is ready with:
- ✅ Regression threshold configuration (10% warning, 25% error)
- ✅ Placeholder structure for all metrics
- ⏳ Awaiting real data from GitHub Actions

**File location:** `/performance-baselines.json`

## Recommendations

1. **Proceed with next deployment** - Let GitHub Actions collect real baselines
2. **Monitor first workflow run** - Verify Vercel Checks integration works
3. **Review collected data** - Update baselines with actual metrics
4. **Document in performance review log** - Record baseline establishment

## Technical Notes

**Why Local Lighthouse Failed:**
- Chrome execution hanging during audits
- Possible network/firewall interference
- CI environment (GitHub Actions) has better isolation

**Why GitHub Actions is Better:**
- Clean Ubuntu environment
- Consistent network conditions
- Automated on every deployment
- Results visible in Vercel dashboard

## Todo Status

- [x] Deploy to preview branch
- [x] Verify deployment accessible
- [x] Attempt Lighthouse collection
- [ ] Collect baselines via GitHub Actions (next push)
- [ ] Populate `performance-baselines.json` with real data
- [ ] Document final baselines in performance review log
- [ ] Verify Vercel Checks integration

<!-- TLP:CLEAR -->

# Activity System Examples

This directory contains example implementations and integration patterns for the dcyfr-labs activity system.

## Files

### trending-integration-example.ts

**Status:** Example code (not production-ready)  
**Purpose:** Demonstrates how to integrate trending calculation into activity sources

**Key Features:**
- Enriching blog post activities with trending metadata
- Batch enrichment for activity feeds
- Integration patterns with existing activity sources

**Note:** All data fetchers return placeholder values (0). Implement actual data sources before using in production.

**Related:**
- `src/lib/activity/trending.ts` - Production trending calculation logic
- `src/lib/activity/sources.server.ts` - Production activity sources

---

**Last Updated:** January 17, 2026

# Analytics Data Governance Policy

**Last Updated:** November 22, 2025  
**Version:** 1.0  
**Owner:** Drew Cypher

Policies and procedures for managing analytics data for cyberdrew.dev in compliance with privacy regulations and best practices.

---

## Overview

This document establishes governance policies for all analytics data collected on cyberdrew.dev, including view counts, web vitals, and user interaction data. The goal is to maintain sustainable, privacy-compliant analytics while providing valuable insights.

---

## Data Collection Inventory

### What We Collect

**1. Page View Data (Custom Analytics)**
- **Data Points:** Post slug, timestamp, session ID (temporary)
- **Storage:** Redis (Vercel KV)
- **Purpose:** Track content popularity, trending posts
- **PII:** None (session IDs are hashed, rotated every 30 minutes)

**2. Web Vitals (Vercel Analytics)**
- **Data Points:** LCP, INP, CLS, FCP, TTFB, page path
- **Storage:** Vercel infrastructure
- **Purpose:** Performance monitoring, optimization
- **PII:** None (aggregated only)

**3. Vercel Speed Insights**
- **Data Points:** Page load metrics, resource timings
- **Storage:** Vercel infrastructure
- **Purpose:** Performance budgets, regression detection
- **PII:** None (aggregated only)

**4. Share Counts**
- **Data Points:** Post slug, share count
- **Storage:** Redis (Vercel KV)
- **Purpose:** Track post sharing, engagement
- **PII:** None

### What We DO NOT Collect

- ❌ Personal identifiable information (names, emails, addresses)
- ❌ IP addresses (stored or logged)
- ❌ User behavior across sites (no cross-site tracking)
- ❌ Cookies for tracking purposes
- ❌ Device fingerprints
- ❌ Location data beyond country (Vercel's aggregated analytics)

---

## Data Retention Policy

### View Counts (Redis)

**Retention Period:** Indefinite
- View count totals are kept permanently as they provide long-term value
- Historical trends help identify evergreen content
- No PII involved, purely aggregated metrics

**Rationale:** View counts are non-sensitive metrics that improve over time with more data.

---

### Session Data (Redis)

**Retention Period:** 30 minutes
- Session IDs used for deduplication expire after 30 minutes
- Automatically deleted via Redis TTL
- No manual cleanup needed

**Rationale:** Sessions are temporary identifiers to prevent counting the same user multiple times within a short window.

---

### View History (Redis)

**Retention Period:** 90 days
- Historical view data stored in sorted sets with timestamps
- Automatically cleaned up when querying (timestamps older than 90 days removed)
- Enables trending calculations (7-day, 30-day windows)

**Rationale:** 90 days provides sufficient data for trend analysis without indefinite storage.

**Implementation:**
```typescript
// In src/lib/views.ts
const HISTORY_RETENTION_DAYS = 90;
const cutoff = Date.now() - (HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);

// Remove old entries
await redis.zremrangebyscore(historyKey, '-inf', cutoff);
```

---

### Share Counts (Redis)

**Retention Period:** 24 hours
- Share count increments tracked per day
- Used to identify rapidly shared content
- Reset daily

**Rationale:** Share velocity is most useful for recent content; historical share data less valuable.

---

### Web Vitals (Vercel)

**Retention Period:** Vercel-managed (typically 30-90 days)
- Managed by Vercel Analytics infrastructure
- We do not control retention policy
- Aggregated data only, no raw individual events

**Rationale:** Sufficient for performance trend analysis and regression detection.

---

## Test Data Cleanup

### Development and Test Events

**Problem:** Test events during development can skew production analytics.

**Prevention Strategies:**

1. **Environment-Based Filtering**
   ```typescript
   // In src/components/blog-analytics-tracker.tsx
   const isDevelopment = process.env.NODE_ENV === 'development';
   
   if (isDevelopment) {
     console.log('[Dev] Would track view:', { postId, sessionId });
     return; // Don't track in development
   }
   ```

2. **Bot Detection**
   - Vercel BotID automatically filters bot traffic
   - User-agent validation in API routes
   - Rate limiting prevents abuse

3. **Admin/Preview Exclusion**
   - Preview deployments don't track analytics by default
   - Admin routes explicitly excluded

**Manual Cleanup (If Needed):**

```bash
# Connect to Vercel KV via CLI
vercel env pull

# Delete specific post views (use with caution)
redis-cli -u $KV_URL
> DEL cyberdrew:views:test-post-slug
> DEL cyberdrew:views:test-post-slug:history
> DEL cyberdrew:shares:test-post-slug

# Verify deletion
> GET cyberdrew:views:test-post-slug
(nil)
```

**When to Clean:**
- After load testing
- After significant development changes
- When test posts are deleted
- Quarterly audit (scheduled)

---

## Export Strategy

### Purpose

Regular backups ensure:
- Data preservation if Redis instance fails
- Historical analysis beyond retention windows
- Business continuity
- Compliance with data portability requirements

---

### Export Schedule

**Monthly Snapshots:**
- First Sunday of each month
- All view counts and share counts
- Export to JSON format
- Store in `/backups/analytics/YYYY-MM.json`

**Quarterly Deep Exports:**
- Full Redis dump with historical data
- Web Vitals screenshots from Vercel dashboard
- Traffic summary reports

---

### Export Script

Create automated export script:

```typescript
// scripts/export-analytics.ts
import { Redis } from '@upstash/redis';

async function exportAnalytics() {
  const redis = Redis.fromEnv();
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Get all view counts
  const viewKeys = await redis.keys('cyberdrew:views:*');
  const views: Record<string, number> = {};
  
  for (const key of viewKeys) {
    if (!key.includes(':history') && !key.includes(':sessions')) {
      const count = await redis.get<number>(key);
      if (count) {
        const slug = key.replace('cyberdrew:views:', '');
        views[slug] = count;
      }
    }
  }
  
  // Get all share counts
  const shareKeys = await redis.keys('cyberdrew:shares:*');
  const shares: Record<string, number> = {};
  
  for (const key of shareKeys) {
    const count = await redis.get<number>(key);
    if (count) {
      const slug = key.replace('cyberdrew:shares:', '');
      shares[slug] = count;
    }
  }
  
  // Export data
  const exportData = {
    timestamp,
    exported: new Date().toISOString(),
    views,
    shares,
    totals: {
      totalViews: Object.values(views).reduce((a, b) => a + b, 0),
      totalShares: Object.values(shares).reduce((a, b) => a + b, 0),
      postsTracked: Object.keys(views).length,
    },
  };
  
  // Save to file
  const filename = `analytics-export-${timestamp}.json`;
  await fs.writeFile(
    path.join(process.cwd(), 'backups/analytics', filename),
    JSON.stringify(exportData, null, 2)
  );
  
  console.log(`✅ Exported analytics to ${filename}`);
  console.log(`   Total views: ${exportData.totals.totalViews}`);
  console.log(`   Total shares: ${exportData.totals.totalShares}`);
  console.log(`   Posts tracked: ${exportData.totals.postsTracked}`);
}

exportAnalytics().catch(console.error);
```

**Usage:**
```bash
# Manual export
npm run analytics:export

# Add to crontab (first Sunday of month)
0 2 1-7 * 0 cd /path/to/project && npm run analytics:export
```

---

### Export Storage

**Location:** `/backups/analytics/` (gitignored)

**File Format:**
```json
{
  "timestamp": "2025-11-01",
  "exported": "2025-11-01T02:00:00.000Z",
  "views": {
    "ai-development-workflow": 1234,
    "hardening-developer-portfolio": 856,
    "shipping-developer-portfolio": 2103
  },
  "shares": {
    "ai-development-workflow": 45,
    "hardening-developer-portfolio": 32
  },
  "totals": {
    "totalViews": 4193,
    "totalShares": 77,
    "postsTracked": 7
  }
}
```

**Backup Retention:**
- Keep all monthly exports indefinitely
- Store in version control (separate analytics repo)
- Or sync to cloud storage (S3, Backblaze B2)

---

## Privacy Compliance

### GDPR Compliance

**Lawful Basis:** Legitimate interest (analytics for site improvement)

**Data Minimization:** ✅
- Only collect necessary metrics
- No PII collected
- No cross-site tracking
- Aggregated data only

**Transparency:** ✅
- Privacy policy explains data collection
- Clear purpose for each data type
- No hidden tracking

**Right to Access:** N/A
- No personal data collected
- No user accounts or profiles
- Nothing to provide upon request

**Right to Erasure:** N/A
- No personal data collected
- Session IDs expire automatically (30 min)
- No persistent user identifiers

**Data Portability:** N/A
- No user-specific data
- Aggregated metrics only

**Consent:** Not required
- No cookies used for tracking
- No personal data collected
- Legitimate interest basis sufficient

---

### CCPA Compliance

**Do Not Sell:** ✅
- No data sold to third parties
- No data shared for advertising
- No cross-site tracking

**Notice at Collection:** ✅
- Privacy policy discloses analytics
- Purpose clearly stated
- No sensitive information collected

**Right to Know:** N/A
- No personal information collected
- Aggregated analytics only

**Right to Delete:** N/A
- No personal information collected
- Session data auto-expires

**Right to Opt-Out:** N/A
- No sale of personal information
- No targeted advertising

---

### Additional Privacy Measures

**1. No Third-Party Analytics**
- No Google Analytics
- No Facebook Pixel
- No advertising trackers
- Only Vercel Analytics (first-party, privacy-focused)

**2. No Cookies for Tracking**
- Session IDs in API request body only
- No persistent cookies
- No tracking across sessions

**3. Server-Side Processing**
- All analytics logic server-side
- No client-side fingerprinting
- No localStorage tracking

**4. IP Address Handling**
- IPs used only for rate limiting (transient)
- Not stored or logged
- Not sent to analytics
- Vercel infrastructure may log (their privacy policy)

**5. User Agent Filtering**
- Used for bot detection only
- Not stored
- No device fingerprinting

---

## Data Access Controls

### Who Has Access?

**Owner (Drew Cypher):**
- Full access to Redis data
- Full access to Vercel Analytics dashboard
- Can export, modify, delete data

**Vercel Platform:**
- Stores Web Vitals and Speed Insights data
- Aggregated only, no raw events
- Subject to Vercel's privacy policy

**No Other Access:**
- No third parties
- No analytics vendors
- No data sharing

---

### Access Procedures

**Development Environment:**
- Use `vercel env pull` to get Redis credentials
- Read-only access preferred for testing
- Test data separated where possible

**Production Environment:**
- Redis credentials via Vercel environment variables
- Access logged via Vercel audit trail
- 2FA required for Vercel account

---

## Data Breach Response Plan

### Low Risk (View Counts Exposed)

**Severity:** Low
- View counts are non-sensitive
- No PII exposed
- No user impact

**Response:**
1. Verify scope of exposure
2. Rotate Redis credentials if compromised
3. Document incident
4. No user notification required

---

### Medium Risk (Session IDs Exposed)

**Severity:** Medium
- Session IDs are temporary (30 min TTL)
- Hashed values, no PII
- Limited time window for abuse

**Response:**
1. Flush all session data immediately
2. Rotate Redis credentials
3. Review access logs
4. Implement additional rate limiting if needed
5. Document incident
6. No user notification required (no PII)

---

### High Risk (Redis Credentials Compromised)

**Severity:** High
- Potential for data modification or deletion
- Could impact site functionality

**Response:**
1. Immediately rotate credentials
2. Export current data for backup
3. Review access logs for unauthorized activity
4. Audit all Redis keys for tampering
5. Restore from backup if necessary
6. Implement additional security measures
7. Document incident thoroughly
8. Review security practices

---

## Audit Schedule

### Monthly (First Friday)

- [ ] Review analytics dashboard for anomalies
- [ ] Check Redis memory usage
- [ ] Verify backup exports running
- [ ] Review rate limiting logs
- [ ] Check for test data contamination

**Time:** 30 minutes  
**Document:** `docs/analytics/monthly-audit-YYYY-MM.md`

---

### Quarterly (First Friday of Jan/Apr/Jul/Oct)

- [ ] Deep Redis data audit
- [ ] Privacy policy review for compliance
- [ ] Export validation (can restore from backup?)
- [ ] Security review (credentials, access logs)
- [ ] Retention policy adherence check
- [ ] Performance impact analysis

**Time:** 2 hours  
**Document:** `docs/analytics/quarterly-audit-YYYY-QN.md`

---

### Annual (January)

- [ ] Complete data governance review
- [ ] GDPR/CCPA compliance verification
- [ ] Update this policy document
- [ ] Review and update export scripts
- [ ] Security audit (penetration testing considerations)
- [ ] Backup restoration test
- [ ] Third-party service review (Vercel policies)

**Time:** 4 hours  
**Document:** `docs/analytics/annual-audit-YYYY.md`

---

## Redis Data Structure Documentation

### View Counts

**Key:** `cyberdrew:views:{postSlug}`  
**Type:** String (number)  
**Value:** Total view count  
**Expiration:** None (permanent)  
**Example:** `cyberdrew:views:ai-development-workflow` → `1234`

---

### View History

**Key:** `cyberdrew:views:{postSlug}:history`  
**Type:** Sorted Set  
**Members:** `{sessionId}:{timestamp}`  
**Score:** Unix timestamp  
**Expiration:** Members older than 90 days removed on query  
**Example:**
```
cyberdrew:views:ai-development-workflow:history
  abc123:1700000000 → 1700000000
  xyz789:1700001000 → 1700001000
```

---

### Session Deduplication

**Key:** `cyberdrew:views:{postSlug}:sessions:{sessionId}`  
**Type:** String (flag)  
**Value:** "1"  
**Expiration:** 30 minutes (TTL)  
**Purpose:** Prevent counting same session multiple times  

---

### Share Counts

**Key:** `cyberdrew:shares:{postSlug}`  
**Type:** String (number)  
**Value:** Share count  
**Expiration:** 24 hours (resets daily)  
**Example:** `cyberdrew:shares:ai-development-workflow` → `45`

---

## Troubleshooting

### View Counts Not Incrementing

**Symptoms:** Views stay at 0 or don't increase

**Diagnosis:**
1. Check Redis connection: `curl https://cyberdrew.dev/api/views?postId=test-post`
2. Verify bot detection isn't blocking: Check user-agent
3. Review rate limiting: May be hitting 10 req/5min limit
4. Check session deduplication: Same sessionId reused?

**Resolution:**
- Increase rate limits if legitimate traffic
- Whitelist specific IPs for testing
- Clear session keys if testing: `DEL cyberdrew:views:*:sessions:*`

---

### Redis Memory Usage High

**Symptoms:** Redis approaching memory limit

**Diagnosis:**
1. Check key count: `redis-cli -u $KV_URL DBSIZE`
2. Check memory usage: Vercel KV dashboard
3. Identify large keys: `MEMORY USAGE {key}`

**Resolution:**
- Run history cleanup manually: Delete old sorted set members
- Reduce history retention from 90 to 30 days
- Export and archive old data
- Upgrade Redis plan if needed

---

### Data Export Failing

**Symptoms:** Export script fails or produces empty files

**Diagnosis:**
1. Verify Redis credentials valid
2. Check key patterns match: `KEYS cyberdrew:views:*`
3. Review script error logs

**Resolution:**
- Update Redis credentials
- Fix key patterns in export script
- Verify backup directory exists and is writable

---

## Policy Updates

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial policy creation | Drew Cypher |

---

### Review Schedule

This policy will be reviewed and updated:
- Annually (every January)
- When privacy regulations change
- When data collection practices change
- After any data incident

---

### Change Approval

Changes to this policy require:
1. Documentation of rationale
2. Privacy impact assessment
3. Update of privacy policy (if user-facing changes)
4. Notification to users (if material changes)

---

## References

- [GDPR Official Text](https://gdpr-info.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [Vercel Analytics Privacy](https://vercel.com/docs/analytics/privacy-policy)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## Contact

**Data Protection Officer:** Drew Cypher  
**Email:** [Contact form on site]  
**Last Review:** November 22, 2025  
**Next Review:** January 2026

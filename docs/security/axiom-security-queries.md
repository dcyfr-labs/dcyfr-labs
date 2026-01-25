{/* TLP:CLEAR */}

# Axiom Security Monitoring Queries
**Date:** December 11, 2025
**Purpose:** Pre-built queries for security monitoring in Axiom dashboard

---

## Quick Reference

**Dashboard:** https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d

**Log Source:** Vercel logs → Axiom (via integration)

**Event Type:** `admin_access` (structured JSON logs from admin endpoints)

---

## Core Security Queries

### 1. Real-Time Admin Access Monitor

**Purpose:** Live view of all admin endpoint access attempts

```sql
['event'] == "admin_access"
| project timestamp, endpoint, result, reason, ip, userAgent, environment
| sort by timestamp desc
| limit 100
```

**Use Case:** Real-time monitoring, incident investigation

**Dashboard Widget:** Table

---

### 2. Failed Authentication Attempts

**Purpose:** Track all denied access attempts

```sql
['event'] == "admin_access" and ['result'] == "denied"
| project timestamp, endpoint, reason, ip, userAgent
| sort by timestamp desc
| limit 100
```

**Use Case:** Detect unauthorized access attempts

**Dashboard Widget:** Table + Time Series Chart

**Alert Threshold:** > 10 from same IP in 5 minutes

---

### 3. Brute Force Detection (IP-based)

**Purpose:** Identify IPs attempting brute force attacks

```sql
['event'] == "admin_access"
and ['result'] == "denied"
and ['reason'] == "invalid or missing API key"
| summarize attempts = count() by ip, userAgent
| where attempts > 5
| sort by attempts desc
```

**Use Case:** Detect brute force attacks, block malicious IPs

**Dashboard Widget:** Bar Chart

**Action:** Block IPs with >10 attempts

---

### 4. Rate Limit Violations

**Purpose:** Monitor rate limit enforcement

```sql
['event'] == "admin_access"
and ['result'] == "denied"
and ['reason'] == "rate limit exceeded"
| summarize violations = count() by ip, endpoint
| sort by violations desc
```

**Use Case:** Identify clients hitting rate limits

**Dashboard Widget:** Table

**Investigation:** Check if legitimate user or attack

---

### 5. Production Access Attempts (CRITICAL)

**Purpose:** Alert on production admin access (should NEVER happen)

```sql
['event'] == "admin_access"
and ['vercelEnv'] == "production"
```

**Use Case:** **CRITICAL ALERT** - Possible security bypass

**Dashboard Widget:** Alert Panel (should show 0 events)

**Expected Result:** **0 events** (admin endpoints blocked in production)

**If >0:** IMMEDIATE investigation required

---

### 6. Successful Access Audit Trail

**Purpose:** Compliance audit log of all successful admin access

```sql
['event'] == "admin_access"
and ['result'] == "success"
| project timestamp, endpoint, ip, userAgent, queryParams
| sort by timestamp desc
```

**Use Case:** Compliance audits, access tracking

**Dashboard Widget:** Table

**Retention:** Keep for audit requirements (30-90 days)

---

### 7. Geographic Anomaly Detection

**Purpose:** Detect access from unusual locations

**Note:** Requires IP geolocation enrichment in Axiom

```sql
['event'] == "admin_access"
| extend country = geo_info_from_ip_address(ip).country
| summarize attempts = count() by country, result
| sort by attempts desc
```

**Use Case:** Detect foreign access attempts

**Expected:** Most access from your known locations

**Investigation:** Unexpected countries require review

---

### 8. Time-Based Attack Pattern Analysis

**Purpose:** Detect attacks concentrated in specific time periods

```sql
['event'] == "admin_access"
and ['result'] == "denied"
| summarize
    attempts = count(),
    unique_ips = dcount(ip)
  by bin(timestamp, 5m)
| where attempts > 20
| sort by timestamp desc
```

**Use Case:** Identify DDoS or coordinated attacks

**Dashboard Widget:** Time Series Chart

**Pattern:** Sudden spikes indicate attack

---

### 9. User Agent Analysis

**Purpose:** Identify automated tools or bots

```sql
['event'] == "admin_access"
and ['result'] == "denied"
| summarize attempts = count() by userAgent
| sort by attempts desc
| limit 20
```

**Use Case:** Identify scanning tools, bots, legitimate clients

**Suspicious User Agents:**
- `curl/`
- `python-requests/`
- `Scrapy/`
- Generic tool names

**Legitimate:**
- Browser user agents
- Known monitoring tools

---

### 10. Attack Source Correlation

**Purpose:** Find common patterns across attacking IPs

```sql
['event'] == "admin_access"
and ['result'] == "denied"
| summarize
    attempts = count(),
    endpoints = make_set(endpoint),
    reasons = make_set(reason)
  by ip
| where attempts > 10
| project ip, attempts, endpoints, reasons
| sort by attempts desc
```

**Use Case:** Identify coordinated attacks, bot networks

**Pattern:** Multiple IPs with same user agent = botnet

---

## Advanced Queries

### 11. Hourly Attack Heatmap

**Purpose:** Visualize attack patterns over 24 hours

```sql
['event'] == "admin_access"
and ['result'] == "denied"
| extend hour = bin(timestamp, 1h)
| summarize attacks = count() by hour, reason
| render timechart
```

**Use Case:** Identify peak attack times

**Dashboard Widget:** Heatmap/Time Series

---

### 12. Endpoint-Specific Threat Analysis

**Purpose:** Compare security events across endpoints

```sql
['event'] == "admin_access"
| summarize
    total = count(),
    denied = countif(['result'] == "denied"),
    success = countif(['result'] == "success")
  by endpoint
| extend deny_rate = (denied * 100.0) / total
| sort by denied desc
```

**Use Case:** Identify most targeted endpoints

**Dashboard Widget:** Table

---

### 13. Top 10 Attacking IPs (Last 24h)

**Purpose:** Quick view of most aggressive attackers

```sql
['event'] == "admin_access"
and ['result'] == "denied"
and timestamp > ago(24h)
| summarize
    attempts = count(),
    first_seen = min(timestamp),
    last_seen = max(timestamp),
    endpoints = make_set(endpoint),
    reasons = make_set(reason)
  by ip
| top 10 by attempts
| project ip, attempts, first_seen, last_seen, endpoints, reasons
```

**Use Case:** Blocklist creation, incident response

**Dashboard Widget:** Table

**Action:** Block top offenders via WAF/firewall

---

### 14. Authentication Success Rate

**Purpose:** Monitor overall security health

```sql
['event'] == "admin_access"
| summarize
    total = count(),
    success = countif(['result'] == "success"),
    denied = countif(['result'] == "denied")
  by bin(timestamp, 1h)
| extend success_rate = (success * 100.0) / total
| render timechart
```

**Use Case:** Baseline normal behavior, detect anomalies

**Dashboard Widget:** Time Series Chart

**Baseline:** 95%+ success rate for legitimate use

**Alert:** Sudden drop = attack in progress

---

### 15. Security Event Timeline

**Purpose:** Comprehensive security event view

```sql
['event'] == "admin_access"
| extend
    severity = case(
      ['result'] == "denied" and ['reason'] contains "production", "CRITICAL",
      ['result'] == "denied" and ['reason'] contains "invalid", "HIGH",
      ['result'] == "denied", "MEDIUM",
      "INFO"
    )
| project timestamp, severity, endpoint, result, reason, ip
| sort by timestamp desc
| limit 500
```

**Use Case:** Security operations center (SOC) view

**Dashboard Widget:** Table with severity color coding

---

## Dashboard Configuration

### Recommended Panels

**Row 1: Critical Alerts**
1. Production Access Count (should be 0) - Single Stat
2. Failed Auth Attempts (Last Hour) - Single Stat
3. Rate Limit Violations (Last Hour) - Single Stat

**Row 2: Real-Time Monitoring**
4. Admin Access Timeline (Last 24h) - Time Series
5. Top Denied Reasons - Pie Chart
6. Top Attacking IPs - Table

**Row 3: Analysis**
7. Authentication Success Rate - Time Series
8. Geographic Distribution - World Map
9. User Agent Distribution - Bar Chart

**Row 4: Audit Log**
10. Recent Admin Access Events - Table (all events)

---

## Alert Configurations (Axiom)

### Alert 1: Production Access (CRITICAL)

```
Query: ['event'] == "admin_access" and ['vercelEnv'] == "production"
Threshold: > 0 events
Window: 1 minute
Action: Email + Slack + PagerDuty
```

### Alert 2: Brute Force Attack

```
Query: ['event'] == "admin_access" and ['result'] == "denied" and ['reason'] == "invalid or missing API key"
Threshold: > 10 events from same IP
Window: 5 minutes
Action: Email + Slack
```

### Alert 3: High Rate Limit Violations

```
Query: ['event'] == "admin_access" and ['result'] == "denied" and ['reason'] == "rate limit exceeded"
Threshold: > 20 events
Window: 15 minutes
Action: Email notification
```

---

## Query Performance Tips

**1. Use Time Filters:**
```sql
timestamp > ago(1h)  -- Last hour
timestamp > ago(24h) -- Last 24 hours
timestamp > ago(7d)  -- Last week
```

**2. Limit Results:**
```sql
| limit 1000  -- Cap results for performance
```

**3. Use Summarize for Aggregations:**
```sql
| summarize count() by field
-- Faster than counting manually
```

**4. Project Only Needed Fields:**
```sql
| project timestamp, endpoint, ip
-- Reduces data transfer
```

---

## Investigation Workflows

### Workflow 1: Brute Force Attack Response

1. **Detect:** Axiom alert triggers
2. **Query:** Run "Brute Force Detection" query
3. **Identify:** Top attacking IPs
4. **Verify:** Check if IPs are known/legitimate
5. **Action:** Block IPs via firewall/WAF
6. **Monitor:** Re-run query after 1 hour
7. **Document:** Log incident in security tracker

### Workflow 2: Production Access Investigation

1. **Alert:** Critical alert triggers
2. **Query:** Production Access Attempts query
3. **Analyze:** Check IP, user agent, timestamp
4. **Verify:** Was blockExternalAccess() bypassed?
5. **Code Review:** Check recent deployments
6. **Rollback:** If needed, rollback deployment
7. **Patch:** Fix bypass, deploy hotfix
8. **Post-Mortem:** Document incident

### Workflow 3: Rate Limit Analysis

1. **Query:** Rate Limit Violations
2. **Identify:** Top violating IPs
3. **Check:** Known monitoring tools?
4. **Contact:** If legitimate, inform of limits
5. **Adjust:** If needed, increase limits for known IPs
6. **Block:** If malicious, add to blocklist

---

## Data Retention

**Axiom Settings:**
- Retention: 30 days (default)
- Archive: Optional (S3/GCS for compliance)

**Compliance:**
- Security logs: 90 days minimum (SOC 2)
- Admin access: 1 year (some regulations)

**Export:**
```sql
['event'] == "admin_access"
| where timestamp > ago(90d)
| project-away _sysTime
-- Export to CSV for archival
```

---

## Integration with Sentry

**Workflow:**
1. **Sentry** alerts you (email/Slack)
2. **Axiom** shows you detailed logs
3. **Together:** Complete incident response

**Example:**
- Sentry: "🚨 Brute force attack detected"
- You: Click to Axiom dashboard
- Axiom: Shows attacking IPs, patterns, timeline
- You: Take action (block IPs, rotate keys)

---

## Next Steps

1. ✅ Add queries to Axiom dashboard
2. ✅ Configure Axiom alerts (4 alerts)
3. ✅ Test queries with sample data
4. ✅ Set up alert notifications (email/Slack)
5. ✅ Schedule weekly dashboard review
6. ✅ Document response procedures

---

**Created:** December 11, 2025
**Maintained By:** Security Team
**Dashboard:** https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d

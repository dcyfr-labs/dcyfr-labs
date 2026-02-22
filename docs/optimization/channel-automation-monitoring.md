<!-- TLP:AMBER - Internal Use Only -->

# Channel Automation Monitoring and Auditability

**Information Classification:** TLP:AMBER (Internal Distribution)
**Last Updated:** 2026-02-21
**Scope:** `dcyfr-labs` — SEO channel automation monitoring
**Parent Strategy:** [search-channel-priority-automation.md](./search-channel-priority-automation.md)

---

## Purpose

This guide defines the audit log schema, per-channel success/error metrics,
policy-violation event tracking, and the monthly review checklist for all SEO
channel automation workflows.

Every channel automation action — Google, Bing, YouTube, Reddit — must be
**logged, measurable, and auditable**.

---

## 4.1 Audit Log Schema

All channel workflow actions emit a structured audit event. Events are written
to the application audit log (Axiom or equivalent observability backend).

### Core Schema

```typescript
interface ChannelAuditEvent {
  // Identity
  event_id: string; // UUID v4
  event_type: ChannelEventType;

  // Channel
  channel: 'google' | 'bing' | 'youtube' | 'reddit';
  operation: string; // e.g. 'submit_url', 'generate_metadata_pack', 'draft_created'

  // Actor
  actor_type: 'system' | 'human';
  actor_id?: string; // Present when actor_type = 'human'

  // Subject
  content_slug?: string; // Blog post slug, if applicable
  resource_url?: string; // URL submitted / acted upon

  // Result
  status: 'success' | 'error' | 'blocked' | 'skipped';
  http_status_code?: number; // For network operations
  error_code?: string; // Internal error classification
  error_detail?: string; // Human-readable error context

  // Timing
  timestamp: string; // ISO 8601
  duration_ms?: number; // Operation duration

  // Policy (Reddit-specific)
  policy_check_id?: string; // ID of policy rule that triggered block/flag
  human_approval_required?: boolean;
  human_approved_by?: string; // actor_id of approving human
  human_approved_at?: string; // ISO 8601
}
```

### Event Type Enumeration

```typescript
type ChannelEventType =
  // Indexing (Google + Bing)
  | 'indexing.url_submitted'
  | 'indexing.batch_queued'
  | 'indexing.submission_failed'
  | 'indexing.key_validated'

  // YouTube
  | 'youtube.metadata_pack_generated'
  | 'youtube.quality_check_passed'
  | 'youtube.quality_check_failed'
  | 'youtube.crosslink_validated'
  | 'youtube.json_ld_synced'
  | 'youtube.workflow_failed'

  // Reddit
  | 'reddit.draft_created'
  | 'reddit.subreddit_suggested'
  | 'reddit.human_approved'
  | 'reddit.published'
  | 'reddit.rate_limit_blocked'
  | 'reddit.policy_violation_detected'
  | 'reddit.discarded';
```

### Storage Requirements

- Minimum retention: **90 days** (rolling).
- Events must be queryable by `channel`, `operation`, `status`, `content_slug`,
  and `timestamp` range.
- Policy-violation events (`reddit.policy_violation_detected`) are retained
  for **1 year** regardless of the rolling retention limit.

---

## 4.2 Per-Channel Success / Error Metrics

Track these metrics per channel for operational visibility and SLA monitoring.

### Google + Bing Indexing

| Metric                       | Description                    | Healthy Threshold    |
| ---------------------------- | ------------------------------ | -------------------- |
| `indexing.submission_rate`   | URLs submitted per day         | ≥1 per publish event |
| `indexing.success_rate`      | Successful submissions / total | ≥95% (7-day rolling) |
| `indexing.avg_latency_ms`    | Average submission latency     | <3000ms (p95)        |
| `indexing.api_error_rate`    | 4xx/5xx responses / total      | <5% (7-day rolling)  |
| `indexing.batch_queue_depth` | Pending items in queue         | <50 (alert at 100)   |

### YouTube

| Metric                                  | Description                            | Healthy Threshold    |
| --------------------------------------- | -------------------------------------- | -------------------- |
| `youtube.metadata_pack_completion_rate` | Packs generated / videos published     | ≥80%                 |
| `youtube.quality_check_pass_rate`       | Videos passing all checks / total      | ≥70% (advisory)      |
| `youtube.crosslink_coverage`            | Videos with blog crosslink / total     | ≥80%                 |
| `youtube.json_ld_coverage`              | Posts with VideoObject JSON-LD / total | ≥80%                 |
| `youtube.workflow_error_rate`           | Failed events / total events           | <10% (7-day rolling) |

### Reddit

| Metric                          | Description                             | Healthy Threshold            |
| ------------------------------- | --------------------------------------- | ---------------------------- |
| `reddit.approval_rate`          | Drafts approved / total drafted         | Monitored (no min threshold) |
| `reddit.discard_rate`           | Drafts discarded / total drafted        | Monitored (warning if >70%)  |
| `reddit.rate_limit_block_rate`  | Rate-limit blocks / submission attempts | <20%                         |
| `reddit.time_to_approval_hours` | Draft created → human approved          | <48h (advisory)              |
| `reddit.policy_violation_count` | Policy violation events detected        | Alert on any non-zero value  |

---

## 4.3 Policy-Violation Event Tracking

Policy violations in the Reddit lane require special treatment beyond standard
error metrics.

### What Constitutes a Policy Violation

A `reddit.policy_violation_detected` event is emitted when:

1. Any service or agent attempts to set `approval_status = approved` without a
   valid human session token.
2. A post submission is attempted to more subreddits than the rate limit allows
   within the cadence window.
3. A prohibited action is attempted (auto-send, vote manipulation, mass DM — see
   §Prohibited Actions in the Reddit guide).
4. A subreddit rule check fails for a **hard** check item and execution continues
   anyway (should be architecturally impossible, but monitored as a safety net).

### Violation Event Fields

Extensions to the core audit schema for violation events:

```typescript
interface PolicyViolationEvent extends ChannelAuditEvent {
  event_type: 'reddit.policy_violation_detected';
  violation_code: ViolationCode;
  violation_detail: string;
  triggered_by_actor_type: 'system' | 'human';
  triggered_by_actor_id?: string;
  escalated: boolean;
  escalated_to?: string; // Team/person escalation target
}

type ViolationCode =
  | 'UNAUTHORIZED_AUTO_APPROVAL'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PROHIBITED_ACTION_ATTEMPTED'
  | 'HARD_RULE_CHECK_BYPASSED';
```

### Violation Response Protocol

| Violation Code                | Immediate Action            | Escalation                 |
| ----------------------------- | --------------------------- | -------------------------- |
| `UNAUTHORIZED_AUTO_APPROVAL`  | Block action; alert on-call | Escalate to security team  |
| `RATE_LIMIT_EXCEEDED`         | Block action; log           | Notify content ops         |
| `PROHIBITED_ACTION_ATTEMPTED` | Block action; alert on-call | Escalate to security team  |
| `HARD_RULE_CHECK_BYPASSED`    | Block action; alert on-call | Escalate to security + eng |

All `UNAUTHORIZED_AUTO_APPROVAL` and `PROHIBITED_ACTION_ATTEMPTED` violations
are escalated immediately regardless of time of day.

---

## 4.4 Monthly Review Checklist

Perform this review in the first week of each month. Owner: content-ops
(primary), engineering (secondary for metric anomalies).

### Channel Health Review

#### Indexing (Google + Bing)

- [ ] Verify `indexing.success_rate` is ≥95% for the past 30 days.
- [ ] Review `indexing.api_error_rate` — investigate if above threshold.
- [ ] Check `indexing.batch_queue_depth` — confirm no items are stuck.
- [ ] Confirm key files are accessible (`/google-site-verification.html`,
      IndexNow key file).
- [ ] Check Google Search Console for crawl errors or mobile usability issues.
- [ ] Check Bing Webmaster Tools for recrawl activity since last review.

#### YouTube

- [ ] Review `youtube.metadata_pack_completion_rate` — are drafts being generated?
- [ ] Review `youtube.crosslink_coverage` — address any orphaned video assets.
- [ ] Review `youtube.quality_check_pass_rate` — investigate recurrent failures.
- [ ] Confirm `VideoObject` JSON-LD is indexed for new posts since last review.
- [ ] Review YouTube Studio analytics — flag significant view drop or retention
      issue for investigation.

#### Reddit

- [ ] Review `reddit.policy_violation_count` — any non-zero value requires
      investigation and a documented response.
- [ ] Review `reddit.discard_rate` — if >70%, investigate draft quality.
- [ ] Review `reddit.time_to_approval_hours` — ensure queue is not bottlenecked.
- [ ] Confirm rate limits have not been exceeded in any subreddit.
- [ ] Check Reddit account health (no shadowbans, no new modmail warnings).

### Compliance Review

- [ ] Verify no prohibited automation actions were attempted (filter audit log
      for `reddit.policy_violation_detected` events).
- [ ] Confirm subreddit community rule files in
      `config/reddit-community-rules.json` are current (rules change frequently).
- [ ] Review any Reddit account modmail or warnings received in past 30 days.
- [ ] Confirm human-approval audit trail is complete — every `reddit.published`
      event has a corresponding `reddit.human_approved` event.

### Documentation and Process

- [ ] Update `config/reddit-community-rules.json` for any new/changed rules.
- [ ] Update this checklist if new channels or metrics are added.
- [ ] Log review completion in `docs/reports/CHANNEL_MONITORING_REVIEW_YYYY-MM.md`.

---

## Related Documentation

- [SEO Channel Priority Matrix](../features/SEO_CHANNEL_PRIORITY.md)
- [Search Channel Priority and Automation Strategy](./search-channel-priority-automation.md)
- [YouTube SEO Automation Guide](./youtube-seo-automation-guide.md)
- [Reddit Policy-Safe Workflow](./reddit-policy-safe-workflow.md)

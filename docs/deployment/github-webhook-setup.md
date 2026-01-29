{/_ TLP:CLEAR _/}

# GitHub Webhook Deployment Guide

**Status:** Ready to deploy (code complete, tests passing)
**Estimated Time:** 30 minutes
**Impact:** Real-time GitHub commit activity feed (< 30 second latency)

---

## 🎯 What This Enables

Once deployed, GitHub will send webhook events to your application whenever code is pushed to `dcyfr/dcyfr-labs`. The webhook:

1. **Receives** push events from GitHub (HMAC-SHA256 verified)
2. **Validates** signature and repository
3. **Queues** commits via Inngest for async processing
4. **Stores** commits in Redis with 7-day TTL
5. **Displays** commits in Activity feed within 30 seconds

**Code:** All implementation is complete at `/api/github/webhook`
**Tests:** 23 passing (webhook route + transformer + integration)

---

## ✅ Prerequisites

- [x] Webhook API route implemented (`src/app/api/github/webhook/route.ts`)
- [x] Inngest function for commit processing (`processGitHubCommit`)
- [x] Redis storage for commits (`github:commit:{hash}`)
- [x] Activity feed integration (`transformWebhookGitHubCommits`)
- [x] Tests passing (14 webhook tests + 9 transformer tests)
- [ ] **Production deployment with stable URL** ← REQUIRED
- [ ] **GITHUB_WEBHOOK_SECRET environment variable** ← REQUIRED

---

## 📋 Step-by-Step Deployment

### Step 1: Generate Webhook Secret

Generate a secure random secret for webhook signature verification:

```bash
# Generate a secure 256-bit secret
openssl rand -base64 32
```

**⚠️ Security:**

- Never commit this secret to version control
- Use different secrets for dev/preview/production
- Rotate periodically (quarterly recommended)

---

### Step 2: Add Environment Variable to Vercel

**Option A: Vercel Dashboard (Recommended)**

1. Go to [Vercel Dashboard](https://vercel.com/dcyfr/dcyfr-labs/settings/environment-variables)
2. Click **"Add New"**
3. Configure:
   - **Name:** `GITHUB_WEBHOOK_SECRET`
   - **Value:** (paste the generated secret from Step 1)
   - **Environments:** Select `Production` (and optionally `Preview`)
4. Click **"Save"**

**Option B: Vercel CLI**

```bash
# Set production environment variable
vercel env add GITHUB_WEBHOOK_SECRET production

# Paste the secret when prompted
# (input will be hidden)
```

**Verify:**

```bash
# List environment variables (masked)
vercel env ls

# Should show:
# GITHUB_WEBHOOK_SECRET | Production | (Sensitive)
```

---

### Step 3: Redeploy Application

The environment variable won't be available until you redeploy:

```bash
# Trigger a new production deployment
vercel --prod

# Or push to main branch (auto-deploys via GitHub Actions)
git push origin main
```

**⏱️ Wait:** Deployment typically takes 2-3 minutes

---

### Step 4: Configure GitHub Webhook

1. **Go to Repository Settings:**
   - Navigate to https://github.com/dcyfr/dcyfr-labs/settings/hooks
   - Click **"Add webhook"**

2. **Configure Webhook:**
   - **Payload URL:** `https://www.dcyfr.ai/api/github/webhook`
   - **Content type:** `application/json`
   - **Secret:** (paste the same secret from Step 1)
   - **SSL verification:** `Enable SSL verification` ✅
   - **Which events:** Select `Just the push event`
   - **Active:** ✅ Checked

3. **Save:**
   - Click **"Add webhook"**
   - GitHub will send a test ping event immediately

---

### Step 5: Verify Webhook Delivery

**Check Initial Ping:**

1. Return to https://github.com/dcyfr/dcyfr-labs/settings/hooks
2. Click on your newly created webhook
3. Scroll to **"Recent Deliveries"**
4. You should see a `ping` event with a green checkmark ✅
5. Click to expand and verify:
   - **Response:** Status `200 OK`
   - **Response body:** `{"status":"ok","webhook":"github","repository":"dcyfr/dcyfr-labs"}`

**Test with Real Commit:**

```bash
# Make a small test commit
cd /Users/drew/DCYFR/code/dcyfr-labs
echo "# Webhook test $(date)" >> .github/WEBHOOK_TEST.md
git add .github/WEBHOOK_TEST.md
git commit -m "test: verify GitHub webhook delivery"
git push origin main

# Wait 5-10 seconds for webhook delivery
```

**Verify in GitHub:**

1. Return to webhook settings → Recent Deliveries
2. You should see a `push` event
3. Expand to verify:
   - **Response:** Status `200 OK`
   - **Response body:** `{"success":true,"commitsProcessed":1,"branch":"main"}`

---

### Step 6: Monitor Processing & Activity Feed

**Check Inngest Processing:**

1. Go to [Inngest Dashboard](https://app.inngest.com/)
2. Navigate to **Functions** → `github/commit.pushed`
3. You should see a recent run (< 30 seconds ago)
4. Verify status: ✅ **Completed**

**Check Redis Storage:**

```bash
# Connect to Redis (requires UPSTASH credentials)
redis-cli -u $UPSTASH_REDIS_REST_URL

# Check for stored commit
KEYS github:commit:*

# Should return something like:
# 1) "github:commit:a1b2c3d"

# Get commit details
GET github:commit:a1b2c3d

# Should return JSON with commit data
```

**Check Activity Feed:**

1. Navigate to https://www.dcyfr.ai/activity
2. Filter by **"GitHub Commits"** source
3. Your test commit should appear within 30 seconds

---

## 🔍 Troubleshooting

### Webhook Returns 401 Unauthorized

**Cause:** Signature verification failed

**Solutions:**

1. Verify `GITHUB_WEBHOOK_SECRET` matches in both:
   - Vercel environment variables
   - GitHub webhook settings
2. Regenerate secret and update both locations
3. Ensure application was redeployed after adding environment variable

**Verify:**

```bash
# Check webhook endpoint health
curl https://www.dcyfr.ai/api/github/webhook

# Should return:
# {"status":"ok","webhook":"github","repository":"dcyfr/dcyfr-labs"}
```

---

### Webhook Returns 500 Internal Server Error

**Cause:** Application error during processing

**Solutions:**

1. Check [Sentry](https://sentry.io/organizations/dcyfr-labs/issues/) for error details
2. Check Vercel logs:
   ```bash
   vercel logs dcyfr-labs --prod
   ```
3. Common issues:
   - Missing `INNGEST_EVENT_KEY` (can't queue events)
   - Missing `UPSTASH_REDIS_REST_URL` (can't store commits)
   - Malformed event payload (unexpected GitHub event type)

---

### Commits Not Appearing in Activity Feed

**Cause:** Processing pipeline issue

**Checklist:**

1. ✅ Webhook delivery successful (200 OK in GitHub)
2. ✅ Inngest function executed (check Inngest dashboard)
3. ✅ Redis storage populated (check keys)
4. ❌ Activity feed transformer not fetching commits

**Solution:**

Check `src/lib/activity/sources.server.ts`:

```typescript
// Ensure transformWebhookGitHubCommits is enabled
const sources: ActivitySource[] = [
  // ...other sources...
  {
    id: 'github-commits',
    type: 'code',
    label: 'GitHub Commits',
    enabled: true, // ← Must be true
    requiresAuth: false,
    fetchData: transformWebhookGitHubCommits, // ← Using webhook source
  },
];
```

---

### Too Many Webhook Deliveries

**Cause:** Multiple webhooks configured or redelivery enabled

**Solution:**

1. Check https://github.com/dcyfr/dcyfr-labs/settings/hooks
2. Ensure only ONE webhook exists for `https://www.dcyfr.ai/api/github/webhook`
3. Delete duplicate webhooks if found
4. Disable "Redeliver" feature unless debugging

---

## 📊 Monitoring & Maintenance

### Webhook Health Checks

**Manual Health Check:**

```bash
# Test webhook endpoint
curl https://www.dcyfr.ai/api/github/webhook

# Expected response:
# {
#   "status": "ok",
#   "webhook": "github",
#   "repository": "dcyfr/dcyfr-labs"
# }
```

**Automated Monitoring:**

The webhook endpoint is monitored via:

- Sentry uptime checks (optional)
- Vercel edge function logs
- Inngest function execution metrics

---

### Rate Limits & Quotas

**GitHub Webhook Limits:**

- GitHub has no hard limit on webhook deliveries
- Each push can trigger up to 20 commits/webhook
- Our implementation processes all commits in batch

**Inngest Limits:**

- Free tier: 1,000 function runs/month
- Pro tier: 100,000 function runs/month
- Each commit = 1 function run

**Redis Storage:**

- TTL: 7 days per commit
- Estimated storage: ~2 KB per commit
- With 100 commits/week: ~1.4 MB total

---

### Webhook Secret Rotation

Rotate the webhook secret quarterly for best security:

```bash
# 1. Generate new secret
openssl rand -base64 32

# 2. Update Vercel environment variable
vercel env rm GITHUB_WEBHOOK_SECRET production
vercel env add GITHUB_WEBHOOK_SECRET production

# 3. Redeploy
vercel --prod

# 4. Update GitHub webhook settings
# (paste new secret in GitHub webhook configuration)

# 5. Test delivery
git commit --allow-empty -m "test: verify webhook after rotation"
git push origin main
```

---

## 📈 Success Metrics

After deployment, monitor these metrics:

**Immediate (< 5 minutes):**

- ✅ Webhook ping event delivered successfully
- ✅ Test commit triggers 200 OK response
- ✅ Inngest function processes commit
- ✅ Commit stored in Redis

**Short-term (< 1 day):**

- ✅ 100% webhook delivery success rate
- ✅ < 30 second latency from push → activity feed
- ✅ No 401/500 errors in webhook logs
- ✅ Redis storage < 10 MB (normal)

**Long-term (1 week):**

- ✅ Activity feed shows recent commits
- ✅ Webhook deliveries correlate with push events
- ✅ No Sentry errors related to webhook processing
- ✅ Users engage with commit activity data

---

## 🔗 Related Documentation

- **Webhook API Route:** `src/app/api/github/webhook/route.ts`
- **Inngest Function:** `src/inngest/github-functions.ts` (processGitHubCommit)
- **Activity Transformer:** `src/lib/activity/sources.server.ts` (transformWebhookGitHubCommits)
- **Environment Setup:** `docs/configuration/ENV_SETUP.md`
- **Activity Feed:** `docs/features/activity-feed.md`
- **GitHub Webhook Docs:** https://docs.github.com/webhooks

---

## ✅ Post-Deployment Checklist

After completing all steps, verify:

- [ ] Webhook secret generated and stored securely
- [ ] `GITHUB_WEBHOOK_SECRET` added to Vercel production environment
- [ ] Application redeployed with new environment variable
- [ ] GitHub webhook configured with correct URL and secret
- [ ] Webhook ping event delivered successfully (200 OK)
- [ ] Test commit triggers webhook and appears in activity feed
- [ ] Inngest function processes commits successfully
- [ ] Redis storage contains commit data
- [ ] No errors in Sentry or Vercel logs
- [ ] Todo.md updated with completion status

---

**Status:** Ready to deploy
**Next Step:** Start with Step 1 (Generate webhook secret)
**Questions?** See troubleshooting section or check Sentry/Vercel logs

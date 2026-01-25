{/* TLP:CLEAR */}

# Inoreader Integration Setup Guide

**Step-by-step guide to configure the Inoreader RSS feed integration for `/dev/news`.**

> ⚠️ **BETA FEATURE**: This integration is currently in development. Follow these steps carefully to set up OAuth authentication.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Redis running locally or a Redis URL (required for token storage)
- ✅ Inngest configured (for background feed syncing)
- ✅ Development server access (`npm run dev`)

---

## Step 1: Create an Inoreader Account

1. Go to: https://www.inoreader.com/signup
2. Sign up for a **free account**
3. Verify your email address
4. Log in to your account

---

## Step 2: Subscribe to Tech Feeds

Before using the integration, subscribe to some feeds in Inoreader:

### Recommended Feeds for Developers:

```
Next.js Blog:        https://nextjs.org/feed.xml
React Blog:          https://react.dev/rss.xml
Vercel Blog:         https://vercel.com/blog/rss.xml
GitHub Security:     https://github.blog/category/security/feed/
npm Blog:            https://blog.npmjs.org/rss.xml
Tailwind CSS:        https://tailwindcss.com/blog/feed.xml
TypeScript Blog:     https://devblogs.microsoft.com/typescript/feed/
CSS-Tricks:          https://css-tricks.com/feed/
Smashing Magazine:   https://www.smashingmagazine.com/feed/
A List Apart:        https://alistapart.com/main/feed/
```

### How to Subscribe:

1. In Inoreader, click **"Add Subscription"** (+ icon)
2. Paste the feed URL
3. Click **"Follow"**
4. Organize feeds into folders (optional but recommended):
   - "Frontend" (React, Next.js, CSS)
   - "Backend" (Node.js, TypeScript)
   - "Security" (GitHub Security, npm advisories)
   - "Design" (Smashing, A List Apart)

---

## Step 3: Register Your Inoreader App

1. Go to: **https://www.inoreader.com/developers/register-app**

2. Fill in the application details:

   | Field | Value |
   |-------|-------|
   | **Application Name** | `dcyfr-labs` (or your portfolio name) |
   | **Description** | `Developer feed aggregator for portfolio` |
   | **Redirect URI** | `http://localhost:3000/api/inoreader/callback` |
   | **Scope** | `Read` (or `Read/Write` if you plan to add bookmarking) |

3. **IMPORTANT**: The redirect URI must be **EXACTLY**:
   ```
   http://localhost:3000/api/inoreader/callback
   ```
   
   ⚠️ **Common Mistakes:**
   - ❌ Using `https://` instead of `http://` for localhost
   - ❌ Adding a trailing slash: `http://localhost:3000/api/inoreader/callback/`
   - ❌ Using a different port: `http://localhost:3001/...`
   - ❌ Missing `/api/inoreader/callback` path

4. Click **"Create Application"**

5. You'll receive:
   - **Client ID** (e.g., `1000000123`)
   - **Client Secret** (e.g., `abc123def456...`)

6. **SAVE THESE CREDENTIALS** - You'll need them in the next step!

---

## Step 4: Configure Environment Variables

1. Open your `.env.local` file (create if it doesn't exist)

2. Add the following variables:

```bash
# ============================================
# INOREADER API CONFIGURATION
# ============================================

# Client ID from Inoreader app registration
INOREADER_CLIENT_ID=your_client_id_here

# Client Secret from Inoreader app registration
INOREADER_CLIENT_SECRET=your_client_secret_here

# IMPORTANT: Must be the same as INOREADER_CLIENT_ID
# This is used by the browser-side OAuth initiation
NEXT_PUBLIC_INOREADER_CLIENT_ID=your_client_id_here

# OAuth Redirect URI (must match Inoreader app registration)
INOREADER_REDIRECT_URI=http://localhost:3000/api/inoreader/callback

# ============================================
# REQUIRED DEPENDENCIES
# ============================================

# Redis URL for token storage and caching
REDIS_URL=redis://localhost:6379

# Inngest configuration for background sync
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=local-dev-key
```

3. Replace `your_client_id_here` with your actual Client ID

4. Replace `your_client_secret_here` with your actual Client Secret

5. **Save the file**

---

## Step 5: Verify Redis is Running

The integration requires Redis for token storage and caching.

### Check if Redis is running:

```bash
redis-cli ping
# Expected output: PONG
```

### If Redis is not running:

**macOS (Homebrew):**
```bash
brew services start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Ubuntu/Debian:**
```bash
sudo systemctl start redis
```

---

## Step 6: Start Development Server

```bash
# Start Next.js development server
npm run dev

# Server should start at http://localhost:3000
```

---

## Step 7: Test OAuth Flow

1. **Visit the dev news page:**
   ```
   http://localhost:3000/dev/news
   ```

2. **You should see:**
   - "Connect to Inoreader" button
   - Features list
   - Security notice

3. **Click "Connect to Inoreader"**

4. **Check browser console** (F12 → Console tab):
   ```
   🔍 OAuth Debug Info:
     Client ID: 1000000123
     Redirect URI: http://localhost:3000/api/inoreader/callback
     Origin: http://localhost:3000
   ```

5. **Verify the redirect URI matches** what you registered in Step 3

6. **You'll be redirected to Inoreader's consent page**

7. **Click "Authorize"** to grant access

8. **You'll be redirected back to `/dev/news?auth=success`**

9. **Your feeds should now display!** 🎉

---

## Step 8: Verify Token Storage

Check that tokens are stored in Redis:

```bash
redis-cli

# Check for stored tokens
> GET inoreader:tokens

# You should see JSON with accessToken, refreshToken, etc.
> EXIT
```

---

## Troubleshooting

### Error: "Inoreader integration is not configured"

**Symptoms:**
- Red error banner
- Button is disabled and grayed out

**Causes:**
- Missing `NEXT_PUBLIC_INOREADER_CLIENT_ID` in `.env.local`
- Environment variables not loaded

**Fix:**
1. Add `NEXT_PUBLIC_INOREADER_CLIENT_ID` to `.env.local`
2. Restart development server: `Ctrl+C` then `npm run dev`

---

### Error: "invalid_client: No client id supplied"

**Symptoms:**
- Error when clicking "Connect to Inoreader"
- Redirected to error page

**Causes:**
- `NEXT_PUBLIC_INOREADER_CLIENT_ID` is empty or undefined

**Fix:**
1. Verify `.env.local` has `NEXT_PUBLIC_INOREADER_CLIENT_ID=<your_client_id>`
2. Ensure no spaces around the `=` sign
3. Restart dev server

---

### Error: "redirect_uri_mismatch"

**Symptoms:**
- Inoreader shows "Redirect URI mismatch" error
- Can't complete OAuth flow

**Causes:**
- Registered redirect URI doesn't match what the code sends
- Common: Using `https://` instead of `http://` for localhost

**Fix:**
1. Check browser console for exact redirect URI being sent
2. Go to https://www.inoreader.com/developers
3. Edit your application
4. Update redirect URI to **EXACTLY** match console output
5. Try authenticating again

**Example:**
```
❌ Registered: https://localhost:3000/api/inoreader/callback
✅ Should be: http://localhost:3000/api/inoreader/callback

❌ Registered: http://localhost:3000/api/inoreader/callback/
✅ Should be: http://localhost:3000/api/inoreader/callback
```

---

### Error: "No Inoreader tokens found"

**Symptoms:**
- OAuth worked before but now shows auth screen again
- Feeds disappeared

**Causes:**
- Tokens expired (30-day TTL)
- Redis was cleared or restarted
- Redis connection failed

**Fix:**
1. Re-authenticate at `/dev/news`
2. Check Redis is running: `redis-cli ping`
3. Verify `REDIS_URL` in `.env.local`

---

### Empty Feeds After Authentication

**Symptoms:**
- OAuth succeeds but no articles shown
- "No feeds available" message

**Causes:**
- Haven't subscribed to any feeds in Inoreader yet
- Background sync hasn't run yet

**Fix:**
1. Subscribe to feeds in Inoreader (see Step 2)
2. Manually trigger background sync:
   ```bash
   curl http://localhost:3000/api/inngest \
     -H "Content-Type: application/json" \
     -d '{"name": "sync-inoreader-feeds", "data": {}}'
   ```
3. Refresh `/dev/news` page

---

### Button Stays Grayed Out

**Symptoms:**
- "Connect to Inoreader" button is disabled
- Can't click it

**Causes:**
- Configuration check failed
- `NEXT_PUBLIC_INOREADER_CLIENT_ID` not loaded

**Fix:**
1. Open browser DevTools → Console
2. Check for any errors
3. Verify `.env.local` has all required variables
4. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

## Production Deployment

When deploying to production (Vercel, etc.), update:

### 1. Register Production Redirect URI

Go to https://www.inoreader.com/developers and add:
```
https://your-domain.com/api/inoreader/callback
```

### 2. Update Environment Variables

In your hosting platform (Vercel, etc.), set:

```bash
INOREADER_CLIENT_ID=<same_as_dev>
INOREADER_CLIENT_SECRET=<same_as_dev>
NEXT_PUBLIC_INOREADER_CLIENT_ID=<same_as_dev>
INOREADER_REDIRECT_URI=https://your-domain.com/api/inoreader/callback
REDIS_URL=<production_redis_url>
```

### 3. CSRF Protection (TODO)

For production, implement session-based CSRF validation:
- Store OAuth state in encrypted session (not sessionStorage)
- Verify state matches in callback handler
- Use `SESSION_ENCRYPTION_KEY` from environment

---

## Background Sync

The integration uses Inngest to sync feeds every 6 hours automatically.

### Manual Trigger (for testing):

```bash
curl http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "sync-inoreader-feeds", "data": {}}'
```

### Check Sync Status:

```bash
redis-cli

# Check cached feeds
> GET inoreader:feeds:latest

# Check feed statistics
> GET inoreader:stats

# Check trending topics
> GET inoreader:trending_topics
```

---

## Rate Limits

**Inoreader API Limits:**
- Free tier: **60 requests/hour**
- Pro tier: Higher limits

**Our Mitigation:**
- Redis caching (5-minute TTL for page loads)
- Background sync every 6 hours (not on every page visit)
- Pagination limits (max 100 articles per request)

---

## Security Notes

### OAuth Tokens:
- ✅ Stored in Redis with 30-day expiration
- ✅ Encrypted connection to Redis
- ❌ Not encrypted at rest (future enhancement)

### CSRF Protection:
- ✅ State parameter generated and logged
- ❌ Not verified against session yet (basic protection)
- ⚠️ For production: Implement session-based CSRF validation

### Token Refresh:
- ❌ Not automatic yet - forces re-auth on expiry
- ⚠️ TODO: Implement automatic token refresh

---

## Next Steps

After successful setup:

1. ✅ Test search and filtering functionality
2. ✅ Subscribe to more feeds in Inoreader
3. ✅ Organize feeds into folders/tags
4. ✅ Monitor background sync job
5. ✅ Check Redis cache hit rate

---

## Support & Documentation

- **Full Integration Docs**: `docs/features/inoreader-integration.md`
- **Inoreader API Docs**: https://www.inoreader.com/developers/
- **OAuth 2.0 Spec**: https://oauth.net/2/
- **Inngest Docs**: https://www.inngest.com/docs

---

## Common Commands

```bash
# Start dev server
npm run dev

# Check TypeScript
npm run typecheck

# Run tests
npm run test:run

# Check Redis
redis-cli ping

# View stored tokens
redis-cli GET inoreader:tokens

# Manual sync trigger
curl http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "sync-inoreader-feeds", "data": {}}'
```

---

**Last Updated**: January 17, 2026  
**Integration Status**: Beta - Under Development  
**Route**: `/dev/news`

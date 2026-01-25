{/* TLP:CLEAR */}

# Environment Variables Quick Reference

**Quick lookup for environment variable setup and troubleshooting.**

## Setup Commands

```bash
# 1. Copy example file
cp .env.example .env.local

# 2. Edit with your values
nano .env.local  # or your preferred editor

# 3. Start dev server
npm run dev
```

## Variables at a Glance

| Variable | Required? | Where Used | Get It From |
|----------|-----------|------------|-------------|
| `RESEND_API_KEY` | Production | Contact form emails | [resend.com/api-keys](https://resend.com/api-keys) |
| `GITHUB_TOKEN` | Recommended | GitHub heatmap rate limits | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `REDIS_URL` | Optional | Blog post view counts | [vercel.com/kv](https://vercel.com/docs/storage/vercel-kv) or [upstash.com](https://upstash.com) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Site URL override | Manual (e.g., `https://www.dcyfr.ai`) |
| `NEXT_PUBLIC_SITE_DOMAIN` | Optional | Domain override | Manual (e.g., `www.dcyfr.ai`) |

## Minimal .env.local for Development

```bash
# Leave empty for local development - everything works!
# The app gracefully degrades without these values.

RESEND_API_KEY=
GITHUB_TOKEN=
REDIS_URL=
```

## Production .env (Vercel)

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxx

# Recommended
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
REDIS_URL=redis://default:password@host:port

# Optional (only if custom domain)
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Behavior Without Each Variable

### Without `RESEND_API_KEY`
- ✅ Contact form displays normally
- ✅ Form validation works
- ⚠️  Submissions logged to console only
- ⚠️  User sees: "Email notifications are not configured"
- ❌ No actual emails sent

### Without `GITHUB_TOKEN`
- ✅ GitHub heatmap works
- ⚠️  Lower rate limits (60 requests/hour vs 5,000)
- ⚠️  May fail during heavy development
- ✅ Server cache helps (5-minute cache)

### Without `REDIS_URL`
- ✅ Blog posts load normally
- ❌ No view counts displayed
- ❌ No view tracking
- ✅ Silent graceful degradation

## Quick Troubleshooting

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Contact form returns error | Missing `RESEND_API_KEY` | Should show warning, not error (check implementation) |
| Heatmap rate limited | No `GITHUB_TOKEN` | Add token for 5,000 req/hr limit |
| No view counts | Missing `REDIS_URL` | Add Redis or accept graceful degradation |
| Wrong domain in links | Incorrect site config | Set `NEXT_PUBLIC_SITE_URL` |

## Getting API Keys

### Resend (Email)
1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys)
3. Create key
4. Add to environment variables
5. Optional: Verify domain for production

### GitHub Token
1. Go to [Settings → Developer Settings → Tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scopes: `public_repo` OR `read:user`
4. Copy token immediately (can't view again)
5. Add to environment variables

### Redis (Vercel KV)
1. Vercel Dashboard → Storage → Create Database → KV
2. Link to project
3. Environment variables auto-added
4. Done! ✅

### Redis (Upstash)
1. Sign up at [console.upstash.com](https://console.upstash.com)
2. Create database
3. Copy connection URL
4. Add to environment variables

## Vercel Configuration

### Add Environment Variable
1. Project Settings → Environment Variables
2. Click "Add"
3. Name: `RESEND_API_KEY` (for example)
4. Value: `re_xxxxxxxxxxxx`
5. Environment: Production, Preview, Development (check all that apply)
6. Save

### Edit Environment Variable
1. Find variable in list
2. Click "..." → Edit
3. Update value
4. Save
5. Redeploy for changes to take effect

## Security Checklist

- [ ] `.env.local` is in `.gitignore` ✅ (default)
- [ ] Never commit actual keys to git
- [ ] Use separate keys for dev/staging/production
- [ ] Rotate keys every 90 days
- [ ] GitHub token has read-only access only
- [ ] Resend domain verified for production
- [ ] Redis has strong password

## Testing Configuration

```bash
# Test contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'

# Test GitHub API
curl http://localhost:3000/api/github-contributions?username=dcyfr

# Check dev server output for Redis connection
# Logs show if Redis is connected/configured
```

## Related Documentation

- [Full Environment Variables Guide](./environment-variables) - Complete documentation
- [API Reference](../api/reference) - API route details
- [Deployment Checklist](./deployment-checklist) - Pre-deploy checks

---

**Need more details?** See the [full environment variables guide](./environment-variables).
